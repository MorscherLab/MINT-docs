---
title: FileBrowserModal
description: "Select mount-relative paths from read-only server storage with the SDK file browser."
---

<p class="mint-component-library__eyebrow">Theming + utilities</p>

# FileBrowserModal

Available in **1.2.0**. A controlled picker for read-only server mounts. `FileBrowserModal` renders the UI; `useFileBrowser()` fetches the platform's `/api/filesystem` routes and owns listing/selection state. Picking a path does not copy or upload its data.

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

## Props

| Prop | Type | Purpose |
|------|------|---------|
| `modelValue` | `boolean` | Required open state (`v-model`) |
| `mounts` | `ServerMount[]` | Mount list, including offline/nested mounts |
| `mountId`, `path` | `string` | Displayed location |
| `parent` | `string \| null` | Parent directory; `null` at root |
| `entries`, `breadcrumbs` | `FileEntry[]`, `FilePathCrumb[]` | Listing rows and path trail |
| `selected` | `FileSelection[]` | Controlled selection (`v-model:selected`) |
| `search` | `string` | Search text (`v-model:search`) |
| `sort` | `'name' \| 'size' \| 'modified'` | Sort selection (`v-model:sort`) |
| `typeRules` | `string[]` | Extensions of interest; unmatched entries remain visible |
| `totalCount`, `matchCount` | `number \| null` | Directory/matching item counts |
| `truncated` | `boolean` | Whether the server capped the listing |
| `loading`, `error` | `boolean`, `string \| null` | Request status |
| `title`, `subtitle`, `contextCode` | `string` | Heading and experiment context |
| `dimNonMatching` | `boolean` | Default `true` |
| `showLocalPicker` | `boolean` | Default `true`; emits a hand-off event, not an upload |
| `confirmLabel` | `string` | Override the generated selection-count label |
| `size` | `ModalSize` | Default `full` |

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

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/FileBrowserModal.vue) · [Platform integration](/sdk/frontend/platform-integration) · [Component library](/sdk/components/)
