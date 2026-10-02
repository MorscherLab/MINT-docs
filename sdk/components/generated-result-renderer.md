---
aside: false
title: GeneratedResultRenderer
description: "Renders standardized text, table, image, Plotly, JSON, and artifact job results."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# GeneratedResultRenderer

Renders standardized text, table, image, Plotly, JSON, and artifact job results.

::: info Generated UI (internal)
This component renders a piece of the SDK's backend-driven **generated UI** system (`@generated_ui` / job manifests). Plugin authors typically don't place it directly; it is composed automatically inside `GeneratedPluginView`. Documented here for completeness and for authors customizing generated-UI rendering.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/GeneratedResultRenderer.vue">Source</a>
</div>

<ComponentPlayground name="GeneratedResultRenderer" />

## Import

```ts
import { GeneratedResultRenderer } from "@morscherlab/mint-sdk/components"
```

## Artifact downloads

For an `artifact` result with a `download_url`, the renderer downloads the file through the SDK transport. The transport adds the Bearer credential. With auth enabled, the platform does not read the session cookie on plugin routes. A plain link or a `fetch` without a Bearer gets a 401, so do not use them for plugin routes.

## Basic Usage

```vue
<GeneratedResultRenderer :result="result" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/GeneratedResultRenderer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` result ` | ` GeneratedAnalysisResult ` | Yes | — | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` GeneratedAnalysisResult `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/generated-ui.ts#L152) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
