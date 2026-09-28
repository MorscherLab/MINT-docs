# Python SDK reference

This reference targets the released **MINT SDK @MINT_VERSION@**.

Core public symbols exported from `mint_sdk`, grouped by area. Each entry has a one-line description and links to the source on GitHub; check `mint_sdk/__init__.py` in your installed version for the exact export list.

## Plugin classes

| Symbol | Description |
|--------|-------------|
| `AnalysisPlugin` | Abstract base class every plugin subclasses |
| `PluginMetadata` | Identity + capabilities declaration |
| `PluginNavItem` | One route/page entry shown in generated contracts and plugin navigation |
| `PluginCapabilities` | What platform features the plugin needs |
| `PluginType` | Enum: `STATIC`, `ANALYSIS`, `EXPERIMENT_DESIGN`, `FULL`, or `WORKFLOW` |
| `PlatformContext` | Long-lived runtime context; repositories retain request-scoped access |
| `CurrentPluginActor`, `CurrentExperiment`, `CurrentPluginRuntime` | Typed request dependencies |
| `PluginAccessPolicy`, `resolve_plugin_access_policy` | Effective CRUD/design/analysis write policy |
| `mint_plugin` | Preferred class decorator for plugin metadata and runtime behavior |
| `endpoint` | Decorator namespace for instance-method HTTP endpoints |
| `generated_ui` | Class decorator that opts into the SDK-managed generated workspace |
| `job` | Decorator for typed managed jobs |

