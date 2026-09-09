# Tutorial — Create a Workflow Plugin

Build **batch-coordinator**, a `WORKFLOW` plugin that lists visible experiments and creates experiment records for downstream design and analysis plugins. It deliberately declares no design-data or result writes.

This tutorial targets **MINT v1.2.1**. A workflow is a plugin category and access policy; it does not automatically schedule jobs or invoke other plugins.

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

The project contains a FastAPI backend, Vue workspace, generated client, tests, and build workflows. `--type workflow` is supported in v1.2 even though the CLI's help description omits it. Generated mode accepts only `analysis`.

Inspect the scaffold's decorator: it already declares `experiment_crud=True`, `design_data_write=False`, and `analysis_result_write=False`. Add authentication and an experiment integration declaration when replacing the example endpoint below.

## 2. Add platform-backed endpoints

Replace `src/mint_plugin_batch_coordinator/plugin.py`:

```python
from fastapi import HTTPException
from pydantic import BaseModel, Field

from mint_sdk import (
    AnalysisPlugin,
    CurrentPluginActor,
    PluginCapabilities,
    PluginType,
    endpoint,
    mint_plugin,
)
from mint_sdk.app import require_context


class CreateExperimentRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    experiment_type: str = Field(min_length=1)
    notes: str | None = None


class ExperimentSummary(BaseModel):
    id: int
    name: str
    experiment_type: str
    status: str


class ExperimentPage(BaseModel):
    items: list[ExperimentSummary]
    total: int


@mint_plugin(
    analysis_type="workflow",
    routes_prefix="/batch-coordinator",
    plugin_type=PluginType.WORKFLOW,
    capabilities=PluginCapabilities(
        requires_auth=True,
        requires_experiments=True,
        experiment_crud=True,
        design_data_write=False,
        analysis_result_write=False,
    ),
)
class BatchCoordinatorPlugin(AnalysisPlugin):
    @endpoint.get("/experiments", response_model=ExperimentPage)
    async def list_experiments(self, actor: CurrentPluginActor) -> ExperimentPage:
        context = require_context(self.context)
        if not actor.has_permission("experiments.view"):
            raise HTTPException(403, "Requires experiments.view permission")
        experiments, total = await context.get_experiment_repository().list_all(
            limit=50,
        )
        return ExperimentPage(
            items=[
                ExperimentSummary(
                    id=item.id,
                    name=item.name,
                    experiment_type=item.experiment_type,
                    status=item.status,
                )
                for item in experiments
            ],
            total=total,
        )

    @endpoint.post("/experiments", response_model=ExperimentSummary)
    async def create_experiment(
        self,
        body: CreateExperimentRequest,
        actor: CurrentPluginActor,
    ) -> ExperimentSummary:
        context = require_context(self.context)
        if not actor.has_permission("experiments.create"):
            raise HTTPException(403, "Requires experiments.create permission")
        name = body.name.strip()
        if not name:
            raise HTTPException(422, "Experiment name must not be blank")
        experiment = await context.get_experiment_repository().create(
            name=name,
            experiment_type=body.experiment_type,
            created_by=int(actor.user_id),
            notes=body.notes,
        )
        return ExperimentSummary(
            id=experiment.id,
            name=experiment.name,
            experiment_type=experiment.experiment_type,
            status=experiment.status,
        )
```

`CurrentPluginActor` supplies platform-authenticated identity. The request cannot choose its `created_by` value. The route checks `experiments.create`; the scoped repository also checks this plugin's write policy and the platform-owned experiment-type allowlist. Use an experiment type configured for your MINT installation.

The list requires `experiments.view` and returns at most 50 visible experiments plus the total. Add explicit pagination parameters if this workspace must browse larger collections.

The routes do not call `save_design()` or `save_analysis_artifacts()`: the design plugin owns scientific inputs, and the analysis plugin owns outputs. Even if an accidental call is added later, this plugin's explicit write policy denies it.

## 3. Verify standalone behavior

`mint dev` runs without an installed platform context. These platform-backed endpoints return HTTP 503, making missing integration visible. Keep the UI usable with an explanatory error state instead of pretending to create a platform experiment locally.

Replace the scaffolded backend tests with:

