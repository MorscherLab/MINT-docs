---
title: FileUploader
description: "Drag-and-drop file picker with accept, size, multiple, and error handling."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FileUploader

Drag-and-drop file picker with accept, size, multiple, and error handling.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/FileUploader.vue">Source</a>
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

[Back to component library](/sdk/components/)
