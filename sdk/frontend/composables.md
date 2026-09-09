# Composables

This page covers the public **1.2.0** composables and helper factories used for generated clients, experiment context, settings, forms, and platform API calls. For a complete selection-and-save page, see [Platform integration](/sdk/frontend/platform-integration).

## Full list

::: details Common composables (click to expand)
| Composable | What it returns | When to reach for it |
|------------|-----------------|----------------------|
| `useApi` | Axios-based API wrapper | Platform routes outside the plugin contract |
| `useAuth` | Login/logout/register/token helpers | Authentication flows |
| `usePasskey` | WebAuthn registration / login flows | Building passkey UX |
| `useTheme` | Theme state + toggle | Light/dark switcher |
| `useToast` | Toast dispatcher | User feedback |
| `usePlatformContext` | Integration, plugin, user, theme, feature flags | Plugins mounted inside the platform shell |
| `useForm` | Reactive form state with validation rules | Manual form management |
| `useFormBuilder` | Schema-driven form runtime | The `FormBuilder` component (rare to use directly) |
| `defineControls`, `defineControlModel` | Typed compact control schemas | Generate FormBuilder, SettingsModal, AppSidebar, and ControlWorkspaceView bindings from one model |
| `useControlSchema`, `useControlWorkspace` | Derived form/sidebar/topbar/component bindings | Custom generated workspaces |
| `useAsync`, `useAsyncBatch` | Async-state helpers (loading/data/error) | Wrap any async operation |
| `useWellPlateEditor` | Well-plate state + helpers | Plate-design UIs |
| `useRackEditor` | Rack-layout state | Sample-rack UIs |
| `useConcentrationUnits` | Concentration parsing / conversion | Anything dealing with µM / mg/mL / % |
| `useDoseCalculator` | Dilution + serial-dilution math | Drug-screening tools |
| `useReagentSeries` | Dilution series generators | Building dose-response panels |
| `useChemicalFormula` | Formula parsing + MW | Showing elemental composition |
| `useSequenceUtils` | DNA / protein sequence helpers | Sequence inputs and stats |
| `useTimeUtils` | Time math + slot generation | Schedule UIs |
| `useScheduleDrag` | Drag-to-reschedule handlers | Calendar / timeline UIs |
| `useProtocolTemplates` | Lab-protocol template engine | Step-by-step protocol UIs |
| `useAutoGroup` | Auto-group samples by name prefix | Sample grouping helpers |
| `createPluginClient` | Contract-aware plugin API client runtime | Generated `useGeneratedPluginClient()` wrappers |
| `buildPluginEndpointUrl`, `resolvePluginBaseUrl` | URL helpers matching generated calls | Rendering links, diagnostics, downloads, and previews |
| `uploadPluginEndpoint`, `downloadPluginEndpoint` | Multipart and Blob helpers | Generated upload/download endpoint wrappers |
| `usePluginEventStream` | Auth-aware SSE stream helper | Generated event-stream endpoints |
| `usePluginSettings` | Plugin settings from platform context or standalone route | Generated `useGeneratedPluginSettings()` wrappers |
| `usePluginJobCenter` | Active/history job-center state | Pass a `PluginJobCenterSource`, such as `usePluginJobs()` |
| `useCurrentExperiment` | Current platform experiment | Integrated plugin pages tied to an experiment |
| `useExperimentSelector` | Picker UI + reactive selected experiment | Experiment dropdowns |
| `useExperimentData` | Reactive exported experiment data payload | Live experiment view |
| `useExperimentSave` | Save/load design data and compatibility analysis results | Forms that save back to an experiment |
| `useAppExperiment` | App-level experiment provide/inject | Plugin pages that need the active experiment |
| `useExperimentStore` | Shared Pinia selection | Workspace picker state and resolved experiment records |
| `useFileBrowser` | Server mount listing and selection | Read-only server paths with `FileBrowserModal` |
| `useRequestSyncState` | Request loading/error/timestamps and cancellation | Stateful request feedback |
:::

