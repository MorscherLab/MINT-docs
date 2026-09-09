---
aside: false
title: ExperimentTimeline
description: "ExperimentTimeline is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# ExperimentTimeline

ExperimentTimeline is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentTimeline.vue">Source</a>
</div>

<ComponentPlayground name="ExperimentTimeline" />

## Import

```ts
import { ExperimentTimeline } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ExperimentTimeline.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ProtocolStep[] ` | No | ` () => [] ` | — |
| ` orientation ` | ` 'horizontal' \| 'vertical' ` | No | ` 'vertical' ` | — |
| ` showDuration ` | ` boolean ` | No | ` true ` | — |
| ` showTime ` | ` boolean ` | No | ` false ` | — |
| ` editable ` | ` boolean ` | No | ` false ` | — |
| ` collapsible ` | ` boolean ` | No | ` true ` | — |
| ` expandedStepId ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` colorByStatus ` | ` boolean ` | No | ` true ` | — |
| ` colorByType ` | ` boolean ` | No | ` false ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the timeline with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the timeline is replaced by an error state. null/undefined renders normally. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ProtocolStep `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L150) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
