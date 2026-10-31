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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ExperimentSelectorModal.vue">Source</a>
</div>

<demo vue="./demos/ExperimentSelectorModal.vue" title="ExperimentSelectorModal" description="Experiment picker with filters and project groups. Open it, select an experiment, and read the result." />

## Import

```ts
import { ExperimentSelectorModal } from "@morscherlab/mint-sdk/data"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ExperimentSelectorModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` experimentType ` | ` string ` | No | ` undefined ` | — |
| ` allowedExperimentTypes ` | ` string[] \| null ` | No | ` undefined ` | — |
| ` currentExperimentId ` | ` number \| null ` | No | ` null ` | — |
| ` title ` | ` string ` | No | ` "Select Experiment" ` | — |
| ` size ` | ` ModalSize ` | No | ` "lg" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ModalSize `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L39) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:open ` | ` value: boolean ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` description ` | — | Text above the experiment list: why the caller asks for an experiment. |
| ` footer ` | ` { close: () => void; } ` | Extra footer content, before Clear selection. close() closes the modal without a selection. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
