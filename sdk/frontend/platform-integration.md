# Frontend platform integration

This guide targets MINT **@MINT_VERSION@**. Start with the [standard frontend tutorial](/sdk/tutorials/adding-a-frontend); it already installs Vue, Pinia, the SDK, styles, and a generated API client.

## Choose the right source of state

| Need | Public API | Important boundary |
|------|------------|--------------------|
| Embedded/standalone mode, platform user, theme, navigation | `usePlatformContext()` | Describes the host; it does not own login or the experiment picker |
| Reactive authentication and permission state | `useAuthStore()` | `isAuthenticated`, `needsAuth`, `userInfo`, and permission helpers |
| Experiment selected by the workspace picker | `useExperimentStore()` | Shared selection for the plugin's Pinia instance |
| Top-bar experiment selector/save/detach UX | `PluginWorkspaceView experiment-shell` or `useAppExperiment()` | Reads the shared experiment store |
| Experiment ID in platform injection or a deep link | `useCurrentExperiment()` | Resolves injection/query/path; it is not the picker store |
| Custom experiment search/list UI | `useExperimentSelector()` | Fetches and filters records; its selection is local to that composable |
| Read/write experiment design JSON | `useExperimentSave()` | Platform data API, subject to backend permissions |
| Call plugin routes | Generated `useGeneratedPluginClient()` | Uses the plugin contract and typed HTTP errors |

Do not keep a second `{ id, name }` experiment object in local storage. In 1.2, `ExperimentSelectorModal` commits its selection to `useExperimentStore()` directly; it emits `update:modelValue`, not a `select` event. Display the resolved platform record so a renamed experiment cannot retain a stale local name.

## Read platform context

Call composables inside `<script setup lang="ts">` so Vue can register their lifecycle hooks:

```vue
<script setup lang="ts">
import { usePlatformContext } from '@morscherlab/mint-sdk'

const { isIntegrated, user, theme, navigate } = usePlatformContext()
</script>

<template>
  <p>Mode: {{ isIntegrated ? 'Platform' : 'Standalone' }}</p>
  <p>Theme: {{ theme }} · User: {{ user?.username ?? 'Anonymous' }}</p>
  <button v-if="isIntegrated" type="button" @click="navigate('/experiments')">
    Open platform experiments
  </button>
</template>
```

Detection happens on mount using the injected `window.__MINT_PLATFORM__` context or the SDK's URL conventions. The composable exposes `context`, `plugin`, `features`, `notify()`, and `sendToPlatform()` as well. Theme/user messages are accepted only from the parent window and an allowed origin. For a deliberately separate host, configure `allowedOrigins: ['https://mint.example.org']`; do not disable origin checks in deployed plugins.

`isIntegrated` is a UI mode indicator, not proof that a request is authorized or that a standalone development backend has a `PlatformContext`. The server still enforces identity, plugin access, experiment compatibility, and project scope.

## Authentication

The SDK's API helpers use the auth store's bearer token. The platform owns sign-in, token refresh and passkeys; a plugin reads identity and permissions from `useAuthStore()` and never logs a user in itself (`useAuth` and `usePasskey` were removed in 1.3):

```ts
import { useAuthStore } from '@morscherlab/mint-sdk'

const authState = useAuthStore()
const canEdit = authState.hasPermission('experiments.edit')
```

Use `authState.needsAuth`, `authState.isLoading`, and `authState.error` to gate the page. Do not assume `usePlatformContext().user` automatically initializes an auth store or grants access. Hiding a button is only presentation; protect its endpoint on the backend too.

## Select, load, edit, and save an experiment

This complete page is for an **experiment-design plugin** whose entry-point key is `my-design`. It uses the platform picker and saves a small design payload. Replace `my-design` with your plugin ID and ensure the platform permits that plugin to edit the selected experiment.

::: warning Deprecated
`useExperimentSave()` is scheduled for removal in **MINT 1.4**. The SDK has no replacement.
:::

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  AlertBox,
  BaseButton,
  ExperimentSelectorModal,
  FormBuilder,
  defineControlModel,
  useExperimentSave,
  useExperimentStore,
} from '@morscherlab/mint-sdk'

