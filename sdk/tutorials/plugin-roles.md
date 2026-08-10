# Tutorial 4 - Plugin Roles

You'll add plugin-specific roles to **panel-designer** from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables) and gate panel deletion on `editor` or `admin`.

Platform admins automatically bypass plugin role checks. Other users need a `UserPluginRole` row for this plugin.

**Time:** 25-35 minutes
**Prereqs:** Tutorial 3 complete; familiarity with `PlatformContext`

## When to Use Plugin Roles

Two permission systems coexist:

| | Platform RBAC | Plugin roles |
|---|---|---|
| Defined by | MINT platform | Your plugin |
| Stored in | `User.role` plus platform permissions | `UserPluginRole` rows |
| Scope | Platform-wide | One plugin |
| Typical use | Projects, experiments, admin pages | Plugin-specific viewer/editor/operator/admin split |
| Platform admin bypass | Built into platform permissions | Built into `require_plugin_role()` |

Use plugin roles when the responsibility only makes sense inside one plugin, such as `operator`, `reviewer`, `approver`, or the `viewer` / `editor` / `admin` split in this tutorial.

## 1. Define the Role Names

Create `src/mint_plugin_panel_designer/roles.py`:

```python
from enum import StrEnum


class PanelDesignerRole(StrEnum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"
```

These strings are what admins assign in the platform and what your routes check at request time.

## 2. Add Delete Logic to the Plugin

In `src/mint_plugin_panel_designer/plugin.py`, add these imports:

```python
from fastapi import HTTPException, status
```

Then add this method to `PanelDesignerPlugin`:

```python
async def delete_panel(self, panel_id: int) -> None:
    async with self.get_plugin_db_session() as session:
        panel = await session.get(Panel, panel_id)
        if panel is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Panel {panel_id} not found",
            )

        experiment_id = panel.experiment_id
        await session.delete(panel)
        await session.commit()

    panel_count = await self.count_panels(experiment_id)
    await self.save_design(experiment_id, {"panel_count": panel_count})
```

The method owns the mutation. The router you add next owns authorization.

## 3. Add a Role-Protected Router

Most endpoints in Tutorial 3 used `@endpoint`. For role guards, use a small native router factory because `context.require_plugin_role(...)` is only available after the platform initializes the plugin.

Create an empty `src/mint_plugin_panel_designer/routers/__init__.py` so the router package can be imported.

Create `src/mint_plugin_panel_designer/routers/panel_roles.py`:

```python
from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, status
from mint_sdk import CurrentPluginActor

from mint_plugin_panel_designer.roles import PanelDesignerRole

if TYPE_CHECKING:
    from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


async def _allow_standalone() -> None:
    return None


def create_router(plugin: "PanelDesignerPlugin") -> APIRouter:
    router = APIRouter(tags=["panel-roles"])
    context = plugin.context

    editor_or_admin = (
        context.require_plugin_role(
            PanelDesignerRole.EDITOR.value,
            PanelDesignerRole.ADMIN.value,
        )
        if context is not None
        else Depends(_allow_standalone)
    )

    @router.delete(
        "/panels/{panel_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        dependencies=[editor_or_admin],
    )
    async def delete_panel(panel_id: int) -> None:
        await plugin.delete_panel(panel_id)

    @router.get("/me/role")
    async def my_role(actor: CurrentPluginActor) -> str | None:
        if actor.is_platform_admin:
            return PanelDesignerRole.ADMIN.value
        return actor.plugin_role

    return router
```

`dependencies=[editor_or_admin]` means FastAPI runs the role guard before the delete handler. In standalone mode there is no platform role repository, so the tutorial keeps deletion open for local development. For stricter local behavior, change `_allow_standalone()` to raise a 403.

## 4. Mount the Router

In `src/mint_plugin_panel_designer/plugin.py`, add:

```python
from fastapi import APIRouter

from mint_plugin_panel_designer.routers import panel_roles
```

Then add this method to `PanelDesignerPlugin`:

```python
def get_routers(self) -> list[tuple[APIRouter, str]]:
    return [(panel_roles.create_router(self), "")]
```

`resolve_plugin_routers()` combines these native routers with the `@endpoint` handlers from Tutorial 3, so the list/create routes stay unchanged.

## 5. Test the Local Fallback

Add a test:

```python
def test_standalone_delete_panel_uses_local_fallback() -> None:
    with TestClient(create_plugin_app()) as client:
        created = client.post(
            "/api/panel-designer/panels",
            json={
                "experiment_id": 1,
                "name": "Cisplatin dose-response",
                "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}],
            },
        )
        panel_id = created.json()["id"]

        deleted = client.delete(f"/api/panel-designer/panels/{panel_id}")

    assert deleted.status_code == 204
```

Run:

```bash
uv run pytest -q
mint doctor --strict
```

## 6. Exercise the Route

Start the plugin:

```bash
mint dev
```

Create a panel, then delete it:

```bash
curl -X POST http://127.0.0.1:8003/api/panel-designer/panels \
  -H "Content-Type: application/json" \
  -d '{
    "experiment_id": 1,
    "name": "Cisplatin dose-response",
    "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1, 10, 100]}]
  }'

curl -X DELETE http://127.0.0.1:8003/api/panel-designer/panels/1
```

When the plugin is installed in MINT, the same `DELETE` route is protected by:

```python
context.require_plugin_role("editor", "admin")
```

::: tip Installed mode matters
`mint dev --platform` makes the plugin visible through the platform dev proxy, but the plugin process is still a standalone hot-reload server. Test real plugin-role enforcement with the plugin installed into a disposable MINT instance or with a custom `PlatformContext` fake.
:::

## 7. Assign Roles in MINT

Admins assign plugin roles from the platform admin surface:

> [Screenshot: plugin role assignment table for panel-designer, with a user assigned the `editor` role]

Use these role strings:

| Role | Meaning in this tutorial |
|------|--------------------------|
| `viewer` | Can list panels |
| `editor` | Can create and delete panels |
| `admin` | Can create and delete panels; also used as plugin power-user role |

The platform stores assignments as `(plugin_id, user_id, role)` in `UserPluginRole`.

## 8. Gate Frontend Actions

After adding `/me/role` and `DELETE /panels/{panel_id}`, regenerate the frontend contract:

```bash
mint sdk generate
```

A frontend view can hide destructive actions unless the user has the right role:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BaseButton } from '@morscherlab/mint-sdk'
import { useGeneratedPluginClient } from '../generated/mint-plugin'

const client = useGeneratedPluginClient()
const myRole = ref<string | null>(null)

onMounted(async () => {
  myRole.value = await client.myRole()
})

const canDelete = computed(() => {
  return myRole.value === 'editor' || myRole.value === 'admin'
})

async function deletePanel(panelId: number): Promise<void> {
  await client.deletePanel({ pathParams: { panelId } })
}
</script>

<template>
  <BaseButton
    v-if="canDelete"
    tone="danger"
    @click="deletePanel(1)"
  >
    Delete
  </BaseButton>
</template>
```

Frontend hiding is only a usability hint. The backend role guard is the real protection.

## Where You've Landed

You now have:

- Plugin-specific role constants
- A role-protected delete route
- A `/me/role` endpoint for frontend gating
- Standalone fallback behavior for local development
- Installed-mode enforcement through `PlatformContext.require_plugin_role()`

## Next

- [Recipes → Route permissions](/sdk/recipes/route-permissions) - focused permission patterns
- [Reference → Permissions](/reference/permissions) - platform RBAC catalog
- [Operations → CI patterns](/sdk/operations/ci-patterns) - add route tests to CI
