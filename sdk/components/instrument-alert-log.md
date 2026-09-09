---
aside: false
title: InstrumentAlertLog
description: "InstrumentAlertLog is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# InstrumentAlertLog

InstrumentAlertLog is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/InstrumentAlertLog.vue">Source</a>
</div>

<ComponentPlayground name="InstrumentAlertLog" />

## Import

```ts
import { InstrumentAlertLog } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/InstrumentAlertLog.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` alerts ` | ` InstrumentAlert[] ` | No | ` () => [] ` | — |
| ` title ` | ` string ` | No | ` 'Event Log' ` | — |
| ` acknowledgeable ` | ` boolean ` | No | ` true ` | — |
| ` emptyMessage ` | ` string ` | No | ` 'No alerts received yet' ` | — |
| ` filteredEmptyMessage ` | ` string ` | No | ` 'No alerts match current filters' ` | — |
| ` locale ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InstrumentAlert `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/instrument.ts#L50) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
