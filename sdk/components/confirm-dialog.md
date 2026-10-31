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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ConfirmDialog.vue">Source</a>
</div>

<demo vue="./demos/ConfirmDialog.vue" title="ConfirmDialog" description="Confirmation dialog in the danger style. Open it with the button, then confirm or cancel." />

## Import

```ts
import { ConfirmDialog } from "@morscherlab/mint-sdk"
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

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ConfirmDialog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` "Confirm" ` | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` message ` | ` string ` | No | ` undefined ` | — |
| ` tone ` | ` Tone ` | No | ` "error" ` | — |
| ` confirmLabel ` | ` string ` | No | ` "Confirm" ` | — |
| ` cancelLabel ` | ` string ` | No | ` "Cancel" ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:open ` | ` value: boolean ` | — |
| ` cancel ` | — | — |
| ` confirm ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` icon ` | — | — |
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
