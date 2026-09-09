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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/FileUploader.vue">Source</a>
</div>

<ComponentPlayground name="FileUploader" />

## Import

```ts
import { FileUploader } from "@morscherlab/mint-sdk/components"
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

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/FileUploader.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` accept ` | ` string ` | No | ` undefined ` | — |
| ` multiple ` | ` boolean ` | No | ` false ` | — |
| ` maxSize ` | ` number ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` mode ` | ` 'file' \| 'folder' \| 'file+folder' ` | No | ` 'file' ` | — |
| ` showFiles ` | ` boolean ` | No | ` true ` | Hide the selection list when a parent presents the files itself. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
