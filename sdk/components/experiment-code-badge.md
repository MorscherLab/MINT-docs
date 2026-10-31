---
aside: false
title: ExperimentCodeBadge
description: "ExperimentCodeBadge is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ExperimentCodeBadge

ExperimentCodeBadge is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ExperimentCodeBadge.vue">Source</a>
</div>

<demo vue="./demos/ExperimentCodeBadge.vue" title="ExperimentCodeBadge" description="Experiment code badges in two sizes. Copy the code from the default badge." />

## Import

```ts
import { ExperimentCodeBadge } from "@morscherlab/mint-sdk/data"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ExperimentCodeBadge.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` code ` | ` string ` | Yes | — | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` copyable ` | ` boolean ` | No | ` true ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` copy ` | ` code: string ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
