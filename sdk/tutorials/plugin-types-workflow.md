# Tutorial — Create a Workflow Plugin

Build `batch-coordinator`, a workflow plugin (`writes = {"experiments"}`). It lists visible experiments and creates experiment records for the design and analysis plugins. It declares no design-data or result writes.

A workflow is a plugin type and a write policy. It does not schedule jobs or call other plugins by itself.

## 1. Scaffold a standard plugin

```bash
mint init batch-coordinator \
  --name "Batch Coordinator" \
  --description "Coordinate laboratory experiments" \
  --mode standard \
  --type workflow \
  --yes
cd batch-coordinator
```

The project has a FastAPI backend, a Vue workspace, a generated client, tests and build workflows. The `Metadata` of the scaffold already sets `writes = {"experiments"}`: experiment CRUD, and no design-data or result writes. `auth` is `True` by default.

## 2. Add platform-backed endpoints

Replace `src/mint_plugin_batch_coordinator/plugin.py`:

```python
from pydantic import BaseModel, Field

from mint_sdk import (
    CurrentActor,
    Metadata,
    Plugin,
    PermissionException,
    UnavailableException,
    endpoint,
    plugin,
)


class CreateExperimentRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    experiment_type: str = Field(min_length=1)
    notes: str | None = None


class ExperimentSummary(BaseModel):
    id: int
    name: str
    experiment_type: str
    status: str


class ExperimentList(BaseModel):
    items: list[ExperimentSummary]


class BatchCoordinatorMeta(Metadata):
    domain = "workflow"
    title = "Batch Coordinator"
    writes = {"experiments"}


@plugin(BatchCoordinatorMeta)
class BatchCoordinatorPlugin(Plugin):
    def _require_platform(self) -> None:
        if self.is_standalone:
            raise UnavailableException("Experiments need the MINT platform")

    @endpoint.get("/experiments", response_model=ExperimentList)
    async def list_experiments(self, actor: CurrentActor) -> ExperimentList:
        self._require_platform()
        if not actor.has_permission("experiments.view"):
            raise PermissionException("Requires experiments.view permission")
        experiments = await self.context.experiments.list(limit=50)
        return ExperimentList(
            items=[
                ExperimentSummary(
                    id=item.id,
                    name=item.name,
                    experiment_type=item.experiment_type,
                    status=item.status,
                )
                for item in experiments
            ],
        )

    @endpoint.post("/experiments", response_model=ExperimentSummary)
    async def create_experiment(
        self,
        body: CreateExperimentRequest,
        actor: CurrentActor,
    ) -> ExperimentSummary:
        self._require_platform()
        if not actor.has_permission("experiments.create"):
            raise PermissionException("Requires experiments.create permission")
        experiment = await self.context.experiments.create(
            body.name.strip(),
            body.experiment_type,
            notes=body.notes,
        )
        return ExperimentSummary(
            id=experiment.id,
            name=experiment.name,
            experiment_type=experiment.experiment_type,
            status=experiment.status,
        )
```

`CurrentActor` supplies the authenticated identity. The calling user becomes the creator of the experiment; see [What the platform enforces](/sdk/concepts/platform-context#what-the-platform-enforces). The route checks `experiments.create`. The scoped namespace also checks the write policy of this plugin and the experiment-type allowlist of the platform. Use an experiment type that your MINT installation has.

The list needs `experiments.view` and returns at most 50 visible experiments, newest first. To browse larger collections, add the filters `status`, `type`, `project` or `search`.

The routes do not call `design.save()` or `artifacts.save_all()`. The design plugin owns the scientific inputs, and the analysis plugin owns the outputs. The write set of this plugin refuses such a call.

## 3. Verify standalone behavior

`mint dev` runs without a platform context, so these endpoints return HTTP 503. Show this error in the UI. Do not create a fake experiment locally.

Replace the scaffolded backend tests with:

```python
from mint_sdk.testing import Harness

from mint_plugin_batch_coordinator.plugin import BatchCoordinatorPlugin


def test_workflow_policy_and_standalone_boundary() -> None:
    plugin = BatchCoordinatorPlugin()
    assert plugin.metadata.plugin_type == "workflow"
    capabilities = plugin.metadata.capabilities
    assert capabilities.experiment_crud
    assert not capabilities.design_data_write
    assert not capabilities.analysis_result_write

    with Harness(BatchCoordinatorPlugin) as harness:
        listed = harness.client.get("/api/batch-coordinator/experiments")
        created = harness.client.post(
            "/api/batch-coordinator/experiments",
            json={"name": "QC batch", "experiment_type": "custom"},
        )

    assert listed.status_code == 503
    assert created.status_code == 503
```

```bash
uv run pytest -q
mint sdk generate
mint doctor --strict
```

The generated contract changes when the routes change. The scaffold `App.vue` shows the controls of `analysisControls` in the sidebar and calls `run(values)` of the store on submit. It also sets `experiment: true`, so the top bar shows the experiment chip. Keep `App.vue` and the export names. Replace `frontend/src/stores/analysis.ts`, so that the sidebar form creates an experiment:

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defineControlModel, useRequest } from '@morscherlab/mint-sdk'

import { useClient, type ExperimentSummary } from '../generated/mint-plugin'

export const analysisControls = defineControlModel({
  actions: { submitLabel: 'Create experiment' },
  initialValues: { name: '', experimentType: '' },
  controls: {
    name: { type: 'text', label: 'Name', required: true, maxLength: 200 },
    experimentType: { type: 'text', label: 'Configured experiment type', required: true },
  },
})

