# Frontend platform integration

This guide targets MINT **@MINT_VERSION@**. Start with the [standard frontend tutorial](/sdk/tutorials/adding-a-frontend); it already installs Vue, Pinia, the SDK, styles, and a generated API client.

## Choose the right source of state

| Need | Public API | Important boundary |
|------|------------|--------------------|
| Embedded/standalone mode, platform user, features, access level | `usePlatform()` | Describes the host; it does not own login or the experiment picker |
| Session token and signed-in user (read-only) | `useAuthStore()` | `token`, `userInfo`, `authRequired`, `isAuthenticated`; the platform writes them |
| Experiment selected by the workspace picker | `useExperimentStore()` | Shared selection for the plugin's Pinia instance |
| Read the current experiment | `useExperiment()` | Read-only view of the store: `id`, `current`, `status`, `error`, `refresh()` |
| Top-bar experiment selector/save/detach UX | `PluginWorkspaceView` with `spec.experiment: true`, or `useAppExperiment()` | Reads the shared experiment store |
| Custom experiment search/list UI | `useExperimentSelector()` | Fetches and filters records; its selection is local to that composable |
| Read/write experiment design JSON | A plugin endpoint through the generated `useClient()`; the backend uses `context.design` | Subject to backend permissions |
| Call plugin routes | Generated `useClient()` | Uses the plugin contract and typed HTTP errors |

Do not keep a second `{ id, name }` experiment object in local storage. `ExperimentSelectorModal` commits its selection to `useExperimentStore()` directly; it binds `v-model:open` and emits no `select` event. Display the resolved platform record so a renamed experiment cannot retain a stale local name.

## Read platform context

Call composables inside `<script setup lang="ts">` so Vue can register their lifecycle hooks:

```vue
<script setup lang="ts">
import { usePlatform } from '@morscherlab/mint-sdk'

const { integrated, user, can } = usePlatform()
</script>

<template>
  <p>Mode: {{ integrated ? 'Platform' : 'Standalone' }}</p>
  <p>User: {{ user?.username ?? 'Anonymous' }}</p>
  <button v-if="can('configure')" type="button">Plugin settings</button>
</template>
```

`usePlatform()` reads the injected `window.__MINT_PLATFORM__` context (or the `mint-plugin` URL parameter) each time you call it. It also exposes `plugin`, `theme`, `features`, `isAdmin`, and `can(access)`. The platform sends no theme, so `theme` holds the SDK theme setting.

`integrated` is a UI mode indicator, not proof that a request is authorized or that a standalone development backend has a `PlatformContext`. The server still enforces identity, plugin access, experiment compatibility, and project scope.

With auth disabled on the platform, `window.__MINT_PLATFORM__` has `authRequired: false` and no `user`, also when the browser holds a session cookie. The platform gives the plugin backend no identity in this mode either, so a page that shows the viewer name from `usePlatform().user` shows no name. `can()` treats an integrated page with no `user` as the implicit administrator only when `authRequired` is `false`.

## Authentication

The SDK's API helpers use the auth store's bearer token. The platform owns sign-in, token refresh and passkeys, and writes the session into the SDK. A plugin reads identity and permissions. It never signs a user in itself:

```ts
import { usePlatform } from '@morscherlab/mint-sdk'

const platform = usePlatform()
const canEdit = platform.can('use')
const canConfigure = platform.can('configure')
```

`can(access)` answers the plugin access levels `use`, `configure`, and `admin`, the same levels as the `access` option of Python endpoints, jobs, and pages. For a platform permission, use the helpers of `@morscherlab/mint-sdk/permissions` with `useAuthStore().userInfo`. Hiding a button is only presentation; protect its endpoint on the backend too.

## Select, load, edit, and save an experiment

The SDK has no composable that writes design data. The page selects the experiment with the platform picker and calls a plugin endpoint through the generated client. The backend saves with `context.design.save()`.

This page is for an **experiment-design plugin** with two endpoints: `get_design` and `save_design`. The backend side:

```python
@endpoint.get("/experiments/{experiment_id}/design")
async def get_design(self, experiment_id: int) -> dict[str, Any]:
    design = await self.design.get(experiment_id)
    return design.data if design else {}

@endpoint.put("/experiments/{experiment_id}/design")
async def save_design(self, experiment_id: int, body: DesignBody) -> None:
    await self.design.save(experiment_id, body)
```

`DesignRepository.save()` also takes a keyword-only `expected_version`. The save then fails with `VersionConflictException` (HTTP 412) when the experiment changed since you read it. Without it, the last write wins. The frontend:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  AlertBox,
  BaseButton,
  FormBuilder,
  defineControlModel,
  useExperiment,
  useExperimentStore,
  useRequest,
} from '@morscherlab/mint-sdk'
import { ExperimentSelectorModal } from '@morscherlab/mint-sdk/data'
import { useClient } from './generated/mint-plugin'

