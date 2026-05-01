# Composables

The frontend SDK ships ~29 typed composables. This page lists every one with a one-line summary, then deep-dives on the 7 you'll use most often: `useApi`, `useAuth`, `useToast`, `usePlatformContext`, `useExperimentSelector`, `useExperimentData`, `useFormBuilder`.

## Full list

::: details All 29 composables (click to expand)
| Composable | What it returns | When to reach for it |
|------------|-----------------|----------------------|
| `useApi` | Typed fetch wrapper | Any API call from the frontend |
| `useAuth` | Current user, login/logout actions | Reading user identity, role checks |
| `usePasskey` | WebAuthn registration / login flows | Building passkey UX |
| `useTheme` | Theme state + toggle | Light/dark switcher |
| `useToast` | Toast dispatcher | User feedback |
| `usePlatformContext` | Active project / experiment context | Plugins mounted inside the platform shell |
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
| `useExperimentData` | Reactive experiment design + analysis | Live experiment view |
| `useExperimentSave` | Save flow with conflict detection | Forms that save back to an experiment |
| `useAppExperiment` | App-level experiment provide/inject | Plugin pages that need the active experiment |
:::

## Deep dives

### `useApi`

A typed fetch wrapper that reads the platform's auth state and prepends `/api` to relative paths.

```ts
import { useApi } from '@morscherlab/mint-sdk'

const api = useApi()

// Plain GET — auto-typed by the type parameter
const summary = await api.get<ExperimentSummary>('/api/my-plugin/experiments/1')

// POST with a body
const created = await api.post<Panel>('/api/my-plugin/panels', {
  experiment_id: 1, name: 'Cisplatin', drugs: [...]
})

// PATCH, PUT, DELETE work analogously
await api.delete(`/api/my-plugin/panels/${id}`)
```

`api` automatically:

- Sends the platform's auth cookie (or bearer token) — no manual header
- Adds `Content-Type: application/json` for JSON bodies, `multipart/form-data` for `FormData`
- Throws on non-2xx — the rejection is an `Error` with `status`, `code`, and `details` fields populated from the platform's structured error response
- Propagates the OpenTelemetry trace context

For plugin-scoped calls (auto-prepending `/api/<plugin-prefix>`), use `usePluginApi` instead.

### `useAuth`

Reactive access to the current user and authentication actions.

```ts
import { useAuth } from '@morscherlab/mint-sdk'

const { user, isAuthenticated, login, logout } = useAuth()

// Reactively gate UI
const canEdit = computed(() => user.value?.role === 'Admin' || user.value?.role === 'Member')

// Programmatic logout
async function signOut() {
  await logout()
}
```

`user` is a `Ref<User | null>`. The user object includes `id`, `username`, `email`, `role`, and the platform-managed audit fields. Plugin roles are separate — fetch via your plugin's own `/me/role` endpoint as needed.

### `useToast`

Programmatic toast notifications using the platform's toast stack.

```ts
import { useToast } from '@morscherlab/mint-sdk'

const toast = useToast()

toast.success('Panel saved')
toast.warning('Detected 3 duplicates — review before saving')
toast.error('Failed to save: network error')
toast.info('Tip: use Cmd+K to open the command palette')

// With more options
toast.success({
  title: 'Panel saved',
  description: 'View in the panels list',
  duration: 5000,
  action: {
    label: 'View',
    onClick: () => router.push('/panels'),
  },
})
```

### `usePlatformContext`

When your plugin is mounted inside the platform shell (under `/<plugin-prefix>`), the platform provides context about the active project and experiment. `usePlatformContext` reads it reactively.

```ts
import { usePlatformContext } from '@morscherlab/mint-sdk'

const { project, experiment } = usePlatformContext()

watch(experiment, (e) => {
  if (e) loadDataFor(e.id)
})
```

Both `project` and `experiment` are `Ref<… | null>`. They're `null` when the plugin is rendered outside an experiment (e.g., at the top-level plugin home).

### `useExperimentSelector`

Inline picker — fetches the user's accessible experiments and surfaces a reactive selected experiment.

```ts
import { useExperimentSelector } from '@morscherlab/mint-sdk'

const { experiments, selected, search, isLoading, refresh } = useExperimentSelector({
  pageSize: 20,
  filterStatus: ['ongoing', 'completed'],
})

// `selected` is a Ref<Experiment | null>. Pair with the `ExperimentSelectorModal`
// component for the picker UI, or render `experiments` yourself.
```

For plugins that expect an experiment to *always* be active (because they're mounted on the experiment **Analyze** tab), use `usePlatformContext` instead — it reads the active experiment from the URL.

### `useExperimentData`

Reactive view of a single experiment's design data and analysis results. Keeps the values in sync as other plugins write.

```ts
import { useExperimentData } from '@morscherlab/mint-sdk'

const { design, analysis, isLoading, refresh } = useExperimentData({
  experimentId: 1,
  pluginId: 'my-plugin',   // which analysis plugin's results to read
})

// design = Ref<DesignData | null>
// analysis = Ref<PluginAnalysisResult | null>
```

Pair with `useExperimentSave` for the save side.

### `useFormBuilder`

Powers the `FormBuilder` component — schema in, model out. You rarely call it directly; you pass a schema to `<FormBuilder>` and it handles the wiring. If you need programmatic control (e.g., custom validation hooks), reach for `useFormBuilder` directly.

```ts
import { useFormBuilder, evaluateCondition } from '@morscherlab/mint-sdk'

const { fields, model, errors, validate, reset } = useFormBuilder({
  schema: panelSchema,
  initial: { name: '', drugs: [] },
})

// Conditional fields driven by the schema
const showAdvanced = evaluateCondition(model.value, panelSchema.advancedCondition)
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
