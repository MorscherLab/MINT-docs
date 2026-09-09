---
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

## Props

| Prop | Type | Default / purpose |
|------|------|-------------------|
| `data` | `Plotly.Data[]` | Required traces |
| `layout` | `Partial<Plotly.Layout>` | `{}`; axes, annotations, limits, and layout |
| `config` | `Partial<Plotly.Config>` | `{}`; mode bar, export, and interaction options |
| `title`, `description` | `string` | Optional chart header |
| `loading` | `boolean` | `false`; show loading state |
| `empty` | `boolean` | `false`; explicitly show empty state |
| `emptyMessage` | `string` | `No data available` |
| `ariaLabel` | `string` | `Interactive Plotly chart`; provide a meaningful plot description |

The component defaults to responsive rendering and hides the Plotly logo. Your `layout` and `config` override those defaults. Input traces/layout are copied before Plotly receives them, so Plotly's mutations do not modify caller-owned reactive state.

## Slots and behavior

- `toolbar`: extra actions in the header.
- `empty`: replace the default empty-state content.
- `error`: replace the rendering-failure message; the default message has `role="alert"`.

Set `empty` yourself when an analysis has no data. Bind `loading` to request state and keep axis labels/units explicit. The component does not expose Plotly click/selection events as Vue emits in 1.2. For custom chart libraries or event bindings beyond this API, use [ChartContainer](/sdk/components/chart-container).

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/PlotlyChart.vue) · [Frontend tutorial](/sdk/tutorials/adding-a-frontend) · [Component library](/sdk/components/)
