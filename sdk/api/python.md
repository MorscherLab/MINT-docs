# Python SDK reference

Core public symbols exported from `mint_sdk`, grouped by area. Each entry has a one-line description and links to the source on GitHub; check `mint_sdk/__init__.py` in your installed version for the exact export list.

## Plugin classes

| Symbol | Description |
|--------|-------------|
| `AnalysisPlugin` | Abstract base class every plugin subclasses |
| `PluginMetadata` | Identity + capabilities declaration |
| `PluginNavItem` | One route/page entry shown in generated contracts and plugin navigation |
| `PluginCapabilities` | What platform features the plugin needs |
| `PluginType` | Enum: `STATIC`, `ANALYSIS`, `EXPERIMENT_DESIGN`, `FULL`, or `WORKFLOW` |
| `PlatformContext` | The runtime object the platform hands to plugins |
| `mint_plugin` | Preferred class decorator for plugin metadata and runtime behavior |
| `endpoint` | Decorator namespace for instance-method HTTP endpoints |
| `generated_ui` | Class decorator that opts into the SDK-managed generated workspace |
| `job` | Decorator for typed managed jobs |

Source: [`mint_sdk/plugin.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/plugin.py), [`mint_sdk/models.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/models.py), [`mint_sdk/context.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/context.py).

### `AnalysisPlugin`

Required package surface:

| Surface | Purpose |
|---------|---------|
| `mint.plugins` entry point | Points to the `AnalysisPlugin` subclass |
| `@mint_plugin(...)` or legacy `metadata` | Declares runtime behavior; package identity comes from PEP 621 |

Common lifecycle and routing methods:

| Method | Purpose |
|--------|---------|
| `metadata` (property) | Return legacy property metadata or the resolved `@mint_plugin` declaration |
| `@endpoint.get/post/put/patch/delete(...)` | Preferred route declaration for plugin instance methods |
| `get_routers()` | Advanced native routers below this plugin's API prefix; defaults to `[]` |
| `initialize(context)` | Initialize and retain the active platform context; default stores context |
| `shutdown()` | Clean up plugin resources; default no-op |

Optional lifecycle hooks (default to no-op):

| Method | When called |
|--------|-------------|
| `check_health()` | Periodically by the platform and surfaced in **Admin -> Platform -> Server** |
| `@on_event("experiment.before_save")` or legacy `on_before_experiment_save(...)` | Before any experiment write |
| `@on_event("experiment.after_save")` or legacy `on_after_experiment_save(...)` | After a successful experiment write |
| `@on_event("experiment.status_changed")` or legacy `on_experiment_status_change(...)` | On status flip |
| `@on_config_change(...)` / `apply_settings(settings)` | When plugin settings are applied |
| `get_migrations_package()` | Returns dotted path; `None` (default) means no migrations |
| `get_shared_models()` | List of SQLAlchemy models for owned tables |
| `get_frontend_dir()` | Path to built frontend (auto-detected by default) |

Convenience methods:

| Method | Purpose |
|--------|---------|
| `save_design(experiment_id, data, *, schema_version=None)` | Save / update `DesignData` |
| `load_design(experiment_id)` | Load `DesignData` |
| `save_analysis(experiment_id, result)` | Save / update `PluginAnalysisResult` |
| `save_analysis_artifact(experiment_id, result, *, artifact_key="default", display_name=None, note=None)` | Save / update one named `AnalysisArtifact` |
| `save_analysis_artifacts(experiment_id, artifacts)` | Atomically save multiple `AnalysisArtifactInput` records |
| `save_analysis_file_artifact(experiment_id, data, *, filename=None, artifact_key=None, kind="file", ...)` | Upload or reuse a file object and save a file-backed analysis artifact |
| `load_analysis(experiment_id, fields=None)` | Load this plugin's `PluginAnalysisResult`; optionally project selected top-level result keys |
| `load_analysis_artifact(experiment_id, *, artifact_key="default", plugin_id=None, fields=None)` | Load one active named artifact |
| `load_analysis_file_artifact(experiment_id, path, *, artifact_key="default", plugin_id=None)` | Stream a file-backed artifact to a local path |
| `load_analysis_artifacts(experiment_id, *, include_others=False, include_archived=False)` | Load artifact metadata for an experiment |
| `archive_analysis_artifact(experiment_id, *, artifact_key="default")` | Archive one of this plugin's artifacts |
| `restore_analysis_artifact(experiment_id, *, artifact_key="default")` | Restore one of this plugin's archived artifacts |
| `load_artifacts(experiment_id)` | Legacy helper: load only `result["artifacts"]` (or a custom key) from `PluginAnalysisResult` |
| `load_analyses(experiment_id, include_others=False)` | Load analysis results; defaults to this plugin's own result only |
| `save(experiment_id, *, design=..., analysis=...)` | Save both at once |
| `load(experiment_id)` | Load both |
| `delete_design(experiment_id)` | Delete design |
| `delete_analysis(experiment_id)` | Delete analysis result |
| `get_plugin_db_session()` (async ctx) | Mode-portable session for plugin tables |
| `save_template(...)`, `load_template(...)` | Save/load one typed biology template |
| `save_template_collection(...)`, `load_template_collection(...)` | Save/load multiple biology templates |
| `save_template_preset(...)` | Save one built-in template preset collection |

`save_analysis()` / `load_analysis()` are the compatibility result path. Prefer `save_analysis_artifact()` for outputs that should appear as managed artifacts in the experiment UI, especially when one run produces multiple named outputs or file-backed downloads. `load_analysis(fields=[...])` remains useful when an older result contains large tables and the UI only needs a few metadata keys.

Settings:

| Symbol | Purpose |
|--------|---------|
| `@mint_plugin(config=SettingsModel)` | Preferred declaration for typed settings |
| `settings` (property) | Current settings instance |
| `apply_settings(dict)` | Validate + populate settings |
| `save_settings_transactionally(dict_or_model, expected_revision=...)` | Persist a full settings replacement against an optional opaque revision |
| `patch_settings_transactionally({...})` | Persist a shallow partial settings update with bounded CAS retries |
| `get_configurable_settings()` | Auto-derived from decorator-owned config |

Standalone helpers:

| Method | Purpose |
|--------|---------|
| `_setup_standalone_db(storage_dir=None)` | Initialize local SQLite |
| `_teardown_standalone_db()` | Close local SQLite |
| `is_standalone` (property) | True when `_context is None` |

### `PluginMetadata`

Dataclass fields:

```python
name: str
version: str
description: str
analysis_type: str            # "metabolomics", "oncology", etc.
routes_prefix: str            # "/my-plugin"
plugin_type: PluginType = PluginType.ANALYSIS
capabilities: PluginCapabilities = PluginCapabilities()
author: str = ""
homepage: str = ""
license: str = ""
icon: str = ""                # SVG path data
color: str = ""               # Optional brand color hex
nav_items: list[PluginNavItem] = []
analysis_result_readers: list[str] = []
allowed_experiment_types: list[str] | None = None
schema_version: str = "1.0"
dependencies: list[str] = []  # plugin slugs that must load first
```

### `PluginNavItem`

Dataclass fields:

```python
path: str
label: str
icon: str = ""                # SVG path data, data URL, or https:// URL
description: str = ""
requires_auth: bool = False
requires_admin: bool = False
requires_feature: str | None = None
id: str = ""                  # Stable page id for generated contracts/navigation
```

### `PluginCapabilities`

Dataclass fields:

```python
requires_auth: bool = False
requires_database: bool = False
requires_experiments: bool = False
requires_shared_database: bool = False
supports_experiment_linking: bool = False
supports_email_notifications: bool = False
supports_teams_notifications: bool = False
supports_slack_notifications: bool = False
supports_calendar_events: bool = False
experiment_crud: bool | None = None
design_data_write: bool | None = None
analysis_result_write: bool | None = None
```

### `PluginType`

```python
class PluginType(str, Enum):
    STATIC = "static"
    ANALYSIS = "analysis"
    EXPERIMENT_DESIGN = "experiment_design"
    FULL = "full"
    WORKFLOW = "workflow"
```

The original four types supply compatibility defaults for experiment CRUD, design-data writes, and analysis-result writes. `WORKFLOW` is fail-closed for all three. Set `PluginCapabilities.experiment_crud`, `design_data_write`, or `analysis_result_write` to `True` or `False` to override one default without changing the other two; `None` preserves the type default.

### `PlatformContext`

| Method | Returns |
|--------|---------|
| `is_authenticated` (property) | `bool` |
| `get_current_user_dependency()` | FastAPI `Depends`-able |
| `get_optional_user_dependency()` | FastAPI `Depends`-able |
| `get_plugin_actor_dependency()` | FastAPI `Depends`-able typed `PluginActor` |
| `get_optional_plugin_actor_dependency()` | Optional typed `PluginActor` dependency |
| `get_job_visibility_dependency()` | Typed job-visibility dependency |
| `get_user_repository()` | `UserRepository \| None` |
| `get_experiment_repository()` | `ExperimentRepository \| None` |
| `get_plugin_role_repository()` | `PluginRoleRepository \| None` |
| `require_plugin_role(*roles)` | FastAPI `Depends`-able |
| `get_plugin_config()` | `PlatformConfig` (alias for `dict`) |
| `enqueue_notifications(...)` | Durable notification enqueue hook for supported platform integrations |
| `publish_calendar_events(...)` | Durable calendar event publish/cancel hook for supported platform integrations |
| `get_shared_db_session()` (async ctx) | SQLAlchemy session scoped to plugin's schema |

## Data models

| Symbol | Description |
|--------|-------------|
| `Experiment` | Dataclass — experiment row |
| `DesignData` | Dataclass — per-experiment design payload |
| `PluginAnalysisResult` | Dataclass — compatibility per-(experiment, plugin) analysis output |
| `AnalysisArtifactInput` | Dataclass — one named artifact to save in an atomic batch |
| `AnalysisArtifactSummary` | Dataclass — metadata-only artifact record |
| `AnalysisArtifact` | Dataclass — full artifact record with result payload |
| `AnalysisFileArtifactUpdate` | Dataclass — CAS file-artifact replacement result |
| `User` | Dataclass — user row |
| `UserPluginRole` | Dataclass — per-(user, plugin) role row |
| `PlatformConfig` | Type alias `dict[str, Any]` for platform config view |

Source: [`mint_sdk/repositories.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/repositories.py).

