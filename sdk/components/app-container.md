---
aside: false
title: AppContainer
description: "Lightweight content shell for standalone plugin screens and routed views."
---

<p class="mint-component-library__eyebrow">Layout</p>

# AppContainer

Lightweight content shell for standalone plugin screens and routed views.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AppContainer.vue">Source</a>
</div>

<ComponentPlayground name="AppContainer" />

## Import

```ts
import { AppContainer } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AppContainer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` scrollable ` | ` boolean ` | No | ` false ` | Makes the container scrollable (overflow-y: auto). Ignored when direction is set. |
| ` direction ` | ` 'row' \| 'column' ` | No | ` undefined ` | Renders as a transparent flex container instead of a card. |
| ` gap ` | ` string ` | No | ` '1rem' ` | Flex gap between children. Only applies when direction is set. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
