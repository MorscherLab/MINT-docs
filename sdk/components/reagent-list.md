---
aside: false
title: ReagentList
description: "ReagentList is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# ReagentList

ReagentList is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ReagentList.vue">Source</a>
</div>

<ComponentPlayground name="ReagentList" />

## Import

```ts
import { ReagentList } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ReagentList.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Reagent[] ` | No | ` () => [] ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` showStockLevel ` | ` boolean ` | No | ` true ` | — |
| ` lowStockThreshold ` | ` number ` | No | ` 10 ` | — |
| ` columns ` | ` ReagentColumn[] ` | No | ` () => ['name', 'lot', 'expiry', 'storage', 'stock'] ` | — |
| ` sortable ` | ` boolean ` | No | ` true ` | — |
| ` searchable ` | ` boolean ` | No | ` true ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the table with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the table is replaced by an error state. null/undefined renders normally. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Reagent `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L197) | See the linked SDK type definition. |
| [` ReagentColumn `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L187) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
