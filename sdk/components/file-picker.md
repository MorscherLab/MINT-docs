---
aside: false
title: FilePicker
description: "Adapter-driven file and folder selection with tree navigation, search, and metadata preview."
---

<p class="mint-component-library__eyebrow">Theming + utilities</p>

# FilePicker

`FilePicker` provides expandable folder navigation, metadata preview, search, and a review step for file selections. Use `usePlatformFilePickerAdapter()` for authenticated MINT server mounts, or supply an adapter backed by your plugin's API.

## Example

This example requires a platform with configured mounts and `filesystem.browse` access:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseButton,
  FilePicker,
  usePlatformFilePickerAdapter,
  type PickerSelection,
} from '@morscherlab/mint-sdk'

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

`selectionMode` accepts `single-file`, `multi-file`, `folder`, or `folder+files`. `sources` can include `server` and `localFile`; the default is server only. `capabilities` sets allowed suffixes, optional `maxBytes`, and optional host-defined blank classification for each source.

## Adapter and selection boundaries

`PickerAdapter` implements `listRoot(request?)`, `listChildren(path, request?)`, and `search(query, scope, request?)`, with optional `invalidate()`. For a mount API, prefer `createFilePickerAdapter()` with `listMounts`/`browse` transport methods instead of writing those navigation methods yourself. Forward abort signals and explicit refresh requests through your transport.

- A server result contains `folders`, `files`, and `excluded` records. Platform-adapter paths are opaque identities: decode them with `decodePlatformPickerPath()` to obtain `mountId` and a relative `path` before a backend call.
- A local result contains browser `File[]` and optional `relativePaths`. The picker does not upload files or read their bytes.
- `rootLocation` on the platform/mount adapter confines browsing to one directory. `systemFilter` on the component supplies additional UI visibility rules. The backend must still validate permissions, paths, and accepted files.

The picker warms at most 20 immediate folders with two background reads at a time. It reuses pending reads, invalidates state when closed or refreshed, and re-reads its location on reopening. The mount adapter refuses truncated listings rather than confirming an incomplete file inventory. Narrow large searches or directories when a limit is reported.

## Events

| Event | Payload |
|-------|---------|
| `update:open` | `boolean`; used by `v-model:open` |
| `select` | `PickerSelection`; store the result in plugin state |
| `cancel` | No payload |

Do not interchange this API with [FileBrowserModal](/sdk/components/file-browser-modal), which takes controlled listing props and emits `confirm`. See [Platform integration](/sdk/frontend/platform-integration#adapter-driven-filepicker) for decoding selections, adapter transport details, and server cache behavior.

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/FilePicker.vue)

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/FilePicker.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` adapter ` | ` PickerAdapter ` | Yes | — | — |
| ` selectionMode ` | ` PickerSelectionMode ` | No | ` 'folder+files' ` | — |
| ` sources ` | ` PickerSource[] ` | No | ` () => ['server'] ` | — |
| ` capabilities ` | ` PickerCapabilities ` | No | ` () => ({}) ` | — |
| ` initialPath ` | ` string ` | No | ` '' ` | — |
| ` initialSelection ` | ` PickerSelection \| null ` | No | ` null ` | — |
| ` title ` | ` string ` | No | ` 'Choose data' ` | — |
| ` systemFilter ` | ` (node: PickerNode, source: PickerSource) => boolean ` | No | ` undefined ` | Host-owned visibility/selection filter; backend must still enforce access. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PickerAdapter `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L38) | See the linked SDK type definition. |
| [` PickerSelectionMode `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L3) | ` 'single-file' \| 'multi-file' \| 'folder' \| 'folder+files' ` |
| [` PickerSource `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L2) | ` 'server' \| 'localFile' ` |
| [` PickerCapabilities `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L56) | See the linked SDK type definition. |
| [` PickerSelection `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L65) | See the linked SDK type definition. |
| [` PickerNode `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/filePicker.ts#L26) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
