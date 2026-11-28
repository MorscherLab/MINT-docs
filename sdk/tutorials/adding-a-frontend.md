# Tutorial 2 - Adding a Frontend

Build `hello-standard`, a `standard` mode plugin with a FastAPI-style backend and a Vue 3 workspace. Use this mode when your plugin needs custom interaction, results or navigation.

Time: 40 to 50 minutes. Prerequisite: the full toolchain from [Install the toolchain](/sdk/install), including Vite+ (`vp` 1.5.1 or later).

## 1. Scaffold in Standard Mode

```bash
mint init hello-standard \
  --name "Hello Standard" \
  --description "Custom UI analysis plugin" \
  --mode standard \
  --type analysis \
  --yes
cd hello-standard
```

The scaffold creates backend and frontend files:

```text
hello-standard/
├── pyproject.toml
├── src/
│   └── mint_plugin_hello_standard/
│       ├── __init__.py
│       └── plugin.py
├── tests/
│   └── test_plugin.py
└── frontend/
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── pnpm-lock.yaml
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── App.vue
        ├── main.ts
        ├── env.d.ts
        ├── style.css
        ├── generated/
        │   ├── mint-plugin.contract.json
        │   └── mint-plugin.ts
        ├── stores/
        │   └── analysis.ts
        └── views/
            ├── WorkspaceView.test.ts
            └── WorkspaceView.vue
```

`mint init` runs `vp install`, which writes `frontend/pnpm-lock.yaml`. Commit it: CI installs from it with `vp install --frozen-lockfile`.

Checkpoint:

```bash
uv run mint doctor --strict
uv run mint lint
cd frontend
vp run type-check
vp run test
vp run build
cd ..
uv run pytest -q
```