Source: [`mint_sdk/plugin.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin.py), [`mint_sdk/models.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/models.py), [`mint_sdk/context.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/context.py).

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
| `@on_event("experiment.before_save")` or legacy `on_before_experiment_save(...)` | Before platform-service design-data save |
| `@on_event("experiment.after_save")` or legacy `on_after_experiment_save(...)` | After platform-service design-data save |
| `@on_event("experiment.status_changed")` or legacy `on_experiment_status_change(...)` | On status flip |
| `@on_config_change(...)` / `apply_settings(settings)` | When plugin settings are applied |
| `get_migration_spec()` | Opt-in Alembic `MigrationSpec`; `None` by default |
| `get_migrations_package()` | Legacy integer migration package; mutually exclusive with `get_migration_spec()` |
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
| `save_analysis_file_artifact(experiment_id, data, *, filename=None, artifact_key=None, kind="file", ...)` | Create-only file artifact; existing key conflicts |
| `update_analysis_file_artifact(experiment_id, artifact_key, data, *, expected_object_key=None, ...)` | CAS-replace an active file artifact; returns artifact and cleanup status |
| `save_managed_job_artifact(...)` | Publish a managed job output as a durable artifact |
| `load_analysis(experiment_id, *, fields=None)` | Load this plugin's `PluginAnalysisResult`; optionally project selected top-level result keys |
| `load_analysis_artifact(experiment_id, *, artifact_key="default", plugin_id=None, fields=None)` | Load one active named artifact |
| `load_analysis_file_artifact(experiment_id, path, *, artifact_key="default", plugin_id=None)` | Stream a file-backed artifact to a local path |
| `load_analysis_artifacts(experiment_id, *, include_others=False, include_archived=False)` | Load artifact metadata for an experiment |
| `archive_analysis_artifact(experiment_id, *, artifact_key="default")` | Archive one of this plugin's artifacts |
| `restore_analysis_artifact(experiment_id, *, artifact_key="default")` | Restore one of this plugin's archived artifacts |
| `load_artifacts(experiment_id)` | Legacy helper: load only `result["artifacts"]` (or a custom key) from `PluginAnalysisResult` |
| `load_analyses(experiment_id, *, include_others=False)` | Load analysis results; defaults to this plugin's own result only |
| `save(experiment_id, *, design=..., analysis=...)` | Sequential design and compatibility result saves; not atomic |
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
| `save_settings_transactionally(dict_or_model, expected_revision=...)` | Persist a full settings replacement; supply the opaque revision for a concurrency-safe edit |
| `settings_revision` | Current opaque content revision |
| `patch_settings_transactionally({...})` | Persist a shallow partial settings update with bounded CAS retries |
| `get_configurable_settings()` | Auto-derived from decorator-owned config |

Standalone helpers:

| Method | Purpose |
|--------|---------|
| `ensure_standalone_database(storage_dir=None)` | Public async standalone database initialization |
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
design_schema: dict[str, Any] | None = None
design_schema_version: str | None = None
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

Legacy defaults are read-only metadata plus analysis writes for `ANALYSIS`, CRUD/design for `EXPERIMENT_DESIGN`, all three for `FULL`, and no writes for `STATIC`. Explicit `PluginCapabilities` boolean fields override each corresponding default; `None` preserves it. `WORKFLOW` defaults to no writes and must request `experiment_crud=True` with design and analysis writes disabled. It does not own experiment designs or manage collaborators. See [Plugin types](/sdk/concepts/plugin-types).

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
| `get_experiment_repository()` | Unified `ExperimentRepository \| None` |
| `get_allowed_experiment_types()` | Effective type allowlist; `None` unrestricted, `[]` blocked |
| `get_data_store(experiment_id, plugin_id=None)` | Scoped object store |
| `get_file_browser()` | Read-only configured server mounts |
| `actor_scope(actor)` | Async context manager for a trusted actor |
| `get_plugin_data_repository()` | MINT 1.1 compatibility adapter over the experiment repository |
| `get_plugin_role_repository()` | `PluginRoleRepository \| None` |
| `require_plugin_role(*roles)` | FastAPI `Depends`-able |
| `get_plugin_config()` | `PlatformConfig` or awaitable, host-dependent; prefer typed `settings` |
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

### Dataclass fields

#### `Experiment`

```python
@dataclass(slots=True)
class Experiment:
    id: int
    name: str
    experiment_type: str
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: int | None = None
    parent_experiment_id: int | None = None
    project: str | None = None
    notes: str | None = None
    tags: dict = field(default_factory=dict)
    custom_metadata: dict = field(default_factory=dict)
    start_date: date | None = None
    end_date: date | None = None
    design_owner_plugin_id: str | None = None
```

#### `DesignData`

```python
@dataclass(slots=True)
class DesignData:
    id: int
    experiment_id: int
    plugin_id: str
    data: dict[str, Any]
    schema_version: str
    created_at: datetime
    updated_at: datetime
```

#### `PluginAnalysisResult`

```python
@dataclass(slots=True)
class PluginAnalysisResult:
    id: int
    experiment_id: int
    plugin_id: str
    result: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    artifact_id: int | None = None
    artifact_key: str | None = None
    display_name: str | None = None
    status: str | None = None
    result_keys: list[str] = field(default_factory=list)
```

#### `AnalysisArtifact`

```python
@dataclass(slots=True)
class AnalysisArtifact:
    id: int
    experiment_id: int
    plugin_id: str
    artifact_key: str
    display_name: str
    status: str
    result: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    result_keys: list[str] = field(default_factory=list)
    note: str | None = None
    archived_at: datetime | None = None
    archived_by: int | None = None
```

#### `User`

```python
@dataclass(slots=True)
class User:
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    email: str | None = None
    shortname: str | None = None
    first_name: str | None = None
    last_name: str | None = None
```

#### `UserPluginRole`

```python
@dataclass(slots=True)
class UserPluginRole:
    id: int
    user_id: int
    plugin_id: str
    role: str
    created_at: datetime
    updated_at: datetime
```

Source: [`mint_sdk/repositories.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py).

## Repository protocols

| Symbol | Description |
|--------|-------------|
| `ExperimentRepository` | CRUD plus `save_design_data`, `get_design_data`, `delete_design_data`, and all analysis/artifact methods below |
| `PluginDataRepository` | `save_experiment_data`, `get_experiment_data`, `delete_experiment_data`, compatibility `save_analysis_result` / `get_analysis_result`, plus `save_analysis_artifact`, `create_analysis_artifact`, `save_analysis_artifacts`, `list_analysis_artifacts`, `get_analysis_artifact`, `archive_analysis_artifact`, `restore_analysis_artifact` |
| `UserRepository` | `get_by_id`, `get_by_username`, `list_all` |
| `PluginRoleRepository` | `get_role`, `set_role`, `remove_role`, `list_plugin_roles`, `list_user_roles` |

