---
aside: false
title: ExperimentDataViewer
description: "ExperimentDataViewer is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ExperimentDataViewer

ExperimentDataViewer is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentDataViewer.vue">Source</a>
</div>

<ComponentPlayground name="ExperimentDataViewer" />

## Import

```ts
import { ExperimentDataViewer } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentDataViewer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` treeData ` | ` TreeNode[] ` | No | ` undefined ` | — |
| ` tableData ` | ` Record<string, unknown>[] ` | No | ` undefined ` | — |
| ` tableColumns ` | ` DataFrameColumn[] \| undefined ` | No | ` undefined ` | — |
| ` summaryData ` | ` SummaryData \| null ` | No | ` undefined ` | — |
| ` defaultView ` | ` 'summary' \| 'tree' \| 'table' ` | No | ` 'summary' ` | — |
| ` title ` | ` string ` | No | ` 'Data' ` | — |
| ` pluginName ` | ` string ` | No | ` undefined ` | — |
| ` pluginRoutePrefix ` | ` string ` | No | ` undefined ` | — |
| ` experimentId ` | ` number ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set (or when the auto-fetch fails), the content area renders an error state instead of the data views. |
| ` downloadJsonUrl ` | ` string ` | No | ` undefined ` | — |
| ` downloadCsvUrl ` | ` string ` | No | ` undefined ` | — |
| ` autoFetch ` | ` boolean ` | No | ` true ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TreeNode `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L226) | See the linked SDK type definition. |
| [` DataFrameColumn `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L401) | See the linked SDK type definition. |
| [` SummaryData `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L128) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
