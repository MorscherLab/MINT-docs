# Tutorial — Create a Workflow Plugin

Build **batch-coordinator**, a workflow plugin (`writes = {"experiments"}`) that lists visible experiments and creates experiment records for downstream design and analysis plugins. It deliberately declares no design-data or result writes.

This tutorial targets **MINT v@MINT_VERSION@**. A workflow is a plugin category and write policy; it does not automatically schedule jobs or invoke other plugins.

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

The project contains a FastAPI backend, Vue workspace, generated client, tests, and build workflows. `--type workflow` is supported even though the CLI's help description omits it. Generated mode accepts only `analysis`.

Inspect the scaffold's `Metadata`: it already sets `writes = {"experiments"}`, which gives experiment CRUD and no design-data or result writes. `auth` defaults to `True`.

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

`CurrentActor` supplies platform-authenticated identity. The platform makes the calling user the creator, and the request cannot choose it. The route checks `experiments.create`; the scoped namespace also checks this plugin's write policy and the platform-owned experiment-type allowlist. Use an experiment type configured for your MINT installation.

The list requires `experiments.view` and returns at most 50 visible experiments (newest first). Add filters (`status`, `type`, `project`, `search`) if this workspace must browse larger collections.

The routes do not call `design.save()` or `artifacts.save_all()`: the design plugin owns scientific inputs, and the analysis plugin owns outputs. Even if an accidental call is added later, this plugin's write set denies it.

## 3. Verify standalone behavior

`mint dev` runs without an installed platform context. These platform-backed endpoints return HTTP 503, making missing integration visible. Keep the UI usable with an explanatory error state instead of pretending to create a platform experiment locally.

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

The generated contract changes when the routes change. Replace `frontend/src/views/WorkspaceView.vue` with this page:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  useClient,
  type ExperimentSummary,
} from '../generated/mint-plugin'

const client = useClient()
const experiments = ref<ExperimentSummary[]>([])
const name = ref('')
const experimentType = ref('')
const busy = ref(false)
const error = ref('')

async function refresh(): Promise<void> {
  const page = await client.listExperiments()
  experiments.value = page.items
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
    <p aria-live="polite">{{ experiments.length }} visible experiments</p>
    <ul>
      <li v-for="experiment in experiments" :key="experiment.id">
        {{ experiment.name }} — {{ experiment.experiment_type }} — {{ experiment.status }}
      </li>
    </ul>
  </section>
</template>
```

The generated methods here are `listExperiments()` and `createExperiment(body)`. The client supplies the configured route prefix and authentication integration. The frontend displays HTTP errors, including the standalone 503; the backend remains responsible for permission checks.

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
  useClient: () => client,
}))

it('creates an experiment and refreshes the visible list', async () => {
  const experiment = { id: 7, name: 'QC batch', experiment_type: 'custom', status: 'planned' }
  client.listExperiments.mockResolvedValueOnce({ items: [] })
  client.listExperiments.mockResolvedValueOnce({ items: [experiment] })
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
  expect(wrapper.text()).toContain('1 visible experiments')
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
mint build
```

Check that the bundle installs and loads, then deploy it to a test platform you administer:

```bash
mint verify
mint platform auth login --url https://mint-test.example.org
mint deploy --to https://mint-test.example.org
```

`mint verify` boots the MINT platform image in Docker, installs the bundle through the normal upload path, restarts, and waits until the plugin loads. `mint deploy` uploads the same bundle, restarts the platform (requires `platform.configure`), and confirms the restart by the new server `boot_id`; `--timeout` (default 180 s) covers restart and load together.

On the test platform, configure the plugin's allowed experiment types. Then verify the actual platform boundary:

| Action | Expected result |
|---|---|
| List while signed in | Only experiments visible to the current actor and compatible with this plugin |
| Create with `experiments.create` permission | New experiment created by the authenticated actor |
| Create without `experiments.create` | HTTP 403 |
| Submit an experiment type outside the plugin allowlist | Rejected by platform scope |
| Write this plugin's design data or analysis result | Rejected by explicit write policy |
| Load an experiment created by another plugin | Existing design ownership and results remain unchanged |

The local test verifies the declared write set and the standalone boundary. It does not replace installed-platform authorization tests. `mint dev --platform` registers a dev proxy; it does not turn the local process into an installed plugin with all platform services.

## 5. Extend the workflow deliberately

For existing experiments, the namespace exposes:

```python
experiment = await self.context.experiments.get(experiment_id)
updated = await self.context.experiments.update(experiment_id, notes="Awaiting acquisition")
deleted = await self.context.experiments.delete(experiment_id)
```

Put these calls behind authenticated routes with the relevant `experiments.edit` or `experiments.delete` permission and your workflow's ownership rules. Handle `None` / `False` as missing or inaccessible resources. Keep mutations scoped to an experiment the user selected; do not expose unrestricted table access.

Use `@job` for your plugin's own queued calculations, [events](/sdk/concepts/lifecycle) such as `@on("experiment.status_changed")` for reacting to platform changes, and [plugin tables](/sdk/tutorials/design-plugin-with-tables) for orchestration records that need durable state. Adding tables is independent of granting design ownership.

Use [analysis artifacts](/sdk/concepts/platform-context) to read downstream outputs. Declare exact producer plugin IDs in `reads_from` when reading another plugin's payload. Merely listing a plugin in `depends_on` controls load order; it does not grant result access or execute that plugin.

Source: [workflow scaffolding](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_command.py), [repository protocol](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py), and [platform permissions](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/permissions.py).
