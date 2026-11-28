---
aside: false
title: SampleHierarchyTree
description: "Collapsible tree of the sample hierarchy, from study to treatment."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SampleHierarchyTree

Use `SampleHierarchyTree` to browse a sample hierarchy: study, experiment, plate, sample, cell line, passage, clone and treatment.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SampleHierarchyTree.vue">Source</a>
</div>

<demo vue="./demos/SampleHierarchyTree.vue" title="SampleHierarchyTree" description="Browse a study, experiment and plate tree with badges. Expand or collapse nodes to see the samples." />

## Import

```ts
import { SampleHierarchyTree } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SampleHierarchyTree.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` nodes ` | ` TreeNode[] ` | Yes | — | — |
| ` defaultExpandedIds ` | ` string[] ` | No | ` [] ` | — |
| ` expandAll ` | ` boolean ` | No | ` false ` | — |
| ` showIcons ` | ` boolean ` | No | ` true ` | — |
| ` showCounts ` | ` boolean ` | No | ` true ` | — |
| ` maxDepth ` | ` number ` | No | ` undefined ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the tree with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the tree is replaced by an error state. null/undefined renders normally. |
| ` selectedId ` | ` string \| null ` | No | ` undefined ` | Selected node id; bind it with v-model on selected-id. Binding it, even to null, turns on selection. The matching row is highlighted, rows take keyboard focus and Enter or Space selects. Left unbound, rows are not selectable. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TreeNode `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L293) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` node-click ` | ` node: TreeNode ` | — |
| ` expand ` | ` nodeId: string ` | — |
| ` collapse ` | ` nodeId: string ` | — |
| ` update:selectedId ` | ` nodeId: string ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` error ` | ` { error: string; } ` | — |
| ` loading ` | — | — |
| ` empty ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
