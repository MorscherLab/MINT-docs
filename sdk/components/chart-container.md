---
aside: false
title: ChartContainer
description: "ChartContainer is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ChartContainer

`ChartContainer` supplies chart chrome, loading and empty states, and slots around a renderer you own. For native Plotly rendering and lifecycle management, use [PlotlyChart](/sdk/components/plotly-chart).

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/ChartContainer.vue">Source</a>
</div>

<ComponentPlayground name="ChartContainer" />

## Import

```ts
import { ChartContainer } from "@morscherlab/mint-sdk/components"
```

## Workbench frame

```vue
<script setup lang="ts">
import { ChartContainer } from '@morscherlab/mint-sdk'
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

The default `card` variant has a border and rounded corners. `frame` fills a parent with a definite height and uses compact header spacing; give your chart renderer an appropriate height too. This component does not resize or dispose an external chart library for you.

| Slot | Placement |
|------|-----------|
| `default` | Chart body when neither loading nor empty |
| `header` | Replaces the title/description block |
| `toolbar` | Separate actions alongside the header |
| `subhead` | Between header and body |
| `empty` | Replaces the empty state |
| `legend` | Below the chart body |
| `footer` | Bottom of the frame/card |

When `loading` is true the normal body slot is not rendered. Initialize custom renderers on their component mount and dispose them on unmount. Use `PlotlyChart` when you want the SDK to own that lifecycle.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/ChartContainer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` empty ` | ` boolean ` | No | ` false ` | — |
| ` emptyMessage ` | ` string ` | No | ` 'No data available' ` | — |
| ` variant ` | ` 'card' \| 'frame' ` | No | ` 'card' ` | frame fills its parent and uses compact workbench chrome. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
