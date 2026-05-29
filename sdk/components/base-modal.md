---
title: BaseModal
description: "Standard modal dialog with controlled visibility and footer slots."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# BaseModal

Standard modal dialog with controlled visibility and footer slots.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/BaseModal.vue">Source</a>
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

[Back to component library](/sdk/components/)
