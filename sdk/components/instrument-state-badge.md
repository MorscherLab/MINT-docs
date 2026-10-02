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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/InstrumentStateBadge.vue">Source</a>
</div>

<ComponentPlayground name="InstrumentStateBadge" />

## Import

```ts
import { InstrumentStateBadge } from "@morscherlab/mint-sdk/components"
```

## States

The `state` prop takes an `InstrumentBadgeState`: the `InstrumentState` values plus `never` and `inactive`. Other strings render as a muted badge with a capitalized label.

| State | Label | Tone |
|-------|-------|------|
| `running` | Running | info |
| `connected` | Connected | success |
| `standby` | Standby | warning |
| `error` | Error | error |
| `idle` | Idle | muted |
| `disconnected` | Offline | muted |
| `never` | Never reported | muted |
| `inactive` | Inactive | muted |

`never` and `inactive` are states that the platform derives. `never` means the instrument has sent no report yet. `label` replaces the default label. `pulseWhenRunning` (default `true`) pulses the badge in the `running` state.

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/InstrumentStateBadge.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` state ` | ` InstrumentBadgeState \| string ` | Yes | — | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` pulseWhenRunning ` | ` boolean ` | No | ` true ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InstrumentBadgeState `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/instrument.ts#L44) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
