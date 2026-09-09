---
aside: false
title: MultiSelect
description: "MultiSelect is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# MultiSelect

MultiSelect is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/MultiSelect.vue">Source</a>
</div>

<ComponentPlayground name="MultiSelect" />

## Import

```ts
import { MultiSelect } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/MultiSelect.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` (string \| number)[] ` | Yes | — | — |
| ` options ` | ` MultiSelectOptionInput[] ` | Yes | — | — |
| ` placeholder ` | ` string ` | No | ` 'Select options...' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` maxSelections ` | ` number ` | No | ` undefined ` | — |
| ` size ` | ` MultiSelectSize ` | No | ` 'md' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` MultiSelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L338) | See the linked SDK type definition. |
| [` MultiSelectSize `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L340) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
