# Tutorial 4 — Plugin Roles

Add `viewer`, `editor`, and `admin` roles to **panel-designer** from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables). An editor can mutate their own reusable panel drafts; a viewer cannot. Publishing still requires `experiments.edit` and a visible experiment.

This tutorial uses the v1.2 `CurrentPluginActor` dependency directly, so the role check works on ordinary `@endpoint` methods without a second router or a standalone authorization bypass.

## 1. Understand the permission boundaries

| Boundary | Answers | Example |
|---|---|---|
| Plugin capabilities | May this plugin perform this kind of platform write? | `design_data_write=True` |
| Platform permissions | May this user perform this platform action? | `experiments.edit` |
| Plugin role | May this user perform this plugin-specific action? | `editor` |
| Row ownership and experiment scope | Which records may this user access? | `Panel.owner_user_id == actor.user_id` |

Role strings are exact values stored per `(plugin_id, user_id)`. The platform enriches `CurrentPluginActor.plugin_role` from the current plugin's assignment. `actor.role` is the platform role; it is not the plugin role.

A platform admin bypasses the role check below. A plugin `admin` is simply one of the allowed plugin roles. Neither bypass removes the panel owner predicate from Tutorial 3.

## 2. Define one shared write guard

Create `src/mint_plugin_panel_designer/roles.py`:

```python
from fastapi import HTTPException
from mint_sdk import PluginActor


def require_panel_editor(actor: PluginActor) -> None:
    if not actor.is_platform_admin and actor.plugin_role not in {"editor", "admin"}:
        raise HTTPException(status_code=403, detail="Requires plugin role: editor or admin")
```

The same guard protects every draft mutation. There is no implicit permission hierarchy: the permitted values are the explicit set `{"editor", "admin"}`. Add an `operator` or `reviewer` role only when its actions are defined.

## 3. Guard create, replace, delete, and publish

Import the guard in `plugin.py`:

```python
from mint_plugin_panel_designer.roles import require_panel_editor
```

Add `require_panel_editor(actor)` as the first statement in **each** of these existing methods:

```python
# At the start of create_panel(self, body, actor):
require_panel_editor(actor)

# At the start of replace_panel(self, panel_id, body, actor):
require_panel_editor(actor)

# At the start of delete_panel(self, panel_id, actor):
require_panel_editor(actor)

# At the start of publish_panel(self, panel_id, experiment, actor):
require_panel_editor(actor)
```

Do not remove `_owned_panel(...)` from replace/delete/publish, the authenticated actor from create, or the `experiments.edit` check from publish. For example, the complete delete method becomes:

```python
@endpoint.delete("/panels/{panel_id}")
async def delete_panel(self, panel_id: str, actor: CurrentPluginActor) -> dict[str, bool]:
    require_panel_editor(actor)
    async with self.get_plugin_db_session() as session:
        panel = await self._owned_panel(session, panel_id, actor.user_id)
        await session.delete(panel)
    return {"deleted": True}
```

`list_panels` remains available to authenticated users and only returns their own drafts. A user with no plugin role can therefore read their existing drafts, but cannot create, replace, delete, or publish them.

## 4. Expose effective permissions for the UI

Add a typed response model above the plugin class:

```python
class PanelAccess(BaseModel):
    plugin_role: str | None
    can_edit: bool
    can_publish: bool
```

`BaseModel` is already imported in Tutorial 3. Add this endpoint inside `PanelDesignerPlugin`:

```python
@endpoint.get("/me/access", response_model=PanelAccess)
async def panel_access(self, actor: CurrentPluginActor) -> PanelAccess:
    can_edit = actor.is_platform_admin or actor.plugin_role in {"editor", "admin"}
    return PanelAccess(
        plugin_role=actor.plugin_role,
        can_edit=can_edit,
        can_publish=can_edit and actor.has_permission("experiments.edit"),
    )
```

Run `mint sdk generate`, then inspect the generated client's operation for `panel_access`. Load it when the workspace opens and disable create/save/delete buttons when `can_edit` is false. Enable publishing only when `can_publish` is true and an experiment is selected. Show a short explanation such as “An editor role is required to change panels.”