## Deep dives

### `useApi`

An Axios wrapper that reads the SDK settings store for the API base URL and adds the stored bearer token when one is available. The default API base is `/api`, so request paths are relative to that base.

```ts
import { useApi, type ExperimentSummary } from '@morscherlab/mint-sdk'

const api = useApi({ typedErrors: true })

// A platform endpoint; path is relative to /api.
const experiment = await api.get<ExperimentSummary>('/experiments/42')
```

The full return shape is `{ client, get, post, put, patch, delete, upload, download, buildUrl, buildWsUrl }`. `client` is the underlying Axios instance.

`api` automatically:

- Adds the stored bearer token unless `withAuth: false` is set
- Uses the configured API base URL and request timeout from `useSettingsStore`
- Sets JSON headers by default and lets Axios set multipart boundaries for `upload()`

For plugin-scoped calls, prefer the generated client from `frontend/src/generated/mint-plugin.ts` after running `mint sdk generate`. It uses the plugin contract, route prefix, and platform context to build the right URLs.

### Generated plugin clients

`mint sdk generate` writes `frontend/src/generated/mint-plugin.ts`. Import from that generated file in plugin code; it wraps the lower-level SDK helpers with your plugin's own endpoint names and types.

```ts
import {
  generatedPluginEndpoints,
  useGeneratedPluginClient,
  useGeneratedPluginContract,
} from '../generated/mint-plugin'

const pluginClient = useGeneratedPluginClient()
const pluginContract = useGeneratedPluginContract()
// Body-only standard scaffold endpoint.
const result = await pluginClient.analyze({ value: 2.5 })
const analyzeUrl = pluginContract.buildEndpointUrl('analyze')
const definition = pluginContract.getEndpoint('analyze')
const endpointNames = generatedPluginEndpoints
```

Generated signatures depend on the endpoint:

| Backend route shape | Generated call shape |
|---------------------|----------------------|
| JSON body only | `client.analyze({ value: 2.5 })` |
| Path/query parameters and JSON body | `client.method({ pathParams: { ... }, query: { ... }, body: { ... } })` |
| Path/query parameters without a body | `client.method({ pathParams: { ... }, query: { ... } })` |
| No parameters or body | `client.method()` |

Omit unused parameter groups. Use the exact field names and endpoint names from `mint docs contract .`; the frontend parameter names may differ from Python's snake_case names. Mixed endpoints also accept flattened parameters for compatibility. Do not wrap a body-only call in `{ body: ... }`.

Generated upload/download helpers accept the endpoint name and its payload. Use `useGeneratedPluginEventStream(name, payload, options)` for a parameterized stream; parameterless streams also accept `(name, options)`. These helpers only work for routes declared by your plugin.

Use `pluginContract.endpointDefinitions`, `pluginContract.getEndpoint(name)`, and `pluginContract.buildEndpointUrl(name, payload)` when you need diagnostics or a link preview without making the request. Use `pluginContract.adaptRequest()` / `adaptResponse()` only at domain-model boundaries where your local UI model is intentionally narrower than the generated API shape.

### Typed HTTP errors in 1.2

Generated clients normalize HTTP failures to `MintApiError`. Raw `useApi()` keeps the legacy error behavior unless called with `{ typedErrors: true }`. Network failures can still be ordinary errors, so keep a fallback:

```ts
import { ref } from 'vue'
import { MintApiError } from '@morscherlab/mint-sdk'
import { useGeneratedPluginClient } from '../generated/mint-plugin'

const client = useGeneratedPluginClient()
const errorMessage = ref<string | null>(null)

async function run(value: number): Promise<void> {
  errorMessage.value = null
  try {
    await client.analyze({ value })
  } catch (error) {
    if (error instanceof MintApiError) {
      const reference = error.requestId ? ` (request ${error.requestId})` : ''
      errorMessage.value = `${error.message}${reference}`
    } else {
      errorMessage.value = error instanceof Error ? error.message : 'Analysis failed'
    }
  }
}
```

