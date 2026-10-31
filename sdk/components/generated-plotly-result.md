---
aside: false
title: GeneratedPlotlyResult
description: "Renders a generated job's Plotly result spec, with a static image fallback."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedPlotlyResult

Renders a generated job's Plotly result spec, with a static image fallback.

::: info Generated UI (internal)
This component renders a piece of the SDK's backend-driven **generated UI** system (`@generated_ui` / job manifests). Plugin authors typically don't place it directly; it is composed automatically inside `GeneratedPluginView`. Documented here for completeness and for authors customizing generated-UI rendering.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/GeneratedPlotlyResult.vue">Source</a>
</div>

::: info Uses Plotly
This component renders a job result with `PlotlyChart`. The docs do not load plotly.js. To see it work, run a plugin with `mint dev`.
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

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/GeneratedPlotlyResult.vue).

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
