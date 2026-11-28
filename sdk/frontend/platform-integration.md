# Frontend platform integration

This page shows how a plugin frontend reads the platform context, selects and saves an experiment, and browses server files. Do the [standard frontend tutorial](/sdk/tutorials/adding-a-frontend) first: it installs Vue, Pinia, the SDK, the styles and a generated API client.

## Choose the right source of state

| Need | Public API | Important boundary |
|------|------------|--------------------|
| Embedded or standalone mode, platform user, features, access level | `usePlatform()` | Describes the host. It does not own login or the experiment picker |
| Session token and signed-in user | `useAuthStore()` | Read-only. The platform writes it |
| Experiment selected by the workspace picker | `useExperimentStore()` | Shared selection for the plugin's Pinia instance |
| Read the current experiment | `useExperiment()` | Read-only view of the store: `id`, `current`, `status`, `error`, `refresh()` |
| Top-bar experiment selector/save/detach UX | `PluginWorkspaceView` with `spec.experiment: true`, or `useAppExperiment()` | Reads the shared experiment store |
| Custom experiment search/list UI | `useExperimentSelector()` | Fetches and filters records; its selection is local to that composable |
| Read/write experiment design JSON | A plugin endpoint through the generated `useClient()`; the backend uses `context.design` | Subject to backend permissions |
| Call plugin routes | Generated `useClient()` | Uses the plugin contract and typed HTTP errors |

Do not keep a second `{ id, name }` experiment object in local storage. Show the platform record, so that a renamed experiment does not keep an old name. `ExperimentSelectorModal` writes its selection to `useExperimentStore()`. It binds `v-model:open` and emits no `select` event.

## Read platform context

Call composables inside `<script setup lang="ts">`, so that Vue can register their lifecycle hooks:

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