Render `errorMessage` in an `AlertBox`. The error exposes `code`, `status`, `requestId`, `details`, legacy `detail`, original `body`, and `cause`. Branch on `code`/`status` for program behavior; use `requestId` to correlate a report with server logs. An expired authenticated request raises `AuthenticationRequiredError`, a `MintApiError` with status 401. Do not blindly retry a state-changing request after a timeout.

`useRequestSyncState()` supplies `loading`, `error`, and success timestamps when a message is sufficient. Its `run()` rethrows failures after recording them; catch at the UI boundary. Its stale-request guard protects those shared refs, not arbitrary result assignments inside your callback.

### `useCurrentExperiment`

Reads an experiment ID from platform injection or the current URL, then fetches its payload by default. Set `{ immediate: false }` to wait for an explicit `fetch()`/`refresh()`. This helper does not track `ExperimentSelectorModal` selection; use `useExperimentStore()` for that flow.

```ts
import { useCurrentExperiment } from '@morscherlab/mint-sdk'

const currentExperiment = useCurrentExperiment()
// Throws when the page has no experiment context.
const id = currentExperiment.requireExperimentId()
```

The generated client can infer `experimentId` for route params named `experimentId` when the platform context contains it, but passing it explicitly keeps examples and tests easier to read.

### `usePluginSettings`

Use `useGeneratedPluginSettings()` with backend settings declared by `@mint_plugin(config=SettingsModel)`. The generated helper binds the settings schema and plugin identity. Platform context determines whether to use platform config routes or the plugin's managed `/settings` route; standalone uses the plugin route.

```ts
import { useGeneratedPluginSettings } from '../generated/mint-plugin'

const settings = useGeneratedPluginSettings()

settings.values.value.threshold = 0.05
const saved = await settings.save()
// Show success only when saved is true; render settings.error otherwise.

// Ready for PluginWorkspaceView / AppTopBar:
const settingsConfig = settings.settingsConfig
```

The return shape includes `settings`, `values`, `config`, `settingsConfig`, `isLoading`, `isSaving`, `error`, `lastLoadedAt`, `lastSavedAt`, `isDirty`, `load()`, `save()`, `reset()`, and `setValues()`. Load the saved values before editing. The helper tracks revisions internally, sends changed fields through platform PATCH routes, and uses `If-Match` for managed plugin PUT saves. Surface conflicts; do not discard unsaved edits with an automatic reload.

### `useAuth`

Authentication actions and token helpers. Reactive auth state lives in the Pinia auth store.

```ts
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuth, useAuthStore } from '@morscherlab/mint-sdk'

const { login, logout, initializeAuth, updateProfile } = useAuth()
const authStore = useAuthStore()
const { userInfo, isAuthenticated, isLoading, error } = storeToRefs(authStore)

// Reactively gate UI
const canConfigurePlugins = computed(() =>
  authStore.hasPermission('plugins.configure')
)

// Programmatic logout
function signOut() {
  logout()
}
```

`useAuth()` returns methods such as `login`, `logout`, `register`, `verifyToken`, `refreshToken`, `initializeAuth`, `getCurrentUser`, `getAuthHeader`, and `updateProfile`. `useAuthStore()` exposes `userInfo`, `isAuthenticated`, `isAdmin`, `needsAuth`, `isLoading`, and `error` as reactive store state. Plugin roles are separate; fetch them from your plugin's own `/me/role` endpoint as needed.

### `useToast`

Programmatic toast notifications using the platform's toast stack.

