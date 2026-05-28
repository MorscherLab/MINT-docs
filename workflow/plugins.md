# Plugins

MINT is built around a plugin architecture. The platform itself is intentionally lean — projects, experiments, members, plugins, marketplace. Everything lab-specific (LC-MS sequence design, drug-response prediction, chemical drawing, …) is a plugin.

> [Screenshot: Admin → Plugins page listing installed plugins with version, status, and migration state]

## Four plugin types

Plugin type controls what the plugin may write through `PlatformContext`; all plugin types can still have their own routes and, when they declare migrations, their own plugin-owned tables.

| Type | Typical role | Platform writes |
|------|--------------|-----------------|
| `STATIC` | Read-only reference UI, calculators, viewers | None |
| `ANALYSIS` | Reads experiments and writes analysis outputs | Analysis results and artifacts |
| `EXPERIMENT_DESIGN` | Creates or edits experiment design data | Experiment design data |
| `FULL` | Combines design and analysis in one plugin | Design data, analysis results, and artifacts |

Authors often split a related lab capability into two plugins: a design plugin for experiment metadata and workflow, and one or more analysis plugins that read those experiments and produce results. Use `FULL` only when one plugin genuinely owns both sides.

## Plugin lifecycle

```
register ──▶ install ──▶ initialize ──▶ ready
                              │
                              └──▶ migrate-on-upgrade ──▶ ready
                              
   ready ──▶ uninstall { keep | archive | purge }
```

| Phase | What happens |
|-------|--------------|
| **register** | The plugin's wheel or `.mint` bundle declares an entry point in the `mint.plugins` group |
| **install** | The platform installs the package or bundle, checks dependency conflicts, records installed artifacts, and reports whether a restart is required |
| **initialize** | The plugin's `initialize(context)` is called once, the plugin returns its routers, and the platform mounts them under `routes_prefix` |
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

The middleware in [`api/plugins/middleware.py`](https://github.com/MorscherLab/MINT/blob/main/api/plugins/middleware.py) wraps every plugin call with error isolation — a plugin crash never takes down the platform.

## Plugin migrations

Plugins that own database tables use `mint_sdk.migrations` for versioned schema evolution:

```python
from mint_sdk.migrations import PluginMigration, MigrationOps

class Migration(PluginMigration):
    version = 1
    name = "create_plates_table"

    async def upgrade(self, op: MigrationOps) -> None:
        await op.create_table("plates", ...)
```

Save this as a module such as `migrations/v001_create_plates_table.py`. Migrations are recorded in `plugin_schema_migrations` and run advisory-locked so two replicas can't race. The admin UI surfaces:

- `schema_version` — the plugin's currently applied revision
- `pending_migrations` — revisions known to the plugin but not yet applied
- `migration_error` — the failure reason, if a migration crashed

If a migration fails, the plugin stays in an `error` state and its routes are not mounted. Fix the migration, reload the plugin, and the runner retries.

## Uninstall modes

| Mode | What happens to data |
|------|----------------------|
| **keep** (current Admin UI / CLI behavior) | The package is uninstalled; plugin-owned tables and rows are kept in the database. Reinstalling the plugin can restore access. |
| **archive** (manager-level cleanup mode) | The plugin schema is renamed with an archived prefix. No code can read it automatically, but a database admin can recover it. |
| **purge** (manager-level cleanup mode) | The plugin schema is dropped after explicit confirmation. **Irreversible.** |

The current browser UI and `mint plugin uninstall` use the safe default: keep plugin data. Take a database backup before using lower-level cleanup paths or manual schema removal.

## Plugin roles

Plugins can register their own `UserPluginRole` entries, separate from platform RBAC. A plugin role is a string the plugin author chose; it lets the plugin gate features per user without burdening the platform's role model.

A user's plugin role for a given plugin is set from **Admin → Plugins → \<plugin> → Users**.

## Built-in plugins

The marketplace can advertise first-party and lab-local plugins. Names and availability depend on the registry configured for your deployment.

| Example plugin | Likely type | Role |
|----------------|-------------|------|
| MS experiment designer | `EXPERIMENT_DESIGN` or `FULL` | LC-MS sequence and plate-map design |
| RAW file uploader | `ANALYSIS` | RAW file upload, conversion, and result attachment |
| HMDB browser | `STATIC` or `ANALYSIS` | Metabolite lookup and annotation |
| Chemical drawing widget | `STATIC` | Chemical structure drawing or visualization |

The full catalog lives in the marketplace.

## Next

→ [Marketplace](/workflow/marketplace) — discover, install, request, approve plugins
→ [Updates](/workflow/updates) — keeping plugins and the platform fresh
→ [Plugin development tutorial](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build`
→ [SDK concepts](/sdk/concepts/) — what's in `mint-sdk` and how plugins integrate