## Repository protocols

| Symbol | Description |
|--------|-------------|
| `ExperimentRepository` | Experiment CRUD; `save_design_data`, `get_design_data`, `delete_design_data`; compatibility analysis results; and named analysis artifacts |
| `UserRepository` | `get_by_id`, `get_by_username`, `list_all` |
| `PluginRoleRepository` | `get_role`, `set_role`, `remove_role`, `list_plugin_roles`, `list_user_roles` |

All repository methods are async. Integrated plugins receive one visibility-scoped `ExperimentRepository`; the resolved access policy independently enforces experiment CRUD, owned design-data writes, and own analysis-result/artifact writes. The `PluginType` defaults match the table in [Plugin types](/sdk/concepts/plugin-types), and explicit capability fields can narrow or widen each write boundary. `WORKFLOW` must opt in to every write it needs.

`ExperimentRepository.get_analysis_results(experiment_id)` and `list_analysis_artifacts(experiment_id)` return only the calling plugin's own data by default. Pass `include_others=True` only for intentional cross-plugin reader plugins whose `analysis_result_readers` declaration allows those plugin IDs. `get_analysis_result_fields(...)` and `get_analysis_artifact(..., fields=[...])` project selected top-level keys from `result`.

## Local database (standalone)

| Symbol | Description |
|--------|-------------|
| `LocalDatabase` | Local SQLite database used by standalone plugins |
| `LocalDatabaseConfig` | `storage_dir` and other configuration |

