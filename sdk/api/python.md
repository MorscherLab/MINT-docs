# Python SDK reference

Core public symbols exported from `mint_sdk`, grouped by area. Each entry has a one-line description and links to the source on GitHub; check `mint_sdk/__init__.py` in your installed version for the exact export list.

## Plugin classes

| Symbol | Description |
|--------|-------------|
| `AnalysisPlugin` | Abstract base class every plugin subclasses |
| `PluginMetadata` | Identity + capabilities declaration |
| `PluginNavItem` | One route/page entry shown in generated contracts and plugin navigation |
| `PluginCapabilities` | What platform features the plugin needs |
| `PluginType` | Enum: `STATIC`, `ANALYSIS`, `EXPERIMENT_DESIGN`, or `FULL` |
| `PlatformContext` | The runtime object the platform hands to plugins |

Source: [`mint_sdk/plugin.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/plugin.py), [`mint_sdk/models.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/models.py), [`mint_sdk/context.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/context.py).

### `AnalysisPlugin`

Abstract methods (every plugin must implement):

| Method | Returns |
|--------|---------|
| `metadata` (property) | `PluginMetadata` |
| `get_routers()` | `list[tuple[APIRouter, str]]` |
| `initialize(context)` | `None` (async) |
| `shutdown()` | `None` (async) |

Optional lifecycle hooks (default to no-op):

| Method | When called |
|--------|-------------|
| `check_health()` | Periodically by **Admin → Status** |
| `on_before_experiment_save(experiment_id, data)` | Before any experiment write |
| `on_after_experiment_save(experiment_id, data)` | After a successful experiment write |
| `on_experiment_status_change(experiment_id, old, new)` | On status flip |
| `apply_settings(settings)` | When the plugin's settings change |
| `get_migrations_package()` | Returns dotted path; `None` (default) means no migrations |
| `get_shared_models()` | List of SQLAlchemy models for owned tables |
| `get_frontend_dir()` | Path to built frontend (auto-detected by default) |

Convenience methods:

| Method | Purpose |
|--------|---------|
| `save_design(experiment_id, data, *, schema_version=None)` | Save / update `DesignData` |
| `load_design(experiment_id)` | Load `DesignData` |
| `save_analysis(experiment_id, result)` | Save / update `PluginAnalysisResult` |
| `load_analysis(experiment_id)` | Load `PluginAnalysisResult` |
| `save(experiment_id, *, design=..., analysis=...)` | Save both at once |
| `load(experiment_id)` | Load both |
| `delete_design(experiment_id)` | Delete design |
| `delete_analysis(experiment_id)` | Delete analysis result |
| `get_plugin_db_session()` (async ctx) | Mode-portable session for plugin tables |
| `save_template(...)`, `load_template(...)` | Save/load one typed biology template |
| `save_template_collection(...)`, `load_template_collection(...)` | Save/load multiple biology templates |
| `save_template_preset(...)` | Save one built-in template preset collection |

Settings:

| Symbol | Purpose |
|--------|---------|
| `settings_model` (class attr) | Pydantic model for typed settings |
| `settings` (property) | Current settings instance |
| `apply_settings(dict)` | Validate + populate settings |
| `save_settings(dict_or_model)` | Persist via the platform's config store |
| `get_configurable_settings()` | Auto-derived from `settings_model` |

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
```

### `PluginType`

```python
class PluginType(str, Enum):
    STATIC = "static"
    ANALYSIS = "analysis"
    EXPERIMENT_DESIGN = "experiment_design"
    FULL = "full"
```

Use `ANALYSIS` for plugins that read experiments and write analysis results, `EXPERIMENT_DESIGN` for plugins that own experiment design data, `FULL` only when one plugin must write both design data and analysis results, and `STATIC` for UI/reporting plugins that should not write either.

### `PlatformContext`

| Method | Returns |
|--------|---------|
| `is_authenticated` (property) | `bool` |
| `get_current_user_dependency()` | FastAPI `Depends`-able |
| `get_optional_user_dependency()` | FastAPI `Depends`-able |
| `get_user_repository()` | `UserRepository \| None` |
| `get_experiment_repository()` | `ExperimentRepository \| None` |
| `get_plugin_data_repository()` | `PluginDataRepository \| None` |
| `get_plugin_role_repository()` | `PluginRoleRepository \| None` |
| `require_plugin_role(*roles)` | FastAPI `Depends`-able |
| `get_config()` | `PlatformConfig` (alias for `dict`) |
| `get_shared_db_session()` (async ctx) | SQLAlchemy session scoped to plugin's schema |

## Data models

| Symbol | Description |
|--------|-------------|
| `Experiment` | Dataclass — experiment row |
| `DesignData` | Dataclass — per-experiment design payload |
| `PluginExperimentData` | Backward-compat alias for `DesignData` |
| `PluginAnalysisResult` | Dataclass — per-(experiment, plugin) analysis output |
| `User` | Dataclass — user row |
| `UserPluginRole` | Dataclass — per-(user, plugin) role row |
| `PlatformConfig` | Type alias `dict[str, Any]` for platform config view |

Source: [`mint_sdk/repositories.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/repositories.py).

## Repository protocols

| Symbol | Description |
|--------|-------------|
| `ExperimentRepository` | `get_by_id`, `list_all`, `create`, `update`, `delete`, `has_design_data` |
| `PluginDataRepository` | `save_experiment_data`, `get_experiment_data`, `delete_experiment_data`, `save_analysis_result`, `get_analysis_result`, `get_analysis_results`, `delete_analysis_result` |
| `UserRepository` | `get_by_id`, `get_by_username`, `list_all` |
| `PluginRoleRepository` | `get_role`, `set_role`, `remove_role`, `list_plugin_roles`, `list_user_roles` |

All repository methods are async. `ANALYSIS` and `STATIC` plugins receive a read-only `ExperimentRepository`; `EXPERIMENT_DESIGN` plugins can create/update/delete through the design-scoped wrapper; `FULL` receives the unrestricted platform repository. Data writes are also type-gated: `ANALYSIS` can save analysis results, `EXPERIMENT_DESIGN` can save design data, `FULL` can save both, and `STATIC` can save neither.

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
    make_test_plugin,           # build a minimal AnalysisPlugin subclass inline
    build_test_app,             # turn a plugin instance into a FastAPI app
    RecordingContext,           # in-memory PlatformContext with a working PluginDataRepository
    write_standalone_plugin_module,  # drop a uvicorn-compatible module into tmp_path
)
```

These four are the entire public testing surface. See [Recipes → Testing plugins](/sdk/recipes/testing-plugins) for usage.

## Export utilities

| Symbol | Description |
|--------|-------------|
| `auto_json_to_tree(data, *, compact=True)` | Generic dict → TreeNode list |
| `auto_json_to_csv(data)` | Generic dict → flat CSV string |
| `auto_json_to_summary(data)` | Generic dict → `{metadata, sections}` |

`AnalysisPlugin.export_tree`, `export_summary`, `export_csv` use these by default; override on the plugin to customize.

## App factory

| Symbol | Description |
|--------|-------------|
| `create_standalone_app(plugin)` | Build a FastAPI app that mounts the plugin's routers; use it when replacing the scaffold's local factory |
| `SPAStaticFiles` | StaticFiles subclass that falls through to `index.html` for SPA routing |
| `PluginDependency` | Helper for declaring plugin-aware FastAPI deps |
| `require_context` | FastAPI dependency that yields the active `PlatformContext` |

Source: [`mint_sdk/app.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/app.py).

Current `mint init` projects generate a `create_standalone_app()` function inside `plugin.py`, and `mint dev` runs that discovered factory. The SDK-level `create_standalone_app()` helper is the reusable version for plugins that want to remove the generated boilerplate.

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