const selection = useExperimentStore()
const experiment = useExperiment()
const client = useClient()
const request = useRequest('Could not load the design')
const pickerOpen = ref(false)
const values = ref<Record<string, unknown>>({})
const ready = ref(false)
const spec = defineControlModel({
  controls: {
    notes: { type: 'textarea', label: 'Design notes', default: '' },
  },
  actions: true,
})

watch(experiment.id, async (id, _oldId, onCleanup) => {
  let stale = false
  onCleanup(() => { stale = true })
  ready.value = false
  values.value = {}
  if (id === null) return
  if (experiment.current.value?.has_design_data === false) {
    values.value = { notes: '' }
    ready.value = true
    return
  }
  try {
    const design = await request.run(() => client.getDesign({ pathParams: { experimentId: id } }), { kind: 'load' })
    if (stale) return
    values.value = design
    ready.value = true
  } catch {
    // request.error holds the message; keep the form closed.
  }
}, { immediate: true })

async function save(data: Record<string, unknown>): Promise<void> {
  const id = experiment.id.value
  if (id === null || !ready.value) return
  await request.run(() => client.saveDesign({ pathParams: { experimentId: id }, body: data }), { kind: 'save' })
}
</script>

<template>
  <BaseButton @click="pickerOpen = true">Select experiment</BaseButton>
  <ExperimentSelectorModal
    v-model:open="pickerOpen"
    :current-experiment-id="selection.currentId"
  />
  <p>{{ experiment.current.value?.name ?? 'No experiment selected' }}</p>
  <FormBuilder
    v-if="ready"
    v-model="values"
    :spec="spec"
    :loading="request.isLoading.value"
    @submit="save"
  />
  <AlertBox v-if="request.error.value" tone="error">{{ request.error.value }}</AlertBox>
</template>
```

The example initializes a blank form only when the resolved experiment record says `has_design_data: false`; it does not reinterpret every failed load as an empty design. `request.run()` rethrows after it records the error, so the watcher catches and keeps the form closed. The watcher discards late responses when selection changes. Show success only after `save` resolves.

The platform integration script owns the `experiment_id` URL parameter in a platform page: the experiment store takes it when the page loads, and a selection or a detach writes it back. Plugin router navigations keep the parameter. Do not write your own route sync, such as a `watch` on `experimentIdFromRoute(route.query)` that calls `selectById()`, or a `router.replace` that writes `experimentId`: the platform reads `experiment_id` only. Standalone plugins have no script and no URL sync. To bind to an experiment known only by id in a standalone page, call `await selection.selectById(id)`. It fetches the real record, exposes `isResolving`/`error`, and returns `null` on failure or when a newer selection supersedes it. `selection.clear()` detaches the experiment.

For a form on a versioned entity, [`useVersionedSave`](/sdk/frontend/composables#useversionedsave) adds `If-Match`, the conflict dialog, and the stale-form banner.

For standard top-bar UI, set `experiment: true` in the `PluginWorkspaceView` spec; it creates the `useAppExperiment()` binding. Set `save: { handler, disabled, reason }` for the save callback; `disabled` and `reason` take a ref or a getter. Use the store in child pages rather than creating another `useAppExperiment()` shell.

For multiple independently managed outputs, call your plugin endpoint and persist [analysis artifacts](/sdk/recipes/writing-results) on the backend. Neither browser state nor an expiring job result replaces durable storage.

## Browse server files

`FilePicker` with `usePlatformFilePickerAdapter()` (both from `@morscherlab/mint-sdk/data`) browses configured **read-only server mounts**. The selection contains mount-relative references; the picker does not upload or copy files. The platform needs configured mounts and the user needs `filesystem.browse`. See [Adapter-driven FilePicker](#adapter-driven-filepicker) below for the example. `useFileBrowser()` and the `FileSelection` / `ServerMount` types remain for custom server-file UIs.

Send selected `{ mount_id, path }` references to a plugin endpoint only after defining that endpoint's input model. On the server, resolve paths through the platform filesystem service and validate access; never concatenate an unchecked browser path onto a server directory. `FileUploader` instead returns browser `File[]` for a local-file workflow.

### Listing cache and refresh

The platform reuses a server-side `FileBrowser` while mount configuration is unchanged. Its default cache retains metadata for up to 300 seconds and 128 directories; each request still resolves the path and checks the directory signature before reuse. After a listing, the server reads up to 32 of the newest subfolders in the background so the next folder opens from the cache. This is metadata caching, not a local copy of the files.

The picker's refresh action (and `useFileBrowser().refresh()` in a custom UI) sends `refresh=true` for the current location and invalidates cached listings for that mount, including descendants. Listing responses are capped at 2,000 entries by default; a custom `useFileBrowser()` UI should display `truncated` and counts instead of claiming the visible rows are a complete directory inventory. Its `typeRules` classify matching entries rather than hiding other files. The helper cancels superseded requests and starts at a reachable mount when the preferred mount is offline.

Cache size, TTL, and entry limits are Python `FileBrowser` settings; they are not `useFileBrowser()` options. See the [release filesystem implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/filesystem.py) if you own a standalone file browser service.

### Adapter-driven FilePicker

Use `FilePicker` for folder navigation, metadata preview, recursive search, and reviewing resolved file selections. Its open binding is `v-model:open`, its result event is `select`, and it accepts a `PickerAdapter`. The platform adapter lists the mounts as header sources next to Local files.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, type PickerSelection } from '@morscherlab/mint-sdk'
import {
  FilePicker,
  decodePlatformPickerPath,
  usePlatformFilePickerAdapter,
} from '@morscherlab/mint-sdk/data'

const open = ref(false)
const adapter = usePlatformFilePickerAdapter()
const files = ref<Array<{ mount_id: string; path: string }>>([])

function select(selection: PickerSelection): void {
  if (selection.source !== 'server') return
  files.value = selection.files.map(file => {
    const location = decodePlatformPickerPath(file.path)
    return { mount_id: location.mountId, path: location.path }
  })
  open.value = false
}
</script>

<template>
  <BaseButton @click="open = true">Choose data</BaseButton>
  <FilePicker
    v-model:open="open"
    :adapter="adapter"
    :sources="['server']"
    selection-mode="folder+files"
    :capabilities="{ server: { formats: ['mzML', 'mzML.gz'] } }"
    @select="select"
  />
  <p>{{ files.length }} input files selected</p>
</template>
```

