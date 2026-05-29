---
title: ConfirmDialog
description: "Pre-built confirm-or-cancel dialog for destructive or high-friction actions."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# ConfirmDialog

Pre-built confirm-or-cancel dialog for destructive or high-friction actions.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/ConfirmDialog.vue">Source</a>
</div>

<ComponentPlayground name="ConfirmDialog" />

## Import

```ts
import { ConfirmDialog } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<ConfirmDialog
  v-model="confirmingDelete"
  title="Delete panel?"
  message="This cannot be undone."
  variant="danger"
  confirm-label="Delete"
  @confirm="confirmDelete"
/>
```

[Back to component library](/sdk/components/)
