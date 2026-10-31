# Composables

This page covers the public **@MINT_VERSION@** composables and helper factories used for generated clients, experiment context, settings, forms, jobs, realtime, onboarding, and platform API calls. For a complete selection-and-save page, see [Platform integration](/sdk/frontend/platform-integration).

## Full list

Each row names the entry that exports the composable. Import from that entry; see [Package entry points](/sdk/frontend/#package-entry-points). The package root still exports the names of the 1.3 root that moved, with a `@deprecated` tag, until MINT 1.5.

::: details Common composables (click to expand)
| Composable | Entry | What it returns | When to reach for it |
|------------|-------|-----------------|----------------------|
| `useApi` | `runtime` | Axios-based API wrapper that rejects with `MintApiError` | Platform routes outside the plugin contract |
| `useTheme` | root | Theme state + toggle | Light/dark switcher |
| `useToast` | root | Toast dispatcher | User feedback |
| `usePlatform` | root | Integration state, plugin, user, theme, feature flags, `isAdmin`, `can(access)` | Plugins mounted inside the platform shell |
| `useExperiment` | root | Read-only current experiment: `id`, `current`, `status`, `error`, `refresh()` | Integrated plugin pages tied to an experiment |
| `useRequest` | root | Request loading/error/timestamps and cancellation | Stateful request feedback |
| `providePluginIdentity` | root | Seeds the standalone name, subtitle, and icon of `AppTopBar` | Once in `main.ts` |
| `useForm` | `runtime` | Reactive form state with validation rules | Manual form management |
| `useFormBuilder` | `runtime` | Schema-driven form runtime | The `FormBuilder` component (rare to use directly) |
| `defineControlModel` | root | Typed compact control model | Generate `FormBuilder`, `SettingsModal`, `AppSidebar`, and top-bar settings from one model |
| `defineControls`, `useControlSchema`, `useControlWorkspace` | `runtime` | Derived form/sidebar/topbar/component bindings | Custom generated workspaces |
| `definePluginWorkspaceView`, `defineDataFrame` | root | Typed `:spec` for the component | Structure of `PluginWorkspaceView` and `DataFrame` |
| `defineWellPlate`, `definePlateEditor` | `lab` | Typed `:spec` for the component | Structure of `WellPlate` and `PlateEditor` |
| `useRackEditor` | `lab` | Rack state, undo/redo, and `PlateEditor` listeners | Holding the plates of a [`PlateEditor`](/sdk/components/plate-editor) |
| `useConcentrationUnits` | `lab` | Concentration parsing / conversion | Anything dealing with µM / mg/mL / % |
| `dose`, `formula`, `time` | `lab` | Namespaces of pure helpers (`dose.calculateDilution()`, `formula.parseFormula()`, `time.formatTime()`) | Dilution math, formula parsing, and time slots |
| `useReagentSeries` | `lab` | Dilution series generators | Building dose-response panels |
| `useSequenceUtils` | `lab` | DNA / protein sequence helpers, including `findSequenceProblems` | Sequence inputs and stats |
| `useScheduleDrag` | `lab` | Drag-to-reschedule handlers | Calendar / timeline UIs |
| `useProtocolTemplates` | `lab` | Lab-protocol template engine | Step-by-step protocol UIs |
| `useExperimentSelector` | `data` | Picker UI + reactive selected experiment | Experiment dropdowns |
| `useExperimentData` | `data` | Reactive exported experiment data payload | Live experiment view |
| `useArtifacts` | `data` | Analysis artifacts of an experiment (list, detail, archive, restore) | Result lists |
| `useAppExperiment` | `data` | App-level experiment provide/inject | Plugin pages that need the active experiment |
| `useVersionedSave` | `data` | Optimistic-concurrency save with `If-Match` | Forms on a versioned entity |
| `useFileBrowser` | `data` | Server mount listing and selection | Custom UIs for read-only server paths (`FilePicker` covers the standard case) |
| `usePlatformFilePickerAdapter` | `data` | Authenticated platform `PickerAdapter` | `FilePicker` folder trees, preview, and resolved file selection |
| `createFilePickerAdapter` | `data` | Shared mount navigation/search adapter | Connect a plugin-owned file API through typed transport callbacks |
| `useJobCenter` | `runtime` | Job list, top-bar job, tray state | `JobsStatusTray` and the top-bar run slot |
| `useRealtime`, `usePresence` | `runtime` | Realtime stream subscription; viewers of a topic | Live refresh and presence (needs the `realtime` feature) |
| `createClient`, `buildEndpointUrl`, `uploadEndpoint`, `downloadEndpoint`, `useEventStream`, `useSettingsEndpoint`, `useJobsEndpoint` | `runtime` | Contract-aware plugin client runtime | The generated `useClient()`, `upload`, `download`, `endpointUrl`, `useStream`, `useSettings`, and `useJobs` wrap these |
| `defineOnboarding`, `provideOnboarding`, `useOnboarding` | `shell` | Tours, checklist, and what's-new coordinator | Help button, "Getting started" chip, and tours in `AppTopBar` |
| `useManualLayoutResize` | `shell` | Pointer resize lifecycle and current drag state | Pair with `LayoutResizeHandle` for workbench panes |
| `resizedLeadingPanelWidth`, `resizedTrailingPanelWidth`, `resizedVerticalSplitPercent` | `shell` | Bounded dimension calculations | Apply pointer deltas to widths or vertical splits |
| `useListSelection`, `useSelectionLimit`, `useExpansionSet`, `useSortedItems` | `shell` | Selection, expansion, and sort state | Tables, lists, trees |
| `useEventListener`, `useDebouncedWatch`, `useFocusTrap`, `useRovingFocus`, `useListReorder`, `useMenuKeyboard` | `shell` | Headless interaction helpers | Custom menus, dialogs, and reorderable lists |
:::

The 1.3 composable names that 1.4 renamed or removed are in the [migration guide](/sdk/operations/migrate-1.3-to-1.4). [Deprecated composables](/sdk/api/frontend#deprecated-composables) lists the root names that leave in 1.5.

## Deep dives

### `useApi`

An Axios wrapper that reads the SDK settings store for the API base URL and adds the stored bearer token when one is available. The default API base is `/api`, so request paths are relative to that base. Generated clients use it; plugin code calls it directly only for platform routes outside the plugin contract.

```ts
import type { ExperimentSummary } from '@morscherlab/mint-sdk'
import { useApi } from '@morscherlab/mint-sdk/runtime'

const api = useApi()

// A platform endpoint; path is relative to /api.
const experiment = await api.get<ExperimentSummary>('/experiments/42')
```

The full return shape is `{ client, get, post, put, patch, delete, upload, download, buildUrl, buildWsUrl }`. `client` is the underlying Axios instance.

`api` automatically:

- Adds the stored bearer token unless `withAuth: false` is set
- Uses the configured API base URL and request timeout from `useSettingsStore`
- Sets JSON headers by default and lets Axios set multipart boundaries for `upload()`

For plugin-scoped calls, prefer the generated client from `frontend/src/generated/mint-plugin.ts` after running `mint sdk generate`. It uses the plugin contract, route prefix, and platform context to build the right URLs.

The session token is read-only for the SDK. The platform signs the user in and writes the session; the SDK never writes or removes the stored token.

### Generated plugin clients

`mint sdk generate` writes `frontend/src/generated/mint-plugin.ts`. Import from that generated file in plugin code; it wraps the lower-level SDK helpers with your plugin's own endpoint names and types.

```ts
import { contract, endpointUrl, useClient } from '../generated/mint-plugin'

const client = useClient()
// Body-only standard scaffold endpoint.
const result = await client.analyze({ value: 2.5 })
const analyzeUrl = endpointUrl('analyze')
const definition = contract.endpoints.analyze
```

The generated file also exports `useSettings()`, `useJobs(name, options)`, `useStream()`, `upload`, `download`, `contractHash`, `apiPrefix`, `settingsSchema`, and `settingsForm`. Run `mint docs contract .` for the exact names of your plugin.

Generated signatures depend on the endpoint:

| Backend route shape | Generated call shape |
|---------------------|----------------------|
| JSON body only | `client.analyze({ value: 2.5 })` |
| Path/query parameters and JSON body | `client.method({ pathParams: { ... }, query: { ... }, body: { ... } })` |
| Path/query parameters without a body | `client.method({ pathParams: { ... }, query: { ... } })` |
| No parameters or body | `client.method()` |

Omit unused parameter groups. Use the exact field names and endpoint names from `mint docs contract .`; the frontend parameter names may differ from Python's snake_case names. Mixed endpoints also accept flattened parameters for compatibility. Do not wrap a body-only call in `{ body: ... }`.

`upload(name, payload)` and `download(name, payload, { filename })` take the endpoint name and its payload. `download` resolves with a `Blob`. With `filename`, the browser also saves the file; `save: false` skips the save. Use `useStream(name, payload, options)` for a parameterized stream; parameterless streams also accept `(name, options)`. These helpers only work for routes declared by your plugin.

Use `endpointUrl(name, payload)` when you need diagnostics or a link preview without making the request. `contract` holds the endpoint definitions.

### Typed HTTP errors {#typed-http-errors-in-1-2}

Generated clients and `useApi()` normalize every HTTP failure to `MintApiError`. Read `status`, `body`, or `detail` of the error, not an Axios `error.response`. Network failures can still be ordinary errors, so keep a fallback:

```ts
import { ref } from 'vue'
import { MintApiError } from '@morscherlab/mint-sdk'
import { useClient } from '../generated/mint-plugin'

const client = useClient()
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

`useRequest(defaultMessage)` supplies `isLoading`, `error`, and success timestamps (`lastLoadedAt`, `lastSavedAt`, `lastRunAt`) when a message is sufficient. `run(operation, { kind })` passes an `AbortSignal` to the operation and rethrows failures after recording them; catch at the UI boundary. A newer `run()` or `cancel()` aborts the older run. Its stale-request guard protects those shared refs, not arbitrary result assignments inside your callback.

### `useExperiment`

Reads the experiment that the plugin page works on. It is read-only: the platform selects the experiment. It returns `id` (`number | null`), `current` (the platform record), `status` (`idle`, `loading`, `ready`, or `error`), `error`, and `refresh()`. `refresh()` keeps the loaded record in place while it reads it again. Standalone, no experiment is selected and `id` stays `null`.

```ts
import { watch } from 'vue'
import { useExperiment } from '@morscherlab/mint-sdk'

const experiment = useExperiment()
watch(experiment.id, (id) => { if (id !== null) void load(id) }, { immediate: true })
```

In a platform page, the integration script sets the experiment store from the `experiment_id` URL parameter when the page loads, and writes the parameter back after a selection or a detach. Plugin router navigations keep the parameter. Do not write your own route sync, such as a `watch` on `experimentIdFromRoute(route.query)` that calls `selectById()`. `useArtifacts()`, `ArtifactSaveDialog`, `GeneratedPathInput`, and the `experimentId` path parameter of generated clients read the same store, not the URL.

### Plugin settings: `useSettings`

Use the generated `useSettings()` with backend settings declared in `Metadata.settings`. The generated helper binds the settings schema and plugin identity (`useSettingsEndpoint` in `runtime` is the runtime underneath). Platform context determines whether to use platform config routes or the plugin's managed `/settings` route; standalone uses the plugin route.

```ts
import { useSettings } from '../generated/mint-plugin'

const settings = useSettings()

settings.values.value.threshold = 0.05
const saved = await settings.save()
// Show success only when saved is true; render settings.error otherwise.

// Ready for spec.topBar.settings of PluginWorkspaceView, or the AppTopBar spec:
const settingsConfig = settings.settingsConfig
```

The return shape includes `settings`, `values`, `config`, `settingsConfig`, `isLoading`, `isSaving`, `error`, `lastLoadedAt`, `lastSavedAt`, `isDirty`, `load()`, `save()`, `reset()`, and `setValues()`. Load the saved values before editing. The helper tracks revisions internally, sends changed fields through platform PATCH routes, and uses `If-Match` for managed plugin PUT saves. Surface conflicts; do not discard unsaved edits with an automatic reload.

### `useAuthStore`

A read-only session bridge. The platform signs users in, refreshes the token, handles passkeys, and writes the session through `@morscherlab/mint-sdk/host`; a plugin never writes it. SDK clients read the token from here.

```ts
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@morscherlab/mint-sdk'

const authStore = useAuthStore()
const { userInfo, isAuthenticated, authRequired } = storeToRefs(authStore)
```

`useAuthStore()` exposes `token`, `tokenExpires`, `userInfo`, `authRequired`, `isInitialized`, and `isAuthenticated`, plus `initialize()` and `clearToken()`. It holds no permission helpers. To gate the UI, use `usePlatform().can(access)` or `usePlatform().isAdmin`; for a platform permission, use the helpers of `@morscherlab/mint-sdk/permissions` with `userInfo`. A hidden button is not authorization: the backend checks every request.

### `useToast`

Programmatic toast notifications using the platform's toast stack.

```ts
import { useToast } from '@morscherlab/mint-sdk'

const toast = useToast()

toast.success('Panel saved')
toast.warning('Detected 3 duplicates — review before saving')
toast.error('Failed to save: network error')
toast.info('Tip: results are saved to the experiment artifacts card')

// Each call returns the toast id and takes an options object.
toast.success('Panel saved', { duration: 8000 })
toast.clear()
```

The defaults are 3500 ms for `success` and `info`, 4000 ms for `warning`, and 5000 ms for `error`.

`push()` returns the toast ID and accepts structured options:

```ts
const toastId = toast.push({
  title: 'Analysis running',
  detail: 'Results will be attached to the selected experiment.',
  type: 'info',
  progress: 'indeterminate',
  dismissible: true,
})
// On completion or failure, dismiss the persistent progress notification.
toast.dismiss(toastId)
```

At most two `actions` are retained; each has `label`, `onClick` and optional
`primary`. `count` shows a grouped count. `progress: 'indeterminate'` prevents
auto-dismiss; `progress: 'none'` hides the bar but still uses the normal timeout.
The default duration is 3500 ms. The toast stack sits 1rem from the top of the viewport; when an `AppTopBar` is mounted, it starts 1rem below the bar (the bar publishes `--mint-toast-offset-top` on `<html>`).

### `usePlatform`

When your plugin is mounted inside the platform shell, the platform injects `window.__MINT_PLATFORM__` with the plugin metadata, user, feature flags, and API origin. `usePlatform` reads that context when you call it, so a router guard or a setup-time check sees the signed-in user before any component mounts.

```ts
import { computed } from 'vue'
import { usePlatform } from '@morscherlab/mint-sdk'

const { integrated, plugin, user, theme, features, isAdmin, can } = usePlatform()

const canConfigure = computed(() => can('configure'))
```

`can(access)` answers the three plugin access levels of the Python `access` option: `use`, `configure`, and `admin` (the `Access` type). A platform administrator meets every level. `use` needs `plugins.use` and plugin visibility for the role; `configure` adds `plugins.configure`. The visibility check accepts the plugin name or its route prefix, as the platform does. With auth disabled, the platform injects `authRequired: false` and no `user`, and every check passes. Standalone also passes every check. An integrated page with no `user` and no `authRequired: false` passes none.

The return shape is `{ integrated, plugin, user, theme, features, isAdmin, can }`. The platform sends no theme, so `theme` holds the SDK theme setting. `features` is `Record<string, boolean>`. There is no `login()` and no selected experiment. In plugin pages, use `can()` and `isAdmin` for access checks. Use the [state selection guide](/sdk/frontend/platform-integration#choose-the-right-source-of-state) to choose between platform context and shared picker state.

`integrated` is a UI mode indicator, not proof that a request is authorized. The server enforces identity and access.

### `useExperimentSelector`

Inline picker — fetches the user's accessible experiments and surfaces a reactive selected experiment.

```ts
import { useExperimentSelector } from '@morscherlab/mint-sdk/data'

const {
  experiments,        // Ref<ExperimentSummary[]>
  total,              // Ref<number>
  selectedExperiment, // Ref<ExperimentSummary | null>
  filters,            // reactive { search, status, project, experimentType, mine, ... }
  isLoading,
  error,
  page,
  hasMore,
  sortKey,
  experimentTypes,    // available faceted values
  projects,
  statusCounts,       // Record<string, number>, with { withStatusCounts: true }
  fetch,              // re-fetch with current filters
  loadMore,
  reset,
  select,             // (experiment: ExperimentSummary) => void
  clear,
  fetchFilterOptions,
  fetchStatusCounts,
} = useExperimentSelector({ /* options */ })

// Search is watched and debounced by the composable.
filters.search = 'TCA'
```

The selected experiment is `selectedExperiment` (not `selected`); the search input is `filters.search`; explicit re-fetch is `fetch()` (not `refresh`). With `{ withStatusCounts: true }`, `statusCounts` stays in step with the other filters through `GET /experiments/stats`, and `fetchStatusCounts()` reads it on demand. `filters.mine` sends `mine=true`. Its `select()` only changes this composable's local selection. For the standard modal, use `ExperimentSelectorModal` directly; it owns its list and commits records to `useExperimentStore()`.

For plugins mounted on an experiment-specific view, use `useExperiment()`. It gives the experiment record, and `id` when you only need the current id.

### `useExperimentData`

Reactive view of one experiment's exported design/analysis display payload.

```ts
import { useExperimentData } from '@morscherlab/mint-sdk/data'

const { data, designData, sampleNames, treeData, tableData, summaryData, isLoading, error, fetch, refresh } = useExperimentData({
  immediate: false,
})

await fetch(1)

// data = Ref<Record<string, unknown> | null>
// designData, sampleNames, treeData, tableData and summaryData are computed display shapes
```

The SDK has no composable that writes design data. To write it, call a plugin endpoint through the generated `useClient()`; the backend saves with `context.design.save()`. See [Platform integration](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment).

### `useFormBuilder`

The form runtime under `FormBuilder`. It takes a raw `FormSchema` and gives the form state. `FormBuilder` takes a control model as `:spec`, so you seldom call `useFormBuilder` directly. Use it for programmatic control, for example custom validation steps.

```ts
import { useFormBuilder, evaluateCondition } from '@morscherlab/mint-sdk/runtime'
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

### `defineControlModel` and `useControlWorkspace`

A control model lets one definition generate forms, settings modals, sidebars, top-bar settings, and initial values. `defineControlModel()` is at the package root. `defineControls()`, `useControlSchema()`, and `useControlWorkspace()` are in `@morscherlab/mint-sdk/runtime`.

```ts
import { ref } from 'vue'
import { defineControlModel, definePluginWorkspaceView } from '@morscherlab/mint-sdk'

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

const spec = definePluginWorkspaceView({
  title: 'Analysis',
  sidebar: { title: 'Run controls', controls: workspaceModel },
})
const values = ref({})
```

```vue
<PluginWorkspaceView v-model:values="values" :spec="spec">
  <FormBuilder v-model="values" :spec="workspaceModel" @submit="run" />
</PluginWorkspaceView>
```

`PluginWorkspaceView` takes the model in `spec.sidebar.controls` and generates the sidebar sections, their forms, and the view pills. It does not render a main form; put `FormBuilder` in the default slot and set `actions` in the model for the submit and cancel bar. For the settings tab, set `topBar.settings` in the spec. For a docked 320 px sidebar, set `floating: false` and `sidebar.width: '320px'`.

For lower-level layouts, `useControlSchema()` gives you `formSchema`, `settingsSchema`, `topBarSettingsConfig`, `sidebarPanels`, `sectionSchemas`, and `initialValues`. `useControlWorkspace()` wraps those into shared reactive values and ready-to-bind bindings. The bindings fit the spec props: `form` is `{ spec }`, `settings` is `{ spec }`, `topBarSettings` is `{ spec: { settings } }`, `sidebar` is `{ spec: { panels, forms }, activeView }` plus `values`, and `topBar` is `{ spec: { pills, settings }, pill, onPillSelect, onSettingsValuesChange }`. `controlsTo(target, controls, ...)` and `controlBindings` (`.props()`, `.list()`, `.byId()`) in `runtime` convert controls to component props.

### `useRealtime` and `usePresence`

The platform streams events over `GET /api/events` when its `realtime` feature is on. The feature is off by default; check `usePlatform().features.realtime` first. Both composables are in `@morscherlab/mint-sdk/runtime`.

```ts
import { useRealtime, usePresence } from '@morscherlab/mint-sdk/runtime'

useRealtime(() => [`experiment:${id.value}`], () => refetch())

const { viewers, count } = usePresence(
  () => `experiment:${id.value}`,
  () => (dirty.value ? 'editing' : 'viewing'),
)
```

- `useRealtime(topics, handler)` subscribes to topics (`experiment:{id}`, `project:{id}`, `experiments`, `user:{id}`, or the plugin topics `plugin:{name}` and `plugin:{name}:experiment:{id}`). All callers in a tab share one `EventSource`. It opens on the union of their topics (at most 50) and reopens when the union changes. It returns `{ connected, stop }`.
- A platform event carries no entity data. Refetch the entity over REST. `event.type` is the audit action of a committed write, such as `experiment.update`, or `resync`. A plugin event has the type `"<plugin>.<event>"` and a JSON `payload` (16 KiB at most).
- `resync` goes to every caller each time the stream opens (the first open, each reconnect with a backoff from 1 s to 30 s, and each reopen for a changed topic union) and when the platform finds that the tab fell behind. On `resync`, refetch.
- `useRealtime` handlers do not receive `presence.changed`. Only `usePresence` receives it, so a refetch handler does not run when a viewer joins or leaves.
- `usePresence(topic, activity?)` returns `{ viewers, count, connected, stop }`. `viewers` holds at most 20 `{ user_id, activity }` entries, `editing` first, and includes the current user. `count` includes the viewers beyond the 20. `activity` is `viewing`, `viewing_design`, `viewing_results`, or `editing` (`project:` topics take only `viewing` and `editing`). The label goes to `POST /api/presence/activity` when the call starts on an open stream, at each open, and at each change; `stop` sets it back to `viewing`. `editing` is a hint, not a lock. While the stream is closed, `viewers` is empty.
- `PresenceAvatars` (`runtime`) shows the other people on a topic. Give it `people` (`{ id, name, activity }`), `selfId`, and `count`. It leaves out the current user, shows `max` avatars (default 4), and then `+N`. With nobody else on the topic, it renders nothing.

### `useVersionedSave`

`useVersionedSave()` (`@morscherlab/mint-sdk/data`) gives a form on a versioned entity (experiments and projects) optimistic concurrency.

```ts
const versioned = useVersionedSave({
  version: () => experiment.value?.version,
  save: headers => api.patch(`/experiments/${id}`, payload(), { headers }),
  reload: () => refetchAndResetForm(),
  topic: () => (realtime && open.value ? `experiment:${id}` : null),
  dirty: () => changeCount.value > 0,
})
```

- `save()` sends `If-Match: "v<version>"`. A 412 `<entity>.version_conflict` sets `conflict` and resolves `undefined`. Other errors reject.
- `VersionConflictDialog` shows the conflict. Its Reload calls `reload()` (discard the edits and refetch). Its Overwrite calls `overwrite()` (the same save with the version from the 412).
- With a realtime `topic`, a write by someone else on the entity sets `stale` while the form has unsaved edits (`dirty`). `StaleFormBanner` names the writers and the changed fields. Several writes merge into one banner. On a form with no edits, the write runs `reload` and shows no banner. A `null` topic, for a closed form or a platform with `realtime` off, turns the banner off. A change of topic clears the conflict.
- When the `reload` option rejects, the conflict and the banner stay.

### Jobs tray

`JobsStatusTray` is a compact, non-modal panel under the top bar. The parent owns the job center.

```ts
import { useJobCenter } from '@morscherlab/mint-sdk/runtime'

const center = useJobCenter({ source: jobs })
```

```vue
<AppTopBar
  :job="center.topBarJob.value"
  :jobs-done="center.completedCount.value"
  :jobs-open="center.isOpen.value"
  :jobs-panel-id="center.panelId"
  @job-click="center.handleTopBarClick(openResult)"
/>
<JobsStatusTray :center="center" @select="openResult" />
```

The simpler path is `PluginWorkspaceView` with `spec.jobs`: the workspace creates the job center, passes the job to its top bar, renders the tray, and emits `job-select`.

- The source is a `PluginJobCenterSource`: `jobs` plus the optional `refresh`, `cancel`, `delete`, and `clear`. The generated `useJobs()` runtime is one. `combinePluginJobSources()` joins several; job ids must be unique across them.
- `topBarJob` is the viewer's own job, picked in this order: an `awaiting_input` job, the first active job, for 6 s a job that just completed, then `'<n> failed'` for failures the viewer has not seen. Own jobs are those whose `owner_user_id` (else `user_id`) is the platform user. Standalone or with auth off, every job is own. The open tray marks failures seen in `localStorage` under `mint.jobs.<plugin id>.seen-failed`.
- The `topBarJob(job)` option maps the chosen job. The `rowJob(job)` option overrides how a tray row looks (`status`, `percent`, `message`). `rowView(job)` returns the result.
- The `confirm` prop of the tray (`true`, or for example `{ delete: true, clear: true }`) asks before Cancel, Delete, and Clear. The default is off. The tray has the slots `job-title`, `job-detail`, and `job-actions` (extra row actions before Cancel and Delete).
- `AppTopBar`: `job` (`TopBarJob`: `status`, `label`, `percent`) takes the place of the experiment name and Save while it shows. `null` shows an idle Jobs button; without the prop, the bar has no jobs control. `jobsDone` shows a count after "Jobs". Both emit `job-click`.
- The job runtime methods are `refresh`, `get`, `wait`, `result`, `cancel`, `delete`, and `clear`. The first `submit()` or `refresh()` opens the job session. Job runtimes of one plugin on one page share one job session.

### Onboarding

`@morscherlab/mint-sdk/shell` has an onboarding framework for the platform and for plugins: tours, a "Getting started" checklist, and what's-new hints. Declare them with `defineOnboarding()`. Call `provideOnboarding()` once in the root component.

```ts
import { defineOnboarding, provideOnboarding, useOnboarding } from '@morscherlab/mint-sdk/shell'

const onboarding = defineOnboarding({
  tours: [{
    id: 'basics',
    title: 'Basics',
    route: '/',
    steps: [
      { id: 'pills', anchor: 'topbar-pills', title: 'Modes', body: 'Switch between the modes of this page.' },
      { id: 'run', anchor: 'my-run-button', title: 'Run', body: 'Start the analysis here.', advanceOn: 'click' },
    ],
  }],
  checklist: [{
    id: 'first-run',
    title: 'Run an analysis',
    available: () => can('use'),
    done: () => runs.value > 0,
    action: { label: 'Open', run: () => router.push('/run') },
  }],
  whatsNew: [{ id: 'jobs', anchor: 'topbar-run', title: 'Jobs', body: 'Your jobs show here.' }],
})

provideOnboarding(onboarding, { appId: 'my-plugin', route: () => router.currentRoute.value.path })
// Later, from any component:
useOnboarding()?.complete('first-run')
```

- `provideOnboarding(definition, { appId, userId?, route?, autoStart? })` returns the state and provides it to `AppTopBar`. `AppTopBar` then shows a Help button, a "Getting started n/m" chip while checklist tasks are open, and the tour layer. `userId` defaults to the platform user (`local` standalone or with auth off); a `null` user turns onboarding off. `autoStart` defaults to `true`.
- A step points at the element with `data-onboarding="<anchor>"`. `AppTopBar` gives the anchors `topbar-pills`, `topbar-page-selector`, `topbar-run`, `topbar-help`, `topbar-checklist`, and `topbar-settings`. Add `data-onboarding` to your own elements for other steps.
- A tour step dims the page with a hole over its element. Back, Next, and Done move the tour. The close button and Escape end it, and its steps count as seen. `advanceOn: 'click'` lets the element take the click and moves on. A step with `available()` returning false is left out. `placement` sets the side of the card.
- A tour starts on its own once, after open modals close. A tour with `route` starts only while the app's `route` option is that value; the coordinator does not change the route. A tour without `route` suits elements on every page, such as the top bar.
- If the element of a step does not appear within 2 s (`ANCHOR_WAIT_MS`), the step is skipped and stays unseen. Only the first step of a run and the step after a click step wait.
- The tour card counts steps as "1 / 3". It holds only the steps that the page can show. The card takes focus when a step opens. Enter goes to the next step.
- The state is in `localStorage` under `mint.onboarding.<appId>.<userId>` and is kept by step id: a new step id shows also to returning users. On the first run, every what's-new item counts as seen.
- A checklist task is done when `done()` returns true or the app calls `useOnboarding()?.complete(id)`. It stays done. `available()` leaves a task out, for example without a permission. `action` adds a link at the end of the task row. The coordinator checks `done()` at start, on a route change, and when the Help menu opens; `refresh()` checks again.
- The "Getting started" chip has a close button with a 24 px target. It hides the checklist from the top bar and moves focus to Help. The Help menu can show the checklist again. `OnboardingState` also has `startTour(id)`, `showNews(id)`, `next()`, `back()`, `dismiss()`, and `setChecklistHidden(hidden)`.
- A what's-new item puts a dot on its element until the user opens it.

## Other notable composables (one-line each)

| Composable | Use it when |
|------------|-------------|
| `dose` (`lab`) | Building dose-response calculators or serial dilution helpers (`dose.calculateDilution()`, `dose.calculateSerialDilution()`) |
| `useConcentrationUnits` (`lab`) | Parsing user input like "5 mM" and converting between unit families |
| `formula` (`lab`) | Show elemental composition of a formula string (`formula.parseFormula()`, `formula.calculateMW()`) |
| `useTheme` | Custom theme switcher (the standard `<ThemeToggle>` already uses this) |
| `time` (`lab`) | Plate-reader scheduling, anything with time slots (`time.generateTimeSlots()`, `time.formatTime()`) |
| `useRequest` | Loading/error/last-saved state around requests |
| `useFileImport` (`data`) | Read and validate delimited text imports; `readTableFileAsCsv(file)` reads a `.csv`, `.tsv`, or `.xlsx` upload as comma-delimited text |
| `useListSelection`, `useSelectionLimit` (`shell`) | Table, list, and plate selection state |
| `useTextSearch` (`data`), `useSortedItems` (`shell`) | Client-side filtering and sorting |
| `useExpansionSet` (`shell`) | Expand/collapse state for trees and grouped lists |
| `useSequenceUtils` (`lab`) | `findSequenceProblems(seq, 'dna' \| 'rna' \| 'protein')` returns `{ ambiguousBases, invalidCharacters }`: the characters `validateSequence` would strip, named instead of dropped |
| `useFileBrowser` (`data`) | Server mount browsing, refresh, search, sort, path selection, and error state |
| `experimentStatus`, `pluginSecret` (`data`) | Namespaces for experiment status labels and tones, and for plugin secret references |

### `useRackEditor`

`useRackEditor(initialRacks?, options?)` (`@morscherlab/mint-sdk/lab`) holds a `Rack[]` for a controlled [`PlateEditor`](/sdk/components/plate-editor). The initial racks are copied, so the caller's wells are not mutated. The active plate binds as `active-rack` (`v-model:active-rack`, event `update:activeRack`).

```vue
<script setup lang="ts">
import { PlateEditor, definePlateEditor, useRackEditor } from '@morscherlab/mint-sdk/lab'

const { racks, activeRackId, plateEditorListeners, canUndo, canRedo } = useRackEditor()
const editorSpec = definePlateEditor({ history: true })
</script>

<template>
  <PlateEditor
    :model-value="racks"
    :spec="editorSpec"
    :active-rack="activeRackId"
    :can-undo="canUndo"
    :can-redo="canRedo"
    v-on="plateEditorListeners"
  />
</template>
```

- `plateEditorListeners` (type `PlateEditorListeners`) applies every `PlateEditor` intent except `well-click`, `import`, `import-text`, `export`, `group-add`, and `selection-change`.
- `undo()` / `redo()` step through at most 50 changes made through the listeners and restore the full previous state; `canUndo` / `canRedo` drive the editor's buttons. `clearHistory()` forgets every step; `reset()` calls it.
- `moveWell(rackId, sourceWellId, targetWellId)` swaps two wells (a move when the target is empty).
- `assignWells(rackId, wellIds, groupId)` sets each well's `group` and keeps its `sampleType`; an empty well becomes a `sample`, and `undefined` empties the wells.

### Plotly results

Use `PlotlyChart` for native Plotly traces instead of owning the library lifecycle in each plugin:

```vue
<script setup lang="ts">
import { PlotlyChart } from '@morscherlab/mint-sdk/lab'
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

The component lazily imports Plotly, updates with `Plotly.react`, tracks theme and container size, and purges on unmount. It applies `mintPlotlyTemplate()` by default (your `layout` keys still win) and re-reads it on every theme change. Set `empty` explicitly when there is no result, and keep axis labels/units in the supplied layout.

`active` pauses render/resize work for hidden tabs; `height` accepts pixels or a CSS height. Pass `plotly` only when the plugin owns a compatible custom build. Set `clickEvents` to receive `plotly-click` with a `PlotMouseEvent`. Use `variant="frame"` in a bounded workbench panel and the `header`, `toolbar`, `subhead`, `legend`, and `footer` slots for surrounding UI. See [PlotlyChart](/sdk/components/plotly-chart) for the full example; use [ChartContainer](/sdk/components/chart-container) for another rendering library.

For a chart you render with Plotly directly, `mintPlotlyTemplate(element?)` (from `@morscherlab/mint-sdk/lab`) returns a Plotly `Template` resolved from the MINT tokens: the `--mint-sample-1…8` colorway, `--font-sans` body text, `--font-mono` ticks, `--border-light` grid, and a card-style hover label. Pass it as `layout: { template: mintPlotlyTemplate() }`; call it again after a theme change. Also pass `showSendToCloud: false` in the config; see [Plotly 4 builds and types](/sdk/components/plotly-chart#plotly-4-builds-and-types).

### Resizable workbench panes

`LayoutResizeHandle` updates its `v-model` on keyboard actions and emits `resize-start` for pointer actions. `useManualLayoutResize({ enabled, resolveTarget })` supplies `startResize(kind, event)`, `stopResize()`, `isResizing`, `isResizingKind(kind)`, and `activeResize`.

Each resolved target provides a container element, a starting value, and an `onResize` callback. Use `resizedLeadingPanelWidth()` for a left panel, `resizedTrailingPanelWidth()` for a right panel, or `resizedVerticalSplitPercent()` for a top/bottom split. The helper owns pointer listeners and cleanup; your component owns the value and applies it to its layout. See [the complete resize example](/sdk/components/layout-resize-handle).

### File picker adapters

`usePlatformFilePickerAdapter()` connects `FilePicker` to authenticated platform mounts. `createFilePickerAdapter()` instead accepts a transport with `listMounts(request?)` and `browse(location, request?)`, plus optional `tree` and `search`, allowing a generated plugin client to reuse the SDK's navigation and search. Both accept `rootLocation` to confine browsing to a mount-relative directory.

Preserve abort signals and explicit refresh flags in custom transports. Decode opaque server selections with `decodePlatformPickerPath()` before calling mount-scoped backend APIs. See [the complete picker example and cache behavior](/sdk/frontend/platform-integration#adapter-driven-filepicker).

## Notes

- All composables use Vue 3 Composition API. Call them inside `<script setup>` or `setup()` only.
- Most composables return `Ref` or `ComputedRef` — destructure but keep the references reactive.
- The composables that hit the network (`useApi`, generated plugin clients, `useExperimentData`, `useExperimentSelector`) send the session token. Do not write your own `fetch` calls.
- Prefer public package imports (the package root or the documented subpaths). `mint doctor` flags a root import of a name that moved to a subpath, the removed 1.3 names, direct private SDK subpaths, and raw plugin API `fetch('/api/...')` calls.

## Related

- [Component Library](/sdk/components/) — components that pair with these composables
- [Design tokens](/sdk/frontend/design-tokens) — `useTheme` integrates with the token system
- [Platform integration](/sdk/frontend/platform-integration) — platform context, experiment selection, and server files
- [API Reference → Frontend SDK](/sdk/api/frontend) — every composable's exported types