Source: [`mint_sdk/local_database.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/local_database.py).

## Lifecycle types

| Symbol | Description |
|--------|-------------|
| `HealthStatus` | Enum: `HEALTHY`, `DEGRADED`, `UNHEALTHY`, `UNKNOWN` |
| `PluginHealth` | Dataclass — health status report |
| `LifecycleHookResult` | Dataclass — `success`, `message`, `data` |

## Logging

| Symbol | Description |
|--------|-------------|
| `get_plugin_logger(name)` | Structured logger with auto-attached fields |

Source: [`mint_sdk/logging.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/logging.py).

## Exceptions

See [Exceptions](/sdk/api/exceptions) for the full taxonomy with constructor signatures.

| Symbol | Use |
|--------|-----|
| `PluginException` | Base structured Python error |
| `ValidationException` | Service-layer business validation |
| `PermissionException` | Service-layer authorization failure |
| `ConfigurationException` | Plugin configuration failure |
| `RepositoryException` | Generic repository/storage failure |
| `NotFoundException` | Service/repository lookup miss |
| `ConflictException` | Duplicate or state conflict |
| `PluginLifecycleException` | Startup/shutdown/health failure |

In FastAPI route handlers, use `HTTPException` when you need a specific HTTP status, or catch these SDK exceptions and translate them yourself.

