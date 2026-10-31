---
aside: false
title: Tooltip
description: "Hover/focus tooltip with smart positioning for compact explanations."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# Tooltip

Hover/focus tooltip with smart positioning for compact explanations.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Tooltip.vue">Source</a>
</div>

<demo vue="./demos/Tooltip.vue" title="Tooltip" description="A button with a tooltip that shows text and a shortcut. Hover the button to see it." />

## Import

```ts
import { Tooltip } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/Tooltip.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` text ` | ` string ` | Yes | — | — |
| ` position ` | ` 'top' \| 'bottom' \| 'left' \| 'right' ` | No | ` "top" ` | — |
| ` delay ` | ` number ` | No | ` 200 ` | — |
| ` shortcut ` | ` string ` | No | ` undefined ` | — |
| ` maxWidth ` | ` string \| number ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
