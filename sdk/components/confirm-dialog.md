---
aside: false
title: ConfirmDialog
description: "Pre-built confirm-or-cancel dialog for destructive or high-friction actions."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# ConfirmDialog

Pre-built confirm-or-cancel dialog for destructive or high-friction actions.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ConfirmDialog.vue">Source</a>
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

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ConfirmDialog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` 'Confirm' ` | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` message ` | ` string ` | No | ` undefined ` | — |
| ` variant ` | ` 'danger' \| 'warning' \| 'info' ` | No | ` 'danger' ` | — |
| ` confirmLabel ` | ` string ` | No | ` 'Confirm' ` | — |
| ` cancelLabel ` | ` string ` | No | ` 'Cancel' ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
