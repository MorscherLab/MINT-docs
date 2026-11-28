---
aside: false
title: InstrumentStateBadge
description: "Status badge for instrument states, including the platform states never and inactive."
---

<p class="mint-component-library__eyebrow">Data display</p>

# InstrumentStateBadge

Use `InstrumentStateBadge` to show the state of an instrument as a colored badge.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/InstrumentStateBadge.vue">Source</a>
</div>

<demo vue="./demos/InstrumentStateBadge.vue" title="InstrumentStateBadge" description="Badges for four instrument states: running, standby, error and disconnected." />

## Import

```ts
import { InstrumentStateBadge } from "@morscherlab/mint-sdk/lab"
```

## States

The `state` prop takes an `InstrumentBadgeState`: the `InstrumentState` values plus `never` and `inactive`. Another string shows as a muted badge with a capitalized label.

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

The platform derives `never` and `inactive`. `never` means that the instrument has sent no report yet. `label` replaces the default label. `pulseWhenRunning` (default `true`) pulses the badge in the `running` state.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/InstrumentStateBadge.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` state ` | ` InstrumentBadgeState \| string ` | Yes | — | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` pulseWhenRunning ` | ` boolean ` | No | ` true ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` InstrumentBadgeState `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/instrument.ts#L28) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
