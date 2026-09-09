---
aside: false
title: FileBrowserModal
description: "Select mount-relative paths from read-only server storage with the SDK file browser."
---

<p class="mint-component-library__eyebrow">Theming + utilities</p>

# FileBrowserModal

Available since **1.2.0**. A controlled picker for read-only server mounts. `FileBrowserModal` renders the UI; `useFileBrowser()` fetches the platform's `/api/filesystem` routes and owns listing/selection state. Picking a path does not copy or upload its data.

The platform must configure mounts and grant `filesystem.browse`. See [the complete server-file example](/sdk/frontend/platform-integration#browse-server-files) for fetch, selection, confirmation, error, and retry wiring.

## Import and state

```ts
import { FileBrowserModal, useFileBrowser, type FileSelection } from '@morscherlab/mint-sdk'

const browser = useFileBrowser({ typeRules: ['.mzML', '.raw'] })
// Call browser.init() when opening the modal.
```

For example, confirming one file yields a record with this shape:

```ts
const input: FileSelection = {
  mount_id: 'instrument-data',
  path: 'batch-01/sample-01.mzML',
  name: 'sample-01.mzML',
  kind: 'file',
}
```

`mount_id` is a configured logical mount and `path` is a mount-relative POSIX path. The backend must resolve and authorize that reference using the filesystem service. Never treat a frontend path as permission to open arbitrary server files.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FileBrowserModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` mounts ` | ` ServerMount[] ` | No | ` () => [] ` | Mounts in the location strip; nested children follow their parent. |
| ` mountId ` | ` string ` | No | ` '' ` | Mount the listing belongs to. |
| ` path ` | ` string ` | No | ` '' ` | Mount-relative path of the directory being shown. |
| ` parent ` | ` string \| null ` | No | ` null ` | Parent path, or null at a mount root. |
| ` entries ` | ` FileEntry[] ` | No | ` () => [] ` | — |
| ` breadcrumbs ` | ` FilePathCrumb[] ` | No | ` () => [] ` | — |
| ` selected ` | ` FileSelection[] ` | No | ` () => [] ` | Controlled selection, mirroring DataFrame's selectedKeys contract. |
| ` typeRules ` | ` string[] ` | No | ` () => [] ` | Extensions the caller cares about, shown as a chip in the toolbar. |
| ` search ` | ` string ` | No | ` '' ` | — |
| ` sort ` | ` FileBrowserSortKey ` | No | ` 'name' ` | — |
| ` totalCount ` | ` number \| null ` | No | ` null ` | Directory size before any search filter. |
| ` matchCount ` | ` number \| null ` | No | ` null ` | How many entries satisfy the type rules. |
| ` truncated ` | ` boolean ` | No | ` false ` | True when the server capped the listing. |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` string \| null ` | No | ` null ` | — |
| ` title ` | ` string ` | No | ` 'Select data' ` | — |
| ` subtitle ` | ` string ` | No | ` '' ` | Free-form context line, e.g. the experiment this data is for. |
| ` contextCode ` | ` string ` | No | ` '' ` | Monospace prefix on the context line, e.g. an experiment code. |
| ` dimNonMatching ` | ` boolean ` | No | ` true ` | Dim entries that fail the type rules instead of showing them plainly. |
| ` showLocalPicker ` | ` boolean ` | No | ` true ` | Offer the hand-off to the system file picker for local, never-uploaded files. |
| ` confirmLabel ` | ` string ` | No | ` '' ` | — |
| ` size ` | ` ModalSize ` | No | ` 'full' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ServerMount `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/fileBrowserTypes.ts#L15) | See the linked SDK type definition. |
| [` FileEntry `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/fileBrowserTypes.ts#L34) | See the linked SDK type definition. |
| [` FilePathCrumb `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/fileBrowserTypes.ts#L28) | See the linked SDK type definition. |
| [` FileSelection `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/fileBrowserTypes.ts#L71) | See the linked SDK type definition. |
| [` FileBrowserSortKey `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/fileBrowserTypes.ts#L12) | ` 'name' \| 'size' \| 'modified' ` |
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L32) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

<!-- sdk-props:end -->

## Events

| Event | Payload | Usual handler |
|-------|---------|---------------|
| `update:modelValue` | `boolean` | `v-model` |
| `update:selected` | `FileSelection[]` | `v-model:selected` |
| `update:search` | `string` | `v-model:search` |
| `update:sort` | `FileBrowserSortKey` | `v-model:sort` |
| `navigate` | `{ mount_id: string; path: string }` | `browser.navigate` |
| `selectFolder` | `{ mount_id: string; path: string }` | `browser.selectCurrentFolder` |
| `refresh` | None | `browser.refresh` |
| `confirm` | `FileSelection[]` | Copy references into plugin input state and close |
| `cancel` | None | Optional cancel handling |
| `chooseLocal` | None | Open a browser file picker you own |

Disable `show-local-picker` if your plugin only supports server data. For local files, [FileUploader](/sdk/components/file-uploader) emits browser `File[]`; any upload is a separate plugin action.

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FileBrowserModal.vue) · [Platform integration](/sdk/frontend/platform-integration) · [Component library](/sdk/components/)
