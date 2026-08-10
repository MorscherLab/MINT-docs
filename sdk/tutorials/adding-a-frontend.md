# Tutorial 2 - Adding a Frontend

You'll build **hello-standard**, a `standard` mode plugin with a FastAPI-style backend and a Vue 3 workspace. Use this path when `generated` mode is too constrained for the interaction you need.

By the end you will have:

- A plugin class with `@endpoint` handlers
- A Vue workspace using `@morscherlab/mint-sdk`
- A generated typed client in `frontend/src/generated/mint-plugin.ts`
- Backend and frontend checks that can run in CI

**Time:** 40-50 minutes
**Prereqs:** Python 3.12+, `uv`, Bun, and the `mint` CLI from `mint-sdk`

## 1. Scaffold in Standard Mode

Create a new standard plugin:

```bash
mint init hello-standard \
  --name "Hello Standard" \
  --description "Custom UI analysis plugin" \
  --mode standard \
  --type analysis \
  --yes
cd hello-standard
```

`standard` mode includes both backend and frontend files:

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
    ├── vite.config.ts
    ├── vitest.config.ts
    └── src/
        ├── App.vue
        ├── main.ts
        ├── style.css
        ├── generated/
        │   ├── mint-plugin.contract.json
        │   └── mint-plugin.ts
        └── views/
            ├── WorkspaceView.test.ts
            └── WorkspaceView.vue
```

Checkpoint:

```bash
mint doctor --strict
uv run pytest -q
cd frontend
bun run type-check
bun run test
cd ..
```

## 2. Inspect the Backend

Open `src/mint_plugin_hello_standard/plugin.py`:

```python
from pydantic import BaseModel, Field

from mint_sdk import (
    AnalysisPlugin,
    PluginNavItem,
    PluginType,
    endpoint,
    mint_plugin,
)


class AnalyzeRequest(BaseModel):
    value: float = Field(1.0, description="Value to analyze")


class AnalyzeResponse(BaseModel):
    input: float
    doubled: float


@mint_plugin(
    analysis_type="custom",
    routes_prefix="/hello-standard",
    plugin_type=PluginType.ANALYSIS,
    icon="M4 19h16M7 16V8m5 8V4m5 12v-6",
    nav_items=[
        PluginNavItem(
            path="/",
            label="Workspace",
            id="workspace",
            icon="M4 4h16v16H4zM8 8h8v8H8z",
            description="Custom UI analysis plugin",
        ),
    ],
)
class HelloStandardPlugin(AnalysisPlugin):
    @endpoint.get("/health", tags=["analysis"])
    async def health(self) -> dict[str, str]:
        return {"status": "healthy", "plugin": self.metadata.name}

    @endpoint.post("/analyze", response_model=AnalyzeResponse, tags=["analysis"])
    async def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        return AnalyzeResponse(
            input=request.value,
            doubled=request.value * 2,
        )
```

`@endpoint` is the normal path for plugin HTTP APIs. Use native `get_routers()` only when you need a FastAPI feature that `@endpoint` does not cover, such as dynamic router factories or non-standard route classes.

## 3. Inspect the Backend Test

The scaffold tests the real SDK runtime app:

```python
from fastapi.testclient import TestClient
from mint_sdk.runtime import create_plugin_app

from mint_plugin_hello_standard.plugin import HelloStandardPlugin


def test_plugin_metadata_uses_scaffolded_name() -> None:
    assert HelloStandardPlugin().metadata.name == "hello-standard"


def test_analyze_route_returns_a_real_result() -> None:
    with TestClient(create_plugin_app()) as client:
        response = client.post("/api/hello-standard/analyze", json={"value": 2.5})

    assert response.json() == {"input": 2.5, "doubled": 5.0}
```

Run it after every backend route change:

```bash
uv run pytest -q
```

## 4. Inspect the Frontend Shell

`frontend/src/main.ts` installs the SDK Vue plugin and Pinia:

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MINTSdk } from '@morscherlab/mint-sdk'

import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(MINTSdk)
app.use(createPinia())
app.mount('#app')
```

`frontend/src/App.vue` wraps the plugin page in the standard workspace shell:

```vue
<script setup lang="ts">
import { AppContainer, PluginWorkspaceView } from '@morscherlab/mint-sdk'

import WorkspaceView from './views/WorkspaceView.vue'
</script>

<template>
  <PluginWorkspaceView
    title="Hello Standard"
    subtitle="Starter workspace"
    :show-sidebar="false"
    :show-settings="false"
    :show-standalone-label="false"
  >
    <AppContainer scrollable>
      <WorkspaceView />
    </AppContainer>
  </PluginWorkspaceView>
</template>
```

The CSS entry imports Tailwind and the SDK tokens:

```css
@import "tailwindcss";
@import "@morscherlab/mint-sdk/styles";
```

## 5. Use the Generated Client

The frontend client is generated from backend decorators and Pydantic models:

```bash
mint sdk generate
mint sdk generate --check
```

The starter `WorkspaceView.vue` calls the backend through `useGeneratedPluginClient()`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AlertBox,
  FormBuilder,
  defineControlModel,
  useRequestSyncState,
} from '@morscherlab/mint-sdk'

import {
  useGeneratedPluginClient,
  type AnalyzeResponse,
} from '../generated/mint-plugin'

const client = useGeneratedPluginClient()
const request = useRequestSyncState('Analysis failed')
const analysisModel = defineControlModel({
  controls: {
    value: {
      type: 'number',
      label: 'Value',
      default: 1,
      hint: 'Replace this field with your analysis inputs.',
      props: { step: 0.1 },
    },
  },
})
const values = ref<Record<string, unknown>>({ value: 1 })
const result = ref<AnalyzeResponse | null>(null)
const loading = computed(() => request.loading.value)
const error = computed(() => request.error.value)

async function runAnalysis(formValues: Record<string, unknown>): Promise<void> {
  await request.run(
    async () => {
      const response = await client.analyze({
        value: Number(formValues.value ?? 0),
      })
      result.value = response
      return response
    },
    { success: 'run' },
  ).catch(() => undefined)
}
</script>
```

For this endpoint, the generated call is direct because `/analyze` has only a JSON body. If an endpoint has path or query parameters, run `mint docs contract .` and follow the call shape printed there.

Do not edit `frontend/src/generated/*` by hand. Regenerate after backend route, schema, settings, or navigation changes.

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

Open the frontend URL and submit the form. The Vite dev server proxies `/api` to the backend, so the workspace can call `client.analyze()` without hard-coding a host.

> [Screenshot: hello-standard workspace with a numeric Value field and Analysis result alert]

## 7. Build for Production

Run frontend checks:

```bash
cd frontend
bun run type-check
bun run test
bun run build
cd ..
```

Then build the plugin:

```bash
mint doctor --strict
uv run pytest -q
mint build .
```

`pyproject.toml` already contains the wheel include rule:

```toml
[tool.hatch.build.targets.wheel.force-include]
"frontend/dist" = "mint_plugin_hello_standard/frontend"
```

That is why `mint build .` can place the built workspace inside the `.mint` bundle.

## Where You've Landed

You now have a standard-mode plugin that:

- Uses `@endpoint` methods for custom HTTP APIs
- Renders a Vue 3 workspace with SDK components
- Calls the backend through the generated typed client
- Runs backend tests and frontend type/test checks
- Builds frontend assets into the plugin bundle

## Next

- [Component Library](/sdk/components/) - choose SDK UI pieces before writing custom controls
- [Frontend → Composables](/sdk/frontend/composables) - platform-aware state and API helpers
- [Tutorial 3 - Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) - add plugin-owned database tables
