# Migrating to MINT 1.2

This guide targets the released **MINT v1.2.6** (17 September 2026). Platform administrators must use PostgreSQL. New plugin code should use the unified experiment repository and current frontend job/client APIs; several legacy APIs remain as compatibility adapters in this release.

## Before upgrading

1. Stop writes and take a verified PostgreSQL backup plus a copy of `server.dataPath`.
2. Run the existing plugin test suites and record the working platform and SDK versions.
3. Check every plugin with `mint doctor --explain` and review `mint docs deprecated-apis`.
4. Upgrade the platform and the Python/frontend SDK packages together to matching 1.2 releases.

::: warning SQLite platform data needs a separate migration plan
MINT 1.2 has no SQLite platform backend and does not ship an automatic SQLite-to-PostgreSQL converter. If an older deployment has platform data in SQLite, keep an offline backup and migrate and verify that data with your normal database tooling before starting 1.2. The SDK's standalone local database remains SQLite and does not need to be converted merely because the platform is upgraded.
:::

## Configure PostgreSQL only

Remove the old database selector from `config.json`:

```json
{
  "database": {
    "host": "postgres",
    "port": 5432,
    "databaseName": "mint_db"
  },
  "DB_USERNAME": "mint",
  "DB_PASSWORD": "secret"
}
```

Also remove `MINT_DATABASE__MODE` from systemd, Compose, Kubernetes, and shell environments. `devMode: true` still bypasses authentication, but it now uses the configured PostgreSQL connection instead of substituting a local SQLite database.

SQLite remains supported for plugin-owned standalone storage through `mint-sdk[local-db]`. Calls through `self.get_plugin_db_session()` continue to use SQLite under `mint dev` and a plugin-scoped PostgreSQL schema when installed.

## Database migrations from 1.2.2

Platform startup now uses the shared SDK Alembic runtime. Existing installations
first complete pending legacy integer migrations through **v031**, then validate
and adopt the frozen `platform_v031` baseline. Fresh databases use packaged
Alembic revisions. Platform and plugin schemas keep independent migration
histories and database ownership.

The legacy bridge can also be run explicitly from the platform environment:

```bash
uv run python -m api.migrations --database-url "$MINT_LEGACY_DATABASE_URL"
```

Set `MINT_LEGACY_DATABASE_URL` to the intended PostgreSQL database using the
platform's synchronous SQLAlchemy driver. **This command applies pending
legacy migrations**; it is not an inspection command. Startup normally invokes
the bridge itself. Running it does not repair schema drift or data from
migrations already recorded as complete, and it does not replace the subsequent
Alembic adoption checks.

Adoption requires the exact v001–v031 history and the expected baseline schema.
It rejects missing/unexpected revisions, schema drift, and invalid current data.
From 1.2.3, valid `cancelled` experiments, deliberately revoked `plugins.use`
permissions, and historically deleted or custom Viewer roles are accepted.
For a genuine validation failure, back up and inspect the fields/record IDs in
the diagnostic before correcting the data. Do not erase history or stamp a
baseline merely to make startup pass.

### Plugin database declarations

The legacy `get_migrations_package()` and numbered `PluginMigration` classes
remain supported. Alembic is an explicit opt-in:

```python
from mint_sdk import AnalysisPlugin, MigrationSpec
from .models import Panel

class MyPlugin(AnalysisPlugin):
    def get_migration_spec(self) -> MigrationSpec:
        return MigrationSpec(
            package="my_plugin.db_revisions",
            models=(Panel,),
        )
```

The package contains standard Alembic revision files; `models` identifies owned
tables. Keep the plugin's shared-database capability and runtime dependency
extras. Do not also return a package from `get_migrations_package()`. Existing
nonempty tables need an explicit, validated `LegacyBaseline` adoption plan;
changing the hook alone is not a data migration. A database already using
Alembic refuses fallback to the legacy/model-only path.

The host applies revisions before plugin initialization, with ownership checks,
checksums and migration locks. An Alembic failure leaves that plugin disabled
and exposes its migration error in administration. Status includes
`migration_backend`, `schema_revision`, `target_revision`,
`pending_migrations` and `migration_error`; integer `schema_version` remains
relevant to the legacy backend.

### Developer inspection does not apply migrations

For an Alembic plugin project and an existing disposable development database:

```bash
uv run mint db current --database-url "$MINT_DEV_DATABASE_URL"
uv run mint db check --database-url "$MINT_DEV_DATABASE_URL"
uv run mint db revision "Add panel index" --database-url "$MINT_DEV_DATABASE_URL"
```

`current` reads and validates history, `check` reports model/schema differences,
and `revision` writes an autogenerated draft to the project's source package.
A diff makes `check` fail; review the generated operations before shipping them.
These commands do not upgrade, repair or stamp the database. The same boundary
applies to `mint add migration --autogenerate`. SQLite targets must already
exist, and the platform target requires PostgreSQL. See [Migrations](/sdk/concepts/migrations)
for revision layout, adoption and runtime verification.

