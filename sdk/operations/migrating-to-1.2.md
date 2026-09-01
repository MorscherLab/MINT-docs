# Migrating to MINT 1.2

MINT 1.2 removes several compatibility paths from the platform and SDK. Platform administrators must use PostgreSQL, and plugin authors must move to the unified experiment repository and current frontend job/client APIs.

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

## Load plugins through entry points

The platform no longer imports plugin module/class pairs listed in `config.json`. Remove non-empty `plugins.plugins` lists and register each plugin package in `pyproject.toml`:

```toml
[project.entry-points."mint.plugins"]
peak-qc = "peak_qc.plugin:PeakQcPlugin"
```

Keep `plugins.settings`, `plugins.extraIndexUrls`, and `plugins.loadFromEntryPoints` when your deployment uses them. An empty legacy `plugins.plugins` list is ignored, but removing it keeps the configuration unambiguous.

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

Repository access remains scoped by the plugin's type, explicit data-access capabilities, allowed experiment types, current user visibility, and `analysis_result_readers` declaration. Do not replace the removed getter with direct platform database access.

## Replace retired frontend helpers

Update imports and call sites as follows:

| Removed in 1.2 | Replacement |
|----------------|-------------|
| `usePluginConfig()` | `usePluginSettings()` or generated `useGeneratedPluginSettings()` |
| `usePluginClient()` | generated `useGeneratedPluginClient()` |
| `usePluginApi()` | generated `useGeneratedPluginClient()` |

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

Remove imports of `useJobsStatusTray`, `JobsStatusTrayAdapter`, `JobStreamMessage`, `UseJobsStatusTrayOptions`, and `UseJobsStatusTrayReturn`. For several job runtimes, combine their sources with `combinePluginJobSources(...)` and pass the result through the same `source` prop.

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
bun run typecheck
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
