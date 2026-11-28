---
aside: false
title: FilePicker
description: "Adapter-driven file and folder selection with tree navigation, search, and metadata preview."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FilePicker

Use `FilePicker` to let the user select files or folders on MINT server mounts or on the local computer. Use `usePlatformFilePickerAdapter()` for the server mounts, or give an adapter that calls your plugin API.

<demo vue="./demos/FilePicker.vue" title="FilePicker" description="A picker over two in-memory mounts. Open it, browse folders, select raw or mzML files and confirm." />

## Example

The example needs a platform with mounts and the `filesystem.browse` permission.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@morscherlab/mint-sdk'
import { FilePicker, usePlatformFilePickerAdapter, type PickerSelection } from '@morscherlab/mint-sdk/data'

const open = ref(false)
const selection = ref<PickerSelection | null>(null)
const adapter = usePlatformFilePickerAdapter()

function select(value: PickerSelection): void {
  selection.value = value
  open.value = false
}
</script>

<template>
  <BaseButton @click="open = true">Select input data</BaseButton>
  <FilePicker
    v-model:open="open"
    :adapter="adapter"
    :initial-selection="selection"
    :sources="['server']"
    selection-mode="multi-file"
    :capabilities="{ server: { formats: ['mzML', 'mzML.gz'] } }"
    @select="select"
  />
  <p>{{ selection?.files.length ?? 0 }} files selected</p>
</template>
```

The picker is a `BaseModal` (`size="xl"`) with folder navigation, metadata preview, search and a review step for file selections.

- `view="list"` (default) shows one folder at a time. Double-click or → opens a folder, ← goes up. Each row shows the size and the modified time.
- `view="tree"` shows a tree with disclosure triangles.
- A row that cannot be read shows a lock and the reason.
- The path-bar menu sorts a folder by Newest first (default), Oldest first, Name A–Z or Name Z–A. Folders stay above files. Rows without a modified time go last.
- `defaultSort` sets the order each time the picker opens. A change lasts until the picker closes.
- With a mount-rooted adapter, the mounts show as sources in the header, next to Local files. The picker opens the first mount it can reach and keeps the selection when the user switches mounts.

`selectionMode` is `single-file`, `multi-file`, `folder` or `folder+files`. `sources` can hold `server` and `localFile` (default: server only). `capabilities` sets, for each source, the allowed suffixes, an optional `maxBytes` and an optional blank classification that you define.

## Adapter and selection boundaries

A `PickerAdapter` implements `listRoot(request?)`, `listChildren(path, request?)` and `search(query, scope, request?)`, and optionally `invalidate()`.

- Set `mounts: true` when `listRoot()` returns mount points, so that the picker shows them as sources. Implement `mountOf(path)`, so that an `initialPath` inside a mount selects that mount.
- Without `rootLocation`, `usePlatformFilePickerAdapter()` and `createFilePickerAdapter()` set `mounts: true`. The platform adapter also implements `mountOf`.
- For a mount API, use `createFilePickerAdapter()` with the transport methods `listMounts` and `browse` (and optionally `tree` and `search`). Do not write the navigation methods yourself. Pass abort signals and refresh requests through your transport.
- `search` returns the matching nodes or `{ nodes, truncated }`. For a truncated result, the picker says that it lists only the first matches.

- A server result holds `folders`, `files` and `excluded` records. Paths from the platform adapter are opaque. Before a backend call, decode them with `decodePlatformPickerPath()` to get `mountId` and a relative `path`.
- A local result holds browser `File[]` and optional `relativePaths`. The picker does not upload files or read their bytes.
- `rootLocation` on the platform or mount adapter keeps browsing inside one directory. `systemFilter` on the component adds rules for what the picker shows. Your backend must still check permissions, paths and accepted files.

- The picker reads ahead at most 20 subfolders of the current folder, two at a time. With a `tree` transport, one request returns the folder and its subfolders, so opening a subfolder needs no more requests.
- It reuses reads in progress, drops its state when it closes or refreshes, and reads its location again when it opens.
- The mount adapter refuses a truncated listing. It does not show an incomplete list of files as complete.
- A search that reaches a limit shows the matches found so far. Narrow the location or the query to see the rest.

## Events

| Event | Payload |
|-------|---------|
| `update:open` | `boolean`; used by `v-model:open` |
| `select` | `PickerSelection`. Store it in plugin state |
| `cancel` | No payload |

For decoding selections, transport details and the server cache, see [Platform integration](/sdk/frontend/platform-integration#adapter-driven-filepicker).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FilePicker.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` adapter ` | ` PickerAdapter ` | No | ` undefined ` | Required when sources includes server (the default). |
| ` selectionMode ` | ` PickerSelectionMode ` | No | ` "folder+files" ` | — |
| ` sources ` | ` PickerSource[] ` | No | ` ["server"] ` | — |
| ` capabilities ` | ` PickerCapabilities ` | No | ` {} ` | — |
| ` initialPath ` | ` string ` | No | ` "" ` | — |
| ` initialSelection ` | ` PickerSelection \| null ` | No | ` null ` | — |
| ` title ` | ` string ` | No | ` "Choose data" ` | — |
| ` view ` | ` PickerView ` | No | ` "list" ` | list shows one folder at a time; tree adds disclosure triangles. |
| ` defaultSort ` | ` PickerSort ` | No | ` "newest" ` | Row order on each open; the user can change it from the path bar until closing. |
| ` systemFilter ` | ` (node: PickerNode, source: PickerSource) => boolean ` | No | ` undefined ` | Host-owned visibility/selection filter; backend must still enforce access. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PickerAdapter `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L49) | See the linked SDK type definition. |
| [` PickerSelectionMode `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L3) | ` 'single-file' \| 'multi-file' \| 'folder' \| 'folder+files' ` |
| [` PickerSource `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L2) | ` 'server' \| 'localFile' ` |
| [` PickerCapabilities `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L74) | See the linked SDK type definition. |
| [` PickerSelection `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L82) | See the linked SDK type definition. |
| [` PickerView `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L5) | ` 'list' \| 'tree' ` |
| [` PickerSort `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L7) | ` 'newest' \| 'oldest' \| 'name' \| 'name-desc' ` |
| [` PickerNode `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/filePicker.ts#L32) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` select ` | ` selection: PickerSelection ` | — |
| ` update:open ` | ` open: boolean ` | — |
| ` cancel ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
