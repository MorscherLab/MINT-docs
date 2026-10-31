---
aside: false
title: Divider
description: "Divider is a layout component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Layout</p>

# Divider

Divider is a layout component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Divider.vue">Source</a>
</div>

<demo vue="./demos/Divider.vue" title="Divider" description="Shows a divider with a centered label between two text blocks." />

## Import

```ts
import { Divider } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Divider.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` vertical ` | ` boolean ` | No | ` false ` | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` align ` | ` 'center' \| 'left' ` | No | ` "center" ` | — |
| ` spacing ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
