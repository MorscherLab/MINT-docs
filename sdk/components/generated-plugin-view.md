---
aside: false
title: GeneratedPluginView
description: "Standard generated workspace for a plugin that exposes an SDK job manifest."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedPluginView

Standard generated workspace for a plugin that exposes an SDK job manifest.

::: info Generated UI (internal)
This component renders a piece of the SDK's backend-driven **generated UI** system (`@generated_ui` / job manifests). Plugin authors typically don't place it directly; it is composed automatically inside `GeneratedPluginView`. Documented here for completeness and for authors customizing generated-UI rendering.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/GeneratedPluginView.vue">Source</a>
</div>

<ComponentPlayground name="GeneratedPluginView" />

## Import

```ts
import { GeneratedPluginView } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<GeneratedPluginView base-url="/api/peak-qc" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/GeneratedPluginView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` baseUrl ` | ` string ` | Yes | — | — |
| ` showStandaloneLabel ` | ` boolean ` | No | ` false ` | — |
| ` transport ` | ` GeneratedAnalysisTransport ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` GeneratedAnalysisTransport `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/composables/useGeneratedAnalysis.ts#L33) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
