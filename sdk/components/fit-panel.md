---
aside: false
title: FitPanel
description: "FitPanel is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# FitPanel

FitPanel is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

::: warning Deprecated
Scheduled for removal in **MINT 1.4**. The SDK has no replacement.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/FitPanel.vue">Source</a>
</div>

<ComponentPlayground name="FitPanel" />

## Import

```ts
import { FitPanel } from "@morscherlab/mint-sdk/components"
```

## Results

Results render as a parameter table with a header row (Parameter / Value, plus 95% CI when any row has `ci`); `columnLabels` renames the headers. A result with `verdict` is shown as a verdict line below the table instead. Pass `series` (with `v-model:active-series`) for several fitted series behind a color-coded switch; it supersedes `results`.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/FitPanel.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` state ` | ` FitState ` | No | ` 'idle' ` | — |
| ` progress ` | ` number ` | No | ` 0 ` | — |
| ` progressLabel ` | ` string ` | No | ` 'Fitting...' ` | — |
| ` indeterminate ` | ` boolean ` | No | ` false ` | — |
| ` results ` | ` FitResultSummary[] ` | No | ` () => [] ` | — |
| ` errorMessage ` | ` string ` | No | ` undefined ` | — |
| ` runLabel ` | ` string ` | No | ` 'Run Fit' ` | — |
| ` cancelLabel ` | ` string ` | No | ` 'Cancel' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` FitState `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L184) | ` 'idle' \| 'running' \| 'completed' \| 'error' ` |
| [` FitResultSummary `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L186) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
