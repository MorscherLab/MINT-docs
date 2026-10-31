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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppContainer.vue">Source</a>
</div>

<demo vue="./demos/AppContainer.vue" title="AppContainer" description="A row of three cards inside a container. Read how the container sets direction and gap." />

## Import

```ts
import { AppContainer } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AppContainer.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` scrollable ` | ` boolean ` | No | ` false ` | Makes the container scrollable (overflow-y: auto). Ignored when direction is set. |
| ` direction ` | ` 'row' \| 'column' ` | No | ` undefined ` | Renders as a transparent flex container instead of a card. |
| ` gap ` | ` string ` | No | ` "1rem" ` | Flex gap between children. Only applies when direction is set. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
