---
aside: false
title: BatchProgressList
description: "BatchProgressList is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# BatchProgressList

BatchProgressList is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BatchProgressList.vue">Source</a>
</div>

<ComponentPlayground name="BatchProgressList" />

## Import

```ts
import { BatchProgressList } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BatchProgressList.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` items ` | ` BatchItem[] ` | Yes | — | — |
| ` showSummary ` | ` boolean ` | No | ` true ` | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` maxHeight ` | ` string ` | No | ` undefined ` | — |
| ` autoScroll ` | ` boolean ` | No | ` true ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the item list with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the item list is replaced by an error state. null/undefined renders normally. |
| ` emptyMessage ` | ` string ` | No | ` 'No items in this batch' ` | Empty-state headline shown when there are no batch items. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` BatchItem `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L41) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
