---
aside: false
title: TimePicker
description: "TimePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# TimePicker

TimePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/TimePicker.vue">Source</a>
</div>

<ComponentPlayground name="TimePicker" />

## Import

```ts
import { TimePicker } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/TimePicker.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` placeholder ` | ` string ` | No | ` 'Select time' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` min ` | ` string ` | No | ` undefined ` | — |
| ` max ` | ` string ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` 15 ` | — |
| ` format ` | ` '12h' \| '24h' ` | No | ` '24h' ` | — |
| ` clearable ` | ` boolean ` | No | ` false ` | — |
| ` disabledSlots ` | ` TimeSlotDisabledFn ` | No | ` undefined ` | Marks slots unavailable; a returned string is shown inline as the reason. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` TimeSlotDisabledFn `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L67) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
