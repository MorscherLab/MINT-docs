---
aside: false
title: InstrumentStateBadge
description: "InstrumentStateBadge is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# InstrumentStateBadge

InstrumentStateBadge is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/InstrumentStateBadge.vue">Source</a>
</div>

<ComponentPlayground name="InstrumentStateBadge" />

## Import

```ts
import { InstrumentStateBadge } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/InstrumentStateBadge.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` state ` | ` InstrumentState \| string ` | Yes | — | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` pulseWhenRunning ` | ` boolean ` | No | ` true ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InstrumentState `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/instrument.ts#L1) | ` 'idle' \| 'running' \| 'standby' \| 'connected' \| 'disconnected' \| 'error' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
