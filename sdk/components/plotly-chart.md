---
aside: false
title: PlotlyChart
description: "Render native Plotly traces with SDK theme, sizing, loading, empty, and error states."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PlotlyChart

Use `PlotlyChart` to render Plotly traces with the MINT theme. It loads Plotly when it mounts, follows theme and size changes, and cleans up on unmount. Declare `plotly.js-dist-min` in the plugin; see [Charts need Plotly](/sdk/frontend/#charts-need-plotly).

::: info Uses Plotly
This component loads plotly.js when it mounts. The docs do not load plotly.js. To see it work, run a plugin with `mint dev`.
:::

## Example

```vue
<script setup lang="ts">
import { PlotlyChart } from '@morscherlab/mint-sdk/lab'
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
    :config="{ displayModeBar: true, toImageButtonOptions: { filename: 'qc-intensity' } }"
  />
</template>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PlotlyChart.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` data ` | ` PlotlyType.Data[] ` | Yes | — | — |
| ` layout ` | ` Partial<PlotlyType.Layout> ` | No | ` {} ` | — |
| ` config ` | ` Partial<PlotlyType.Config> ` | No | ` {} ` | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` empty ` | ` boolean ` | No | ` false ` | — |
| ` emptyText ` | ` string ` | No | ` "No data available" ` | — |
| ` ariaLabel ` | ` string ` | No | ` "Interactive Plotly chart" ` | — |
| ` plotly ` | ` typeof PlotlyType ` | No | ` undefined ` | Use a custom Plotly build instead of the SDK's lazy-loaded default bundle. |
| ` active ` | ` boolean ` | No | ` true ` | Pause rendering while a tab or panel is inactive. |
| ` height ` | ` string \| number ` | No | ` undefined ` | Plot canvas height. Numbers are interpreted as pixels. |
| ` clickEvents ` | ` boolean ` | No | ` false ` | Forward Plotly point clicks through the plotly-click event. |
| ` variant ` | ` 'card' \| 'frame' ` | No | ` "card" ` | Shared chart container chrome. frame fills a workbench panel. |
| ` headerLegend ` | ` boolean ` | No | ` true ` | With two or more legend traces, list them in the chart header (click toggles the trace) instead of Plotly's in-plot legend. Any layout.showlegend leaves the legend to Plotly (true shows its legend, false shows none). |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` plotly-click ` | ` event: Plotly.PlotMouseEvent ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` header ` | — | — |
| ` toolbar ` | — | — |
| ` subhead ` | — | — |
| ` empty ` | — | — |
| ` error ` | — | — |
| ` legend ` | — | — |
| ` footer ` | — | — |

<!-- sdk-props:end -->

Defaults:

- Responsive rendering, no Plotly logo.
- No modebar (`displayModeBar: false`). Pass `config: { displayModeBar: true }` to show it.
- `showSendToCloud: false`. Plotly 4 shows an "Upload to Cloud" modebar button by default, which sends the figure to cloud.plotly.com.
- The `mintPlotlyTemplate()` theme: MINT fonts, the `--mint-sample-1…8` group palette, and grid and axis colors from the tokens. The chart reads it again on each theme change.

Your `layout` and `config` override these defaults.

With two or more legend traces, the chart header lists the series, and a click toggles a trace. To leave the legend to Plotly, set `headerLegend: false` or `layout.showlegend` (`true` keeps the Plotly legend in the plot, `false` shows none). The component copies the traces and the layout before Plotly gets them, so Plotly does not change your reactive state.

## Workbench charts and point clicks

- `variant="frame"` gives compact chrome that fills a workbench panel. Give the parent a definite height, and set `height="100%"`. A number in `height` is pixels.
- Set `active` to `false` to pause rendering and resizing while a kept-alive tab is hidden.
- The chart follows the size of its container. The Plotly `responsive` option is always on; `responsive: false` in `config` has no effect.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PlotlyChart } from '@morscherlab/mint-sdk/lab'

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

`plotly-click` emits the Plotly `PlotMouseEvent` only when `clickEvents` is `true`. `pointNumber` is the index of the point in its trace. To map a point of a multi-trace plot to a record, use `curveNumber` or the trace `customdata`. The component does not emit the other Plotly events.

To use your own Plotly build, pass it as `:plotly="customPlotly"`. The component then does not load `plotly.js-dist-min`. The build must be Plotly 4.1.2 or later, or the chart does not follow the size of its container. It must include the trace types you use.

## Plotly 4 builds and types

The SDK uses `plotly.js-dist-min` ^4.3.0 and does not bundle it. `PlotlyChart` loads it from the `node_modules` of your plugin when it first renders, so declare the package in the plugin; see [Charts need Plotly](/sdk/frontend/#charts-need-plotly). When Plotly cannot load, the chart shows "Unable to load the chart library." and logs the cause one time with `console.error`. When rendering fails, it shows "Unable to display this chart."

- A plugin that calls `Plotly.newPlot` itself with `mintPlotlyTemplate()` does not get the `PlotlyChart` defaults. Pass `showSendToCloud: false` in the config.
- Import Plotly types from `plotly.js-dist-min`. Do not use `@types/plotly.js`, which describes Plotly 3.
- Remove any ambient `declare module 'plotly.js-dist-min'` shim. It hides the types that Plotly 4 ships, and the `PlotlyChart` prop types stop resolving.
- Plotly 4 has no `scattermapbox`, `choroplethmapbox` or `densitymapbox` traces and no mapbox subplot. Figures that use them, such as plotly.py `px.*_mapbox` figures, do not render.

## Slots and behavior

- `header`: replaces the title and description. `toolbar` stays.
- `toolbar`: actions in the header.
- `subhead`: content between the header and the chart body.
- `empty`: replaces the empty state.
- `error`: replaces the render-failure message. The default message has `role="alert"`.
- `legend`, `footer`: content below the chart body.

Set `empty` when an analysis has no data, and bind `loading` to the request state. For another chart library, or for Plotly events that this component does not emit, use [ChartContainer](/sdk/components/chart-container).
