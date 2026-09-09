---
aside: false
title: AutoGroupModal
description: "AutoGroupModal is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# AutoGroupModal

AutoGroupModal is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AutoGroupModal.vue">Source</a>
</div>

<ComponentPlayground name="AutoGroupModal" />

## Import

```ts
import { AutoGroupModal } from "@morscherlab/mint-sdk/components"
```

## Usage Notes

`AutoGroupModal` is the recommended UI for sample grouping from pasted names, CSV metadata, or experiment design data. It is driven by `useAutoGroup()` and now surfaces the parsed grouping as both flat groups and a nested preview tree.

Recent grouping behavior:

- Trailing injection/run numbers such as `_085` or `_00B` are kept as an `Injection #` / run-order column instead of being silently stripped.
- Samples are split by token count after sample-type classification, so ragged names do not align unrelated fields into the same column.
- The preview can render a three-layer hierarchy: sample class, enabled group-by columns, then sample leaves.
- QC-like classes can be grouped, overlaid, or excluded without losing the experimental group preview.

The applied result includes `groups`, `experimentalGroups`, `qcGroups`, `metadata`, `excludedSamples`, and `groupTree`. Use `groupTree` with `SampleHierarchyTree` when you want to render the same hierarchy outside the modal.

## Smart Group Components

The smart grouping UI is also exported as composable pieces:

| Component | Use |
|-----------|-----|
| `SmartGroupModal` | Full two-mode auto/manual grouping shell |
| `SmartGroupFieldRecipe` | Auto grouping view only |
| `SmartGroupManual` | Manual cohort builder only |

Use `AutoGroupModal` when you want the existing sample auto-grouping integration. Use the `SmartGroup*` components when a plugin needs to own more of the modal shell, route the mode switch itself, or embed one grouping mode inside a larger workflow.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AutoGroupModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` samples ` | ` string[] ` | No | ` () => [] ` | — |
| ` groups ` | ` SampleGroup[] ` | No | ` () => [] ` | — |
| ` initialMode ` | ` GroupingWorkflow ` | No | ` 'auto' ` | — |
| ` experimentId ` | ` number ` | No | ` undefined ` | — |
| ` designData ` | ` Record<string, unknown> ` | No | ` undefined ` | Pre-fetched design data — bypasses API fetch when provided |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SampleGroup `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L162) | See the linked SDK type definition. |
| [` GroupingWorkflow `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/AutoGroupModal.vue#L34) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