All repository methods are async. MINT 1.2 uses one scoped experiment repository governed by the effective write capabilities, actor visibility, experiment-type restrictions, data ownership, and reader declarations. Even `FULL` is scoped. `PluginDataRepository` retains the old design-method names for MINT 1.1 compatibility; new code should use the experiment repository or convenience helpers.

`ExperimentRepository.get_analysis_results(experiment_id)` and `list_analysis_artifacts(experiment_id)` return only the calling plugin's own data by default. Pass `include_others=True` only for intentional cross-plugin reader plugins whose `analysis_result_readers` declaration allows those plugin IDs. `get_analysis_result_fields(...)` and `get_analysis_artifact(..., fields=[...])` project selected top-level keys from `result`.

### Repository return types

| Repository | Returns | Writes |
|------------|---------|--------|
| `ExperimentRepository` | Experiment, design, result, and artifact records | Effective `experiment_crud`, `design_data_write`, and `analysis_result_write` capabilities |
| `ExperimentRepository.save_design_data` | `DesignData` | Owner-scoped design upsert |
| `PluginDataRepository.save_experiment_data` | `DesignData` | `DesignData` |
| `PluginDataRepository.save_analysis_result` | `PluginAnalysisResult` | `PluginAnalysisResult` compatibility payload |
| `PluginDataRepository.save_analysis_artifact` | `AnalysisArtifact` | Named analysis artifact |
| `PluginDataRepository.save_analysis_artifacts` | `list[AnalysisArtifact]` | Atomic batch of named artifacts |
| `PluginDataRepository.list_analysis_artifacts` | `list[AnalysisArtifactSummary]` | — |
| `PluginDataRepository.get_analysis_artifact` | `AnalysisArtifact \| None` | — |
| `PluginDataRepository.archive_analysis_artifact` / `restore_analysis_artifact` | `AnalysisArtifactSummary \| None` | Artifact status |
| `PluginDataRepository.get_analysis_results` | `list[PluginAnalysisResult]` (calling plugin by default; pass `include_others=True` for every plugin's result on one experiment) | — |
| `UserRepository` | `User` | — |
| `PluginRoleRepository` | `UserPluginRole`, `str \| None` (a single role) | `UserPluginRole` |

MINT 1.2 consolidates these methods on `ExperimentRepository`. `PluginDataRepository` remains a MINT 1.1 adapter, including its old `save_experiment_data` / `get_experiment_data` / `delete_experiment_data` names. New code should use `save_design_data` / `get_design_data` / `delete_design_data` on the experiment repository or the plugin convenience helpers.

## Local database (standalone)

| Symbol | Description |
|--------|-------------|
| `LocalDatabase` | Local SQLite database used by standalone plugins |
| `LocalDatabaseConfig` | `storage_dir` and other configuration |

Source: [`mint_sdk/local_database.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/local_database.py).

## Lifecycle types

| Symbol | Description |
|--------|-------------|
| `HealthStatus` | Enum: `HEALTHY`, `DEGRADED`, `UNHEALTHY`, `UNKNOWN` |
| `PluginHealth` | Dataclass — health status report |
| `LifecycleHookResult` | Dataclass — `success`, `message`, `data` |

## Logging

| Symbol | Description |
|--------|-------------|
| `get_plugin_logger(plugin_name)` | **Deprecated**, removal in MINT 1.3. Use the standard library `logging.getLogger()` |

Source: [`mint_sdk/logging.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/logging.py).

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

MINT 1.2 SDK hosts map typed exceptions to the canonical HTTP envelope automatically. `HTTPException` remains useful for an explicit status. See [Exceptions](/sdk/api/exceptions) for mapping and ownership/type-conflict subclasses.

## Migrations

`MigrationSpec` (also exported from `mint_sdk`), the Alembic runtime functions and the legacy `PluginMigration` API are documented in [Migrations reference](/sdk/api/migrations).

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
| `DataObjectRef`, `ExperimentDataStore` | Typed object reference and storage protocol |
| `design_schema_from_model(Model)` | JSON Schema from a Pydantic design model |

`AnalysisPlugin.export_tree`, `export_summary`, `export_csv` use these by default; override on the plugin to customize.

## App factory

| Symbol | Description |
|--------|-------------|
| `create_standalone_app(plugin)` | Build a FastAPI app that mounts the plugin's routers; use it when replacing the scaffold's local factory |
| `mint_sdk.runtime:create_plugin_app` | SDK-owned Uvicorn factory used by current `mint init` projects and `mint dev` |
| `SPAStaticFiles` | StaticFiles subclass that falls through to `index.html` for SPA routing |
| `PluginDependency` | Helper for declaring plugin-aware FastAPI deps |
| `require_context(context)` | Returns `context` when it is set; raises HTTP 503 otherwise (integrated-only routes). Not a FastAPI dependency |

Source: [`mint_sdk/app.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/app.py).

Current `mint init` projects use the SDK-owned runtime target `mint_sdk.runtime:create_plugin_app`, which discovers the current project's single `mint.plugins` entry point and passes it to `create_standalone_app()`. Use `create_standalone_app(MyPlugin)` directly in tests or custom hosts when you already have the plugin class.

## Client

| Symbol | Description |
|--------|-------------|
| `MINTClient` | Typed REST client for cross-platform calls |

See [REST client](/sdk/api/client) for full signatures.

## Other exports

The tables above cover the core surface. Every other package-root export is listed here by source module; `mint docs python` shows signatures for the installed SDK. Names marked `*` are deprecated (see the next section).

| Module | Exports |
|--------|---------|
| `mint_sdk.actors` | `JobVisibility`, `JobVisibilityScope` |
| `mint_sdk.analysis` | `ArtifactResult`, `ImageResult`, `JobFinalizationContext`, `JobPresentation`, `JsonResult`, `JobContext`, `ManagedFile`, `ManagedFileResult`, `ServiceJob`, `StagedInputs`, `StagedJob`, `StagedPart`, `TableResult`, `TextResult`, `job_finalizer` |
| `mint_sdk.app` | `register_plugin_exception_handlers`* |
| `mint_sdk.config` | `JsonSettingsStore`, `MemorySettingsStore`, `PluginRuntimeMode`, `ResolvedSettings`*, `ResolvedSettingsProvider`, `SettingsFieldState`*, `SettingsCompareAndSwapAdapter`, `SettingsResolver`, `SettingsSource`, `SettingsStore`* |
| `mint_sdk.data_store` | `DataTransferProgress`, `TransferProgressCallback`, `LocalExperimentDataStore`, `validate_object_key` |
| `mint_sdk.design_validation` | `FieldError`, `validate_design_data`, `ensure_valid_design_data` |
| `mint_sdk.endpoint` | `PluginRouterMount` |
| `mint_sdk.exceptions` | `UnsupportedExperimentTypeException`, `EventVetoException`, `DesignDataOwnershipConflictException`, `get_plugin_exception_status_code` |
| `mint_sdk.filesystem` | `FileBrowser`, `ServerMount`, `MountInfo`, `DirectoryEntry`, `DirectoryListing`, `PathCrumb`, `EntryKind`, `SortKey`, `MountNotFoundError`, `MountPathError`, `MountPathNotFoundError` |
| `mint_sdk.instrument` | `AlertLevel`, `InstrumentAlert`, `InstrumentAlertBody`, `InstrumentState`, `InstrumentStatus`, `SampleInfo`, `SequenceProgress`, `build_sequence_progress` |
| `mint_sdk.integrations` | `NotificationSeverity`, `NotificationChannel`, `NotificationEvent`, `NotificationDispatchError`, `CalendarEvent`, `CalendarEventCancellation`, `CalendarPublishError`, `notify`, `calendar_event` |
| `mint_sdk.job_manager` | `JobActivitySnapshot`, `JobManager` |
| `mint_sdk.job_stream` | `JOB_EVENT_STREAM_OPENAPI_EXTRA`*, `JOB_EVENT_STREAM_RESPONSES`*, `JobEventStream`, `JobEventStreamResponse`, `create_job_event_stream_response` |
| `mint_sdk.jobs` | `JobCallback`, `JobClearPayload`*, `JobDeletePayload`*, `JobEventPayload`*, `JobListPayload`, `JobProgress`, `JobProgressPayload`*, `JobId`*, `JobState`, `JobStatePayload`, `JobStatus`, `JobSnapshotPayload`, `JobSubscription`, `JobUpdate`, `JobWatch`, `JobWatchCallback`, `TERMINAL_JOB_STATUSES`, `clone_job_state`, `job_can_cancel`, `job_can_delete`, `serialize_job_state` |
| `mint_sdk.lcms` | `LcmsContainerType`, `LcmsMethodPathEntry`, `LcmsPlateCell`, `LcmsPlateType`, `LcmsPolarity`, `LcmsSequenceItem`, `LcmsSequenceParams`*, `combine_lcms_sequence_csvs`*, `extract_lcms_common_prefix`, `extract_lcms_sample_name`, `infer_lcms_plate_type_from_positions`*, `insert_lcms_item_at_intervals`*, `lcms_sequence_items_to_csv`, `lcms_well_id_from_position`*, `number_lcms_sequence_items`, `parse_lcms_sequence_csv`, `plate_cells_to_lcms_sequence_items`, `reconstruct_lcms_plate_cells_from_sequence_items`, `reorder_lcms_sequence_numbers`*, `resolve_lcms_method_path` |
| `mint_sdk.migrations` | `MigrationOps`, `MigrationResult`, `MigrationRunner`, `LegacyBaseline`, `SchemaConformanceIssue`, `SchemaConformanceReport`, `check_model_schema_conformance` |
| `mint_sdk.permissions` | `ADMIN_ROLE`, `ADMIN_PANEL_PERMISSIONS`, `can_access_admin`, `can_access_plugin`, `can_access_policy`, `get_access_audience`, `get_user_permissions`*, `has_all_permissions`, `has_any_permission`, `is_admin_role`*, `is_admin_user`, `requires_permissions`, `requires_plugin_admin` |
| `mint_sdk.plugin_database` | `PluginDatabaseState`*, `ensure_standalone_plugin_database`, `plugin_has_shared_database_contract`, `plugin_requires_shared_database`*, `validate_plugin_database_runtime` |
| `mint_sdk.plugin_decorators` | `health_check`, `on_config_change`, `on_event`, `resolve_plugin_config_model` |
| `mint_sdk.plugin_lifecycle` | `BeforeExperimentSave`, `AfterExperimentSave`, `ExperimentStatusChanged`, `EventActor` |
| `mint_sdk.plugin_persistence` | `ANALYSIS_FILE_ARTIFACT_SCHEMA` |
| `mint_sdk.plugin_settings` | `SettingsChangeSource`, `ConfigChange`, `SettingsCommitState`*, `SettingsConflictError`, `SettingsReconciliationRequiredError`, `SettingsTransactionError`, `SettingsTransactionStage` |
| `mint_sdk.r` | `RAnalysisBridge`, `RScriptSpec`, `RBridgeError`, `RRunProvenance` |
| `mint_sdk.runtime_dependencies` | `PluginRuntimeContext`*, `CurrentJobVisibility`, `CurrentReadableJob`, `CurrentManageableJob`, `current_plugin_runtime`*, `current_plugin_actor`, `authorize_plugin_settings`, `current_experiment`, `current_job_visibility`*, `current_readable_job`*, `current_manageable_job`* |
| `mint_sdk.schema` | `config_model_to_form_fields`, `config_model_to_settings_schema` |
| `mint_sdk.settings_router` | `InMemorySettingsProvider`, `SettingsProvider`*, `create_settings_router` |
| `mint_sdk.templates` | `BioTemplateEnvelope`, `TEMPLATE_COLLECTION_KEY`, `BioTemplateCatalogEntry`, `BioTemplatePackEntry`, `BioTemplatePresetEntry`, `PlateMapTemplate`, `SampleSheetTemplate`, `SamplePrepTemplate`, `CalibrationCurveTemplate`, `DoseResponseTemplate`, `FlowCytometryPanelTemplate`, `InstrumentRunTemplate`, `QpcrPlateTemplate`, `TimeCourseTemplate`, `AssayMatrixTemplate`, `ReagentListTemplate`, `ProtocolStepsTemplate`, `TemplateValidationError`, `get_template_info`, `list_template_catalog`, `require_template_info`, `get_template_pack_info`, `list_template_packs`, `require_template_pack_info`, `get_template_preset_info`, `list_template_presets`, `require_template_preset_info`, `save_template_preset_collection`, `create_template_collection`, `create_template_preset_collection`, `create_elisa_assay_collection`, `create_flow_cytometry_assay_collection`, `create_lcms_batch_collection`, `create_qpcr_expression_collection`, `create_targeted_metabolomics_collection`, `create_wellplate_screen_collection`, `create_western_blot_assay_collection`, `extract_template_collection` |
| `mint_sdk.token_auth` | `ApiTokenVerifier`, `create_bearer_token_dependency`, `create_header_token_dependency` |

## Deprecated exports

These names still import from `mint_sdk` but emit a `DeprecationWarning` once per name and are scheduled for removal in MINT 1.3. `mint doctor` flags them. `PluginExperimentData` has already been removed; use `DesignData`.

| Export | Replacement |
|--------|-------------|
| `JOB_EVENT_STREAM_OPENAPI_EXTRA` | None |
| `JOB_EVENT_STREAM_RESPONSES` | None |
| `JobClearPayload` | None |
| `JobDeletePayload` | None |
| `JobEventPayload` | Import `JobStatePayload` / `JobSnapshotPayload` directly |
| `JobId` | The `str \| int` union |
| `JobProgressPayload` | `JobStatePayload.progress` |
| `LcmsSequenceParams` | None |
| `PluginDatabaseState` | None |
| `PluginRuntimeContext` | `CurrentPluginRuntime` |
| `ResolvedSettings` | `SettingsResolver` |
| `SettingsCommitState` | `SettingsTransactionStage` |
| `SettingsFieldState` | None |
| `SettingsProvider` | `InMemorySettingsProvider` |
| `SettingsStore` | `JsonSettingsStore` / `MemorySettingsStore` |
| `combine_lcms_sequence_csvs` | `parse_lcms_sequence_csv()` per file, then `lcms_sequence_items_to_csv()` |
| `current_job_visibility` | `CurrentJobVisibility` |
| `current_manageable_job` | `CurrentManageableJob` |
| `current_plugin_runtime` | `CurrentPluginRuntime` |
| `current_readable_job` | `CurrentReadableJob` |
| `get_plugin_logger` | Standard library `logging.getLogger()` |
| `get_user_permissions` | `has_any_permission()` / `has_all_permissions()` |
| `infer_lcms_plate_type_from_positions` | None |
| `insert_lcms_item_at_intervals` | None |
| `is_admin_role` | `is_admin_user()` |
| `lcms_well_id_from_position` | None |
| `plugin_requires_shared_database` | `plugin_has_shared_database_contract()` |
| `register_plugin_exception_handlers` | `create_standalone_app()` (registers handlers automatically) |
| `reorder_lcms_sequence_numbers` | `number_lcms_sequence_items()` |

Source: [`mint_sdk/__init__.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/__init__.py).

## Notes

- The package version is `mint_sdk.__version__`. With `hatch-vcs`, this is derived from the git tag at build time.
- Modules prefixed with `_` (`mint_sdk._discover`, `mint_sdk._version`, `mint_sdk._prompt`) are internal and may break without notice. Use only the symbols documented in `__init__.py`.
- For testing, see [`mint_sdk.testing`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/testing) — exports may evolve faster than the main SDK; check the testing module's `__init__.py` in your installed version.

## Related

- [Concepts](/sdk/concepts/) — the model these symbols implement
- [Recipes](/sdk/recipes/) — patterns using these symbols