Source: [v1.2.6 platform startup](https://github.com/MorscherLab/MINT/blob/v1.2.6/api/repositories/database.py), [legacy adoption checks](https://github.com/MorscherLab/MINT/blob/v1.2.6/api/migrations/alembic_adoption.py), and [developer database commands](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/db_commands.py).

## Load plugins through entry points

The platform deprecates plugin module/class pairs listed in `config.json` but still loads them in v1.2.6. Migrate these declarations to package entry points in `pyproject.toml`:

```toml
[project.entry-points."mint.plugins"]
peak-qc = "peak_qc.plugin:PeakQcPlugin"
```

Keep `plugins.settings`, `plugins.extraIndexUrls`, and `plugins.loadFromEntryPoints` when your deployment uses them. After verifying entry-point discovery, remove the old module/class declarations to keep configuration unambiguous.

## Use the unified experiment repository

Experiment rows, design data, compatibility analysis results, and named artifacts now share `ExperimentRepository`.

| MINT 1.1 | MINT 1.2 |
|----------|----------|
| `PluginExperimentData` | `DesignData` |
| `PluginDataRepository` | `ExperimentRepository` |
| `context.get_plugin_data_repository()` | `context.get_experiment_repository()` |
| `repo.save_experiment_data(...)` | `repo.save_design_data(...)` |
| `repo.get_experiment_data(...)` | `repo.get_design_data(...)` |
| `repo.delete_experiment_data(...)` | `repo.delete_design_data(...)` |

Before:

```python
repo = context.get_plugin_data_repository()
await repo.save_experiment_data(experiment_id, plugin_id, design)
```

After:

```python
repo = context.get_experiment_repository()
await repo.save_design_data(experiment_id, plugin_id, design)
```

Repository access remains scoped by the plugin's type, explicit data-access capabilities, allowed experiment types, current user visibility, and `analysis_result_readers` declaration. The old getter still returns a compatibility adapter in v1.2.6. Use the new getter in new code; do not bypass it with direct platform database access.

## Replace legacy frontend helpers

Update imports and call sites as follows:

| Older usage | Preferred replacement |
|----------------|-------------|
| `usePluginConfig()` | `usePluginSettings()` or generated `useGeneratedPluginSettings()` |
| `usePluginClient()` | generated `useGeneratedPluginClient()` |
| `usePluginApi()` | generated `useGeneratedPluginClient()` |

`usePluginConfig()` and `usePluginClient()` remain exported in v1.2.6 for compatibility. Migrate new code to the current helpers instead of relying on those aliases.

`createPluginClient()` remains available as the lower-level runtime used by generated clients. Plugin application code should normally import the generated wrapper from `frontend/src/generated/mint-plugin.ts`.

## Pass one job source to the job center

`JobsStatusTray` and `usePluginJobCenter()` now consume one `PluginJobCenterSource`. The object returned by generated `usePluginJobs()` already implements that interface.

Before:

```ts
const tray = useJobsStatusTray()
```

```vue
<JobsStatusTray :jobs="jobs" :adapter="jobsAdapter" :event-stream="eventStream" />
```

After:

```ts
const jobs = usePluginJobs()
const tray = usePluginJobCenter({ source: jobs })
```

```vue
<JobsStatusTray :source="jobs" />
```

When migrating a job center, replace imports of `useJobsStatusTray` and its legacy adapter types with the source-based API. The v1.2.6 release still exports the legacy helper for compatibility. For several job runtimes, combine their sources with `combinePluginJobSources(...)` and pass the result through the same `source` prop.

## Update and verify the plugin

Keep the Python and frontend SDK releases aligned. After updating the dependency declarations and lockfiles, regenerate the contract when the plugin has a custom frontend:

```bash
uv sync
uv run mint sdk generate
uv run mint doctor --fix
uv run mint doctor --explain
uv run mint doctor --strict
uv run pytest -v

cd frontend
bun install
bun run type-check
bun run build
```

Review every automatic fix before committing it. Then run the plugin against a disposable MINT 1.2/PostgreSQL environment and exercise experiment reads/writes, settings, generated clients, jobs, and migrations before upgrading a shared deployment.

## Release tags

The platform, `mint-sdk`, and `@morscherlab/mint-sdk` now share one `v*` release tag. Legacy `sdk-v*` tags remain in Git history but receive no new releases. Plugin repositories still keep their own independent version tags.

## Related

- [Upgrading the SDK](/sdk/operations/upgrading-sdk)
- [Configuration](/cli/configuration)
- [Platform updates](/workflow/updates)
- [Python SDK reference](/sdk/api/python)
- [Frontend SDK reference](/sdk/api/frontend)

Release sources: [platform loader](https://github.com/MorscherLab/MINT/blob/v1.2.6/api/plugins/loader.py), [context adapters](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/context.py), [frontend exports](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/composables/index.ts).
