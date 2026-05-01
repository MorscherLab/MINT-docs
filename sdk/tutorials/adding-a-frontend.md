# Tutorial 3 — Adding a frontend

You'll add a Vue 3 frontend to the **hello-mint** plugin from [Tutorial 1](/sdk/tutorials/first-analysis-plugin). It uses `@morscherlab/mint-sdk` components — `AppLayout`, `Card`, the `useApi` composable — and runs side-by-side with the backend with hot reload.

**Time:** ~45 minutes
**Prereqs:** Tutorial 1 completed; bun installed

## 1. Scaffold the frontend

`mint init` scaffolds a frontend by default — frontend setup is **opt-out** via `--no-frontend`, not opt-in via a separate flag. There's no `mint init --add-frontend`. So if your existing plugin was created with `--no-frontend`, you have two choices:

| Option | When |
|--------|------|
| Re-scaffold with frontend included | The plugin source is still small — easiest |
| Manually add a `frontend/` directory | The plugin already has substantial source code |

For Tutorial 1's hello-mint plugin, re-scaffolding is fastest. From the parent directory, with the existing plugin moved aside:

```bash
mv hello-mint hello-mint.backup
mint init hello-mint \
  --type analysis \
  --description "Hello world analysis plugin" \
  --yes
# Then port your routes.py changes from hello-mint.backup/src/hello_mint/
```

Alternatively, copy the frontend scaffolding from a fresh `mint init` run into your existing project. Either way, the resulting layout:

```
hello-mint/
├── src/
│   └── hello_mint/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       └── views/
│           └── Home.vue
└── pyproject.toml
```

```bash
cd frontend
bun install
```

## 2. Inspect the scaffolded entry

```ts
// frontend/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@morscherlab/mint-sdk/styles'
import './style.css'

import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

The SDK exposes only one CSS sub-path — `'@morscherlab/mint-sdk/styles'` — which is the full bundle (variables + base styles). There is no `/styles/variables.css` sub-path.

```vue
<!-- frontend/src/App.vue -->
<script setup lang="ts">
import Home from './views/Home.vue'
</script>

<template>
  <Home />
</template>
```

```ts
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'
import preset from '@morscherlab/mint-sdk/tailwind.preset'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  presets: [preset],
} satisfies Config
```

The CSS variables import + Tailwind preset are how plugin frontends inherit the platform's design language without hand-rolling tokens.

## 3. Build a Home view

Replace `frontend/src/views/Home.vue`:

```vue
<!-- frontend/src/views/Home.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppLayout, Card, BaseInput, BaseButton, useApi } from '@morscherlab/mint-sdk'

interface ExperimentSummary {
  experiment_id: number
  name: string
  status: string
  experiment_type: string
}

const api = useApi()
const experimentId = ref<number>(1)
const summary = ref<ExperimentSummary | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

