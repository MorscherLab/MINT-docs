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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Tooltip.vue">Source</a>
</div>

<ComponentPlayground name="Tooltip" />

## Import

```ts
import { Tooltip } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Tooltip.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` text ` | ` string ` | Yes | — | — |
| ` position ` | ` 'top' \| 'bottom' \| 'left' \| 'right' ` | No | ` 'top' ` | — |
| ` delay ` | ` number ` | No | ` 200 ` | — |
| ` shortcut ` | ` string ` | No | ` undefined ` | — |
| ` maxWidth ` | ` string \| number ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
