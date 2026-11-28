---
aside: false
title: ChartContainer
description: "Chart frame with header, toolbar, loading and empty states, and legend, around a renderer you own."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ChartContainer

Use `ChartContainer` to frame a chart from another library: header, toolbar, loading and empty states, and legend. For Plotly, use [PlotlyChart](/sdk/components/plotly-chart), which also loads, resizes and disposes the chart.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ChartContainer.vue">Source</a>
</div>

<demo vue="./demos/ChartContainer.vue" title="ChartContainer" description="Chart frame with a toolbar button and a legend. Use it to wrap any chart content." />

## Import

```ts
import { ChartContainer } from "@morscherlab/mint-sdk/lab"
```

## Workbench frame

```vue
<script setup lang="ts">
import { ChartContainer } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <div class="chart-panel">
    <ChartContainer variant="frame" title="QC overview" :empty="true">
      <template #subhead><p>Choose an experiment to load its results.</p></template>
      <template #empty><p>No result has been selected.</p></template>
      <template #footer>Intensity is reported in arbitrary units.</template>
    </ChartContainer>
  </div>
</template>

<style scoped>
.chart-panel { height: 24rem; min-height: 0; }
</style>
```

- The component has no frame of its own. Put it in a [SectionCard](/sdk/components/section-card#content-in-a-card).
- `variant="frame"` fills a parent with a definite height. Give your chart renderer a height too.
- Both variants have one header: a one-line title and description above a hairline.
- With `empty`, the body shows an `EmptyState` with a chart icon. `emptyText`, `emptyHint` and the `#empty` slot change it.
- `legendItems` (`{ label, color, hidden? }[]`) lists the series as clickable items in the header. A click emits `legend-toggle` with the item index. Your renderer applies the change.

| Slot | Placement |
|------|-----------|
| `default` | Chart body when neither loading nor empty |
| `header` | Replaces the title/description block |
| `toolbar` | Separate actions alongside the header |
| `subhead` | Between header and body |
| `empty` | Replaces the empty state |
| `legend` | Below the chart body |
| `footer` | Bottom of the frame/card |

While `loading` is `true`, the default slot does not render. The component does not resize or dispose your chart. Create the chart when its component mounts and dispose it on unmount.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ChartContainer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` empty ` | ` boolean ` | No | ` false ` | — |
| ` emptyText ` | ` string ` | No | ` "No data available" ` | — |
| ` emptyHint ` | ` string ` | No | ` undefined ` | Muted line under the empty title. |
| ` variant ` | ` 'card' \| 'frame' ` | No | ` "card" ` | frame fills its parent and uses compact workbench chrome. |
| ` legendItems ` | ` ChartLegendItem[] ` | No | ` undefined ` | Series shown as clickable items in the header; a click emits legend-toggle. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ChartLegendItem `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L388) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` legend-toggle ` | ` index: number ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | — | — |
| ` header ` | — | — |
| ` toolbar ` | — | — |
| ` subhead ` | — | — |
| ` empty ` | — | — |
| ` legend ` | — | — |
| ` footer ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
