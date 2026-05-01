# Tutorial 4 — Plugin roles

You'll add a per-plugin role enum to **panel-designer** (from [Tutorial 2](/sdk/tutorials/design-plugin-with-tables)) and gate panel deletion on the `admin` role. Platform admins automatically bypass the check.

**Time:** ~30 minutes
**Prereqs:** Tutorial 2 (panels CRUD); familiarity with `PlatformContext`

## When plugin roles vs platform roles

Two RBAC systems coexist:

| | Platform RBAC | Plugin role |
|---|---|---|
| Defined by | The platform — 18 fixed permissions | Each plugin — strings the plugin chooses |
| Stored in | `User.role` plus the platform's role-permission map | `UserPluginRole` rows |
| Granted to | Every user has exactly one platform role | Per-(user, plugin) — granted from **Admin → Plugins → \<plugin> → Users** |
| Affects | Platform-level permissions across all plugins | Just this plugin's UI / API |
| Platform admin bypass | n/a | Yes — admins always pass plugin role checks |

Use plugin roles when:

- You want a power-user / read-only split inside one plugin without inflating the platform's role catalog
- You need plugin-specific responsibilities ("approver", "operator", "auditor") that don't generalize
- Lab admins want to delegate plugin admin-ness without granting full platform admin

Don't use plugin roles when the responsibility maps cleanly to an existing platform permission — use the platform permission instead.

## 1. Define the role enum

```python
# src/panel_designer/roles.py
from enum import StrEnum


class PanelDesignerRole(StrEnum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"
```

A `StrEnum` is convenient because the values are strings on the wire and Python comparisons still work. Pick whatever roles your plugin needs; this tutorial uses three.

## 2. Gate the delete route

Add a delete route to the panels CRUD; gate it on `editor` or `admin`.

```python
# src/panel_designer/routes.py
from uuid import UUID
from fastapi import APIRouter, Depends, status
from mint_sdk import NotFoundException, PermissionException
from sqlalchemy import select

from panel_designer.models import Panel
from panel_designer.roles import PanelDesignerRole

router = APIRouter()


def _get_plugin():
    from panel_designer import plugin as _pkg
    return _pkg._INSTANCE


def _editor_or_admin():
    """Inject as a Depends — checks role on every request."""
    plugin = _get_plugin()
    if plugin._context is None:
        async def _stub(): return None     # standalone mode: skip
        return Depends(_stub)
    return Depends(plugin._context.require_plugin_role(
        PanelDesignerRole.EDITOR.value,
        PanelDesignerRole.ADMIN.value,
    ))


@router.delete("/panels/{panel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_panel(panel_id: UUID, _user = _editor_or_admin()):
    plugin = _get_plugin()
    async with plugin.get_plugin_db_session() as session:
        result = await session.execute(select(Panel).where(Panel.id == panel_id))
        panel = result.scalar_one_or_none()
        if panel is None:
            raise NotFoundException(f"Panel {panel_id} not found", entity="panel")
        await session.delete(panel)
        await session.commit()
```

`require_plugin_role(*allowed)` returns a FastAPI `Depends` that:

- Resolves the current user via the platform's auth dependency
- Reads the user's role for *this plugin* via `PluginRoleRepository`
- Allows the request through only if the user's role is in `allowed`, OR the user is a platform admin
- Raises a 403 with a `PermissionException` body otherwise

## 3. Gate UI elements by role

In the frontend, fetch the current user's plugin role and conditionally render:

```vue
<!-- frontend/src/views/PanelList.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi, useAuth } from '@morscherlab/mint-sdk'

const api = useApi()
const { user } = useAuth()
const myRole = ref<string | null>(null)

onMounted(async () => {
  // The platform exposes the current user's plugin role at this endpoint
  myRole.value = await api.get<string | null>('/api/panel-designer/me/role')
})

const canDelete = computed(() =>
  user.value?.role === 'Admin' ||
  myRole.value === 'editor' ||
  myRole.value === 'admin'
)

async function deletePanel(panelId: string) {
  await api.delete(`/api/panel-designer/panels/${panelId}`)
  // refresh list...
}
</script>

<template>
  <div class="panels">
    <div v-for="panel in panels" :key="panel.id">
      <span>{{ panel.name }}</span>
      <BaseButton
        v-if="canDelete"
        variant="danger"
        size="sm"
        @click="deletePanel(panel.id)"
      >
        Delete
      </BaseButton>
    </div>
  </div>
</template>
```

You'll need a route on the backend to surface the current user's role:

```python
# src/panel_designer/routes.py — add
@router.get("/me/role")
async def my_role():
    plugin = _get_plugin()
    if plugin._context is None:
        return None
    role_repo = plugin._context.get_plugin_role_repository()
    user_dep = plugin._context.get_current_user_dependency()
    # NOTE: in real code wire as a FastAPI Depends; abbreviated here
    user = await user_dep()
    if user is None:
        return None
    return await role_repo.get_role(plugin.metadata.name, user.id)
```

## 4. Assign roles in the platform UI

When the plugin is installed in a real MINT instance, admins assign plugin roles from **Admin → Plugins → \<plugin> → Users**:

> [Screenshot: plugin role assignment table — placeholder]

The dropdown lists every value your enum exports (the platform reads `metadata.capabilities` plus your declared role enum, surfaced via a separate hook in newer SDK versions). Saving writes a `UserPluginRole` row for that user.

## 5. Test the guard

```python
# tests/test_role_guard.py
import pytest
from mint_sdk.testing import (
    InMemoryPluginRoleRepository,
    StandalonePlatformContext,
)

from panel_designer.plugin import PanelDesignerPlugin
from panel_designer.roles import PanelDesignerRole


@pytest.fixture
async def plugin_with_roles():
    p = PanelDesignerPlugin()
    role_repo = InMemoryPluginRoleRepository()
    # Pre-assign role 17 -> EDITOR
    await role_repo.set_role("panel-designer", 17, PanelDesignerRole.EDITOR.value)
    ctx = StandalonePlatformContext(plugin_roles=role_repo)
    await p.initialize(ctx)
    yield p
    await p.shutdown()


@pytest.mark.asyncio
async def test_editor_can_delete(plugin_with_roles):
    # Use FastAPI's TestClient with the user dependency overridden;
    # verify that POSTing as user_id=17 succeeds and as user_id=99 returns 403
    ...
```

The exact test setup depends on the testing harness shape — see [Recipes → Testing plugins](/sdk/recipes/testing-plugins).

## 6. Platform admin bypass

`require_plugin_role` automatically lets platform admins through without consulting `PluginRoleRepository`. So a user with `User.role = "Admin"` can delete panels even if they have no `panel-designer` plugin role assigned.

This is the same pattern the platform uses everywhere: platform admins are super-users for all plugins. Plugin authors don't need to special-case admins themselves.

## Where you've landed

The panel-designer plugin now:

- Defines three plugin-internal roles (`viewer`, `editor`, `admin`)
- Gates `DELETE /panels/{id}` on `editor` or `admin`
- Surfaces the current user's plugin role at `/me/role`
- Conditionally renders the delete button in the frontend
- Honors the platform-admin bypass automatically

## Next

→ [Recipes → Route permissions](/sdk/recipes/route-permissions) — combining plugin roles with platform permissions
→ [Concepts → PlatformContext](/sdk/concepts/platform-context) — the `require_plugin_role` API in detail
→ [Recipes → Testing plugins](/sdk/recipes/testing-plugins) — exercising guards under test
