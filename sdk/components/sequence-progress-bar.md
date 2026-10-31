---
aside: false
title: SequenceProgressBar
description: "SequenceProgressBar is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# SequenceProgressBar

SequenceProgressBar is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SequenceProgressBar.vue">Source</a>
</div>

<demo vue="./demos/SequenceProgressBar.vue" title="SequenceProgressBar" description="Progress bar for an instrument sequence with sample count and times. Check the current sample and the time left." />

## Import

```ts
import { SequenceProgressBar } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SequenceProgressBar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` progress ` | ` SequenceProgress ` | Yes | — | — |
| ` compact ` | ` boolean ` | No | ` false ` | — |
| ` label ` | ` string ` | No | ` "samples" ` | — |
| ` showEta ` | ` boolean ` | No | ` true ` | — |
| ` showRemaining ` | ` boolean ` | No | ` true ` | — |
| ` failed ` | ` number ` | No | ` 0 ` | Failed injections so far; shown as "N failed" in the head when above 0. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SequenceProgress `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/instrument.ts#L14) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
