# PlatformContext

MINT 1.2 gives an integrated plugin one long-lived `PlatformContext`. Use its scoped `ExperimentRepository` for experiment metadata, design data, analysis results, and artifacts. User identity is resolved separately for each request; never store the current user on the plugin instance.

## Choose the right integration boundary

| Runtime | Context | Platform data | Plugin-owned SQL tables |
|---------|---------|---------------|-------------------------|
| Installed, in process | Platform `PlatformContext` implementation | Async scoped repositories | `get_plugin_db_session()` with shared database capability |
| Installed, isolated subprocess | SDK `RemotePlatformContext` | Same async protocol over trusted internal HTTP | Shared SQL sessions unavailable |
| Standalone (`mint dev` without platform binding) | `None` | No platform repositories; selected helpers return empty values | SDK-managed local SQLite when declared |
| External notebook, script, CI | No plugin context | Synchronous `MINTClient` using the caller's credentials | Use platform APIs |

An isolated plugin is still **integrated**: `context is not None`. Do not construct a `RemotePlatformContext` or forge forwarded user headers in application code. The platform host establishes its trusted binding and checks internal API compatibility at startup.

```python
from mint_sdk import AnalysisPlugin, PlatformContext

class MyPlugin(AnalysisPlugin):
    async def initialize(self, context: PlatformContext | None = None) -> None:
        await super().initialize(context)
        # Open only resources this plugin owns here.
```

Use the public `self.context` property after initialization. `initialize()` is optional when no extra resources are needed.

## Request-scoped access

Use `CurrentExperiment` to resolve a route's `experiment_id`, and `CurrentPluginActor` for the trusted caller:

```python
from mint_sdk import (
    AnalysisPlugin, CurrentExperiment, CurrentPluginActor,
    PluginCapabilities, endpoint, mint_plugin,
)

@mint_plugin(
    analysis_type="qc",
    routes_prefix="/peak-qc",
    capabilities=PluginCapabilities(requires_auth=True, requires_experiments=True),
)
class PeakQcPlugin(AnalysisPlugin):
    @endpoint.get("/experiments/{experiment_id}/summary")
    async def summary(
        self, experiment: CurrentExperiment, actor: CurrentPluginActor,
    ) -> dict[str, object]:
        design = await self.load_design(experiment.id)
        return {
            "experiment_id": experiment.id,
            "requested_by": actor.user_id,
            "design_owner": experiment.design_owner_plugin_id,
            "design": design.data if design else None,
        }
```

`CurrentExperiment` checks `experiments.view`, resolves the actor-visible, type-compatible experiment, and returns 404 when the scoped lookup cannot see it. It returns 503 when no experiment repository exists. This avoids treating missing platform integration as an empty successful response.

## What the platform enforces

Access is the intersection of these rules:

1. **Plugin write policy**: `experiment_crud`, `design_data_write`, and `analysis_result_write`, with defaults derived from `PluginType`.
2. **Experiment compatibility**: the plugin's declared types plus any tighter platform/admin restriction. `None` means unrestricted; `[]` blocks all types.
3. **Actor visibility**: deployment visibility settings, project membership, experiment ownership/collaboration, and platform administrator access.
4. **Data ownership**: writes use the calling plugin's ID. A plugin cannot overwrite another plugin's design or artifacts.
5. **Declared readers**: cross-plugin analysis reads require exact IDs in `analysis_result_readers`.

These rules also apply over isolated-plugin internal HTTP. Even `FULL` receives scoped access. Plugin roles and route-specific permissions add checks; a plugin role alone does not grant visibility to every experiment. See [Route permissions](/sdk/recipes/route-permissions).

## Context services

| API | Use |
|-----|-----|
| `get_experiment_repository()` | Unified experiment CRUD, design, analysis, and artifact protocol |
| `get_plugin_data_repository()` | MINT 1.1 compatibility adapter; design methods retain `*_experiment_data` names |
| `get_user_repository()` | Read user records |
| `get_plugin_role_repository()` | Roles scoped to the current plugin |
| `get_plugin_actor_dependency()` | Native FastAPI dependency returning a typed actor |
| `get_optional_plugin_actor_dependency()` | Optional actor dependency |
| `require_plugin_role(*roles)` | `Depends` guard; platform admins bypass the plugin-role check |
| `get_allowed_experiment_types()` | Effective type restrictions |
| `get_data_store(experiment_id, plugin_id=None)` | Experiment/plugin-scoped object storage |
| `get_file_browser()` | Read-only access to configured server mounts |
| `get_shared_db_session()` | In-process SQL session for declared plugin-owned tables |
| `get_plugin_config()` | Persisted settings; can return a dict or an awaitable depending on host |
| `actor_scope(actor)` | Bind an already trusted actor around host-side async work |
| `enqueue_notifications(...)`, `publish_calendar_events(...)` | Host integration hooks normally called by SDK decorators |

Use `self.settings`, `@on_config_change`, and transactional settings helpers for typed configuration, rather than calling low-level config hooks. See [Lifecycle](/sdk/concepts/lifecycle).

## Persistence helpers and standalone behavior

The base class supplies the plugin ID and delegates to the same repository:

| Helper | Integrated result | No repository |
|--------|-------------------|---------------|
| `save_design()`, `load_design()` | `DesignData` or missing read | `None` |
| `save_analysis()`, `load_analysis()` | Compatibility `PluginAnalysisResult` | `None` |
| `save_analysis_artifact()`, `load_analysis_artifact()` | Named JSON artifact | `None` |
| `save_analysis_artifacts()` | Atomic batch in input order | Nonempty batch raises `RuntimeError`; empty batch returns `[]` |
| `save_analysis_file_artifact()` | Create-only file artifact | `None` |
| `update_analysis_file_artifact()` | CAS replacement and cleanup status | `None` |
| `load_analysis_artifacts()`, `load_analyses()` | Own outputs by default | `[]` |
| `archive_analysis_artifact()`, `restore_analysis_artifact()` | Changed metadata or no match | `None` |
| `delete_design()`, `delete_analysis()` | Whether a record was deleted | `False` |

These empty return values do **not** persist to standalone SQLite. Use local tables/files for deliberate standalone persistence, or require platform integration at the route boundary. `get_plugin_db_session()` handles local versus shared SQL, but cannot provide shared tables in isolated mode.

## Cross-plugin readers

Declare exact, case-sensitive producing plugin IDs:

```python
@mint_plugin(
    analysis_type="qc-dashboard",
    routes_prefix="/qc-dashboard",
    analysis_result_readers=["peak-qc", "calibration"],
)
class DashboardPlugin(AnalysisPlugin):
    @endpoint.get("/experiments/{experiment_id}/outputs")
    async def outputs(self, experiment: CurrentExperiment) -> list[dict[str, object]]:
        artifacts = await self.load_analysis_artifacts(
            experiment.id, include_others=True,
        )
        return [
            {"plugin_id": item.plugin_id, "key": item.artifact_key,
             "name": item.display_name}
            for item in artifacts
        ]
```

`include_others=True` includes the calling plugin and declared readers only. It does not grant write access. Archived artifacts are restricted to the owning plugin; do not combine `include_others=True` and `include_archived=True`.

## Source and next steps

Verified against [v1.2.1 context](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/context.py), [remote context](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/remote_context.py), and [platform scope enforcement](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/repositories/scoped_experiment_repository.py).

- [Reading and managing experiments](/sdk/recipes/reading-experiments)
- [Writing results and files](/sdk/recipes/writing-results)
- [Plugin-owned tables](/sdk/recipes/querying-plugin-data)