export const useAnalysisStore = defineStore('analysis', () => {
  const client = useClient()
  const request = useRequest('Could not load experiments')
  const experiments = ref<ExperimentSummary[]>([])
  const running = computed(() => request.isLoading.value)
  const error = computed(() => request.error.value)

  async function refresh(): Promise<void> {
    await request
      .run(
        async () => {
          experiments.value = (await client.listExperiments()).items
          return experiments.value
        },
        { kind: 'load' },
      )
      .catch(() => undefined)
  }

  async function run(values: Record<string, unknown>): Promise<void> {
    await request
      .run(
        async () => {
          await client.createExperiment({
            name: String(values.name ?? '').trim(),
            experiment_type: String(values.experimentType ?? '').trim(),
          })
          experiments.value = (await client.listExperiments()).items
          return experiments.value
        },
        { kind: 'save', errorMessage: 'Could not create experiment' },
      )
      .catch(() => undefined)
  }

  return { experiments, running, error, refresh, run }
})
```

The generated methods are `listExperiments()` and `createExperiment(body)`. The client supplies the route prefix and the authentication. The frontend shows HTTP errors, also the standalone 503. The backend does the permission checks.

Replace `frontend/src/views/WorkspaceView.vue`. The main area lists the visible experiments:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertBox, BaseButton, EmptyState, SectionCard } from '@morscherlab/mint-sdk'

import { useAnalysisStore } from '../stores/analysis'

const batch = useAnalysisStore()

onMounted(batch.refresh)
</script>

<template>
  <SectionCard title="Visible experiments" :count="batch.experiments.length" fill>
    <template #actions>
      <BaseButton variant="secondary" size="sm" :disabled="batch.running" @click="batch.refresh">Refresh</BaseButton>
    </template>
    <div class="mint-section-card__content">
      <AlertBox v-if="batch.error" tone="error">
        {{ batch.error }}
      </AlertBox>
      <ul v-if="batch.experiments.length">
        <li v-for="experiment in batch.experiments" :key="experiment.id">
          {{ experiment.name }} — {{ experiment.experiment_type }} — {{ experiment.status }}
        </li>
      </ul>
      <EmptyState
        v-else
        title="No experiments yet"
        description="Create an experiment in the sidebar, then open its design and analysis plugins in MINT."
        size="sm"
      />
    </div>
  </SectionCard>
</template>
```

Replace `WorkspaceView.test.ts` of the scaffold with a test of the request contract:

```typescript
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it, vi } from 'vitest'

import { useAnalysisStore } from '../stores/analysis'
import WorkspaceView from './WorkspaceView.vue'

const client = vi.hoisted(() => ({
  listExperiments: vi.fn(),
  createExperiment: vi.fn(),
}))
vi.mock('../generated/mint-plugin', () => ({
  useClient: () => client,
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

it('should create an experiment and refresh the visible list when the sidebar form is submitted', async () => {
  const experiment = { id: 7, name: 'QC batch', experiment_type: 'custom', status: 'planned' }
  client.listExperiments.mockResolvedValueOnce({ items: [] })
  client.listExperiments.mockResolvedValueOnce({ items: [experiment] })
  client.createExperiment.mockResolvedValue(experiment)
  const wrapper = mount(WorkspaceView)
  await flushPromises()

  await useAnalysisStore().run({ name: 'QC batch', experimentType: 'custom' })
  await flushPromises()

  expect(client.createExperiment).toHaveBeenCalledWith({
    name: 'QC batch',
    experiment_type: 'custom',
  })
  expect(wrapper.get('li').text()).toContain('QC batch')
})
```

## 4. Test the installed integration

Run the frontend checks and package the plugin:

```bash
cd frontend
vp run type-check
vp run test
cd ..
mint sdk generate --check
mint build
```

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying).

On the test platform, set the allowed experiment types of the plugin. Then check the platform boundary:

| Action | Expected result |
|---|---|
| List while signed in | Only experiments visible to the current actor and compatible with this plugin |
| Create with `experiments.create` permission | New experiment created by the authenticated actor |
| Create without `experiments.create` | HTTP 403 |
| Submit an experiment type outside the plugin allowlist | Rejected by platform scope |
| Write this plugin's design data or analysis result | Rejected by explicit write policy |
| Load an experiment created by another plugin | Existing design ownership and results remain unchanged |

The local test checks the declared write set and the standalone boundary. It does not replace authorization tests on an installed platform. `mint dev --platform` is only a development proxy; see [Development proxy limitations](/sdk/concepts/isolation#development-proxy-limitations).

## 5. Extend the workflow

For existing experiments, the namespace has these methods:

```python
experiment = await self.context.experiments.get(experiment_id)
updated = await self.context.experiments.update(experiment_id, notes="Awaiting acquisition")
deleted = await self.context.experiments.delete(experiment_id)
```

Put these calls behind authenticated routes that check `experiments.edit` or `experiments.delete` and the ownership rules of your workflow. Treat `None` or `False` as a missing or inaccessible experiment. Change only an experiment that the user selected. Do not expose unrestricted table access.

- For queued calculations of your plugin, use `@job`.
- To react to platform changes, use [events](/sdk/concepts/lifecycle) such as `@on("experiment.status_changed")`.
- For durable orchestration records, use [plugin tables](/sdk/tutorials/design-plugin-with-tables). Tables do not give design ownership.
- To read the results of other plugins, declare their exact IDs in `reads_from`; see [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers). `depends_on` sets only the load order. It does not give access to results and does not run that plugin.

Source: [workflow scaffolding](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_command.py), [repository protocol](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py), and [platform permissions](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/permissions.py).
