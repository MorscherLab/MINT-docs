# Frontend platform integration

This guide targets MINT **1.2.6**. Start with the [standard frontend tutorial](/sdk/tutorials/adding-a-frontend); it already installs Vue, Pinia, the SDK, styles, and a generated API client.

## Choose the right source of state

| Need | Public API | Important boundary |
|------|------------|--------------------|
| Embedded/standalone mode, platform user, theme, navigation | `usePlatformContext()` | Describes the host; it does not own login or the experiment picker |
| Login actions and token lifecycle | `useAuth()` | Actions such as `initializeAuth()`, `login()`, `logout()` |
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

The SDK's API helpers use the auth store's bearer token. `useAuth()` returns methods; read reactive state from `useAuthStore()`:

```ts
import { onMounted } from 'vue'
import { useAuth, useAuthStore } from '@morscherlab/mint-sdk'

const auth = useAuth()
const authState = useAuthStore()

// For a custom shell that owns authentication initialization.
onMounted(async () => {
  await auth.initializeAuth()
})

async function signIn(username: string, password: string): Promise<boolean> {
  return auth.login(username, password)
}
```

Render `authState.needsAuth`, `authState.isLoading`, and `authState.error` in the surrounding login UI. Use the SDK's existing workspace/account controls where they cover the flow. Do not assume `usePlatformContext().user` automatically initializes an auth store or grants access. Hiding a button is only presentation; protect its endpoint on the backend too.

## Select, load, edit, and save an experiment

This complete page is for an **experiment-design plugin** whose entry-point key is `my-design`. It uses the platform picker and saves a small design payload. Replace `my-design` with your plugin ID and ensure the platform permits that plugin to edit the selected experiment.

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

MINT 1.2 adds `FileBrowserModal` and `useFileBrowser()` for configured **read-only server mounts**. The selection contains mount-relative paths; the picker does not upload or copy files. The platform needs configured mounts and the user needs `filesystem.browse`. With no mounts configured, the helper treats the absent routes as an empty mount list.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseButton,
  FileBrowserModal,
  useFileBrowser,
  type FileSelection,
} from '@morscherlab/mint-sdk'

const open = ref(false)
const inputFiles = ref<FileSelection[]>([])
const typeRules = ['.mzML', '.raw']
const browser = useFileBrowser({ typeRules })
const {
  mounts, mountId, path, parent, entries, breadcrumbs, selected,
  search, sort, totalCount, matchCount, truncated, isLoading, error,
} = browser

async function chooseFiles(): Promise<void> {
  open.value = true
  await browser.init()
}

function confirm(selection: FileSelection[]): void {
  inputFiles.value = [...selection]
  open.value = false
}
</script>

<template>
  <BaseButton @click="chooseFiles">Select server data</BaseButton>
  <p>{{ inputFiles.length }} input paths selected</p>
  <FileBrowserModal
    v-model="open"
    v-model:selected="selected"
    v-model:search="search"
    v-model:sort="sort"
    :mounts="mounts"
    :mount-id="mountId"
    :path="path"
    :parent="parent"
    :entries="entries"
    :breadcrumbs="breadcrumbs"
    :type-rules="typeRules"
    :total-count="totalCount"
    :match-count="matchCount"
    :truncated="truncated"
    :loading="isLoading"
    :error="error"
    :show-local-picker="false"
    @navigate="browser.navigate"
    @select-folder="browser.selectCurrentFolder"
    @refresh="browser.refresh"
    @confirm="confirm"
  />
</template>
```

Send the selected `{ mount_id, path, ... }` records to a plugin endpoint only after defining that endpoint's input model. On the server, resolve paths through the platform filesystem service and validate access; never concatenate an unchecked browser path onto a server directory. `typeRules` marks matching entries for the UI; it is not backend file validation. `FileUploader` instead returns browser `File[]` for a local-file workflow.

### Listing cache and refresh

The file-browser changes introduced in 1.2.4 are included in 1.2.6. The platform reuses a server-side `FileBrowser` while mount configuration is unchanged. Its default cache retains metadata for up to 300 seconds and 128 directories; each request still resolves the path and checks the directory signature before reuse. This is metadata caching, not a local copy of the files.

Keep `@refresh="browser.refresh"` connected. It sends `refresh=true` for the current location and invalidates cached listings for that mount, including descendants. Listing responses are capped at 2,000 entries by default, so display `truncated` and counts instead of claiming the visible rows are a complete directory inventory. `typeRules` classifies matching entries rather than hiding other files. The helper cancels superseded requests and starts at a reachable mount when the preferred mount is offline.

Cache size, TTL, and entry limits are Python `FileBrowser` settings; they are not `useFileBrowser()` options. See the [release filesystem implementation](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-python/src/mint_sdk/filesystem.py) if you own a standalone file browser service.

### Adapter-driven FilePicker

Use `FilePicker` for expandable folder trees, metadata preview, recursive search, and reviewing resolved file selections. It is a different component from the controlled `FileBrowserModal` above: its open binding is `v-model:open`, its result event is `select`, and it accepts a `PickerAdapter`.

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

`usePlatformFilePickerAdapter({ rootLocation: { mount_id, path } })` can start inside one directory and prevent navigating above it. For a plugin-owned file API, use `createFilePickerAdapter(transport, options)` with `listMounts(request?)` and `browse(location, request?)` transport methods that return `ServerMount[]` and `FileDirectoryListing`. Forward `request.signal` and `request.refresh` to your generated endpoint calls; the adapter already implements mount identity, navigation, and search. `useFilePicker` itself is internal, not the public extension point.

The picker warms at most 20 immediate folders with two requests at a time and reuses in-flight reads during navigation. Closing, changing source, and refreshing invalidate pending/cached adapter state; reopening re-reads the current location. This bounded prefetch is not a full-tree index. Recursive adapter search stops at 500 folders or more than 10,000 matches; narrow the location/query when those limits are reached. Unlike the raw browser modal, the adapter rejects a truncated server listing so a partial inventory cannot be confirmed as a complete selection.

`systemFilter` and `capabilities` guide visibility/selection in the UI. They never replace backend access checks, file-size validation, or path resolution.

## Verify both execution modes

1. Run `mint dev` and verify calculations and explicit missing-platform states in the standalone workspace.
2. Run `mint dev --platform` for the platform-shell development flow. Verify authentication, API routing, selector filtering, and theme changes; a dev proxy does not by itself turn the plugin backend into an installed platform plugin.
3. Build with `mint build .`, install on a local/test platform, and verify real platform persistence, permissions, reload, and selection of a second experiment.
4. Test a failed load and denied save. Existing results must not disappear or be replaced by an empty design after a failed request.

## Release source

- [Platform context and message validation](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/composables/usePlatformContext.ts)
- [Shared experiment selection](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/stores/experiment.ts)
- [Experiment data persistence](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/composables/useExperimentSave.ts)
- [Server file browser API](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/composables/useFileBrowser.ts)
