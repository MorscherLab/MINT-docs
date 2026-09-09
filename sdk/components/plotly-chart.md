---
aside: false
title: PlotlyChart
description: "Render native Plotly traces with SDK theme, sizing, loading, empty, and error states."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PlotlyChart

Available in **1.2.0**. `PlotlyChart` renders native Plotly traces inside `ChartContainer`, loads Plotly lazily when mounted, follows theme/container changes, and cleans up on unmount.

## Example

```vue
<script setup lang="ts">
import { PlotlyChart } from '@morscherlab/mint-sdk'
</script>

<template>
  <PlotlyChart
    title="QC intensity"
    description="Peak intensity across sequential injections"
    aria-label="Peak intensity by injection number"
    :data="[{ type: 'scatter', mode: 'lines+markers', x: [1, 2, 3], y: [100, 98, 102] }]"
    :layout="{
      xaxis: { title: { text: 'Injection' } },
      yaxis: { title: { text: 'Intensity (a.u.)' } },
    }"
    :config="{ toImageButtonOptions: { filename: 'qc-intensity' } }"
  />
</template>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/PlotlyChart.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` data ` | ` PlotlyType.Data[] ` | Yes | — | — |
| ` layout ` | ` Partial<PlotlyType.Layout> ` | No | ` () => ({}) ` | — |
| ` config ` | ` Partial<PlotlyType.Config> ` | No | ` () => ({}) ` | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` empty ` | ` boolean ` | No | ` false ` | — |
| ` emptyMessage ` | ` string ` | No | ` 'No data available' ` | — |
| ` ariaLabel ` | ` string ` | No | ` 'Interactive Plotly chart' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

The component defaults to responsive rendering and hides the Plotly logo. Your `layout` and `config` override those defaults. Input traces/layout are copied before Plotly receives them, so Plotly's mutations do not modify caller-owned reactive state.

## Slots and behavior

- `toolbar`: extra actions in the header.
- `empty`: replace the default empty-state content.
- `error`: replace the rendering-failure message; the default message has `role="alert"`.

Set `empty` yourself when an analysis has no data. Bind `loading` to request state and keep axis labels/units explicit. The component does not expose Plotly click/selection events as Vue emits in 1.2. For custom chart libraries or event bindings beyond this API, use [ChartContainer](/sdk/components/chart-container).

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/PlotlyChart.vue) · [Frontend tutorial](/sdk/tutorials/adding-a-frontend) · [Component library](/sdk/components/)
