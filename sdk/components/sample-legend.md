---
aside: false
title: SampleLegend
description: "SampleLegend is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# SampleLegend

SampleLegend is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SampleLegend.vue">Source</a>
</div>

<ComponentPlayground name="SampleLegend" />

## Import

```ts
import { SampleLegend } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SampleLegend.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` samples ` | ` SampleType[] ` | Yes | ` () => [] ` | — |
| ` showCounts ` | ` boolean ` | No | ` true ` | — |
| ` editable ` | ` boolean ` | No | ` false ` | — |
| ` colorPalette ` | ` string[] ` | No | ` () => [...SAMPLE_COLOR_SCALE] ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` orientation ` | ` 'vertical' \| 'horizontal' ` | No | ` 'vertical' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SampleType `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L122) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
