---
aside: false
title: TimeRangeInput
description: "Paired start/end time pickers that validate range order and display computed duration."
---

<p class="mint-component-library__eyebrow">Forms</p>

# TimeRangeInput

Paired start/end time pickers that validate range order and display computed duration.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/TimeRangeInput.vue">Source</a>
</div>

<ComponentPlayground name="TimeRangeInput" />

## Import

```ts
import { TimeRangeInput } from "@morscherlab/mint-sdk/components"
```

## Validation

When end ≤ start, the fields show "End time must be after start time". The component emits `validity-change(valid)` on mount and whenever validity flips, and exposes `isValid` through a template ref so a form can block submit. With `showDuration`, the duration reads like `1 h 30 min` and shows "—" for an incomplete or inverted range. `disabledSlots` is forwarded to both pickers.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/TimeRangeInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` TimeRange ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` min ` | ` string ` | No | ` undefined ` | — |
| ` max ` | ` string ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` 15 ` | — |
| ` format ` | ` '12h' \| '24h' ` | No | ` '24h' ` | — |
| ` showDuration ` | ` boolean ` | No | ` true ` | — |
| ` blockedRanges ` | ` TimeRange[] ` | No | ` () => [] ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TimeRange `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L62) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