Keep normal request error handling: a user's role can change after the page loads. Frontend controls communicate permissions; the backend checks enforce them.

## 5. Test denial and ownership together

The original Tutorial 3 CRUD test uses the standalone actor, which has no plugin role. Update it to inject an editor **before its first request**:

```python
app.dependency_overrides[current_plugin_actor] = lambda: PluginActor(
    user_id="owner", plugin_role="editor",
)
```

When testing another user's ownership boundary, give that user `plugin_role="editor"` too; otherwise the role check returns 403 before the ownership lookup can return 404. Restore the owner editor override after that check instead of calling `app.dependency_overrides.clear()`.

Add `tests/test_panel_roles.py`:

```python
from pathlib import Path

from fastapi.testclient import TestClient
from mint_sdk import PluginActor
from mint_sdk.app import create_standalone_app
from mint_sdk.runtime_dependencies import current_plugin_actor
from pytest import MonkeyPatch

from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


def test_roles_do_not_bypass_panel_ownership(
    tmp_path: Path, monkeypatch: MonkeyPatch,
) -> None:
    plugin = PanelDesignerPlugin()
    plugin._setup_standalone_db(storage_dir=tmp_path)
    # Backend checks do not depend on a built frontend.
    monkeypatch.setattr(plugin, "get_frontend_dir", lambda: None)
    app = create_standalone_app(plugin, environ={})
    base = "/api/panel-designer/panels"
    body = {"name": "Pilot", "drugs": [{"name": "Cisplatin", "doses_uM": [1]}]}

    with TestClient(app) as client:
        # Standalone identity has no plugin role; writes fail closed.
        assert client.post(base, json=body).status_code == 403

        app.dependency_overrides[current_plugin_actor] = lambda: PluginActor(
            user_id="owner", plugin_role="editor",
        )
        created = client.post(base, json=body)
        assert created.status_code == 201
        panel_id = created.json()["id"]

        app.dependency_overrides[current_plugin_actor] = lambda: PluginActor(
            user_id="owner", plugin_role="viewer",
        )
        assert client.post(base, json=body).status_code == 403
        assert client.put(f"{base}/{panel_id}", json=body).status_code == 403
        assert client.delete(f"{base}/{panel_id}").status_code == 403

        app.dependency_overrides[current_plugin_actor] = lambda: PluginActor(
            user_id="other", plugin_role="admin",
        )
        assert client.delete(f"{base}/{panel_id}").status_code == 404

        app.dependency_overrides[current_plugin_actor] = lambda: PluginActor(
            user_id="owner", plugin_role="editor",
        )
        assert client.delete(f"{base}/{panel_id}").status_code == 200
```

```bash
uv run pytest -q
mint sdk generate
mint doctor --strict
```

These overrides exist only in tests. The running standalone app has no platform role assignment store, so its write requests remain denied. To exercise real role assignments, install the plugin into a disposable MINT instance. `mint dev --platform` is a development proxy and does not supply an installed plugin context.

## 6. Assign and verify roles in MINT

A platform admin assigns the exact role string to the user for `panel-designer` through MINT's plugin-role administration.

> [Screenshot: MINT plugin-role assignment for panel-designer showing an editor user and a viewer user]

| Assignment | Behavior in this tutorial |
|---|---|
| No plugin role / `viewer` | List own drafts; mutations denied |
| `editor` | Create/replace/delete own drafts |
| `admin` | Same draft permissions as editor; no cross-user row access |
| Platform admin | Pass the plugin-role guard; row ownership still applies |

Publishing additionally requires `experiments.edit`, a visible compatible experiment, and the plugin's design-write capability. Verify a real viewer gets 403, an editor can change their own draft, and another editor cannot access it.

For larger plugins using native FastAPI routers, `context.require_plugin_role("editor", "admin")` returns a ready-to-use `Depends` object with the same platform-admin bypass. It is available after platform initialization. Do not wrap it in another `Depends`, and do not replace a missing context with an “allow everyone” dependency.

See [route permissions](/sdk/recipes/route-permissions), [platform permissions](/reference/permissions), and [CI patterns](/sdk/operations/ci-patterns).