```ts
import { useToast } from '@morscherlab/mint-sdk'

const toast = useToast()

toast.success('Panel saved')
toast.warning('Detected 3 duplicates — review before saving')
toast.error('Failed to save: network error')
toast.info('Tip: results are saved to the experiment artifacts card')

// Generic dispatcher: message, type, duration
toast.show('Panel saved', 'success', 5000)
toast.clear()
```

### `usePlatformContext`

When your plugin is mounted inside the platform shell, the platform can inject plugin metadata, user context, theme, feature flags, and API origin information. `usePlatformContext` reads that context and exposes postMessage helpers.

```ts
import { watch } from 'vue'
import { usePlatformContext } from '@morscherlab/mint-sdk'

const { isIntegrated, plugin, user, theme, features, navigate, notify } = usePlatformContext()

watch(theme, (mode) => {
  document.documentElement.dataset.theme = mode
})

notify('Panel saved', 'success')
```

The return shape is `{ context, isIntegrated, plugin, user, theme, features, navigate, notify, sendToPlatform }`. It does not expose `login()` or the selected experiment. Use the [state selection guide](/sdk/frontend/platform-integration#choose-the-right-source-of-state) to choose between URL context and shared picker state.

### `useExperimentSelector`

Inline picker — fetches the user's accessible experiments and surfaces a reactive selected experiment.

```ts
import { useExperimentSelector } from '@morscherlab/mint-sdk'

const {
  experiments,        // Ref<Experiment[]>
  total,              // Ref<number>
  selectedExperiment, // Ref<Experiment | null>
  filters,            // reactive { search, status, project, experimentType, ... }
  isLoading,
  error,
  page,
  hasMore,
  sortKey,
  experimentTypes,    // available faceted values
  projects,
  groupedByProject,
  fetch,              // re-fetch with current filters
  loadMore,
  reset,
  select,             // (experiment: Experiment) => void
  clear,
  fetchFilterOptions,
} = useExperimentSelector({ /* options */ })

// Search is watched and debounced by the composable.
filters.search = 'TCA'
```

The selected experiment is `selectedExperiment` (not `selected`); the search input is `filters.search`; explicit re-fetch is `fetch()` (not `refresh`). Its `select()` only changes this composable's local selection. For the standard modal, use `ExperimentSelectorModal` directly; it owns its list and commits records to `useExperimentStore()`.

For plugins mounted on an experiment-specific view, use `useCurrentExperiment()` when you need the experiment payload or `useExperimentSave().currentExperimentId` when you only need the current id for persistence.

### `useExperimentData`

Reactive view of one experiment's exported design/analysis display payload.

```ts
import { useExperimentData } from '@morscherlab/mint-sdk'

const { data, treeData, tableData, summaryData, isLoading, error, fetch, refresh } = useExperimentData({
  immediate: false,
})

await fetch(1)

// data = Ref<Record<string, unknown> | null>
// treeData/tableData/summaryData are computed display shapes
```

Pair with `useExperimentSave` for the save side.

### `useFormBuilder`

Powers the `FormBuilder` component — schema in, model out. You rarely call it directly; you pass a schema to `<FormBuilder>` and it handles the wiring. If you need programmatic control (e.g., custom validation hooks), reach for `useFormBuilder` directly.

```ts
import { useFormBuilder, evaluateCondition } from '@morscherlab/mint-sdk/composables'
import type { FormSchema } from '@morscherlab/mint-sdk/types'

const panelSchema: FormSchema = { sections: [/* ... */] }
const builder = useFormBuilder(panelSchema, { name: '', drugs: [] })

// Conditional fields driven by the schema
const showAdvanced = evaluateCondition(
  { field: 'expert_mode', eq: true },
  builder.form.data,
)
```

See [FormBuilder deep dive](/sdk/frontend/form-builder).

### `defineControls` and `useControlWorkspace`

Compact controls let one model generate forms, settings modals, sidebars, topbar settings, and initial values:

```ts
import { ref } from 'vue'
import {
  ControlWorkspaceView,
  defineControlModel,
} from '@morscherlab/mint-sdk'

const workspaceModel = defineControlModel({
  views: {
    run: {
      label: 'Run',
      sections: {
        parameters: {
          label: 'Parameters',
          controls: {
            threshold: { type: 'number', default: 0.05, min: 0, max: 1 },
            method: { default: 'linear', options: ['linear', 'logistic'] },
          },
        },
      },
    },
  },
})

const values = ref({})
```

```vue
<ControlWorkspaceView
  v-model="values"
  :model="workspaceModel"
  title="Analysis"
  sidebar-title="Run controls"
/>
```

For lower-level layouts, `useControlSchema()` gives you `formSchema`, `settingsSchema`, `topBarSettingsConfig`, `sidebarPanels`, `sectionSchemas`, and `initialValues`. `useControlWorkspace()` wraps those into shared reactive values and ready-to-bind `AppTopBar`, `AppSidebar`, and `FormBuilder` props.

## Other notable composables (one-line each)

| Composable | Use it when |
|------------|-------------|
| `useAsync` | Wrap any async function so the template can show loading / error / data states |
| `useDoseCalculator` | Building dose-response calculators or serial dilution helpers |
| `useConcentrationUnits` | Parsing user input like "5 mM" and converting between unit families |
| `useChemicalFormula` | Show elemental composition of a formula string |
| `useTheme` | Custom theme switcher (the standard `<ThemeToggle>` already uses this) |
| `useTimeUtils` | Plate-reader scheduling, anything with time slots |
| `useRequestSyncState` | Loading/error/last-saved state around requests |
| `useFileImport` | Read and validate delimited text imports |
| `useListSelection`, `useSelectionLimit` | Table, list, and plate selection state |
| `useTextSearch`, `useSortedItems` | Client-side filtering and sorting |
| `useExpansionSet` | Expand/collapse state for trees and grouped lists |
| `useBioTemplateWorkspace` | Template-driven controls, preview, and component bindings |
| `useFileBrowser` | Server mount browsing, refresh, search, sort, path selection, and error state |

### Plotly results

Use `PlotlyChart` for native Plotly traces instead of owning the library lifecycle in each plugin:

```vue
<script setup lang="ts">
import { PlotlyChart } from '@morscherlab/mint-sdk'
</script>

<template>
  <PlotlyChart
    title="QC intensity"
    aria-label="Peak intensity by injection number"
    :data="[{ type: 'scatter', mode: 'lines+markers', x: [1, 2, 3], y: [100, 98, 102] }]"
    :layout="{ xaxis: { title: { text: 'Injection' } }, yaxis: { title: { text: 'Intensity' } } }"
  />
</template>
```

Props include `data`, `layout`, `config`, `title`, `description`, `loading`, `empty`, `emptyMessage`, and `ariaLabel`. The component lazily imports Plotly, updates with `Plotly.react`, tracks theme and container size, and purges on unmount. Set `empty` explicitly when there is no result. Keep axis labels and units in the supplied layout. Use `ChartContainer` for another rendering library.

## Notes

- All composables use Vue 3 Composition API. Call them inside `<script setup>` or `setup()` only.
- Most composables return `Ref` or `ComputedRef` — destructure but keep the references reactive.
- The composables that hit the network (`useApi`, generated plugin clients, `useExperimentData`, `useExperimentSelector`) handle auth automatically; you don't construct your own `fetch` calls.
- Prefer public package imports (`@morscherlab/mint-sdk` or documented subpaths). `mint doctor` flags legacy `usePluginApi()`, direct private SDK subpaths, and raw plugin API `fetch('/api/...')` calls.

## Related

- [Component Library](/sdk/components/) — components that pair with these composables
- [Design tokens](/sdk/frontend/design-tokens) — `useTheme` integrates with the token system
- [API Reference → Frontend SDK](/sdk/api/frontend) — every composable's exported types
