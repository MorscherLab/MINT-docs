# Plugins

MINT is built around a plugin architecture. The platform itself is intentionally lean — projects, experiments, members, plugins, marketplace. Everything lab-specific (LC-MS sequence design, drug-response prediction, chemical drawing, …) is a plugin.

> [Screenshot: Admin → Plugins page listing installed plugins with version, status, and migration state]

## Two plugin types

| | Experiment-design plugin | Analysis plugin |
|---|---|---|
| Plugin type enum | `EXPERIMENT_DESIGN` | `ANALYSIS` |
| Owns | An experiment type, with its own database schema | None |
| Writes | Its own tables + the experiment's `design_data` | The experiment's `analysis_results` and artifacts |
| Reads | Anything via `PlatformContext` | Existing experiments, projects, users |
| Migrations | Yes — runs `PluginMigration`s on startup | Yes — even analysis plugins can have their own tables |

A plugin can implement only one type. Authors typically split a related lab capability into two plugins: a design plugin for the experiment metadata + workflow, and one or more analysis plugins that read those experiments and produce results.

## Plugin lifecycle

```
register ──▶ install ──▶ initialize ──▶ ready
                              │
                              └──▶ migrate-on-upgrade ──▶ ready
                              
   ready ──▶ uninstall { keep | archive | purge }
```

| Phase | What happens |
|-------|--------------|
| **register** | The plugin's wheel is installable from PyPI / a private index, declares an entry point in the `mld.plugins` group |
| **install** | `mint` resolves the plugin, places it in an isolated venv (or shared, if no conflicts), runs `MigrationRunner` to apply pending migrations |
| **initialize** | `AnalysisPlugin.initialize(context)` is called once, the plugin returns its routers, the platform mounts them under `routes_prefix` |
| **ready** | Plugin handles requests; UI tile is visible to users with the appropriate role |
| **upgrade** | New version installed, migrations applied, snapshot taken so the upgrade can be rolled back |
| **uninstall** | One of three modes (below) |

> [Screenshot: plugin lifecycle visualization with state pills]

## Isolation

Plugins run with one of two isolation strategies:

| Strategy | When | Mechanism |
|----------|------|-----------|
| **Shared environment** | When dependency sets are compatible | Plugin shares the platform's venv |
| **Per-plugin venv** | When `conflict.py` detects a dependency clash | `uv` creates a separate venv; plugin runs in a subprocess and the platform proxies HTTP to it |

In both cases the plugin's HTTP surface is mounted at the `routes_prefix` declared in its `PluginMetadata`. The user can't tell from the URL whether the plugin is in-process or out-of-process; the platform handles the proxy transparently.

The middleware in [`api/plugins/middleware.py`](https://github.com/MorscherLab/mld/blob/main/api/plugins/middleware.py) wraps every plugin call with error isolation — a plugin crash never takes down the platform.

## Plugin migrations

Plugins that own database tables use `mint_sdk.migrations` for versioned schema evolution:

```python
from mint_sdk.migrations import PluginMigration, MigrationOps

class V001(PluginMigration):
    revision = "001"
    description = "create plates table"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.create_table("plates", ...)
```

Migrations are recorded in `plugin_schema_migrations` (added by platform migration v011) and run advisory-locked so two replicas can't race. The admin UI surfaces:

- `schema_version` — the plugin's currently applied revision
- `pending_migrations` — revisions known to the plugin but not yet applied
- `migration_error` — the failure reason, if a migration crashed

If a migration fails, the plugin stays in an `error` state and its routes are not mounted. Fix the migration, reload the plugin, and the runner retries.

## Uninstall modes

| Mode | What happens to data |
|------|----------------------|
| **keep** (default) | Tables and rows kept in the database. Reinstalling the plugin restores access. |
| **archive** | Tables renamed with an `archived_<timestamp>_` prefix. No code can read them, but the data is recoverable. |
| **purge** | Tables and uploaded artifacts permanently dropped. **Irreversible.** |

> [Screenshot: uninstall confirmation dialog showing the three radio buttons]

## Plugin roles

Plugins can register their own `UserPluginRole` entries, separate from platform RBAC. A plugin role is a string the plugin author chose; it lets the plugin gate features per user without burdening the platform's role model.

A user's plugin role for a given plugin is set from **Admin → Plugins → \<plugin> → Users**.

## Built-in plugins

A typical lab MINT install ships with a small set of first-party plugins:

| Plugin | Type | Role |
|--------|------|------|
| `mint-ms-designer` | Design | LCMS sequence + plate-map design |
| `mint-ms-planner` | Design | Acquisition scheduling |
| `mint-ms-uploader` | Analysis | RAW file upload + auto-convert |
| `mint-plugin-drp` | Analysis | Drug-response prediction |
| `mint-hmdb` | Analysis | HMDB metabolite lookup |
| `mint-chem-draw` | Tool | Chemical structure drawing widget |

The full catalog lives in the marketplace.

## Next

→ [Marketplace](/workflow/marketplace) — discover, install, request, approve plugins
→ [Updates](/workflow/updates) — keeping plugins and the platform fresh
→ [Plugin development](/cli/plugin-dev) — `mint init`, `mint dev`, `mint build`
→ [SDK concepts](/sdk/concepts/) — what's in `mint-sdk` and how plugins integrate