The frontend uses pnpm and Vite+, and its scripts run `vp`. For the files and scripts of the scaffold, see [`mint init`](/sdk/api/cli-reference#mint-init). `mint lint` checks the MINT design rules, then runs ruff and oxlint; a new plugin passes with no finding.

The scaffold tests use `Harness`, which runs the backend app without a built frontend. Build the frontend (`vp run build`) before you run the plugin with `mint dev` against its bundled assets or build the bundle.

## 2. Inspect the Backend

Open `src/mint_plugin_hello_standard/plugin.py`:

```python
from mint_sdk import Metadata, Page, Plugin, endpoint, plugin
from mint_sdk.mcp import Tool, ToolContext, tool
from mint_sdk.panels import KeyValuePanel, LinkPanel, PanelSection, panel
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    value: float = Field(1.0, description="Value to analyze")


class AnalyzeResponse(BaseModel):
    input: float
    doubled: float


class DoubleValue(Tool):
    title = "Double a value"
    effect = "read"


class HelloStandard(Metadata):
    domain = "custom"
    title = "Hello Standard"
    icon = "M4 19h16M7 16V8m5 8V4m5 12v-6"
    pages = [
        Page(
            "Workspace",
            id="workspace",
            icon="M4 4h16v16H4zM8 8h8v8H8z",
            description="Custom UI analysis plugin",
        ),
    ]


@plugin(HelloStandard)
class HelloStandardPlugin(Plugin):
    @endpoint.post("/analyze", response_model=AnalyzeResponse, tags=["analysis"])
    async def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        return AnalyzeResponse(
            input=request.value,
            doubled=request.value * 2,
        )

    # Published on the platform's /mcp endpoint as "hello_standard_double_value".
    @tool(DoubleValue)
    async def double_value(self, ctx: ToolContext, args: AnalyzeRequest) -> AnalyzeResponse:
        """Double one value. AI clients read this docstring as the tool description."""
        return AnalyzeResponse(input=args.value, doubled=args.value * 2)

    @panel("summary", slot="experiment.analysis", title="Summary")
    async def summary(self, experiment_id: int) -> list[PanelSection]:
        return [
            KeyValuePanel(title="Experiment", items=[("Experiment id", experiment_id)]),
            LinkPanel(
                label="Open the workspace",
                href="/plugin/hello-standard",
            ),
        ]
```

- `@endpoint` is the normal way to declare plugin HTTP APIs. Use native `routers()` only for a FastAPI feature that `@endpoint` does not cover, such as dynamic router factories or custom route classes.
- The SDK serves the health route (`/__mint/health`) itself. Add `@health` only to report a real status.
- The `@tool` method publishes the calculation to AI assistants; see [MCP tools](/sdk/recipes/mcp-tools). Delete it when you do not need it.
- The `@panel` method adds a "Summary" tab to the Analysis artifacts card of each experiment page. Change its sections or delete it; see [Panels](/sdk/recipes/panels).

## 3. Inspect the Backend Test

The scaffold tests the real SDK runtime app through `Harness`, so the backend tests do not need a frontend build:

```python
import asyncio

from mint_sdk import Actor
from mint_sdk.mcp import call_tool
from mint_sdk.testing import Harness

from mint_plugin_hello_standard.plugin import HelloStandardPlugin


def test_plugin_metadata_uses_scaffolded_name() -> None:
    assert HelloStandardPlugin().name == "hello-standard"


def test_analyze_route_returns_a_real_result() -> None:
    with Harness(HelloStandardPlugin) as harness:
        response = harness.client.post("/api/hello-standard/analyze", json={"value": 2.5})

    assert response.json() == {"input": 2.5, "doubled": 5.0}


def test_mcp_tool_returns_a_real_result() -> None:
    result = asyncio.run(
        call_tool(
            HelloStandardPlugin(),
            "double_value",
            {"value": 2.5},
            actor=Actor.standalone(),
            platform=None,
        )
    )

    assert result == {"input": 2.5, "doubled": 5.0}
```

The scaffold also tests the summary panel with `Harness.panel`; see [Testing plugins → Panels](/sdk/recipes/testing-plugins#panels).

Run it after every backend route change:

```bash
uv run pytest -q
```

## 4. Inspect the Frontend Shell

`frontend/src/main.ts` creates the app and installs Pinia and Vue Router. The app imports each SDK component by name and does not install `MINTSdk`; see [Package entry points](/sdk/frontend/#package-entry-points).

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { providePluginIdentity, resolvePluginFrontendBase } from '@morscherlab/mint-sdk'

import App from './App.vue'
import { contract } from './generated/mint-plugin'
import './style.css'

const routes = [
  {
    path: '/',
    name: 'workspace',
    component: () => import('./views/WorkspaceView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(resolvePluginFrontendBase(import.meta.env.BASE_URL)),
  routes,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
providePluginIdentity(contract)
app.mount('#app')
```

`frontend/src/App.vue` is a sidebar workspace. The inputs are in the sidebar, and the routed page shows the result in the main area:

```vue
<script setup lang="ts">
import { PluginWorkspaceView, definePluginWorkspaceView, useTheme } from '@morscherlab/mint-sdk'

import { analysisControls, useAnalysisStore } from './stores/analysis'

useTheme()

const analysis = useAnalysisStore()

const workspace = definePluginWorkspaceView({
  floating: true,
  main: 'plain',
  topBar: {
    variant: 'card',
    settings: false,
    standaloneLabel: false,
  },
  sidebar: {
    title: 'Parameters',
    collapsible: true,
    controls: analysisControls,
  },
})
</script>

<template>
  <PluginWorkspaceView
    :spec="workspace"
    :form-loading="analysis.running"
    :form-disabled="analysis.running"
    @form-submit="(_section: string, values: Record<string, unknown>) => analysis.run(values)"
  >
    <router-view />
  </PluginWorkspaceView>
</template>
```

`PluginWorkspaceView` takes one `:spec` built with `definePluginWorkspaceView`. It supplies the top bar and the sidebar; see [AppLayout or a workspace?](/sdk/frontend/#applayout-or-a-workspace) for the shell rules. `main: 'plain'` lets the page put its own `SectionCard`s in the main area. The sidebar shows the controls of `sidebar.controls` as a form, and its submit emits `form-submit`.

A plugin type that writes experiments (`experiment-design`, `full`, `workflow`) also gets `experiment: true` in the spec. The top bar then shows the experiment chip, so the user picks the experiment there and not in a form field.

Keep this shell for custom plugin screens. The `mint lint` layout rules check it: `workspace-sidebar` reports a workspace with `sidebar: false`, and `nested-card` reports a card inside a card.

The CSS entry `src/style.css` imports Tailwind and the SDK tokens; see the [setup checklist](/sdk/frontend/#setup-checklist).

## 5. Use the Generated Client

The frontend client is generated from backend decorators and Pydantic models:

```bash
mint sdk generate
mint sdk generate --check
```

The state of the page is in the Pinia store `frontend/src/stores/analysis.ts`. It defines the sidebar controls and calls the backend through `useClient()`:

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defineControlModel, useRequest } from '@morscherlab/mint-sdk'

import { useClient, type AnalyzeResponse } from '../generated/mint-plugin'

export const analysisControls = defineControlModel({
  actions: { submitLabel: 'Run' },
  initialValues: { value: 1 },
  controls: {
    value: {
      type: 'number',
      label: 'Value',
      hint: 'Replace this field with your analysis inputs.',
      props: { step: 0.1 },
    },
  },
})

export const useAnalysisStore = defineStore('analysis', () => {
  const client = useClient()
  const request = useRequest('Analysis failed')
  const result = ref<AnalyzeResponse | null>(null)
  const running = computed(() => request.isLoading.value)
  const error = computed(() => request.error.value)

  async function run(values: Record<string, unknown>): Promise<void> {
    await request
      .run(
        async () => {
          result.value = await client.analyze({ value: Number(values.value ?? 0) })
          return result.value
        },
        { kind: 'run' },
      )
      .catch(() => undefined)
  }

  return { result, running, error, run }
})
```

`frontend/src/views/WorkspaceView.vue` reads the store and shows the result in one `SectionCard`:

```vue
<script setup lang="ts">
import { AlertBox, EmptyState, SectionCard } from '@morscherlab/mint-sdk'

import { useAnalysisStore } from '../stores/analysis'

const analysis = useAnalysisStore()
</script>

<template>
  <SectionCard title="Result" fill>
    <div class="mint-section-card__content">
      <AlertBox v-if="analysis.error" tone="error">
        {{ analysis.error }}
      </AlertBox>
      <p v-else-if="analysis.result" class="workspace-view__value">
        {{ analysis.result.input }} × 2 = {{ analysis.result.doubled }}
      </p>
      <EmptyState
        v-else
        title="No result yet"
        description="Set the parameters in the sidebar and run the analysis."
        size="sm"
      />
    </div>
  </SectionCard>
</template>
```

`useClient()` returns one typed method per endpoint. For the method names, the other exports and the call shapes, see [Generated plugin clients](/sdk/frontend/composables#generated-plugin-clients). `/analyze` has only a JSON body, so its call is direct. For an endpoint with path or query parameters, run `mint docs contract` and use the call shape that it prints.

The full request path is: sidebar form submit → `form-submit` → `analysis.run(values)` → typed `client.analyze(body)` → Vite `/api` proxy → `/api/hello-standard/analyze` → Pydantic request validation → `AnalyzeResponse` → the result in `WorkspaceView`. Authentication and URL selection stay in the SDK client.

`useRequest().run()` records the loading and error state and throws the error again. The example catches it after the visible error is set. For handling by status and a request ID, use `MintApiError`; see [Typed HTTP errors](/sdk/frontend/composables#typed-http-errors-in-1-2).

Do not edit `frontend/src/generated/*` by hand. Generate it again after a change to backend routes, schemas, settings or navigation.

### Add a backend operation without hand-writing a client

Add these models above the plugin class and the method inside it:

```python
class ScaleRequest(BaseModel):
    values: list[float] = Field(min_length=1)
    factor: float = Field(2.0, gt=0)


class ScaleResponse(BaseModel):
    values: list[float]


# Inside HelloStandardPlugin:
@endpoint.post("/scale", response_model=ScaleResponse)
async def scale(self, request: ScaleRequest) -> ScaleResponse:
    return ScaleResponse(values=[value * request.factor for value in request.values])
```

Generate the client again from the plugin root:

```bash
mint sdk generate
mint docs contract
mint sdk generate --check
```

The workspace can now call `await client.scale({ values: [1, 2, 3], factor: 2 })` and gets a typed `{ values: number[] }` response. Use a synchronous request for short calculations only. For long analyses, use `@job` and the SDK job client.

Add one route check to `tests/test_plugin.py`:

```python
def test_scale_route_validates_and_calculates() -> None:
    with Harness(HelloStandardPlugin) as harness:
        result = harness.client.post(
            "/api/hello-standard/scale",
            json={"values": [1, 2, 3], "factor": 2},
        )
        invalid = harness.client.post(
            "/api/hello-standard/scale",
            json={"values": [], "factor": 2},
        )
    assert result.status_code == 200
    assert result.json() == {"values": [2.0, 4.0, 6.0]}
    assert invalid.status_code == 422
```

## 6. Run the Workspace

From the plugin root:

```bash
mint dev
```

Default ports:

```text
Backend   http://127.0.0.1:8003/api/hello-standard
Frontend  http://localhost:5175/hello-standard/
```

Open the frontend URL and submit the form in the sidebar. The Vite dev server proxies `/api` to the backend URL that `mint dev` passes in `MINT_DEV_BACKEND_URL`.

> [Screenshot: hello-standard workspace with the Value field in the Parameters sidebar and the Result card in the main area]

Keep the `resolve.alias` and `resolve.dedupe` entries for Vue and Pinia in the scaffold, so that the SDK and the plugin use the same runtime instances. Keep the Vite `base: '/hello-standard/'` equal to the plugin route prefix, so that the built assets resolve after install. Add a route to `main.ts` for each further page of the workspace.

For authentication, experiment selection, design saves and server files, continue with [Platform integration](/sdk/frontend/platform-integration).

## 7. Build for Production

Run frontend checks:

```bash
cd frontend
vp run type-check
vp run fmt:check
vp run test
vp run build
cd ..
```

Then build the plugin:

```bash
uv run mint doctor --strict
uv run mint lint
uv run pytest -q
uv run mint build
```

`pyproject.toml` already maps the built frontend into the wheel:

```toml
[tool.hatch.build.targets.wheel.sources]
"src/mint_plugin_hello_standard" = "mint_plugin_hello_standard"
"frontend/dist" = "mint_plugin_hello_standard/frontend"
```

With this mapping, `mint build` puts the built workspace in the `.mint` bundle.

## 8. Verify and deploy

Test the bundle in a disposable platform with `mint verify`, then install it on a test platform with `mint deploy`. See [Deploying and verifying a plugin](/sdk/operations/deploying).

## Next

- [Component library](/sdk/components/): choose SDK UI parts before you write custom controls.
- [FormBuilder](/sdk/frontend/form-builder): share controls across forms, sidebars and settings.
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables): add plugin-owned database tables.
