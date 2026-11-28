# Tutorial 4 — Access Levels

Add access levels to `panel-designer` from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables). Every user with the `plugins.use` permission manages their own panel drafts. A role with `plugins.configure` also sees a summary of all drafts. Only a platform administrator can delete a draft of another user.

A plugin tags each endpoint, job, MCP tool and page with an `access` level: `use` (the default), `configure` or `admin`. The platform maps the level to its own permissions, and the plugin stores no roles. See [Access levels](/sdk/recipes/route-permissions#access-levels) for who passes each level.

## 1. Understand the permission boundaries

| Boundary | Answers | Example |
|---|---|---|
| Plugin write set | May this plugin perform this kind of platform write? | `writes = {"experiments", "design"}` |
| Platform permissions | May this user perform this platform action? | `experiments.edit` |
| Access level | May this user call this plugin endpoint, job, tool or page? | `access="configure"` |
| Row ownership and experiment scope | Which records may this user access? | `Panel.owner_user_id == actor.user_id` |

No access level replaces the owner predicate of Tutorial 3.

## 2. Tag the endpoints

Add a response model above the plugin class:

```python
class PanelAccess(BaseModel):
    can_configure: bool
    can_admin: bool
    can_publish: bool


class PanelStats(BaseModel):
    panels: int
    owners: int
```

Add these endpoints inside `PanelDesignerPlugin`. `func` comes from SQLAlchemy (`from sqlalchemy import func`):

```python
@endpoint.get("/me/access", response_model=PanelAccess)
async def panel_access(self, actor: CurrentActor) -> PanelAccess:
    return PanelAccess(
        can_configure=actor.can("configure"),
        can_admin=actor.can("admin"),
        can_publish=actor.has_permission("experiments.edit"),
    )

@endpoint.get("/stats", response_model=PanelStats, access="configure")
async def panel_stats(self) -> PanelStats:
    async with self.context.db() as session:
        result = await session.execute(
            select(func.count(Panel.id), func.count(func.distinct(Panel.owner_user_id)))
        )
        panels, owners = result.one()
    return PanelStats(panels=panels, owners=owners)

@endpoint.delete("/all-panels/{panel_id}", access="admin")
async def delete_any_panel(self, panel_id: str) -> dict[str, bool]:
    async with self.context.db() as session:
        panel = await session.get(Panel, panel_id)
        if panel is None:
            raise HTTPException(status_code=404, detail="Panel not found")
        await session.delete(panel)
    return {"deleted": True}
```

The SDK refuses a caller below the level with 403 before the handler runs, so the handlers need no role check of their own. The draft endpoints keep the default `access="use"`.

Page entries take the same argument. A page with an `access` above `"use"` is hidden from viewers below that level:

```python
from mint_sdk import Page

class PanelDesignerMeta(Metadata):
    ...
    pages = [
        Page("Panels", "/", id="panels"),
        Page("All panels", "/all", id="all-panels", access="configure"),
    ]
```

A page with an `access` needs `auth = True` on the `Metadata`, which is the default. `Metadata.settings_access` sets the level that can change the plugin settings (`"admin"` by default).

A job takes the level in its `Job` spec: `class Reindex(Job): access = "admin"`. An MCP tool takes it in its `Tool` spec. In a handler, `actor.can("configure")` tells whether the caller meets a level, for example to hide a field.

## 3. Use the levels in the UI

1. Run `mint sdk generate`. The client now has `panelAccess()`, `panelStats()` and `deleteAnyPanel(panelId)`.
2. Load the access flags when the workspace opens.
3. Show the summary only when `can_configure` is true.
4. Show the delete action only when `can_admin` is true.

`usePlatform().can('configure')` gives the same answer from the platform context. The frontend only shows or hides controls; the backend checks enforce the levels.

## 4. Test every level

Standalone mode passes every level, so the tests of Tutorial 3 stay valid. To test a level, give the plugin a platform context: `RecordingContext(actor=...)` gives an actor with the role and permissions that you choose. It has no database, so test routes that pass or fail at the level check. Add `tests/test_panel_access.py`:

```python
from mint_sdk import Actor
from mint_sdk.testing import Harness, RecordingContext

from mint_plugin_panel_designer.plugin import PanelDesignerPlugin

BASE = "/api/panel-designer"
MEMBER = Actor(user_id="1", username="ada", role="member", permissions=frozenset({"plugins.use"}))
LEAD = Actor(
    user_id="2", username="lee", role="lab-lead",
    permissions=frozenset({"plugins.use", "plugins.configure"}),
)
ADMIN = Actor(user_id="3", username="root", role="admin")


def access_flags(actor: Actor) -> dict[str, bool]:
    with Harness(PanelDesignerPlugin, context=RecordingContext(actor=actor)) as harness:
        return harness.client.get(f"{BASE}/me/access").json()


def test_access_flags_follow_the_role() -> None:
    assert access_flags(MEMBER) == {"can_configure": False, "can_admin": False, "can_publish": False}
    assert access_flags(LEAD)["can_configure"] and not access_flags(LEAD)["can_admin"]
    assert access_flags(ADMIN)["can_admin"]


def test_configure_and_admin_routes_refuse_a_lower_level() -> None:
    with Harness(PanelDesignerPlugin, context=RecordingContext(actor=MEMBER)) as harness:
        assert harness.client.get(f"{BASE}/stats").status_code == 403
        assert harness.client.delete(f"{BASE}/all-panels/x").status_code == 403
    with Harness(PanelDesignerPlugin, context=RecordingContext(actor=LEAD)) as harness:
        assert harness.client.delete(f"{BASE}/all-panels/x").status_code == 403
```

```bash
uv run pytest -q
mint sdk generate
mint doctor --strict
```


## 5. Verify and deploy

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying).

On the test platform, check the real roles in **Admin → Roles**:

| Role | Behavior in this tutorial |
|---|---|
| `plugins.use` only (Member) | Manage own drafts; `/stats` and `/all-panels/{id}` return 403 |
| `plugins.use` and `plugins.configure` | Also read `/stats` and see the "All panels" page |
| Platform administrator | Also delete any draft |
| Role without `plugins.use`, or a role that cannot see the plugin | 403 `plugin.permission_denied` or `plugin.not_visible` before the plugin runs |

Publishing also needs `experiments.edit`, a visible compatible experiment and the design-write capability of the plugin. For the platform permissions, see [Permissions](/reference/permissions).
