# Tutorial 4 - Plugin roles

You'll add plugin-specific roles to **panel-designer** from [Tutorial 3](/sdk/tutorials/design-plugin-with-tables) and gate panel deletion on `editor` or `admin`.

Platform admins automatically bypass plugin role checks. Other users need a `UserPluginRole` row for this plugin.

**Time:** ~30 minutes
**Prereqs:** Tutorial 3 complete; familiarity with `PlatformContext`

## When to use plugin roles

Two permission systems coexist:

| | Platform RBAC | Plugin roles |
|---|---|---|
| Defined by | MINT platform | Your plugin |
| Stored in | `User.role` plus platform permissions | `UserPluginRole` rows |
| Scope | Platform-wide | One plugin |
| Typical use | Projects, experiments, admin pages | Plugin-specific viewer/editor/operator/admin split |
| Platform admin bypass | Built into platform permissions | Built into `require_plugin_role()` |

Use plugin roles when the responsibility only makes sense inside one plugin, such as `operator`, `reviewer`, `approver`, or the `viewer` / `editor` / `admin` split in this tutorial.

## 1. Define the role names

Create `src/mint_plugin_panel_designer/roles.py`:

```python
from enum import StrEnum


class PanelDesignerRole(StrEnum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"
```

These strings are what admins assign in the platform and what your routes check at request time.

## 2. Add delete support to the service

Update `src/mint_plugin_panel_designer/services/panel_service.py`:

```python
from fastapi import HTTPException, status
```

Add a method to `PanelService`:

```python
async def delete_panel(self, panel_id: int) -> None:
    async with self.plugin.get_plugin_db_session() as session:
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
    await self.plugin.save_design(experiment_id, {"panel_count": panel_count})
```

The service owns the data mutation. The router will own the authorization dependency.

## 3. Convert the panels router to a factory

FastAPI dependencies are bound when the router is mounted. The platform initializes an installed plugin before mounting routers, so a router factory can close over the initialized plugin and build role-aware dependencies.

Replace `src/mint_plugin_panel_designer/routers/panels.py` with:

```python
from typing import TYPE_CHECKING, Any

from fastapi import APIRouter, Depends, status

from mint_plugin_panel_designer.roles import PanelDesignerRole
from mint_plugin_panel_designer.schemas.panels import PanelIn, PanelOut
from mint_plugin_panel_designer.services.panel_service import PanelService

if TYPE_CHECKING:
    from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


async def _allow_standalone() -> None:
    return None


async def _optional_standalone_user() -> None:
    return None


def create_router(plugin: "PanelDesignerPlugin") -> APIRouter:
    router = APIRouter(tags=["panels"])
    service = PanelService(plugin)
    context = getattr(plugin, "_context", None)

    editor_or_admin = (
        context.require_plugin_role(
            PanelDesignerRole.EDITOR.value,
            PanelDesignerRole.ADMIN.value,
        )
        if context is not None
        else Depends(_allow_standalone)
    )

    current_user = (
        context.get_current_user_dependency()
        if context is not None
        else _optional_standalone_user
    )

    @router.get("/panels/{experiment_id}", response_model=list[PanelOut])
    async def list_panels(experiment_id: int) -> list[PanelOut]:
        return await service.list_panels(experiment_id)

    @router.post("/panels", response_model=PanelOut, status_code=status.HTTP_201_CREATED)
    async def create_panel(body: PanelIn) -> PanelOut:
        return await service.create_panel(body)

    @router.delete(
        "/panels/{panel_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        dependencies=[editor_or_admin],
    )
    async def delete_panel(panel_id: int) -> None:
        await service.delete_panel(panel_id)

    @router.get("/me/role")
    async def my_role(user: dict[str, Any] | None = Depends(current_user)) -> str | None:
        if context is None or user is None:
            return None
        if user.get("role") == "admin":
            return PanelDesignerRole.ADMIN.value

        role_repo = context.get_plugin_role_repository()
        if role_repo is None:
            return None

        user_id = user.get("sub") or user.get("id")
        if user_id is None:
            return None
        return await role_repo.get_role(plugin.metadata.name, int(user_id))

    return router
```

`dependencies=[editor_or_admin]` means FastAPI runs the role guard before the delete handler. In standalone mode there is no auth, so the tutorial keeps the delete route open for local development. For stricter local tests, change `_allow_standalone()` to raise a 403.

## 4. Wire the router factory

