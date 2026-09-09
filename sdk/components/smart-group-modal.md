---
aside: false
title: SmartGroupModal
description: "Two-mode smart grouping shell combining auto field recipes and manual cohort assignment."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SmartGroupModal

`SmartGroupModal` is the full Smart Group UI. It switches between the auto field-recipe flow and the manual cohort builder with `v-model:mode`.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupModal.vue">Source</a>
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

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroupModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` auto ` | ` Partial<SmartGroupFieldRecipeProps> ` | No | ` () => ({}) ` | Props forwarded to the auto-mode Field Recipe. |
| ` manual ` | ` Partial<SmartGroupManualProps> ` | No | ` () => ({}) ` | Props forwarded to the manual cohort builder. |
| ` mode ` | ` 'auto' \| 'manual' ` | No | ` 'auto' ` | Two-way value for v-model:mode. Emits update:mode. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SmartGroupFieldRecipeProps `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts#L38) | See the linked SDK type definition. |
| [` SmartGroupManualProps `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SmartGroup.types.ts#L87) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [SmartGroupFieldRecipe](/sdk/components/smart-group-field-recipe)
- [SmartGroupManual](/sdk/components/smart-group-manual)
- [AutoGroupModal](/sdk/components/auto-group-modal)

[Back to component library](/sdk/components/)
