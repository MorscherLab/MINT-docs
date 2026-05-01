# `PlatformContext`

`PlatformContext` is the single object the platform hands to a plugin. Through it, the plugin reaches every platform-side service: experiments, plugin data, users, plugin roles, the platform config, and a database session scoped to the plugin's schema.

```python
from mint_sdk import PlatformContext

class MyPlugin(AnalysisPlugin):
    async def initialize(self, context: PlatformContext | None = None):
        self._context = context   # may be None in standalone mode
```

When standalone, `context` is `None`; the plugin uses `LocalDatabase` (a `mint-sdk`-managed local SQLite) instead. When integrated, `context` is a real `PlatformContext` instance and every accessor below is live.

## Accessors

| Accessor | Returns | Notes |
|----------|---------|-------|
| `is_authenticated` (property) | `bool` | True if the active request has an authenticated user |
| `get_current_user_dependency()` | FastAPI `Depends` | Inject as `user = Depends(context.get_current_user_dependency())` |
| `get_optional_user_dependency()` | FastAPI `Depends` | As above but `None`-tolerant |
| `get_user_repository()` | `UserRepository \| None` | User lookups (read-only) |
| `get_experiment_repository()` | `ExperimentRepository \| None` | Experiment CRUD (read-only for ANALYSIS, full for EXPERIMENT_DESIGN) |
| `get_plugin_data_repository()` | `PluginDataRepository \| None` | Save/load `DesignData` and `PluginAnalysisResult` |
| `get_plugin_role_repository()` | `PluginRoleRepository \| None` | Per-plugin user roles |
| `require_plugin_role(*roles)` | FastAPI `Depends` | Route guard — see below |
| `get_config()` | `dict` (`PlatformConfig`) | Platform configuration view (filtered) |
| `get_shared_db_session()` | async context manager | Async SQLAlchemy session scoped to your plugin's schema |

Repositories return `None` when the corresponding capability isn't declared. So a plugin without `requires_experiments=True` will get `None` from `get_experiment_repository()` even when integrated. Plan your code accordingly.

## Authentication and current user

Two FastAPI dependencies cover the common cases:

```python
from fastapi import APIRouter, Depends
from mint_sdk import PlatformContext

router = APIRouter()

class MyPlugin(AnalysisPlugin):
    async def initialize(self, context: PlatformContext | None = None):
        self._context = context

    def get_routers(self):
        return [(router, "")]

@router.get("/me")
async def me(user = Depends(_plugin._context.get_current_user_dependency())):
    return {"id": user.id, "username": user.username}
```

In practice, plugins typically wrap the dependency once on the plugin instance:

```python
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context
        if context is not None:
            self.current_user = context.get_current_user_dependency()
        else:
            async def _stub(): return None
            self.current_user = _stub
```

…and then routes write `Depends(plugin.current_user)`. Standalone mode falls through to the stub.

## Plugin role guard

`require_plugin_role(*roles)` returns a dependency that:

- Resolves the current user via the same auth dependency
- Reads the user's plugin role from `PluginRoleRepository`
- Allows the request through only if the role is in `roles`
- **Bypasses** the check for platform admins automatically

```python
@router.get("/admin/settings")
async def settings(user = context.require_plugin_role("admin", "owner")):
    return {"settings": "..."}
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

## Convenience methods on `AnalysisPlugin`

For the most common operations on `DesignData` and `PluginAnalysisResult`, the plugin base class wraps `PluginDataRepository`:

| Method | What it does | Standalone? |
|--------|--------------|-------------|
| `await self.save_design(experiment_id, data)` | Save / update design data | Returns `None` |
| `await self.load_design(experiment_id)` | Load design data | Returns `None` |
| `await self.save_analysis(experiment_id, result)` | Save / update analysis result for *this* plugin | Returns `None` |
| `await self.load_analysis(experiment_id)` | Load analysis result for this plugin | Returns `None` |
| `await self.save(experiment_id, design=..., analysis=...)` | Save both at once | Returns `(None, None)` |
| `await self.load(experiment_id)` | Load both | Returns `(None, None)` |
| `await self.delete_design(experiment_id)` | Delete design | Returns `False` |
| `await self.delete_analysis(experiment_id)` | Delete analysis | Returns `False` |

These are the daily authoring API. Drop down to `context.get_plugin_data_repository()` only when you need bulk operations or have multiple plugin IDs to coordinate.

## What `PlatformContext` is *not*

- **Not** a request-scoped object you `Depends`-inject. It's a long-lived object set during `initialize()` and stored on the plugin instance.
- **Not** a synchronous interface. Every accessor returning data uses async I/O. The shared-mode and isolated-mode variants both honor this.
- **Not** a container for user state. The user comes from the FastAPI auth dependency (`get_current_user_dependency()`), not from the context object directly.

## Standalone fallback pattern

For mode-portable code:

```python
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context
        if context is None:
            self._setup_standalone_db()      # base class helper

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
