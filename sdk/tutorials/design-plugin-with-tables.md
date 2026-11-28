# Tutorial 3 — Design Plugin With Tables

Build `panel-designer`, a standard experiment-design plugin that stores reusable drug panels in its own table. Users create, list, replace and delete their own panels. They then publish a panel into the design data of a visible MINT experiment. The plugin declares its tables with `Metadata.database`; see [Migrations](/sdk/concepts/migrations).

Prerequisites: [Tutorial 2](/sdk/tutorials/adding-a-frontend), Docker for `mint verify`, and a test MINT platform for the final PostgreSQL check.

## 1. Scaffold and declare dependencies

```bash
mint init panel-designer --name "Panel Designer" \
  --description "Reusable drug panels and experiment designs" \
  --mode standard --type experiment-design --yes
cd panel-designer
uv add 'mint-sdk[local-db]>=1.4.0,<2.0'
```

The `local-db` extra of the SDK supplies compatible SQLModel, SQLAlchemy, aiosqlite, greenlet and Alembic versions. Keep the package metadata, the `mint.plugins` entry point, the frontend and the packaging files of the scaffold. The examples use `src/mint_plugin_panel_designer/`; use the package path of your scaffold if it is different.

The plugin release, `Design(version="1.0")` and the Alembic revision `p001` are separate versions; see [What each version controls](/sdk/operations/versioning#what-each-version-controls).

## 2. Define the current table

Create `src/mint_plugin_panel_designer/models.py`:

```python
from uuid import uuid4

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class Panel(SQLModel, table=True):
    __tablename__ = "panels"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True, max_length=36)
    owner_user_id: str = Field(index=True, max_length=255)
    name: str = Field(max_length=200)
    drugs: list[dict[str, object]] = Field(sa_column=sa.Column(sa.JSON, nullable=False))
```

The application generates UUID strings, so the same model and migration work on SQLite and PostgreSQL without backend-specific identity columns. `owner_user_id` comes from the authenticated SDK actor, never from a request body.

Do not set `__table_args__ = {"schema": "public"}` or a fixed plugin schema in the model. MINT scopes the integrated session to the plugin schema; standalone SQLite uses unqualified tables. Use foreign keys only between plugin-owned tables. Resolve platform experiment IDs through the SDK namespaces. Do not import platform ORM models or add a cross-schema foreign key.

## 3. Add CRUD and experiment publishing

Replace `src/mint_plugin_panel_designer/plugin.py`:

```python
from typing import Annotated

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from mint_sdk import (
    CurrentActor,
    CurrentExperiment,
    Design,
    Metadata,
    MigrationSpec,
    Plugin,
    endpoint,
    plugin,
)
from mint_plugin_panel_designer.models import Panel


class Drug(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    doses_uM: list[Annotated[float, Field(ge=0, allow_inf_nan=False)]] = Field(min_length=1, max_length=100)


class PanelInput(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    drugs: list[Drug] = Field(min_length=1, max_length=100)


class PanelOutput(PanelInput):
    model_config = ConfigDict(from_attributes=True)
    id: str


class PanelDesignerMeta(Metadata):
    domain = "drug-response"
    title = "Panel Designer"
    writes = {"experiments", "design"}
    design = Design(version="1.0")
    database = MigrationSpec(
        package="mint_plugin_panel_designer.migrations",
        models=(Panel,),
    )


@plugin(PanelDesignerMeta)
class PanelDesignerPlugin(Plugin):
    async def _owned_panel(
        self, session: AsyncSession, panel_id: str, user_id: str
    ) -> Panel:
        result = await session.execute(
            select(Panel).where(Panel.id == panel_id, Panel.owner_user_id == user_id)
        )
        panel = result.scalar_one_or_none()
        if panel is None:
            raise HTTPException(status_code=404, detail="Panel not found")
        return panel

    @endpoint.get("/panels", response_model=list[PanelOutput])
    async def list_panels(self, actor: CurrentActor) -> list[PanelOutput]:
        async with self.context.db() as session:
            result = await session.execute(
                select(Panel).where(Panel.owner_user_id == actor.user_id).order_by(Panel.id)
            )
            return [PanelOutput.model_validate(panel) for panel in result.scalars()]

    @endpoint.post("/panels", response_model=PanelOutput, status_code=201)
    async def create_panel(
        self, body: PanelInput, actor: CurrentActor
    ) -> PanelOutput:
        panel = Panel(owner_user_id=actor.user_id, **body.model_dump(mode="json"))
        async with self.context.db() as session:
            session.add(panel)
            await session.flush()
            return PanelOutput.model_validate(panel)

    @endpoint.put("/panels/{panel_id}", response_model=PanelOutput)
    async def replace_panel(
        self, panel_id: str, body: PanelInput, actor: CurrentActor
    ) -> PanelOutput:
        async with self.context.db() as session:
            panel = await self._owned_panel(session, panel_id, actor.user_id)
            panel.name = body.name
            panel.drugs = body.model_dump(mode="json")["drugs"]
            await session.flush()
            return PanelOutput.model_validate(panel)

    @endpoint.delete("/panels/{panel_id}")
    async def delete_panel(self, panel_id: str, actor: CurrentActor) -> dict[str, bool]:
        async with self.context.db() as session:
            panel = await self._owned_panel(session, panel_id, actor.user_id)
            await session.delete(panel)
        return {"deleted": True}

    @endpoint.post("/experiments/{experiment_id}/panels/{panel_id}/publish")
    async def publish_panel(
        self,
        panel_id: str,
        experiment: CurrentExperiment,
        actor: CurrentActor,
    ) -> dict[str, object]:
        if not actor.has_permission("experiments.edit"):
            raise HTTPException(status_code=403, detail="Missing permission: experiments.edit")
        async with self.context.db() as session:
            panel = await self._owned_panel(session, panel_id, actor.user_id)
            snapshot = PanelOutput.model_validate(panel).model_dump(mode="json")
        await self.design.save(experiment.id, {"panel": snapshot})
        return {"published": True, "experiment_id": experiment.id, "panel_id": panel_id}
```

Platform authentication does not limit the rows of your tables, so every query filters on the owner. See [Querying plugin-owned tables](/sdk/recipes/querying-plugin-data#read-within-a-scoped-session). Standalone mode uses the single-user actor `standalone`.

`CurrentExperiment` resolves a visible experiment; see [Request-scoped access](/sdk/concepts/platform-context#request-scoped-access). The publish route also checks the user permission `experiments.edit`. `writes = {"experiments", "design"}` gives the plugin the design-write capability. A user permission and a plugin capability are different checks.

The panel table stores reusable drafts. `design.save()` publishes a snapshot and replaces the whole design payload with `{"panel": ...}`. If your design has other sections, load and merge them first. A change to a draft does not change the snapshots that are already published. Publishing needs the platform and returns 503 in standalone mode. To refuse a publish over a newer edit, pass `expected_version`; see [Writing results](/sdk/recipes/writing-results#design-data-belongs-to-its-design-plugin).

The session commits when the context exits without an error and rolls back on an exception. `flush()` sends the pending writes while the session is open, so the code builds the response models before it leaves the session. No transaction covers both a plugin table write and `design.save()`. For this reason, publishing is a separate action.

## 4. Declare the initial migration

Create `src/mint_plugin_panel_designer/migrations/__init__.py` as an empty file, then `migrations/p001_initial.py`:

```python
from alembic import op
import sqlalchemy as sa

revision = "p001"
down_revision = None
branch_labels = None
depends_on = None
destructive = False


def upgrade(*, schema: str | None) -> None:
    op.create_table(
        "panels",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_user_id", sa.String(255), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("drugs", sa.JSON, nullable=False),
        schema=schema,
    )
    op.create_index("ix_panels_owner_user_id", "panels", ["owner_user_id"], schema=schema)


def downgrade(*, schema: str | None) -> None:
    raise NotImplementedError("Use a reviewed forward migration or restore a backup")
```

MINT passes `schema` to `upgrade()`: `None` for SQLite and the plugin schema for PostgreSQL. Pass it to every table and index operation. See [Revision module shape](/sdk/api/migrations#revision-module-shape).

On a fresh SQLite or PostgreSQL database, this baseline runs and creates the table. MINT records the database owner, the revision and the checksum of the revision file. Existing unversioned tables need a reviewed [baseline adoption](/sdk/concepts/migrations#adopting-existing-tables).

## 5. Verify persistence and ownership

Add `tests/test_panel_database.py`:

```python
from pathlib import Path

import pytest
from fastapi import HTTPException
from mint_sdk.testing import Harness

from mint_plugin_panel_designer.plugin import PanelDesignerPlugin


def test_panel_crud_and_owner_boundary(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    # The standalone database lives under ~/.mint/plugins/: keep tests out of it.
    monkeypatch.setenv("HOME", str(tmp_path))
    plugin = PanelDesignerPlugin()
    with Harness(plugin) as harness:
        base = "/api/panel-designer/panels"
        body = {"name": "Cisplatin", "drugs": [{"name": "Cisplatin", "doses_uM": [0.1, 1]}]}
        created = harness.client.post(base, json=body)
        assert created.status_code == 201
        panel_id = created.json()["id"]
        assert harness.client.get(base).json()[0]["id"] == panel_id
        updated = harness.client.put(f"{base}/{panel_id}", json={**body, "name": "Pilot"})
        assert updated.status_code == 200

        async def lookup_as_other_user() -> None:
            async with plugin.context.db() as session:
                await plugin._owned_panel(session, panel_id, "other")

        # Another user sees no panel: the owner predicate answers 404.
        with pytest.raises(HTTPException) as refused:
            harness.client.portal.call(lookup_as_other_user)
        assert refused.value.status_code == 404

        assert harness.client.delete(f"{base}/{panel_id}").status_code == 200
        assert harness.client.get(base).json() == []
        assert harness.client.post(base, json={"name": "", "drugs": []}).status_code == 422
```

The test covers standalone persistence and the owner predicate through the plugin session. `Harness` runs as the standalone actor `standalone`, and `client.portal.call` runs the check on the event loop of the app. This test uses a fresh database. To test that an upgrade keeps old data, add the [upgrade check](/sdk/recipes/backfill-migration#test-the-real-upgrade-path).

Delete `tests/test_plugin.py` of the scaffold. It posts to the `/analyze` route, which this plugin does not have:

```bash
rm tests/test_plugin.py
uv run pytest -q
```

## 6. Connect the frontend

The scaffold keeps the page state in `frontend/src/stores/analysis.ts`, which calls `client.analyze()`. This plugin does not have that endpoint. Generate the typed client again:

```bash
mint sdk generate
mint docs contract
```

The client methods are `listPanels()`, `createPanel(body)`, `replacePanel(...)`, `deletePanel(...)` and `publishPanel(...)`. `mint docs contract` prints the call shape of the methods with path parameters.

The scaffold `App.vue` shows the controls of `analysisControls` in the sidebar and calls `run(values)` of the store on submit. Keep `App.vue` and the export names. Replace `frontend/src/stores/analysis.ts`, so that the sidebar form creates a panel:

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defineControlModel, useRequest } from '@morscherlab/mint-sdk'

import { useClient, type PanelOutput } from '../generated/mint-plugin'

export const analysisControls = defineControlModel({
  actions: { submitLabel: 'Create panel' },
  initialValues: { name: '', drug: '' },
  controls: {
    name: { type: 'text', label: 'Panel name', required: true, maxLength: 200 },
    drug: { type: 'text', label: 'Drug', required: true, maxLength: 200 },
  },
})

export const useAnalysisStore = defineStore('analysis', () => {
  const client = useClient()
  const request = useRequest('Could not load the panels')
  const panels = ref<PanelOutput[]>([])
  const running = computed(() => request.isLoading.value)
  const error = computed(() => request.error.value)

  async function refresh(): Promise<void> {
    await request
      .run(
        async () => {
          panels.value = await client.listPanels()
          return panels.value
        },
        { kind: 'load' },
      )
      .catch(() => undefined)
  }

  async function run(values: Record<string, unknown>): Promise<void> {
    await request
      .run(
        async () => {
          await client.createPanel({
            name: String(values.name ?? '').trim(),
            drugs: [{ name: String(values.drug ?? '').trim(), doses_uM: [0.1, 1, 10] }],
          })
          panels.value = await client.listPanels()
          return panels.value
        },
        { kind: 'save', errorMessage: 'Could not create the panel' },
      )
      .catch(() => undefined)
  }

  return { panels, running, error, refresh, run }
})
```

Replace `frontend/src/views/WorkspaceView.vue`. The main area lists the panels in one `SectionCard`:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertBox, EmptyState, SectionCard } from '@morscherlab/mint-sdk'

import { useAnalysisStore } from '../stores/analysis'

const panels = useAnalysisStore()

onMounted(panels.refresh)
</script>

<template>
  <SectionCard title="Drug panels" fill>
    <div class="mint-section-card__content">
      <AlertBox v-if="panels.error" tone="error">
        {{ panels.error }}
      </AlertBox>
      <ul v-if="panels.panels.length">
        <li v-for="panel in panels.panels" :key="panel.id">{{ panel.name }} ({{ panel.drugs.length }} drugs)</li>
      </ul>
      <EmptyState v-else title="No panels yet" description="Enter a panel name and a drug in the sidebar." size="sm" />
    </div>
  </SectionCard>
</template>
```

Replace `frontend/src/views/WorkspaceView.test.ts`. The test runs the store action that the sidebar submit calls:

```typescript
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it, vi } from 'vitest'

import { useAnalysisStore } from '../stores/analysis'
import WorkspaceView from './WorkspaceView.vue'

const client = vi.hoisted(() => ({
  listPanels: vi.fn(),
  createPanel: vi.fn(),
}))
vi.mock('../generated/mint-plugin', () => ({
  useClient: () => client,
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

it('should create a panel and refresh the list when the sidebar form is submitted', async () => {
  const panel = { id: 'p1', name: 'Pilot', drugs: [{ name: 'Cisplatin', doses_uM: [0.1, 1, 10] }] }
  client.listPanels.mockResolvedValueOnce([])
  client.listPanels.mockResolvedValueOnce([panel])
  client.createPanel.mockResolvedValue(panel)
  const wrapper = mount(WorkspaceView)
  await flushPromises()

  await useAnalysisStore().run({ name: 'Pilot', drug: 'Cisplatin' })
  await flushPromises()

  expect(client.createPanel).toHaveBeenCalledWith({
    name: 'Pilot',
    drugs: [{ name: 'Cisplatin', doses_uM: [0.1, 1, 10] }],
  })
  expect(wrapper.get('li').text()).toContain('Pilot')
})
```

Check the contract and the frontend, then build the frontend. The backend does not start while `frontend/dist` has no `index.html`:

```bash
mint doctor --strict
cd frontend
vp run type-check
vp run test
vp run build
cd ..
mint dev
```

Use the backend address printed by `mint dev`:

```bash
curl -X POST http://127.0.0.1:8003/api/panel-designer/panels \
  -H 'Content-Type: application/json' \
  -d '{"name":"Cisplatin","drugs":[{"name":"Cisplatin","doses_uM":[0.1,1,10]}]}'
curl http://127.0.0.1:8003/api/panel-designer/panels
```

Publishing needs a platform context, so `POST /api/panel-designer/experiments/{experiment_id}/panels/{panel_id}/publish` returns 503 under `mint dev`. Test it after deployment in step 8.

## 7. Evolve the schema

To add a field, update `Panel` and add a new revision whose `down_revision` names the current head. Do not change `p001_initial.py`. Test an old database with data and a fresh database. See the [backfill recipe](/sdk/recipes/backfill-migration) for a complete `p002` revision and upgrade test.

Inspect the local development database after the first successful `mint dev` startup:

```bash
mint db current --database-url "sqlite:///$HOME/.mint/plugins/panel-designer/data.db"
mint doctor --only db --database-url "sqlite:///$HOME/.mint/plugins/panel-designer/data.db"
```

After a model change, generate a draft revision:

```bash
mint add migration "add panel notes" --autogenerate \
  --database-url "sqlite:///$HOME/.mint/plugins/panel-designer/data.db"
```

The development database must be at the packaged head. Review the generated operations and backfills before you restart the development runtime. See [Author and inspect](/sdk/concepts/migrations#author-and-inspect) for what each command does.

## 8. Verify and deploy

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying). At startup, the platform runs the `p001` baseline against its PostgreSQL schema.

This plugin owns tables, so it must run in-process; see [Isolation](/sdk/concepts/isolation#runtime-comparison).

On the test platform:

1. Create a compatible experiment.
2. POST to `/api/panel-designer/experiments/{experiment_id}/panels/{panel_id}/publish`.
3. Check the saved design.
4. Repeat the publish as a user without `experiments.edit`. Expect 403.
5. Check that another user cannot change the draft.
