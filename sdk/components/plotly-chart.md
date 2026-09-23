---
aside: false
title: PlotlyChart
description: "Render native Plotly traces with SDK theme, sizing, loading, empty, and error states."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PlotlyChart

Available since **1.2.0**. `PlotlyChart` renders native Plotly traces inside `ChartContainer`, loads Plotly lazily when mounted, follows theme/container changes, and cleans up on unmount.

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

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/PlotlyChart.vue).

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
| ` plotly ` | ` typeof PlotlyType ` | No | ` undefined ` | Use a custom Plotly build instead of the SDK's lazy-loaded default bundle. |
| ` active ` | ` boolean ` | No | ` true ` | Pause rendering and resize work while a tab or panel is inactive. |
| ` height ` | ` string \| number ` | No | ` undefined ` | Plot canvas height. Numbers are interpreted as pixels. |
| ` clickEvents ` | ` boolean ` | No | ` false ` | Forward Plotly point clicks through the plotly-click event. |
| ` variant ` | ` 'card' \| 'frame' ` | No | ` 'card' ` | Shared chart container chrome. frame fills a workbench panel. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

The component defaults to responsive rendering and hides the Plotly logo. Your `layout` and `config` override those defaults. Input traces/layout are copied before Plotly receives them, so Plotly's mutations do not modify caller-owned reactive state.

## Workbench charts and point clicks

In 1.2.6, set `variant="frame"` for compact chrome that fills a workbench panel. Give the parent a definite height and set `height="100%"` on the plot canvas. Numeric `height` values are pixels. Use `active` to pause rendering and resize work while a retained tab is hidden.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PlotlyChart } from '@morscherlab/mint-sdk'

const active = ref(true)
const selectedPoint = ref<number | null>(null)
</script>

<template>
  <div class="qc-panel">
    <PlotlyChart
      variant="frame"
      height="100%"
      title="QC intensity"
      :active="active"
      :click-events="true"
      :data="[{ type: 'scatter', mode: 'markers', x: [1, 2, 3], y: [100, 98, 102] }]"
      @plotly-click="selectedPoint = $event.points[0]?.pointNumber ?? null"
    >
      <template #subhead><p>Select a point to inspect its injection.</p></template>
      <template #footer>Selected point: {{ selectedPoint ?? 'None' }}</template>
    </PlotlyChart>
  </div>
</template>

<style scoped>
.qc-panel { height: 24rem; min-height: 0; }
</style>
```

`plotly-click` emits Plotly's `PlotMouseEvent` only when `clickEvents` is enabled. `pointNumber` is the point index within its trace; use `curveNumber` or trace `customdata` when mapping a multi-trace plot to domain records. The SDK does not expose every Plotly event as a Vue emit.

If your application already owns a compatible custom Plotly build, pass it through `:plotly="customPlotly"` to bypass the default lazy import. That build must include the trace types you use. Otherwise retain the SDK default; a custom build is optional.

## Slots and behavior

- `header`: replace the title/description content; `toolbar` remains separate.
- `toolbar`: extra actions in the header.
- `subhead`: content between the header and chart body.
- `empty`: replace the default empty-state content.
- `error`: replace the rendering-failure message; the default message has `role="alert"`.
- `legend`, `footer`: content below the chart body.

Set `empty` yourself when an analysis has no data. Bind `loading` to request state and keep axis labels/units explicit. For another chart library or event bindings beyond this API, use [ChartContainer](/sdk/components/chart-container).

[Release source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/PlotlyChart.vue) · [Frontend tutorial](/sdk/tutorials/adding-a-frontend) · [Component library](/sdk/components/)
