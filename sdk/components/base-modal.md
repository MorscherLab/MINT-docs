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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseModal.vue">Source</a>
</div>

<ComponentPlayground name="BaseModal" />

## Import

```ts
import { BaseModal } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<BaseModal v-model="showModal" title="Edit panel">
  <p>Modal body content.</p>
  <template #footer>
    <BaseButton variant="ghost" @click="showModal = false">Cancel</BaseButton>
    <BaseButton variant="primary" @click="save">Save</BaseButton>
  </template>
</BaseModal>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` subtitle ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` ModalSize ` | No | ` 'md' ` | — |
| ` variant ` | ` ModalVariant ` | No | ` 'centered' ` | — |
| ` closable ` | ` boolean ` | No | ` true ` | — |
| ` closeOnOverlay ` | ` boolean ` | No | ` false ` | — |
| ` closeOnEscape ` | ` boolean ` | No | ` true ` | — |
| ` layout ` | ` ModalLayout ` | No | ` 'plain' ` | Shell layout. 'tabs' renders a tab strip between header and body; 'rail' renders a sidebar rail + pane as the shell's middle row. Both are shell regions — never part of the scrolling body content. |
| ` tabs ` | ` ModalTab[] ` | No | ` () => [] ` | Sections for the tab strip / rail. The strip renders only with 2+ tabs. |
| ` activeTab ` | ` string ` | No | ` undefined ` | Id of the selected tab. Two-way bindable via update:activeTab. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L32) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |
| [` ModalVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L33) | ` 'centered' \| 'drawer' \| 'sheet' ` |
| [` ModalLayout `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L34) | ` 'plain' \| 'tabs' \| 'rail' ` |
| [` ModalTab `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L37) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
