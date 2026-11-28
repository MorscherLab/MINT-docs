---
aside: false
title: GeneratedPlotlyResult
description: "Renders a generated job's Plotly result spec, with a static image fallback."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedPlotlyResult

`GeneratedPlotlyResult` draws the Plotly result of a generated job. It shows a static image when the chart cannot render.

::: info Generated UI
[GeneratedPluginView](/sdk/components/generated-plugin-view) places this component for you. Use it directly only to change how a generated UI renders.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/GeneratedPlotlyResult.vue">Source</a>
</div>

::: info Uses Plotly
This component renders a job result with `PlotlyChart`, so the plugin must declare `plotly.js-dist-min`; see [Charts need Plotly](/sdk/frontend/#charts-need-plotly). The docs do not load plotly.js. To see it work, run a plugin with `mint dev`.
:::

## Import

```ts
import { GeneratedPlotlyResult } from "@morscherlab/mint-sdk/runtime"
```

## Basic Usage

```vue
<GeneratedPlotlyResult :spec="plotlySpec" :fallback="staticFallback" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/GeneratedPlotlyResult.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` Record<string, unknown> ` | Yes | — | — |
| ` fallback ` | ` { media_type: string; data: string } ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
