---
title: SmartGroupModal
description: "Two-mode smart grouping shell combining auto field recipes and manual cohort assignment."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupModal

`SmartGroupModal` is the full Smart Group UI. It switches between the auto field-recipe flow and the manual cohort builder with `v-model:mode`.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/SmartGroupModal.vue">Source</a>
</div>

<ComponentPlayground name="SmartGroupModal" />

## Import

```ts
import { SmartGroupModal } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<SmartGroupModal
  v-model:mode="mode"
  :auto="{ samples, fields, experimentLabel: experiment.code }"
  :manual="{ sampleNames, seed }"
  @apply="applyAutoGroups"
  @done="applyManualGroups"
/>
```

Use this when a plugin should let users choose between automatic grouping from parsed metadata and manual grouping for irregular sample names. The `auto` and `manual` prop bags are forwarded to `SmartGroupFieldRecipe` and `SmartGroupManual`.

## Related

- [SmartGroupFieldRecipe](/sdk/components/smart-group-field-recipe)
- [SmartGroupManual](/sdk/components/smart-group-manual)
- [AutoGroupModal](/sdk/components/auto-group-modal)

[Back to component library](/sdk/components/)
