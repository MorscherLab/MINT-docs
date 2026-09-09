---
aside: false
title: ColorSlider
description: "ColorSlider is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# ColorSlider

ColorSlider is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ColorSlider.vue">Source</a>
</div>

<ComponentPlayground name="ColorSlider" />

## Import

```ts
import { ColorSlider } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ColorSlider.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` 0 ` | — |
| ` max ` | ` number ` | No | ` 100 ` | — |
| ` step ` | ` number ` | No | ` 1 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` showValue ` | ` boolean ` | No | ` true ` | — |
| ` showLabels ` | ` boolean ` | No | ` false ` | — |
| ` minLabel ` | ` string ` | No | ` undefined ` | — |
| ` maxLabel ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` colorStops ` | ` ColorStop[] ` | No | ` undefined ` | Color stops for the gradient. Default: green (low) → yellow (mid) → red (high) |
| ` thresholds ` | ` [number, number] ` | No | ` undefined ` | Thresholds for value badge color. Default: green ≤ threshold1, yellow ≤ threshold2, red above |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ColorStop `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ColorSlider.vue#L5) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
