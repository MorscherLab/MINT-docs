# Route permissions

## Goal

Gate plugin routes by who's calling them. Two complementary mechanisms: the platform's RBAC (`require_permission`) and the plugin's own roles (`require_plugin_role`).

## Plugin role guard

The simplest case — restrict to users with a specific plugin role.

```python
from fastapi import APIRouter, Depends

router = APIRouter()

class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context
        if context is not None:
            self.admin_only = Depends(context.require_plugin_role("admin"))
            self.editor_or_admin = Depends(context.require_plugin_role("editor", "admin"))
        else:
            async def _stub(): return None
            self.admin_only = Depends(_stub)
            self.editor_or_admin = Depends(_stub)


@router.delete("/items/{item_id}")
async def delete_item(item_id: int, _user = self.admin_only):
    ...
```

`require_plugin_role(*roles)` automatically lets platform admins through — you don't add a special case.

## Authenticated-user dependency

When you don't need a specific role, just an authenticated user:

```python
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context
        if context is not None:
            self.current_user = Depends(context.get_current_user_dependency())
        else:
            async def _stub(): return None
            self.current_user = Depends(_stub)


@router.get("/me/preferences")
async def my_prefs(user = self.current_user):
    return await load_prefs(user.id)
```

`get_optional_user_dependency()` is the variant that returns `None` for unauthenticated requests instead of raising.

## Combining with platform permissions

Plugin role checks happen on top of the platform's auth and route-level permissions. The platform applies its own `require_permission(...)` checks for any path under `/api/<plugin>/...` based on the plugin's `capabilities` — for example, a plugin with `requires_experiments=True` already requires `experiment.read` for routes that hit `ExperimentRepository`.

If you need a tighter platform-level check, do it explicitly inside the route — but consult the platform's RBAC catalog first to confirm the permission you want exists. See [Reference → Permissions](/reference/permissions).

```python
from fastapi import HTTPException, status

@router.post("/admin/maintenance/run")
async def run_maintenance(user = self.admin_only):
    # plugin-admin and platform-admin both pass
    if not _is_safe_to_run():
        raise HTTPException(status.HTTP_409_CONFLICT, "another maintenance run is active")
    return await _do_maintenance()
```

## Standalone fallback

In standalone mode, `self._context` is `None` and there's no auth. Stub out the dependencies so the same route code runs:

```python
class MyPlugin(AnalysisPlugin):
    async def initialize(self, context=None):
        self._context = context
        if context is not None:
            self.admin_only = Depends(context.require_plugin_role("admin"))
        else:
            async def _stub_admin(): return None  # always allow in dev
            self.admin_only = Depends(_stub_admin)
```

For a stricter standalone (e.g., a CI test of the guard's behavior), wire the stub to raise a 403 instead.

## Patterns to avoid

- **Don't read the `Authorization` header yourself.** The platform's auth dependency owns JWT/passkey validation. Reading it directly will miss session cookies, MFA, and SSO paths.
- **Don't hardcode admin user IDs.** Always go through `require_plugin_role` (auto-bypasses platform admins) or the user's `role` attribute (`user.role == "Admin"`).
- **Don't mix HTTP error codes from FastAPI with `PluginException`.** Throw `PluginException` subclasses (`PermissionException`, `ValidationException`, …) and let the platform's middleware turn them into structured responses. See [Recipes → Error handling](/sdk/recipes/error-handling).

## Notes

- `require_plugin_role` reads the user's role from `PluginRoleRepository` on every request. Cached lookups would defeat the dynamic admin-bypass for revoked admins; the platform handles caching at its repository layer.
- A user without a plugin role assignment has role `None` — `require_plugin_role` rejects them unless they're a platform admin.
- To list a user's role for the current plugin (e.g., to surface in the frontend), expose it via a `/me/role` route — see [Tutorial 4 → Plugin roles](/sdk/tutorials/plugin-roles#3-gate-ui-elements-by-role).

## Related

- [Concepts → PlatformContext](/sdk/concepts/platform-context) — `require_plugin_role` API
- [Tutorials → Plugin roles](/sdk/tutorials/plugin-roles) — end-to-end role setup
- [Reference → Permissions](/reference/permissions) — platform RBAC catalog
