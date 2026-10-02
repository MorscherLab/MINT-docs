---
aside: false
title: BaseSlider
description: "BaseSlider is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseSlider

BaseSlider is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/BaseSlider.vue">Source</a>
</div>

<ComponentPlayground name="BaseSlider" />

## Import

```ts
import { BaseSlider } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/BaseSlider.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` 0 ` | — |
| ` max ` | ` number ` | No | ` 100 ` | — |
| ` step ` | ` number ` | No | ` 1 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` showValue ` | ` boolean ` | No | ` true ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` colorStops ` | ` SliderColorStop[] ` | No | ` undefined ` | Paint the track with a gradient through these stops instead of the primary fill. |
| ` thresholds ` | ` [number, number] ` | No | ` undefined ` | Tone the value badge by percent of range: success up to the first, warning up to the second, error above. |
| ` showLabels ` | ` boolean ` | No | ` false ` | Show the range ends under the slider. |
| ` minLabel ` | ` string ` | No | ` undefined ` | Label for the low end. Defaults to min. |
| ` maxLabel ` | ` string ` | No | ` undefined ` | Label for the high end. Defaults to max. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SliderColorStop `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/BaseSlider.vue#L8) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