const selection = useExperimentStore()
const persistence = useExperimentSave({ pluginId: 'my-design', schemaVersion: '1.0' })
const pickerOpen = ref(false)
const values = ref<Record<string, unknown>>({})
const ready = ref(false)
const model = defineControlModel({
  controls: {
    notes: { type: 'textarea', label: 'Design notes', default: '' },
  },
})
const { error, isSaving } = persistence

watch(() => selection.current?.id, async (id, _oldId, onCleanup) => {
  let stale = false
  onCleanup(() => { stale = true })
  ready.value = false
  values.value = {}
  if (id === undefined) return
  if (selection.current?.has_design_data === false) {
    values.value = { notes: '' }
    ready.value = true
    return
  }
  const response = await persistence.loadDesign(id)
  if (stale) return
  const data = response?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return
  values.value = data as Record<string, unknown>
  ready.value = true
}, { immediate: true })

async function save(data: Record<string, unknown>): Promise<void> {
  const id = selection.current?.id
  if (id === undefined || !ready.value) return
  await persistence.saveDesign(id, data)
}
</script>

<template>
  <BaseButton @click="pickerOpen = true">Select experiment</BaseButton>
  <ExperimentSelectorModal
    v-model="pickerOpen"
    :current-experiment-id="selection.currentId"
  />
  <p>{{ selection.current?.name ?? 'No experiment selected' }}</p>
  <FormBuilder
    v-if="ready"
    v-model="values"
    :model="model"
    :loading="isSaving"
    @submit="save"
  />
  <AlertBox v-if="error" type="error">{{ error }}</AlertBox>
</template>
```

In 1.2, `loadDesign()` returns the platform response envelope (`experiment_id`, `plugin_id`, `data`, `schema_version`, `updated_at`), so bind **`response.data`** to the form. It returns `null` and sets `error` on failure, including a missing-design 404. The example initializes a blank form only when the resolved experiment record says `has_design_data: false`; it does not reinterpret every failed load as an empty design. Saves return `boolean`; only show success after `true`. The watcher discards late responses when selection changes.

Use `saveDesign(selection.current.id, data)` when the picker owns selection. `saveCurrentDesign()` resolves the current ID from platform injection or URL conventions and does not follow `useExperimentStore()` automatically. For a URL-only page, `useCurrentExperiment()` and the `saveCurrent*` helpers are appropriate.

To resolve a deep link into the shared picker store, call `await selection.selectById(id)`. It fetches the real record, exposes `isResolving`/`error`, and returns `null` on failure or when a newer selection supersedes it. `selection.clear()` detaches the experiment. The store prevents stale responses from replacing a newer selection.

For standard top-bar UI, enable `experiment-shell` on `PluginWorkspaceView`; it creates the `useAppExperiment()` binding. Use `experiment-save` for the save callback and `experiment-save-disabled` while data is unavailable. Use the store in child pages rather than creating another `useAppExperiment()` shell.

`saveAnalysis()` is the compatibility single-result API. For multiple independently managed outputs, call your plugin endpoint and persist [analysis artifacts](/sdk/recipes/writing-results) on the backend. Neither browser state nor an expiring job result replaces durable storage.

## Browse server files

`FilePicker` with `usePlatformFilePickerAdapter()` browses configured **read-only server mounts**. The selection contains mount-relative references; the picker does not upload or copy files. The platform needs configured mounts and the user needs `filesystem.browse`. See [Adapter-driven FilePicker](#adapter-driven-filepicker) below for the example. `useFileBrowser()` and the `FileSelection` / `ServerMount` types remain for custom server-file UIs.

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
import {
  BaseButton,
  FilePicker,
  decodePlatformPickerPath,
  usePlatformFilePickerAdapter,
  type PickerSelection,
} from '@morscherlab/mint-sdk'

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

- [Platform context and message validation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/usePlatformContext.ts)
- [Shared experiment selection](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/stores/experiment.ts)
- [Experiment data persistence](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useExperimentSave.ts)
- [Server file browser API](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useFileBrowser.ts)
