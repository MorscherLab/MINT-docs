---
aside: false
title: BaseModal
description: "Standard modal dialog with controlled visibility and footer slots."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# BaseModal

Standard modal dialog with controlled visibility and footer slots.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseModal.vue">Source</a>
</div>

<demo vue="./demos/BaseModal.vue" title="BaseModal" description="A modal with a footer. Click the button to open it, then cancel or save to close it." />

## Import

```ts
import { BaseModal } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<BaseModal v-model:open="showModal" title="Edit panel">
  <p>Modal body content.</p>
  <template #footer>
    <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
    <BaseButton variant="primary" @click="save">Save</BaseButton>
  </template>
</BaseModal>
```

## Behavior

- With `layout="rail"`, a `ModalTab.section` groups adjacent rail items under a section heading. The scoped `#pane-header` slot (`{ tab }`) replaces the pane's default title and subtitle.
- A [StepWizard](/sdk/components/step-wizard#in-a-modal) in the body puts its buttons in the modal footer. Do not add a `#footer` slot then.
- The overlay uses the `--mint-scrim` token.
- With modals stacked, Escape closes only the topmost one. A modal mounted already open takes focus on mount, preferring an `[autofocus]` descendant.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` ModalSize ` | No | ` "md" ` | — |
| ` variant ` | ` ModalVariant ` | No | ` "centered" ` | — |
| ` closable ` | ` boolean ` | No | ` true ` | — |
| ` closeOnOverlay ` | ` boolean ` | No | ` false ` | — |
| ` closeOnEscape ` | ` boolean ` | No | ` true ` | — |
| ` layout ` | ` ModalLayout ` | No | ` "plain" ` | Shell layout. 'tabs' renders a tab strip between header and body; 'rail' renders a sidebar rail + pane as the shell's middle row. Both are shell regions — never part of the scrolling body content. |
| ` tabs ` | ` ModalTab[] ` | No | ` [] ` | Sections for the tab strip / rail. The strip renders only with 2+ tabs. |
| ` activeTab ` | ` string ` | No | ` undefined ` | Id of the selected tab. Two-way bindable via update:activeTab. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L40) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |
| [` ModalVariant `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L41) | ` 'centered' \| 'drawer' \| 'sheet' ` |
| [` ModalLayout `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L42) | ` 'plain' \| 'tabs' \| 'rail' ` |
| [` ModalTab `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L45) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:open ` | ` value: boolean ` | — |
| ` update:activeTab ` | ` id: string ` | — |
| ` close ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` header ` | — | — |
| ` rail-footer ` | — | — |
| ` pane-header ` | ` { tab: ModalTab \| undefined; } ` | — |
| ` default ` | — | — |
| ` footer ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
