# Composables

The frontend SDK ships 35 typed composables. This page lists the commonly used ones with a one-line summary, then deep-dives on the 7 you'll use most often: `useApi`, `useAuth`, `useToast`, `usePlatformContext`, `useExperimentSelector`, `useExperimentData`, `useFormBuilder`.

## Full list

::: details Common composables (click to expand)
| Composable | What it returns | When to reach for it |
|------------|-----------------|----------------------|
| `useApi` | Typed fetch wrapper | Any API call from the frontend |
| `useAuth` | Login/logout/register/token helpers | Authentication flows |
| `usePasskey` | WebAuthn registration / login flows | Building passkey UX |
| `useTheme` | Theme state + toggle | Light/dark switcher |
| `useToast` | Toast dispatcher | User feedback |
| `usePlatformContext` | Integration, plugin, user, theme, feature flags | Plugins mounted inside the platform shell |
| `useForm` | Reactive form state with validation rules | Manual form management |
| `useFormBuilder` | Schema-driven form runtime | The `FormBuilder` component (rare to use directly) |
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
| `usePluginConfig` | Plugin settings reactive object | Reading plugin config from the frontend |
| `usePluginApi` | Plugin-scoped API client | Calls scoped to the plugin's prefix |
| `useExperimentSelector` | Picker UI + reactive selected experiment | Experiment dropdowns |
| `useExperimentData` | Reactive exported experiment data payload | Live experiment view |
| `useExperimentSave` | Save/load design data and analysis results | Forms that save back to an experiment |
| `useAppExperiment` | App-level experiment provide/inject | Plugin pages that need the active experiment |
:::

## Deep dives

### `useApi`

An Axios wrapper that reads the SDK settings store for the API base URL and adds the stored bearer token when one is available. The default API base is `/api`, so request paths are relative to that base.

```ts
import { useApi } from '@morscherlab/mint-sdk'

const api = useApi()

// Plain GET — auto-typed by the type parameter
const summary = await api.get<ExperimentSummary>('/my-plugin/experiments/1')

// POST with a body
const created = await api.post<Panel>('/my-plugin/panels', {
  experiment_id: 1, name: 'Cisplatin', drugs: [...]
})

// Other methods on the returned object:
await api.put<Panel>('/my-plugin/panels/1', { ... })
await api.patch('/my-plugin/panels/1', { name: 'Renamed' })
await api.delete(`/my-plugin/panels/${id}`)

// File operations
const result = await api.upload('/my-plugin/files', file)
const blob = await api.download(`/my-plugin/files/${id}`)

// URL builders for WebSocket / SSE endpoints
const wsUrl = api.buildWsUrl('/my-plugin/stream')
```

The full return shape is `{ client, get, post, put, patch, delete, upload, download, buildUrl, buildWsUrl }`. `client` is the underlying Axios instance.

`api` automatically:

- Adds the stored bearer token unless `withAuth: false` is set
- Uses the configured API base URL and request timeout from `useSettingsStore`
- Sets JSON headers by default and lets Axios set multipart boundaries for `upload()`

For plugin-scoped calls with a plugin-specific base URL, use `usePluginApi({ fallbackPrefix: '/api/<plugin-prefix>' })` and call paths like `/sessions`.

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
const canEdit = computed(() =>
  userInfo.value?.role === 'admin' || userInfo.value?.role === 'member'
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
toast.info('Tip: use Cmd+K to open the command palette')

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

The return shape is `{ context, isIntegrated, plugin, user, theme, features, navigate, notify, sendToPlatform }`. For the current experiment in integrated plugin views, use `useCurrentExperiment()` or the `currentExperimentId` helper returned by `useExperimentSave()`.

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

// To search, mutate filters.search and call fetch():
filters.search = 'TCA'
await fetch()
```

The selected experiment is `selectedExperiment` (not `selected`); the search input is `filters.search`; re-fetch is `fetch()` (not `refresh`). Pair with the `ExperimentSelectorModal` component for a picker UI, or render `experiments` yourself.

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

## Other notable composables (one-line each)

| Composable | Use it when |
|------------|-------------|
| `useAsync` | Wrap any async function so the template can show loading / error / data states |
| `useDoseCalculator` | Building dose-response calculators or serial dilution helpers |
| `useConcentrationUnits` | Parsing user input like "5 mM" and converting between unit families |
| `useChemicalFormula` | Show elemental composition of a formula string |
| `useTheme` | Custom theme switcher (the standard `<ThemeToggle>` already uses this) |
| `useTimeUtils` | Plate-reader scheduling, anything with time slots |

## Notes

- All composables use Vue 3 Composition API. Call them inside `<script setup>` or `setup()` only.
- Most composables return `Ref` or `ComputedRef` — destructure but keep the references reactive.
- The composables that hit the network (`useApi`, `useExperimentData`, `useExperimentSelector`) handle auth automatically; you don't construct your own `fetch` calls.

## Related

- [Components](/sdk/frontend/components) — components that pair with these composables
- [Design tokens](/sdk/frontend/design-tokens) — `useTheme` integrates with the token system
- [API Reference → Frontend SDK](/sdk/api/frontend) — every composable's exported types
