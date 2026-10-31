---
aside: false
title: InstrumentStatusPanels
description: "Card with one tab for each typed panel of an instrument live status."
---

<p class="mint-component-library__eyebrow">Data display</p>

# InstrumentStatusPanels

Card with one tab for each typed panel of an instrument live status.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/InstrumentStatusPanels.vue">Source</a>
</div>

<demo vue="./demos/InstrumentStatusPanels.vue" title="InstrumentStatusPanels" description="Four panel kinds in tabs. Switch tabs and pick the series of the bar chart." />

## Import

```ts
import { InstrumentStatusPanels } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/InstrumentStatusPanels.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` panels ` | ` StatusPanel[] ` | Yes | — | — |
| ` title ` | ` string ` | No | ` "Live data" ` | — |
| ` meta ` | ` string ` | No | ` undefined ` | Monospace meta next to the title, e.g. the reporting plugin and report age. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` StatusPanel `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/instrument.ts#L64) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