Update `src/mint_plugin_panel_designer/plugin.py`.

Remove the dependency import and lifecycle calls added in Tutorial 3:

```python
# remove these if present
from mint_plugin_panel_designer.routers.panels import panel_service_dep
from mint_plugin_panel_designer.services.panel_service import PanelService

panel_service_dep.set(...)
panel_service_dep.reset()
```

Keep the router import:

```python
from mint_plugin_panel_designer.routers import analysis, panels
```

Update `get_routers()`:

```python
def get_routers(self) -> list[tuple[APIRouter, str]]:
    return [
        (analysis.router, ""),
        (panels.create_router(self), ""),
    ]
```

Run:

```bash
uv run pytest -q
mint doctor --fix
```

## 5. Exercise the local route

Standalone mode uses the permissive stub guard:

```bash
mint dev
```

If port 8003 is busy, use `mint dev --port 8015` and change the curl URLs below.

In another terminal, create a panel and delete it:

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

When the plugin is installed in MINT, the same `DELETE` route is protected by `context.require_plugin_role("editor", "admin")`.

::: tip Installed mode matters
`mint dev --platform` uses the dev proxy. It makes the plugin visible in the platform UI, but the plugin process is still a standalone hot-reload server, so this tutorial's permissive standalone guard is used. Test real plugin-role enforcement with the plugin installed into a disposable MINT instance or with a custom `PlatformContext` fake.
:::

## 6. Assign roles in MINT

Admins assign plugin roles from the platform admin surface:

> [Screenshot: plugin role assignment table for panel-designer, with a user assigned the `editor` role]

Use these role strings:

| Role | Meaning in this tutorial |
|------|--------------------------|
| `viewer` | Can list panels |
| `editor` | Can create and delete panels |
| `admin` | Can create and delete panels; also used as plugin power-user role |

The platform stores assignments as `(plugin_id, user_id, role)` in `UserPluginRole`.

## 7. Gate frontend actions

After adding `/me/role` and `DELETE /panels/{panel_id}`, regenerate the frontend contract:

```bash
mint sdk generate
```

Then a frontend view can hide destructive actions unless the user has the right role:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BaseButton, useAuth } from '@morscherlab/mint-sdk'
import { useGeneratedPluginClient } from '../generated/mint-plugin'

const pluginClient = useGeneratedPluginClient()
const { user } = useAuth()
const myRole = ref<string | null>(null)

onMounted(async () => {
  myRole.value = await pluginClient.myRole()
})

const canDelete = computed(() => {
  return user.value?.role === 'admin' ||
    myRole.value === 'editor' ||
    myRole.value === 'admin'
})

async function deletePanel(panelId: number) {
  await pluginClient.deletePanel({ pathParams: { panelId } })
  // refresh the panel list here
}
</script>

<template>
  <BaseButton
    v-if="canDelete"
    variant="danger"
    size="sm"
    @click="deletePanel(panel.id)"
  >
    Delete
  </BaseButton>
</template>
```

The backend remains authoritative. Hiding the button improves UX, but the delete route must still enforce the role guard.

## 8. Test role behavior

The standalone test app is useful for route existence and local behavior, not full RBAC assertions:

```python
import pytest
from httpx import ASGITransport, AsyncClient
from mint_sdk.testing import build_test_app

from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


@pytest.fixture
async def client():
    plugin = PanelDesignerPlugin()
    app = build_test_app(plugin)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_delete_route_exists(client):
    response = await client.delete("/api/panel-designer/panels/999")
    assert response.status_code == 404
```

For true role tests, use a platform integration test or a custom `PlatformContext` fake that implements `get_current_user_dependency()` and `get_plugin_role_repository()`. The SDK's `RecordingContext` is intentionally lightweight and does not include a fake `PluginRoleRepository`.

## Where you've landed

The panel-designer plugin now:

- Defines plugin-local roles (`viewer`, `editor`, `admin`)
- Gates `DELETE /panels/{panel_id}` on `editor` or `admin`
- Surfaces the current user's role at `/me/role`
- Keeps standalone development simple with a permissive stub
- Keeps the backend as the source of truth for destructive actions

## Next

- [Recipes - Route permissions](/sdk/recipes/route-permissions) - reusable permission patterns
- [Concepts - PlatformContext](/sdk/concepts/platform-context) - `require_plugin_role`
- [Recipes - Testing plugins](/sdk/recipes/testing-plugins) - route and harness patterns