The platform adapter uses opaque picker identities, not filesystem paths. Decode each selected server file with `decodePlatformPickerPath()` before submitting its mount-relative reference. For local selections, `selection.source === 'localFile'` instead yields browser `File[]` with optional `relativePaths`; the picker does not read or upload their bytes.

`usePlatformFilePickerAdapter({ rootLocation: { mount_id, path } })` can start inside one directory and prevent navigating above it. For a plugin-owned file API, use `createFilePickerAdapter(transport, options)` with `listMounts(request?)` and `browse(location, request?)` transport methods that return `ServerMount[]` and `FileDirectoryListing`, and optionally `tree(location, request?)` and `search(location, query, recursive, request?)`. Forward `request.signal` and `request.refresh` to your generated endpoint calls; the adapter already implements mount identity, navigation, and search.

The backend side of such an API is `mint_sdk.filesystem.file_browser_router(get_browser)`, the same routes the platform serves at `/api/filesystem`: `GET mounts`, `browse`, `tree` (up to three levels in one request) and `search` (server-side name search). Build the `FileBrowser` over the plugin's own directories; `allow_directory` refuses any directory a listing, tree, search or `resolve_picker_path()` would open (HTTP 403), and `hide_unmatched_files`, `files_at_root` and `allow_hidden` fix what the listing may show. `FileBrowser.resolve_picker_path(identity)` turns a selected picker path into the server path for a job. `useFilePicker` itself is internal, not the public extension point.

The picker warms at most 20 immediate folders with two requests at a time and reuses in-flight reads during navigation. Closing, changing source, and refreshing invalidate pending/cached adapter state; reopening re-reads the current location. This bounded prefetch is not a full-tree index. With a `search` transport the server searches (5,000 folders, 1,000 matches, 10 seconds); without it the adapter walks folders itself and stops at 500 folders or 10,000 matches. Either way, a search that reaches a limit returns the matches found so far and the picker says so. Unlike a raw `useFileBrowser()` listing, the adapter rejects a truncated server listing so a partial inventory cannot be confirmed as a complete selection.

`systemFilter` and `capabilities` guide visibility/selection in the UI. They never replace backend access checks, file-size validation, or path resolution.

## Verify both execution modes

1. Run `mint dev` and verify calculations and explicit missing-platform states in the standalone workspace.
2. Run `mint dev --platform` for the platform-shell development flow. Verify authentication, API routing, selector filtering, and theme changes; a dev proxy does not by itself turn the plugin backend into an installed platform plugin.
3. Build with `mint build .`, install on a local/test platform, and verify real platform persistence, permissions, reload, and selection of a second experiment.
4. Test a failed load and denied save. Existing results must not disappear or be replaced by an empty design after a failed request.

## Release source

- [Platform context and access levels](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/usePlatform.ts)
- [Shared experiment selection](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/stores/experiment.ts)
- [Current experiment](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useExperiment.ts)
- [Server file browser API](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useFileBrowser.ts)
