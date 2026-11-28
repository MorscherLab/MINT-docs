---
aside: false
title: PlotlyChart
description: "Render native Plotly traces with SDK theme, sizing, loading, empty, and error states."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PlotlyChart

`PlotlyChart` renders native Plotly traces inside `ChartContainer`, loads Plotly lazily when mounted, follows theme/container changes, and cleans up on unmount. The plugin declares `plotly.js-dist-min` in its own frontend dependencies (`vp add plotly.js-dist-min`). See [Charts need Plotly](/sdk/frontend/#charts-need-plotly).

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

The component defaults to responsive rendering, hides the Plotly logo, hides the modebar (`displayModeBar: false`; pass `config: { displayModeBar: true }` to restore it), and sets `showSendToCloud: false`. Plotly 4 shows the modebar "Upload to Cloud" button by default, and that button sends the figure to cloud.plotly.com. The component applies `mintPlotlyTemplate()` (MINT fonts, the `--mint-sample-1…8` group palette, token-based grid and axis colors) and re-reads it on every theme change. Your `layout` and `config` override those defaults.

With two or more legend traces, the series are listed in the chart header and a click toggles the trace. Set `headerLegend: false`, or set `layout.showlegend` (`true` keeps Plotly's in-plot legend, `false` shows none), to leave the legend to Plotly. Input traces/layout are copied before Plotly receives them, so Plotly's mutations do not modify caller-owned reactive state.

## Workbench charts and point clicks

Set `variant="frame"` for compact chrome that fills a workbench panel. Give the parent a definite height and set `height="100%"` on the plot canvas. Numeric `height` values are pixels. Use `active` to pause rendering and resize work while a retained tab is hidden. The chart follows the size of its container with the Plotly `responsive` option. `responsive` is always on; `responsive: false` in `config` has no effect.

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

`plotly-click` emits Plotly's `PlotMouseEvent` only when `clickEvents` is enabled. `pointNumber` is the point index within its trace; use `curveNumber` or trace `customdata` when mapping a multi-trace plot to domain records. The SDK does not expose every Plotly event as a Vue emit.

If your application already owns a compatible custom Plotly build, pass it through `:plotly="customPlotly"` to bypass the default lazy import. That build must be Plotly 4.1.2 or later, or the chart does not follow the size of its container, and it must include the trace types you use. A plugin that always passes its own build does not need the `plotly.js-dist-min` package. Otherwise retain the SDK default; a custom build is optional.

## Plotly 4 builds and types

The SDK uses `plotly.js-dist-min` ^4.3.0. The SDK `dist/` does not bundle Plotly. `PlotlyChart` loads Plotly lazily from your plugin's `node_modules` when it first renders. Declare the package in the plugin: `mint doctor` gives the warning "Frontend chart dependency" when it is missing, and `--strict` counts it. When Plotly cannot load, the chart shows "Unable to load the chart library." and logs the cause one time with `console.error`. A render failure shows "Unable to display this chart."

- A plugin that calls `Plotly.newPlot` itself with `mintPlotlyTemplate()` does not get the `PlotlyChart` defaults. Pass `showSendToCloud: false` in the config.
- Import Plotly types from `plotly.js-dist-min`. Do not use `@types/plotly.js`, which describes Plotly 3.
- Remove any ambient `declare module 'plotly.js-dist-min'` shim. It hides the types that Plotly 4 ships, and the `PlotlyChart` prop types stop resolving.
- Plotly 4 removes the `scattermapbox`, `choroplethmapbox`, and `densitymapbox` traces and the mapbox subplot. Figures that use them, such as plotly.py `px.*_mapbox` figures, do not render.

## Slots and behavior

- `header`: replace the title/description content; `toolbar` remains separate.
- `toolbar`: extra actions in the header.
- `subhead`: content between the header and chart body.
- `empty`: replace the default empty-state content.
- `error`: replace the rendering-failure message; the default message has `role="alert"`.
- `legend`, `footer`: content below the chart body.

Set `empty` yourself when an analysis has no data. Bind `loading` to request state and keep axis labels/units explicit. For another chart library or event bindings beyond this API, use [ChartContainer](/sdk/components/chart-container).

[Release source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PlotlyChart.vue) · [Frontend tutorial](/sdk/tutorials/adding-a-frontend) · [Component library](/sdk/components/)
