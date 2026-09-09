---
aside: false
title: TimeRangeInput
description: "TimeRangeInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# TimeRangeInput

TimeRangeInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/TimeRangeInput.vue">Source</a>
</div>

<ComponentPlayground name="TimeRangeInput" />

## Import

```ts
import { TimeRangeInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/TimeRangeInput.vue).

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
| [` TimeRange `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L62) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
