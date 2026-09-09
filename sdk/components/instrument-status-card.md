---
aside: false
title: InstrumentStatusCard
description: "InstrumentStatusCard is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# InstrumentStatusCard

InstrumentStatusCard is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/InstrumentStatusCard.vue">Source</a>
</div>

<ComponentPlayground name="InstrumentStatusCard" />

## Import

```ts
import { InstrumentStatusCard } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/InstrumentStatusCard.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` status ` | ` InstrumentStatus ` | Yes | — | — |
| ` name ` | ` string ` | No | ` undefined ` | — |
| ` showPlaceholders ` | ` boolean ` | No | ` true ` | — |
| ` locale ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InstrumentStatus `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/instrument.ts#L25) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
