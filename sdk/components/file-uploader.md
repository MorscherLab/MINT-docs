---
aside: false
title: FileUploader
description: "Drag-and-drop file picker with accept, size, multiple, and error handling."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FileUploader

Drag-and-drop file picker with accept, size, multiple, and error handling.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/FileUploader.vue">Source</a>
</div>

<demo vue="./demos/FileUploader.vue" title="FileUploader" description="File drop zone that accepts CSV and XLSX files. Drop or pick several files." />

## Import

```ts
import { FileUploader } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<FileUploader
  accept=".csv,.xlsx"
  :max-size="100 * 1024 * 1024"
  multiple
  @upload="uploadFiles"
/>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/FileUploader.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` accept ` | ` string ` | No | ` undefined ` | — |
| ` multiple ` | ` boolean ` | No | ` false ` | — |
| ` maxSize ` | ` number ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` mode ` | ` 'file' \| 'folder' \| 'file+folder' ` | No | ` "file" ` | — |
| ` showFiles ` | ` boolean ` | No | ` true ` | Hide the selection list when a parent presents the files itself. |
| ` files ` | ` File[] ` | No | ` undefined ` | Restore selections owned by a parent form; omitted for internal selection state. |
| ` rootName ` | ` string ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` error ` | ` message: string ` | — |
| ` upload ` | ` files: File[], rootName?: string \| undefined, relativePaths?: string[] \| undefined ` | — |
| ` remove ` | ` files: File[] ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` actions ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