```python
from fastapi.testclient import TestClient
from mint_sdk.models import resolve_plugin_access_policy
from mint_sdk.app import create_standalone_app
from pytest import MonkeyPatch

from mint_plugin_batch_coordinator.plugin import BatchCoordinatorPlugin


def test_workflow_policy_and_standalone_boundary(monkeypatch: MonkeyPatch) -> None:
    plugin = BatchCoordinatorPlugin()
    metadata = plugin.metadata
    policy = resolve_plugin_access_policy(metadata.plugin_type, metadata.capabilities)
    assert policy.experiment_crud
    assert not policy.design_data_write
    assert not policy.analysis_result_write

    # This backend test does not require a built frontend/dist/index.html.
    monkeypatch.setattr(plugin, "get_frontend_dir", lambda: None)
    with TestClient(create_standalone_app(plugin, environ={})) as client:
        listed = client.get("/api/batch-coordinator/experiments")
        created = client.post(
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

The generated contract changes when the routes change. Replace `frontend/src/views/WorkspaceView.vue` with this page:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  useGeneratedPluginClient,
  type ExperimentSummary,
} from '../generated/mint-plugin'

const client = useGeneratedPluginClient()
const experiments = ref<ExperimentSummary[]>([])
const total = ref(0)
const name = ref('')
const experimentType = ref('')
const busy = ref(false)
const error = ref('')

async function refresh(): Promise<void> {
  const page = await client.listExperiments()
  experiments.value = page.items
  total.value = page.total
}

async function load(): Promise<void> {
  busy.value = true
  error.value = ''
  try {
    await refresh()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not load experiments'
  } finally {
    busy.value = false
  }
}

async function create(): Promise<void> {
  busy.value = true
  error.value = ''
  try {
    await client.createExperiment({
      name: name.value.trim(),
      experiment_type: experimentType.value.trim(),
    })
    name.value = ''
    await refresh()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not create experiment'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <section aria-labelledby="coordinator-title">
    <h2 id="coordinator-title">Batch coordinator</h2>
    <p>Create an experiment, then open its design and analysis plugins in MINT.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <form @submit.prevent="create">
      <fieldset :disabled="busy">
        <legend>New experiment</legend>
        <label for="experiment-name">Name</label>
        <input id="experiment-name" v-model="name" required maxlength="200" />
        <label for="experiment-type">Configured experiment type</label>
        <input id="experiment-type" v-model="experimentType" required />
        <button type="submit">Create experiment</button>
      </fieldset>
    </form>
    <button type="button" :disabled="busy" @click="load">Refresh</button>
    <p aria-live="polite">{{ experiments.length }} of {{ total }} visible experiments</p>
    <ul>
      <li v-for="experiment in experiments" :key="experiment.id">
        {{ experiment.name }} — {{ experiment.experiment_type }} — {{ experiment.status }}
      </li>
    </ul>
  </section>
</template>
```

The generated v1.2 methods here are `listExperiments()` and `createExperiment(body)`. The client supplies the configured route prefix and authentication integration. The frontend displays HTTP errors, including the standalone 503; the backend remains responsible for permission checks.

Replace the scaffold's `WorkspaceView.test.ts` with a check of the actual request contract:

```typescript
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import WorkspaceView from './WorkspaceView.vue'

const client = vi.hoisted(() => ({
  listExperiments: vi.fn(),
  createExperiment: vi.fn(),
}))
vi.mock('../generated/mint-plugin', () => ({
  useGeneratedPluginClient: () => client,
}))

it('creates an experiment and refreshes the visible list', async () => {
  const experiment = { id: 7, name: 'QC batch', experiment_type: 'custom', status: 'draft' }
  client.listExperiments.mockResolvedValueOnce({ items: [], total: 0 })
  client.listExperiments.mockResolvedValueOnce({ items: [experiment], total: 1 })
  client.createExperiment.mockResolvedValue(experiment)
  const wrapper = mount(WorkspaceView)
  await flushPromises()

  await wrapper.get('#experiment-name').setValue('QC batch')
  await wrapper.get('#experiment-type').setValue('custom')
  await wrapper.get('form').trigger('submit')
  await flushPromises()

  expect(client.createExperiment).toHaveBeenCalledWith({
    name: 'QC batch', experiment_type: 'custom',
  })
  expect(wrapper.text()).toContain('1 of 1 visible experiments')
  expect(wrapper.get('li').text()).toContain('QC batch')
})
```

See [adding a frontend](/sdk/tutorials/adding-a-frontend) to replace the plain form with SDK controls or build a richer experiment workspace.

## 4. Test the installed integration

After updating the frontend, run its checks and package the plugin:

```bash
cd frontend
bun run type-check
bun run test
cd ..
mint sdk generate --check
mint build .
```

Install the `.mint` bundle in a disposable MINT instance and configure its allowed experiment types. Then verify the actual platform boundary:

| Action | Expected result |
|---|---|
| List while signed in | Only experiments visible to the current actor and compatible with this plugin |
| Create with `experiments.create` permission | New experiment owned by the authenticated actor |
| Create without `experiments.create` | HTTP 403 |
| Submit an experiment type outside the plugin allowlist | Rejected by platform scope |
| Write this plugin's design data or analysis result | Rejected by explicit write policy |
| Load an experiment created by another plugin | Existing design ownership and results remain unchanged |

The local test verifies policy resolution and the standalone boundary. It does not replace installed-platform authorization tests. `mint dev --platform` registers a dev proxy; it does not turn the local process into an installed plugin with all platform services.

## 5. Extend the workflow deliberately

For existing experiments, the repository exposes:

```python
experiment = await repository.get_by_id(experiment_id)
updated = await repository.update(experiment_id, notes="Awaiting acquisition")
deleted = await repository.delete(experiment_id)
```

Put these calls behind authenticated routes with the relevant `experiments.edit` or `experiments.delete` permission and your workflow's ownership rules. Handle `None` / `False` as missing or inaccessible resources. Keep mutations scoped to an experiment the user selected; do not expose unrestricted table access.

Use `@job` for your plugin's own queued calculations, [lifecycle events](/sdk/concepts/lifecycle) for reacting to platform changes, and [plugin tables](/sdk/tutorials/design-plugin-with-tables) for orchestration records that need durable state. Adding tables is independent of granting design ownership.

Use [analysis artifacts](/sdk/concepts/platform-context) to read downstream outputs. Declare exact producer plugin IDs in `analysis_result_readers` when reading another plugin's payload. Merely listing a plugin in `dependencies` controls load order; it does not grant result access or execute that plugin.

Source: [v1.2 workflow scaffolding](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/init_command.py), [repository protocol](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/repositories.py), and [platform permissions](https://github.com/MorscherLab/MINT/blob/v1.2.1/api/permissions.py).