`usePlatform()` and `useAuthStore()` are read-only context, not authorization. The platform signs the user in and writes the session; a plugin never does. The server checks identity, plugin access, experiment compatibility and project scope on each request. For the return values and the rules of `can()`, see [`usePlatform`](/sdk/frontend/composables#useplatform) and [`useAuthStore`](/sdk/frontend/composables#useauthstore). For the access levels, see [Route permissions → Access levels](/sdk/recipes/route-permissions#access-levels).

When an administrator disables authentication on the platform (see [`devMode`](/admin/configuration#devmode)), the page gets no `user`, also when the browser holds a session cookie. The plugin backend gets no identity either. A page that shows the viewer name from `usePlatform().user` then shows no name.

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

`DesignRepository.save()` also takes a keyword-only `expected_version`. With it, the save fails with `VersionConflictException` (HTTP 412) when the experiment changed after you read it. Without it, the last write wins.

The frontend:

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

How the example works:

- It shows an empty form only when the experiment record says `has_design_data: false`. A failed load does not become an empty design.
- `request.run()` records the error and throws it again. The watcher catches it and keeps the form closed.
- The watcher ignores a late response after the selection changes.
- Show success only after `save` resolves.

### Experiment in the URL

In a platform page, the platform integration script owns the `experiment_id` URL parameter. The experiment store reads it when the page loads. A selection or a detach writes it back. Plugin router navigations keep the parameter. `useArtifacts()`, `ArtifactSaveDialog`, `GeneratedPathInput` and the `experimentId` path parameter of generated clients read the store, not the URL.

Do not write your own route sync. For example, do not `watch` `experimentIdFromRoute(route.query)` to call `selectById()`, and do not write `experimentId` with `router.replace`. The platform reads only `experiment_id`.

A standalone plugin has no integration script and no URL sync. To bind to an experiment by id in a standalone page, call `await selection.selectById(id)`. It fetches the record and exposes `isResolving` and `error`. It returns `null` on failure, or when a newer selection replaces it. `selection.clear()` detaches the experiment.

### Top bar, versions and outputs

- For the standard top-bar UI, set `experiment: true` in the `PluginWorkspaceView` spec. It creates the `useAppExperiment()` binding. In child pages, use the store; do not create another `useAppExperiment()` shell.
- Set `save: { handler, disabled, reason }` in the spec for the save callback. `disabled` and `reason` take a ref or a getter.
- For a form on a versioned entity, [`useVersionedSave`](/sdk/frontend/composables#useversionedsave) adds `If-Match`, the conflict dialog and the stale-form banner.
- For several outputs that change independently, save [analysis artifacts](/sdk/recipes/writing-results) on the backend. Browser state and an expiring job result are not durable storage.

## Browse server files

`FilePicker` with `usePlatformFilePickerAdapter()` (both from `@morscherlab/mint-sdk/data`) browses the read-only server mounts. The selection holds mount-relative references. The picker does not upload or copy files. The administrator must configure the mounts, and the user needs `filesystem.browse`; see [Server file browser](/admin/platform-settings#server-file-browser). For a custom server-file UI, use `useFileBrowser()` and the `FileSelection` and `ServerMount` types.

Send the selected `{ mount_id, path }` references to a plugin endpoint that has an input model for them. On the server, resolve each path through the platform filesystem service and check access. Never join an unchecked browser path to a server directory. For local files, use `FileUploader`: it returns browser `File[]`.

### Listing cache and refresh

The platform keeps one server-side `FileBrowser` while the mount configuration does not change. It caches file metadata, not the files.

- The default cache keeps metadata for up to 300 seconds and 128 directories. Each request still resolves the path and checks the directory signature before it uses the cache.
- After a listing, the server reads up to 32 of the newest subfolders in the background. The next folder then opens from the cache.
- The refresh action of the picker, and `useFileBrowser().refresh()` in a custom UI, send `refresh=true` for the current location. The server then clears the cached listings of that mount, subfolders included.
- A listing has at most 2,000 entries by default. A custom `useFileBrowser()` UI must show `truncated` and the counts. Do not show the visible rows as the full directory.
- `typeRules` of `useFileBrowser()` classify matching entries. They do not hide other files.
- `useFileBrowser()` cancels replaced requests. When the preferred mount is offline, it starts at a mount that it can reach.

Cache size, TTL and entry limits are settings of the Python `FileBrowser`, not `useFileBrowser()` options. If you own a standalone file browser service, see the [release filesystem implementation](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/filesystem.py).

### Adapter-driven FilePicker

Use `FilePicker` for folder navigation, metadata preview, recursive search and a review of the selected files. It binds `v-model:open`, emits `select` with the result and takes a `PickerAdapter`. The platform adapter shows the mounts as sources next to Local files.

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

- The platform adapter uses opaque picker identities, not file paths. Decode each selected server file with `decodePlatformPickerPath()` before you send its mount-relative reference.
- A local selection (`selection.source === 'localFile'`) gives browser `File[]` with optional `relativePaths`. The picker does not read or upload the bytes.
- `usePlatformFilePickerAdapter({ rootLocation: { mount_id, path } })` starts in one directory and blocks navigation above it.
- `systemFilter` and `capabilities` control what the UI shows and lets the user select. They do not replace backend access checks, file-size checks or path resolution.

For the prefetch, refresh and truncation behavior of the picker, see [FilePicker → Adapter and selection boundaries](/sdk/components/file-picker#adapter-and-selection-boundaries). Search limits: with a `search` transport, the server searches up to 5,000 folders, 1,000 matches or 10 seconds. Without it, the adapter walks the folders and stops at 500 folders or 10,000 matches. A search that reaches a limit returns the matches found so far, and the picker says so.

### Plugin-owned file API

1. On the backend, mount `mint_sdk.filesystem.file_browser_router(get_browser)`. It serves the same routes as the platform at `/api/filesystem`: `GET mounts`, `browse`, `tree` (up to three levels in one request) and `search` (name search on the server).
2. Build the `FileBrowser` over the plugin's own directories. `allow_directory` refuses (HTTP 403) each directory that a listing, tree, search or `resolve_picker_path()` would open. `hide_unmatched_files`, `files_at_root` and `allow_hidden` set what a listing shows.
3. In a job, call `FileBrowser.resolve_picker_path(identity)` to get the server path of a selected picker path.
4. On the frontend, call `createFilePickerAdapter(transport, options)`. The transport has `listMounts(request?)` and `browse(location, request?)`, which return `ServerMount[]` and `FileDirectoryListing`. `tree(location, request?)` and `search(location, query, recursive, request?)` are optional.
5. Forward `request.signal` and `request.refresh` to the generated endpoint calls. The adapter supplies mount identity, navigation and search.

`useFilePicker` is internal. Do not use it as an extension point.

## Verify both execution modes

1. Run `mint dev`. In the standalone workspace, check the calculations and the states without a platform.
2. Run `mint dev --platform`. Check authentication, API routing, selector filters and theme changes. The dev proxy does not make the plugin backend an installed platform plugin.
3. Build with `mint build .` and install the bundle on a test platform. Check persistence, permissions, reload and the selection of a second experiment.
4. Make a load fail and a save be refused. Existing results must stay, and an empty design must not replace them.

## Release source

- [Platform context and access levels](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/usePlatform.ts)
- [Shared experiment selection](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/stores/experiment.ts)
- [Current experiment](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useExperiment.ts)
- [Server file browser API](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/useFileBrowser.ts)
