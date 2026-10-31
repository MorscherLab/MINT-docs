---
aside: false
title: DatePicker
description: "DatePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# DatePicker

DatePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/DatePicker.vue">Source</a>
</div>

<ComponentPlayground name="DatePicker" />

## Import

```ts
import { DatePicker } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/DatePicker.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` type ` | ` 'date' \| 'time' \| 'datetime' ` | No | ` 'date' ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` min ` | ` string ` | No | ` undefined ` | Earliest value, in the format of the bound value. |
| ` max ` | ` string ` | No | ` undefined ` | Latest value, in the format of the bound value. |
| ` clearable ` | ` boolean ` | No | ` undefined ` | Show a clear button. Default: true for date, false otherwise. |
| ` step ` | ` number ` | No | ` undefined ` | Minutes between time slots (time, datetime). |
| ` format ` | ` '12h' \| '24h' ` | No | ` undefined ` | Clock format of the time slots (time, datetime). |
| ` locale ` | ` string ` | No | ` undefined ` | Locale of the calendar (datetime). |
| ` disabledSlots ` | ` TimeSlotDisabledFn ` | No | ` undefined ` | Marks time slots unavailable; a returned string is shown inline as the reason (time). |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TimeSlotDisabledFn `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L66) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