## Migrations

See [Migrations](/sdk/api/migrations) for full signatures.

| Symbol | Description |
|--------|-------------|
| `PluginMigration` | Base class — set `version: int` and `name: str` class attrs |
| `MigrationOps` | Portable DDL helpers (10 methods: add_column, drop_column, rename_column, alter_column, create_table, drop_table, create_index, drop_index, backfill, execute) |
| `MigrationRunner` | Applies pending migrations via `run()` and `discover()` |
| `MigrationResult` | Dataclass with `current_version`, `applied`, `stamped`, `errors` |

## Testing harness

```python
from mint_sdk.testing import (
    CompletedPluginJob,         # completed job state + natural result value helper
    PluginJobTestError,         # raised when a harness-submitted job fails
    PluginTestHarness,          # run real @job declarations through the SDK job API
    make_test_plugin,           # build a minimal AnalysisPlugin subclass inline
    build_test_app,             # turn a plugin instance into a FastAPI app
    RecordingContext,           # in-memory PlatformContext with a working ExperimentRepository
    write_standalone_plugin_module,  # drop a uvicorn-compatible module into tmp_path
)
```

See [Recipes → Testing plugins](/sdk/recipes/testing-plugins) for usage. Prefer `PluginTestHarness` for `@job` plugins and `TestClient(create_plugin_app())` for HTTP endpoints.

## Export utilities

| Symbol | Description |
|--------|-------------|
| `auto_json_to_tree(data, *, compact=True)` | Generic dict → TreeNode list |
| `auto_json_to_csv(data)` | Generic dict → flat CSV string |
| `auto_json_to_summary(data)` | Generic dict → `{metadata, sections}` |
| `ANALYSIS_ARTIFACTS_KEY` | Legacy conventional result key (`"artifacts"`) for references inside `PluginAnalysisResult` |

`AnalysisPlugin.export_tree`, `export_summary`, `export_csv` use these by default; override on the plugin to customize.

## App factory

| Symbol | Description |
|--------|-------------|
| `create_standalone_app(plugin)` | Build a FastAPI app that mounts the plugin's routers; use it when replacing the scaffold's local factory |
| `mint_sdk.runtime:create_plugin_app` | SDK-owned Uvicorn factory used by current `mint init` projects and `mint dev` |
| `SPAStaticFiles` | StaticFiles subclass that falls through to `index.html` for SPA routing |
| `PluginDependency` | Helper for declaring plugin-aware FastAPI deps |
| `require_context` | FastAPI dependency that yields the active `PlatformContext` |

Source: [`mint_sdk/app.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/app.py).

Current `mint init` projects use the SDK-owned runtime target `mint_sdk.runtime:create_plugin_app`, which discovers the current project's single `mint.plugins` entry point and passes it to `create_standalone_app()`. Use `create_standalone_app(MyPlugin)` directly in tests or custom hosts when you already have the plugin class.

## Client

| Symbol | Description |
|--------|-------------|
| `MINTClient` | Typed REST client for cross-platform calls |

See [REST client](/sdk/api/client) for full signatures.

## Notes

- The package version is `mint_sdk.__version__`. With `hatch-vcs`, this is derived from the git tag at build time.
- Modules prefixed with `_` (`mint_sdk._discover`, `mint_sdk._version`, `mint_sdk._prompt`) are internal and may break without notice. Use only the symbols documented in `__init__.py`.
- For testing, see [`mint_sdk.testing`](https://github.com/MorscherLab/MINT/tree/main/packages/sdk-python/src/mint_sdk/testing) — exports may evolve faster than the main SDK; check the testing module's `__init__.py` in your installed version.

## Related

- [Concepts](/sdk/concepts/) — the model these symbols implement
- [Recipes](/sdk/recipes/) — patterns using these symbols
