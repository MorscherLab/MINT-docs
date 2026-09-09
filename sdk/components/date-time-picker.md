---
aside: false
title: DateTimePicker
description: "DateTimePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# DateTimePicker

DateTimePicker is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DateTimePicker.vue">Source</a>
</div>

<ComponentPlayground name="DateTimePicker" />

## Import

```ts
import { DateTimePicker } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/DateTimePicker.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` placeholder ` | ` string ` | No | ` 'Select date & time' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` min ` | ` string ` | No | ` undefined ` | — |
| ` max ` | ` string ` | No | ` undefined ` | — |
| ` timeStep ` | ` number ` | No | ` 15 ` | — |
| ` timeFormat ` | ` '12h' \| '24h' ` | No | ` '24h' ` | — |
| ` clearable ` | ` boolean ` | No | ` false ` | — |
| ` locale ` | ` string ` | No | ` 'en-US' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
