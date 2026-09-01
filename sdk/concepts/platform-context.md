# `PlatformContext`

`PlatformContext` is the single object the platform hands to a plugin. Through it, the plugin reaches every platform-side service: experiments and their design/analysis data, users, plugin roles, the platform config, and a database session scoped to the plugin's schema.

```python
from mint_sdk import AnalysisPlugin, PlatformContext, mint_plugin


@mint_plugin(analysis_type="custom", routes_prefix="/my-plugin")
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context: PlatformContext | None = None) -> None:
        await super().initialize(context)
```

When standalone, `context` is `None`; the plugin uses `LocalDatabase` (a `mint-sdk`-managed local SQLite) instead. When integrated, `context` is a real `PlatformContext` instance and every accessor below is live.

## Accessors

| Accessor | Returns | Notes |
|----------|---------|-------|
| `is_authenticated` (property) | `bool` | True if the active request has an authenticated user |
| `get_current_user_dependency()` | FastAPI `Depends` | Inject as `user = Depends(context.get_current_user_dependency())` |
| `get_optional_user_dependency()` | FastAPI `Depends` | As above but `None`-tolerant |
| `get_plugin_actor_dependency()` | FastAPI `Depends` | Yields typed `PluginActor` with platform role, plugin role, and permissions |
| `get_optional_plugin_actor_dependency()` | FastAPI `Depends` | Optional typed actor |
| `get_job_visibility_dependency()` | FastAPI `Depends` | Yields typed job visibility for job routes |
| `get_user_repository()` | `UserRepository \| None` | User lookups (read-only) |
| `get_experiment_repository()` | `ExperimentRepository \| None` | Experiment, `DesignData`, `AnalysisArtifact`, and compatibility `PluginAnalysisResult` access |
| `get_plugin_role_repository()` | `PluginRoleRepository \| None` | Per-plugin user roles |
| `require_plugin_role(*roles)` | FastAPI `Depends` | Route guard — see below |
| `get_plugin_config()` | `dict` (`PlatformConfig`) | Persisted plugin configuration view |
| `enqueue_notifications(...)` | async method | Durable notification enqueue hook when the platform supports it |
| `publish_calendar_events(...)` | async method | Durable calendar publish/cancel hook when the platform supports it |
| `get_shared_db_session()` | async context manager | Async SQLAlchemy session scoped to your plugin's schema |

In integrated mode, all five plugin types receive the same visibility-scoped `ExperimentRepository`. The resolved access policy independently controls experiment CRUD, owned design-data writes, and own analysis-result/artifact writes. `STATIC`, `ANALYSIS`, `EXPERIMENT_DESIGN`, and `FULL` supply compatibility defaults; `WORKFLOW` is fail-closed. `PluginCapabilities.experiment_crud`, `design_data_write`, and `analysis_result_write` can override each default independently. `get_shared_db_session()` requires shared-database setup; declare `requires_shared_database=True` when your plugin owns tables.

## Authentication and Current Actor

For ordinary `@endpoint` methods, use the typed request dependencies exported by the SDK:

```python
from mint_sdk import AnalysisPlugin, CurrentPluginActor, endpoint, mint_plugin


@mint_plugin(analysis_type="custom", routes_prefix="/my-plugin")
class MyPlugin(AnalysisPlugin):
    @endpoint.get("/me", auth=True)
    async def me(self, actor: CurrentPluginActor) -> dict[str, str | None]:
        return {
            "user_id": actor.user_id,
            "username": actor.username,
            "plugin_role": actor.plugin_role,
        }
```

Standalone mode returns a deliberate `standalone` actor. Integrated mode resolves the actor from the platform request and includes platform permissions plus the current plugin role when available.

## Plugin role guard

`require_plugin_role(*roles)` returns a dependency that:

- Resolves the current user via the same auth dependency
- Reads the user's plugin role from `PluginRoleRepository`
- Allows the request through only if the role is in `roles`
- **Bypasses** the check for platform admins automatically

```python
from fastapi import APIRouter, Depends


async def _allow_standalone():
    return None


def create_admin_router(plugin: MyPlugin) -> APIRouter:
    router = APIRouter(tags=["admin"])
    context = getattr(plugin, "_context", None)
    admin_or_owner = (
        context.require_plugin_role("admin", "owner")
        if context is not None
        else Depends(_allow_standalone)
    )

    @router.get("/admin/settings", dependencies=[admin_or_owner])
    async def settings():
        return {"settings": "..."}

    return router
```

See [Recipes → Route permissions](/sdk/recipes/route-permissions) for the full pattern.

## Database session

`get_shared_db_session()` is the canonical way for a plugin to talk to its own tables. The session has its `search_path` set to the plugin's schema, so unqualified table names resolve correctly:

