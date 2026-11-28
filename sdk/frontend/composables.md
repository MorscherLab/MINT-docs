# Composables

Composables give a plugin frontend typed state for generated clients, the current experiment, settings, forms, jobs, realtime and onboarding. Call them inside `<script setup>` or `setup()`. Most return a `Ref` or `ComputedRef`: keep the references reactive when you destructure them.

[Frontend SDK reference → Composables](/sdk/api/frontend#composables) lists every composable with its entry point. This page describes the composables that need more than one line. For a full selection-and-save page, see [Platform integration](/sdk/frontend/platform-integration).

## Deep dives

### `useApi`

`useApi()` is deprecated, and MINT 2.0 removes it. `mint doctor` shows each import as a "Deprecated SDK APIs" warning, and `mint doctor --strict` counts it. Use these instead:

| Call | Use |
|------|-----|
| A route of your plugin | The generated `useClient()` (built on `createClient`) |
| The experiment number | [`useExperimentNumber`](#useexperimentnumber) |
| Other platform data | The SDK composable for that data, for example `useExperiment`, `useArtifacts` or `useExperimentData`. Platform routes without a composable have no public client: open an issue |
| An external, non-MINT HTTP API | `fetch` |

The SDK sends its requests with `fetch`. It uses `XMLHttpRequest` only for upload or download progress. It does not depend on `axios`. For code that still calls `useApi()`, query strings, bodies, response data and `MintApiError` errors do not change. These points differ from axios:

1. `axios` is not installed with the SDK. A plugin that imports `axios` declares it in its own `package.json`. A config typed as `AxiosRequestConfig` does not type-check as a `useApi()` config.
2. `useApi().client` is not an axios instance. It has `request`, `get`, `delete`, `head`, `options`, `post`, `put`, `patch`, `defaults` and `interceptors` (`use`, `eject`, `clear`). It has no `create`, `getUri`, `postForm` or call signature. `defaults.headers` has no `common` or per-method entries. In an interceptor, `config.headers` is a plain object.
3. A `FormData` body is always sent as `multipart/form-data`.
4. `cancelToken`, `xsrfCookieName`, `xsrfHeaderName`, `withXSRFToken`, `auth`, `transformRequest` and `transformResponse` have no effect. Use `signal` to cancel. `responseType` `'document'` and `'stream'` give text.

### Generated plugin clients

`mint sdk generate` writes `frontend/src/generated/mint-plugin.ts`. Import plugin API calls from this file. It wraps the lower-level SDK helpers with the endpoint names and types of your plugin. Do not build plugin URLs by hand.

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

- Omit the parameter groups that the endpoint does not use.
- Use the exact endpoint and field names from `mint docs contract .`. A frontend parameter name can differ from the Python snake_case name.
- Mixed endpoints also accept flat parameters for compatibility.
- Do not wrap a body-only call in `{ body: ... }`.
- `upload(name, payload)` and `download(name, payload, { filename })` take the endpoint name and its payload. `download` resolves with a `Blob`. With `filename`, the browser also saves the file; `save: false` skips the save.
- `useStream(name, payload, options)` opens a stream with parameters. A stream without parameters also accepts `(name, options)`.
- `endpointUrl(name, payload)` gives the URL without a request, for diagnostics or a link preview. `contract` holds the endpoint definitions.
- These helpers work only for routes that your plugin declares.

### Typed HTTP errors {#typed-http-errors-in-1-2}

Generated clients turn every HTTP failure into a `MintApiError`. There is no `error.response`. A network failure can still be an ordinary error, so keep a fallback:

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

- Show `errorMessage` in an `AlertBox`.
- Use `code` or `status` to choose what the program does. Use `requestId` to find the request in the server logs. For all members, see [HTTP error types](/sdk/api/frontend#http-error-types).
- An expired session raises `AuthenticationRequiredError`, a `MintApiError` with status 401.
- Do not retry a request that changes state after a timeout without a check.

When a message is sufficient, use `useRequest(defaultMessage)`. It gives `isLoading`, `error` and the success timestamps `lastLoadedAt`, `lastSavedAt` and `lastRunAt`.

- `run(operation, { kind })` passes an `AbortSignal` to the operation. It records a failure and throws it again; catch it at the UI boundary.
- A newer `run()` or `cancel()` aborts the older run. This guard protects the refs of `useRequest`, not the values that your callback writes.

### `useExperiment`

`useExperiment()` reads the experiment of the plugin page. It is read-only: the platform selects the experiment.

- It returns `id` (`number | null`), `current` (the platform record), `status` (`idle`, `loading`, `ready` or `error`), `error` and `refresh()`.
- `refresh()` keeps the loaded record while it reads the record again.
- In a standalone page, no experiment is selected and `id` stays `null`.

```ts
import { watch } from 'vue'
import { useExperiment } from '@morscherlab/mint-sdk'

const experiment = useExperiment()
watch(experiment.id, (id) => { if (id !== null) void load(id) }, { immediate: true })
```

The platform keeps the store and the `experiment_id` URL parameter in step. Do not write your own route sync; see [Experiment in the URL](/sdk/frontend/platform-integration#experiment-in-the-url).

### Plugin settings: `useSettings`

Use the generated `useSettings()` for the backend settings that `Metadata.settings` declares. It binds the settings schema and the plugin identity. `useSettingsEndpoint` in `runtime` is the runtime under it. In a platform page, it uses the platform config routes. In a standalone page, it uses the managed `/settings` route of the plugin.

```ts
import { useSettings } from '../generated/mint-plugin'

const settings = useSettings()

settings.values.value.threshold = 0.05
const saved = await settings.save()
// Show success only when saved is true; render settings.error otherwise.

// Ready for spec.topBar.settings of PluginWorkspaceView, or the AppTopBar spec:
const settingsConfig = settings.settingsConfig
```

- It returns `settings`, `values`, `config`, `settingsConfig`, `isLoading`, `isSaving`, `error`, `lastLoadedAt`, `lastSavedAt`, `isDirty`, `load()`, `save()`, `reset()` and `setValues()`.
- Load the saved values before the user edits them.
- The helper tracks revisions. It sends the changed fields through platform PATCH routes, and uses `If-Match` for PUT saves to the managed plugin route.
- Show a conflict to the user. Do not discard unsaved edits with an automatic reload.

### `useAuthStore`

`useAuthStore()` is the read-only session of the SDK. The platform signs users in, refreshes the token, handles the second factor and writes the session through `@morscherlab/mint-sdk/host`. A plugin never writes it, and the SDK never writes or removes the stored token. SDK clients read the token from this store.

```ts
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@morscherlab/mint-sdk'

const authStore = useAuthStore()
const { userInfo, isAuthenticated, authRequired } = storeToRefs(authStore)
```

- It exposes `token`, `tokenExpires`, `userInfo`, `authRequired`, `isInitialized` and `isAuthenticated`, and the methods `initialize()` and `clearToken()`.
- It has no permission helpers. To show or hide UI, use `usePlatform().can(access)` or `usePlatform().isAdmin`. For a platform permission, pass `userInfo` to the helpers of `@morscherlab/mint-sdk/permissions`.
- A hidden button is not authorization. The backend checks every request.

### `useToast`

`useToast()` shows toast notifications in the toast stack.

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

The default durations are 3500 ms for `success` and `info`, 4000 ms for `warning` and 5000 ms for `error`.

`push()` takes structured options and returns the toast id:

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

- A toast keeps at most two `actions`. Each has `label`, `onClick` and an optional `primary`.
- `count` shows a grouped count.
- `progress: 'indeterminate'` keeps the toast open. `progress: 'none'` hides the bar and keeps the normal timeout.
- For the position of the stack, see [Toast positioning](/sdk/components/app-toast-container#toast-positioning).

### `usePlatform`

In the platform shell, the platform injects `window.__MINT_PLATFORM__` with the plugin metadata, the user, the feature flags and the API origin. `usePlatform()` reads this context (or the `mint-plugin` URL parameter) each time you call it. A router guard or a setup-time check thus sees the signed-in user before a component mounts.

```ts
import { computed } from 'vue'
import { usePlatform } from '@morscherlab/mint-sdk'

const { integrated, plugin, user, theme, features, isAdmin, can } = usePlatform()

const canConfigure = computed(() => can('configure'))
```

`usePlatform()` is read-only context, not authorization. `integrated` shows the UI mode. It does not prove that a request is authorized, or that a standalone development backend has a `PlatformContext`. The server checks identity and access on each request.

- It returns `{ integrated, plugin, user, theme, features, isAdmin, can }`. There is no `login()` and no selected experiment.
- The platform sends no theme, so `theme` holds the SDK theme setting. `features` is `Record<string, boolean>`.
- `can(access)` takes the plugin access levels of the Python `access` option (the `Access` type). For the rules of each level, see [Route permissions → Access levels](/sdk/recipes/route-permissions#access-levels). The visibility check accepts the plugin name or its route prefix, as the platform does.
- With authentication disabled, the platform injects `authRequired: false` and no `user`. Every check then passes.
- In a standalone page, every check passes.
- In an integrated page with no `user` and without `authRequired: false`, no check passes.

To choose between platform context and the shared picker state, see [Choose the right source of state](/sdk/frontend/platform-integration#choose-the-right-source-of-state).

### `useExperimentSelector`

`useExperimentSelector()` fetches the experiments that the user can see and keeps a selected experiment. Use it for a custom picker.

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

- The selection is `selectedExperiment`, not `selected`. The search text is `filters.search`. To fetch again, call `fetch()`; there is no `refresh`.
- With `{ withStatusCounts: true }`, `statusCounts` follows the other filters through `GET /experiments/stats`. `fetchStatusCounts()` reads the counts on demand.
- `filters.mine` sends `mine=true`.
- `select()` changes only the local selection of this composable. For the standard modal, use `ExperimentSelectorModal`: it owns its list and writes the record to `useExperimentStore()`.
- On a page for one experiment, use `useExperiment()` instead.

### `useExperimentNumber`

`useExperimentNumber(experimentId, { experimentType? })` from `@morscherlab/mint-sdk/data` reads, checks and assigns the experiment number (the code, for example `LCM-EXP-011`).

```ts
import { useExperiment } from '@morscherlab/mint-sdk'
import { useExperimentNumber } from '@morscherlab/mint-sdk/data'

const experiment = useExperiment()
const number = useExperimentNumber(experiment.id)

await number.refresh()                 // number.next.value?.preview, for example "LCM-EXP-012"
const check = await number.check(15)   // { available, code, experiment } or null
const code = await number.assign()     // the next free number; assign({ seq: 15 }) picks one
```

- `code` is the assigned code, or `null`. `next` holds the preview of the next free number. For when an experiment gets a number, see [Experiment numbers](/guide/experiments#experiment-numbers).
- When the experiment has a code, `assign()` returns it.
- A failed call resolves to `null` and sets `error` (a `MintApiError`). A call that succeeds clears it.
- Only the newest preview and the newest check are kept. An answer that arrives after the experiment id or type changed is dropped.
- `experimentType` must be the stored type of the experiment. Without it, the composable reads the type from the SDK experiment store. While the type is unknown, `check()` sets `error.code` to `experiment.type_unknown`.
- Outside the platform, each call sets `error.code` to `platform.unavailable` and sends no request.

### `useLiveDesign`

`useLiveDesign(experimentId, pluginId, options?)` from `@morscherlab/mint-sdk/data` edits the design data of a live design (`Design(live=True)`) field by field. [LiveDesignForm](/sdk/components/live-design-form) draws a form from its result.

- It saves the edits with `PATCH /api/experiments/{id}/data/{plugin_id}` 1 s after the last edit or on `blur`. At most one PATCH (64 fields) is in flight.
- It returns `status`, `error`, `retryAt`, `schema`, `fields`, `activity` and the functions `setValue`, `focus`, `blur`, `discard`, `flush` and `retry`.
- `status` is `loading`, `clean`, `dirty`, `saving`, `offline`, `rejected`, `readonly`, `not_live` or `error`.
- Each entry of `fields` has `value`, `state` (`clean`, `dirty`, `saving` or `rejected`), `error`, `lastChange`, `editors`, `lockedBy` and `missingRequired`.
- A remote change replaces a `clean` field. A `dirty`, `saving` or `rejected` field keeps its value. `discard(field)` drops a local edit and shows the newest server value.
- A field that another user edits is locked. `lockedBy` names that user. `setValue` and `focus` do nothing on a locked field.
- On a network error or a 502, 503 or 504, `status` is `offline`. The composable tries again 5 times after 1, 2, 4, 8 and 16 s; `retryAt` gives the next time.
- On `pagehide`, it sends the unsaved edits at once with `fetch(..., { keepalive: true })`.

| Option | Use |
|--------|-----|
| `readonly` | True when the user may not edit the design. No PATCH is sent |
| `userId` | The signed-in user. Default: the SDK session user. Without a user id, no field is locked |
| `realtime` | False while the platform `realtime` feature flag is off: no remote changes, presence or locks |
| `viewers` | The viewers of `experiment:{id}`, when the host sends the presence itself |
| `hasDesignData` | False when the experiment has no design data: the first read sends no request |

### `useExperimentData`

`useExperimentData()` gives the exported design and analysis data of one experiment as display shapes.

```ts
import { useExperimentData } from '@morscherlab/mint-sdk/data'

const { data, designData, sampleNames, treeData, tableData, summaryData, isLoading, error, fetch, refresh } = useExperimentData({
  immediate: false,
})

await fetch(1)

// data = Ref<Record<string, unknown> | null>
// designData, sampleNames, treeData, tableData and summaryData are computed display shapes
```

`useExperimentData()` does not write. To write design data, see [Platform integration](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment).

### `useFormBuilder`

`useFormBuilder()` is the form runtime under `FormBuilder`. It takes a raw `FormSchema` and gives the form state. Use it to control a form from code, for example for a custom validation step.

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

See [FormBuilder](/sdk/frontend/form-builder).

### `defineControlModel` and `useControlWorkspace`

One control model generates forms, settings modals, sidebars, top-bar settings and initial values. `defineControlModel()` is at the package root. `defineControls()`, `useControlSchema()`, and `useControlWorkspace()` are in `@morscherlab/mint-sdk/runtime`.

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

- `PluginWorkspaceView` takes the model in `spec.sidebar.controls`. It generates the sidebar sections, their forms and the view pills.
- The workspace does not render a main form. Put `FormBuilder` in the default slot. Set `actions` in the model for the submit and cancel bar.
- For the settings tab, set `topBar.settings` in the spec.
- For a docked 320 px sidebar, set `floating: false` and `sidebar.width: '320px'`.

For lower-level layouts:

- `useControlSchema()` gives `formSchema`, `settingsSchema`, `topBarSettingsConfig`, `sidebarPanels`, `sectionSchemas` and `initialValues`.
- `useControlWorkspace()` wraps these in shared reactive values and bindings that fit the spec props: `form` is `{ spec }`, `settings` is `{ spec }`, `topBarSettings` is `{ spec: { settings } }`, `sidebar` is `{ spec: { panels, forms }, activeView }` plus `values`, and `topBar` is `{ spec: { pills, settings }, pill, onPillSelect, onSettingsValuesChange }`.
- `controlsTo(target, controls, ...)` and `controlBindings` (`.props()`, `.list()`, `.byId()`) in `runtime` convert controls to component props.

### `useRealtime` and `usePresence`

The platform sends events over `GET /api/events` when its `realtime` feature is on. The feature is off by default; check `usePlatform().features.realtime` first. Both composables are in `@morscherlab/mint-sdk/runtime`.

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
- `usePresence(topic, activity?)` returns `{ viewers, count, connected, stop }`. `viewers` holds at most 20 `{ user_id, activity }` entries, `editing` first, and includes the current user. `count` includes the viewers beyond the 20. `activity` is `viewing`, `viewing_design`, `viewing_results`, `editing`, or `editing:<field>` for one top-level design field (`project:` topics take only `viewing` and `editing`). A user with several browser tabs shows the strongest label: `editing:<field>`, then `editing`, then another label, then `viewing`. A viewer whose role cannot see the design plugin gets `editing:<field>` as `editing`. [`useLiveDesign`](#uselivedesign) locks a field on `editing:<field>`; see [Live design forms](/sdk/recipes/live-design). The label goes to `POST /api/presence/activity` when the call starts on an open stream, at each open, and at each change; `stop` sets it back to `viewing`. `editing` is a hint, not a lock. While the stream is closed, `viewers` is empty.
- `PresenceAvatars` (`runtime`) shows the other people on a topic. Give it `people` (`{ id, name, activity }`), `selfId`, and `count`. It leaves out the current user, shows `max` avatars (default 4), and then `+N`. With nobody else on the topic, it renders nothing.

### `useVersionedSave`

`useVersionedSave()` (`@morscherlab/mint-sdk/data`) adds a version check to the save of a form on a versioned entity (an experiment or a project).

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

`JobsStatusTray` is a small non-modal panel under the top bar. The parent owns the job center.

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

For the usual case, set `spec.jobs` on `PluginWorkspaceView`. The workspace then creates the job center, gives the job to its top bar, renders the tray and emits `job-select`.

- The source is a `PluginJobCenterSource`: `jobs` plus the optional `refresh`, `cancel`, `delete`, and `clear`. The generated `useJobs()` runtime is one. `combinePluginJobSources()` joins several; job ids must be unique across them.
- `topBarJob` is the viewer's own job, picked in this order: an `awaiting_input` job, the first active job, for 6 s a job that just completed, then `'<n> failed'` for failures the viewer has not seen. Own jobs are those whose `owner_user_id` (else `user_id`) is the platform user. Standalone or with auth off, every job is own. The open tray marks failures seen in `localStorage` under `mint.jobs.<plugin id>.seen-failed`.
- The `topBarJob(job)` option maps the chosen job. The `rowJob(job)` option overrides how a tray row looks (`status`, `percent`, `message`). `rowView(job)` returns the result.
- The `confirm` prop of the tray (`true`, or for example `{ delete: true, clear: true }`) asks before Cancel, Delete, and Clear. The default is off. The tray has the slots `job-title`, `job-detail`, and `job-actions` (extra row actions before Cancel and Delete).
- `AppTopBar`: `job` (`TopBarJob`: `status`, `label`, `percent`) takes the place of the experiment name and Save while it shows. `null` shows an idle Jobs button; without the prop, the bar has no jobs control. `jobsDone` shows a count after "Jobs". Both emit `job-click`.
- The job runtime methods are `refresh`, `get`, `wait`, `result`, `cancel`, `delete`, and `clear`. The first `submit()` or `refresh()` opens the job session. Job runtimes of one plugin on one page share one job session.

### Onboarding

`@morscherlab/mint-sdk/shell` gives tours, a "Getting started" checklist and what's-new hints to the platform and to plugins. Declare them with `defineOnboarding()`. Call `provideOnboarding()` one time in the root component.

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

### Lab and data helpers

The reference table lists these helpers. Some functions in them:

- `dose` (`lab`): `dose.calculateDilution()` and `dose.calculateSerialDilution()` for dilution and dose-response calculators.
- `formula` (`lab`): `formula.parseFormula()` and `formula.calculateMW()` for the elemental composition of a formula string.
- `time` (`lab`): `time.generateTimeSlots()` and `time.formatTime()` for time slots, for example in plate-reader schedules.
- `useConcentrationUnits` (`lab`): parses input such as "5 mM" and converts between unit families.
- `useSequenceUtils` (`lab`): `findSequenceProblems(seq, 'dna' | 'rna' | 'protein')` returns `{ ambiguousBases, invalidCharacters }`. These are the characters that `validateSequence` removes.
- `useFileImport` (`data`): reads and checks delimited text imports. `readTableFileAsCsv(file)` reads a `.csv`, `.tsv` or `.xlsx` upload as comma-delimited text.
- `useTheme` (root): see [Theming](/sdk/frontend/theming#light-dark-system). `ThemeToggle` uses it.

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

Use [PlotlyChart](/sdk/components/plotly-chart) for native Plotly traces. The plugin must declare `plotly.js-dist-min`; see [Charts need Plotly](/sdk/frontend/#charts-need-plotly).

For a chart that you render with Plotly directly, call `mintPlotlyTemplate(element?)` from `@morscherlab/mint-sdk/lab`. It returns a Plotly `Template` made from the MINT tokens: the `--mint-sample-1…8` colorway, `--font-sans` body text, `--font-mono` ticks, the `--border-light` grid and a card-style hover label. Pass it as `layout: { template: mintPlotlyTemplate() }`, and call it again after a theme change. Also pass `showSendToCloud: false` in the config; see [Plotly 4 builds and types](/sdk/components/plotly-chart#plotly-4-builds-and-types).

### Resizable workbench panes

`LayoutResizeHandle` changes its `v-model` on keyboard actions and emits `resize-start` for pointer actions. `useManualLayoutResize({ enabled, resolveTarget })` gives `startResize(kind, event)`, `stopResize()`, `isResizing`, `isResizingKind(kind)` and `activeResize`.

- Each resolved target gives a container element, a start value and an `onResize` callback.
- Use `resizedLeadingPanelWidth()` for a left panel, `resizedTrailingPanelWidth()` for a right panel and `resizedVerticalSplitPercent()` for a top and bottom split.
- The helper owns the pointer listeners and their cleanup. Your component owns the value and applies it to its layout.

See [the full resize example](/sdk/components/layout-resize-handle).

### File picker adapters

`usePlatformFilePickerAdapter()` connects `FilePicker` to the platform mounts. `createFilePickerAdapter()` connects it to a plugin-owned file API. See [Adapter-driven FilePicker](/sdk/frontend/platform-integration#adapter-driven-filepicker).

## Network calls

The composables that call the network send the session token: the generated plugin clients, `useExperimentData`, `useExperimentSelector`, `useExperimentNumber` and `useLiveDesign`. Do not write your own `fetch` calls to MINT routes. Import from the package root or the documented subpaths. `mint doctor` reports a root import of a name that moved to a subpath, a removed 1.3 name, a private SDK subpath and a raw plugin API `fetch('/api/...')` call.
