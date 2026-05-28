# Route permissions

## Goal

Gate plugin routes by who's calling them. The SDK's plugin-facing mechanism is `PlatformContext.require_plugin_role(*roles)`. Platform RBAC permissions such as `experiments.edit` are enforced by platform routes, not by plugin code.

## Use a router factory for role guards

`require_plugin_role(*roles)` returns a FastAPI `Depends` object. Because route dependencies are bound when routers are mounted, create role-protected routers from the initialized plugin instance:

```python
# my_plugin/routers/admin.py
from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, status

if TYPE_CHECKING:
    from my_plugin.plugin import MyPlugin


async def _allow_standalone() -> None:
    return None


def create_router(plugin: "MyPlugin") -> APIRouter:
    router = APIRouter(tags=["admin"])
    context = getattr(plugin, "_context", None)
    admin_only = (
        context.require_plugin_role("admin")
        if context is not None
        else Depends(_allow_standalone)
    )

    @router.post(
        "/admin/rebuild",
        status_code=status.HTTP_202_ACCEPTED,
        dependencies=[admin_only],
    )
    async def rebuild_index() -> dict[str, str]:
        await plugin.rebuild_index()
        return {"status": "queued"}

    return router
```

Then mount it from the plugin:

```python
# my_plugin/plugin.py
from fastapi import APIRouter
from my_plugin.routers import admin


class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context

    def get_routers(self) -> list[tuple[APIRouter, str]]:
        return [(admin.create_router(self), "")]
```

In installed platform mode, the platform initializes the plugin before calling `get_routers()`, so `context.require_plugin_role(...)` is available. In standalone mode, the stub keeps local development simple.

## Authenticated user only

When a route only needs "logged in" rather than a plugin role, use the same pattern:

```python
async def _optional_standalone_user() -> None:
    return None


def create_router(plugin: "MyPlugin") -> APIRouter:
    router = APIRouter(tags=["profile"])
    context = getattr(plugin, "_context", None)
    current_user = (
        context.get_current_user_dependency()
        if context is not None
        else _optional_standalone_user
    )

    @router.get("/me/preferences")
    async def my_prefs(user: dict | None = Depends(current_user)):
        if user is None:
            return {"theme": "system"}
        return await plugin.load_preferences(int(user["sub"]))

    return router
```

Use `get_optional_user_dependency()` when anonymous requests should be allowed in integrated mode.

## Platform admin bypass

`require_plugin_role()` automatically lets platform admins through. A user with platform role `admin` passes any plugin role guard even without a `UserPluginRole` row.

Do not add hardcoded user IDs or duplicate admin checks in every handler. Put the guard on the route and let the platform context handle the bypass.

## Standalone fallback

Standalone mode has no platform auth or plugin role repository. Choose the fallback deliberately:

```python
from fastapi import HTTPException, status


async def _allow_standalone() -> None:
    return None


async def _deny_standalone() -> None:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Role-protected route is disabled in standalone mode.",
    )
```

Use `_allow_standalone` for tutorial and UI iteration routes. Use `_deny_standalone` when you are testing a sensitive path and want local behavior to fail closed.

## Patterns to avoid

- Do not read the `Authorization` header yourself. The platform auth dependency owns JWT, session cookie, MFA, and SSO handling.
- Do not import `api.dependencies.permissions` in plugin code. That is platform-internal.
- Do not rely on frontend-only hiding for destructive actions. Hide buttons for UX, but enforce roles on the backend route.
- Do not cache plugin role checks in the plugin process. Role assignments can change while the plugin is running.

## Notes

- A user without a plugin role assignment has role `None`; `require_plugin_role()` rejects them unless they are a platform admin.
- `RecordingContext` does not include a fake `PluginRoleRepository`. Use a platform integration test or a custom context fake for full role assertions.
- To show the current user's role in a frontend, expose a small `/me/role` route as in [Tutorial 4](/sdk/tutorials/plugin-roles).

## Related

- [Tutorials - Plugin roles](/sdk/tutorials/plugin-roles) - end-to-end role setup
- [Concepts - PlatformContext](/sdk/concepts/platform-context) - `require_plugin_role`
- [Reference - Permissions](/reference/permissions) - platform RBAC catalog