```python
from sqlalchemy import select

class MyPlugin(AnalysisPlugin):
    async def list_panels(self):
        async with self._context.get_shared_db_session() as session:
            result = await session.execute(select(PanelModel))
            return result.scalars().all()
```

Standalone mode has its own equivalent — `AnalysisPlugin.get_plugin_db_session()` (an instance method on the plugin itself, not the context) routes to `LocalDatabase` when no context is present:

```python
class MyPlugin(AnalysisPlugin):
    async def list_panels(self):
        async with self.get_plugin_db_session() as session:
            ...   # works in both modes
```

Prefer `self.get_plugin_db_session()` over the context method directly — it gives you mode-portable plugin code.

Current `mint dev` / `create_plugin_app()` initializes standalone SQLite automatically for plugins with a shared-database contract. If you build a custom host, call `await plugin.ensure_standalone_database()` before using `get_plugin_db_session()` in standalone mode.

## Convenience methods on `AnalysisPlugin`

For the most common operations on `DesignData`, `AnalysisArtifact`, and compatibility `PluginAnalysisResult`, the plugin base class wraps `ExperimentRepository`:

| Method | What it does | Standalone? |
|--------|--------------|-------------|
| `await self.save_design(experiment_id, data)` | Save / update design data | Returns `None` |
| `await self.load_design(experiment_id)` | Load design data | Returns `None` |
| `await self.save_analysis_artifact(experiment_id, result, artifact_key="default")` | Save / update one named artifact for this plugin | Returns `None` |
| `await self.save_analysis_artifacts(experiment_id, artifacts)` | Atomically save multiple named artifacts | Raises without context |
| `await self.save_analysis_file_artifact(experiment_id, data, ...)` | Save an uploaded/reused file object as a managed artifact | Returns `None` |
| `await self.load_analysis_artifact(experiment_id, artifact_key="default")` | Load one active artifact for this plugin | Returns `None` |
| `await self.load_analysis_artifacts(experiment_id, include_others=False)` | Load artifact metadata; defaults to this plugin's own artifacts | Returns `[]` |
| `await self.archive_analysis_artifact(experiment_id, artifact_key="default")` | Archive one artifact owned by this plugin | Returns `None` |
| `await self.restore_analysis_artifact(experiment_id, artifact_key="default")` | Restore one archived artifact owned by this plugin | Returns `None` |
| `await self.save_analysis(experiment_id, result)` | Compatibility path: save / update `PluginAnalysisResult` for this plugin | Returns `None` |
| `await self.load_analysis(experiment_id, fields=None)` | Compatibility path: load this plugin's result, optionally projecting top-level result keys | Returns `None` |
| `await self.load_artifacts(experiment_id)` | Legacy helper: load only `result["artifacts"]` from this plugin's compatibility result | Returns `None` |
| `await self.load_analyses(experiment_id, include_others=False)` | Load compatibility results; defaults to this plugin's own result | Returns `[]` |
| `await self.save(experiment_id, design=..., analysis=...)` | Save both at once | Returns `(None, None)` |
| `await self.load(experiment_id)` | Load both | Returns `(None, None)` |
| `await self.delete_design(experiment_id)` | Delete design | Returns `False` |
| `await self.delete_analysis(experiment_id)` | Delete analysis | Returns `False` |

These are the daily authoring API. Drop down to `context.get_experiment_repository()` only when you need bulk operations or have multiple plugin IDs to coordinate.

For cross-plugin readers, call `load_analysis_artifacts(experiment_id, include_others=True)`, `load_analyses(experiment_id, include_others=True)`, or the matching repository methods explicitly. The default is intentionally scoped to the calling plugin so ordinary analysis plugins do not accidentally consume another plugin's output payloads.

## What `PlatformContext` is *not*

- **Not** a request-scoped object you `Depends`-inject. It's a long-lived object set during `initialize()` and stored on the plugin instance.
- **Not** a synchronous interface. Every accessor returning data uses async I/O. The shared-mode and isolated-mode variants both honor this.
- **Not** a container for user state. The user comes from the FastAPI auth dependency (`get_current_user_dependency()`), not from the context object directly.

## Standalone fallback pattern

For mode-portable code:

```python
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        await super().initialize(context)

    def get_experiment_id_from_request(self, request_body):
        # Use convenience methods — they no-op cleanly when standalone
        return request_body.get("experiment_id", 1)

    async def fetch(self, experiment_id):
        # Works in both modes
        return await self.load_design(experiment_id)
```

The convenience methods (`save_design`, `load_design`, …) return `None`/`False` in standalone mode rather than raising — your plugin can carry on with empty results in development without branching code.

## Next

→ [Data model](/sdk/concepts/data-model) — what the repos return
→ [Recipes → Reading experiments](/sdk/recipes/reading-experiments) — concrete `ExperimentRepository` patterns
→ [Recipes → Route permissions](/sdk/recipes/route-permissions) — using the plugin role guard
