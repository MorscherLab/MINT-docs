---
aside: false
title: ExperimentPopover
description: "ExperimentPopover is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ExperimentPopover

ExperimentPopover is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentPopover.vue">Source</a>
</div>

<ComponentPlayground name="ExperimentPopover" />

## Import

```ts
import { ExperimentPopover } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentPopover.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` experimentName ` | ` string ` | No | ` undefined ` | — |
| ` experimentCode ` | ` string ` | No | ` undefined ` | — |
| ` experimentStatus ` | ` string ` | No | ` undefined ` | — |
| ` isResolving ` | ` boolean ` | No | ` false ` | An experiment is bound but the platform has not returned its record yet. |
| ` error ` | ` string ` | No | ` undefined ` | Message explaining why the bound experiment could not be resolved. |
| ` showSave ` | ` boolean ` | No | ` false ` | — |
| ` showDetach ` | ` boolean ` | No | ` false ` | — |
| ` saveDisabled ` | ` boolean ` | No | ` false ` | — |
| ` saveLoading ` | ` boolean ` | No | ` false ` | — |
| ` saveSuccessMessage ` | ` string ` | No | ` undefined ` | — |
| ` saveDisabledMessage ` | ` string ` | No | ` undefined ` | — |
| ` confirmSave ` | ` boolean ` | No | ` true ` | — |
| ` confirmTitle ` | ` string ` | No | ` undefined ` | — |
| ` confirmMessage ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
