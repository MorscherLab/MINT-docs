---
aside: false
title: GeneratedResultRenderer
description: "Renders standardized text, table, image, Plotly, JSON, and artifact job results."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedResultRenderer

`GeneratedResultRenderer` draws a job result of a generated plugin UI: text, table, image, Plotly, JSON or artifact.

::: info Generated UI
[GeneratedPluginView](/sdk/components/generated-plugin-view) places this component for you. Use it directly only to change how a generated UI renders.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/GeneratedResultRenderer.vue">Source</a>
</div>

<demo vue="./demos/GeneratedResultRenderer.vue" title="GeneratedResultRenderer" description="A table result of four metabolites with m/z and retention time. Search and sort the rows." />

## Import

```ts
import { GeneratedResultRenderer } from "@morscherlab/mint-sdk/runtime"
```

## Artifact downloads

For an `artifact` result with a `download_url`, the renderer downloads the file through the SDK transport, which adds the Bearer credential. Do not use a plain link or your own `fetch` for a plugin route: they get a 401. See [Platform authentication gate](/sdk/recipes/route-permissions#platform-authentication-gate).

## Basic Usage

```vue
<GeneratedResultRenderer :result="result" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/GeneratedResultRenderer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` result ` | ` GeneratedAnalysisResult ` | Yes | — | — |
| ` searchable ` | ` boolean ` | No | ` true ` | Show the search box above a table result. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` GeneratedAnalysisResult `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/generated-ui.ts#L175) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
