---
aside: false
title: ExperimentSelectorModal
description: "ExperimentSelectorModal is a workflow component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# ExperimentSelectorModal

ExperimentSelectorModal is a workflow component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentSelectorModal.vue">Source</a>
</div>

<ComponentPlayground name="ExperimentSelectorModal" />

## Import

```ts
import { ExperimentSelectorModal } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentSelectorModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` experimentType ` | ` string ` | No | ` undefined ` | — |
| ` allowedExperimentTypes ` | ` string[] \| null ` | No | ` undefined ` | — |
| ` currentExperimentId ` | ` number \| null ` | No | ` null ` | — |
| ` title ` | ` string ` | No | ` 'Select Experiment' ` | — |
| ` size ` | ` ModalSize ` | No | ` 'full' ` | — |
| ` groupByProject ` | ` boolean ` | No | ` false ` | — |
| ` showFilters ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L32) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