async function fetchSummary() {
  loading.value = true
  error.value = null
  summary.value = null
  try {
    summary.value = await api.get<ExperimentSummary>(
      `/api/hello-mint/experiments/${experimentId.value}`
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchSummary)
</script>

<template>
  <AppLayout title="hello-mint">
    <Card class="mb-4">
      <h2 class="text-lg font-semibold mb-2">Experiment summary</h2>
      <div class="flex items-end gap-2 mb-4">
        <BaseInput
          v-model.number="experimentId"
          type="number"
          label="Experiment ID"
          class="w-32"
        />
        <BaseButton @click="fetchSummary" :loading="loading">
          Fetch
        </BaseButton>
      </div>

      <div v-if="error" class="text-text-error">
        Error: {{ error }}
      </div>

      <dl v-else-if="summary" class="grid grid-cols-2 gap-2 text-sm">
        <dt class="text-text-secondary">ID</dt>
        <dd class="font-mono">{{ summary.experiment_id }}</dd>
        <dt class="text-text-secondary">Name</dt>
        <dd>{{ summary.name }}</dd>
        <dt class="text-text-secondary">Type</dt>
        <dd>{{ summary.experiment_type }}</dd>
        <dt class="text-text-secondary">Status</dt>
        <dd>{{ summary.status }}</dd>
      </dl>

      <div v-else class="text-text-secondary">Loading…</div>
    </Card>
  </AppLayout>
</template>
```

What's used:

| Symbol | From | What it does |
|--------|------|--------------|
| `AppLayout` | `@morscherlab/mint-sdk` | Page shell with the platform's top bar / sidebar shape |
| `Card` | `@morscherlab/mint-sdk` | Standard card surface — picks up bg / border / shadow tokens |
| `BaseInput` | `@morscherlab/mint-sdk` | Themed input with label, focus ring, and the optical-centering rule |
| `BaseButton` | `@morscherlab/mint-sdk` | Themed button with loading state |
| `useApi` | `@morscherlab/mint-sdk` | Typed fetch wrapper that auto-applies auth + tracing |

The Tailwind utilities (`bg-bg-primary`, `text-text-secondary`, …) come from the SDK's preset.

## 4. Run with the platform

From `hello-mint/`:

```bash
mint dev --platform
```

Expected output:

```
→ platform:        http://127.0.0.1:8001
→ plugin backend:  http://127.0.0.1:8005
→ plugin frontend: http://127.0.0.1:5173 (Vite dev)
→ proxy: /api/hello-mint/* → :8005
→ proxy: /hello-mint/*     → :5173
```

Open `http://127.0.0.1:8001/hello-mint` in the browser. You should see the **Experiment summary** card. Type an ID, click **Fetch**, see the response.

The Vite dev server hot-reloads on Vue changes; the backend hot-reloads on Python changes. No restart needed for either.

## 5. Add a useExperimentSelector

The SDK ships a composable that gives you a project-aware experiment picker. Swap the bare number input for it:

```vue
<!-- frontend/src/views/Home.vue — replace the input section -->
<script setup lang="ts">
// ... imports as before, plus:
import { ExperimentSelector, useExperimentSelector } from '@morscherlab/mint-sdk'

const { selected } = useExperimentSelector()

// Sync selected → experimentId
import { watch } from 'vue'
watch(selected, (e) => {
  if (e) {
    experimentId.value = e.id
    fetchSummary()
  }
})
</script>

<template>
  <AppLayout title="hello-mint">
    <Card class="mb-4">
      <h2 class="text-lg font-semibold mb-2">Pick an experiment</h2>
      <ExperimentSelector class="mb-4" />
      <!-- summary block as before -->
    </Card>
  </AppLayout>
</template>
```

`useExperimentSelector` reads from the platform's experiments API and surfaces the user's accessible ones. The `selected` ref is reactive; we watch it and re-fetch.

## 6. Build for production

```bash
# In hello-mint/frontend
bun run build
# → dist/ — static assets

# In hello-mint/
mint build
```

`mint build` picks up `frontend/dist/` (via `tool.hatch.build.targets.wheel.force-include` in your `pyproject.toml`) and packages it into the `.mld` bundle. The plugin's `get_frontend_dir()` finds the assets at runtime — first under the installed package's directory, then walking upward looking for `frontend/dist` in dev layouts.

## 7. Style notes

The SDK's design tokens are CSS variables. **Don't hardcode hex colors in your plugin frontend.** Instead use:

- The Tailwind utilities the SDK preset exposes (`bg-bg-primary`, `text-text-muted`, `border-border-default`, …)
- The `--color-primary*`, `--mint-{success,error,warning,info}`, and surface variables for raw CSS
- The `--focus-ring` variable for any custom interactive element

This is how a plugin's UI stays in sync when a deployment overrides the platform's palette. See [Frontend → Design tokens](/sdk/frontend/design-tokens).

## Where you've landed

The hello-mint plugin now has:

- A Vue 3 frontend mounted at `/hello-mint` in the platform
- A live experiment lookup using `useApi` and `useExperimentSelector`
- Tailwind utilities pointing at SDK design tokens
- A production build wired into `mint build`

## Next

→ [Tutorial 4 — Plugin roles](/sdk/tutorials/plugin-roles) — gate UI by user role
→ [Frontend → Components](/sdk/frontend/components) — the catalog of available components
→ [Frontend → Composables](/sdk/frontend/composables) — `useApi`, `useExperimentSelector`, `useFormBuilder`, …
