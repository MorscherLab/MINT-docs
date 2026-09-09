---
aside: false
title: StatusIndicator
description: "StatusIndicator is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# StatusIndicator

StatusIndicator is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/StatusIndicator.vue">Source</a>
</div>

<ComponentPlayground name="StatusIndicator" />

## Import

```ts
import { StatusIndicator } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/StatusIndicator.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` status ` | ` 'success' \| 'warning' \| 'error' \| 'info' \| 'muted' ` | No | ` 'muted' ` | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` pulse ` | ` boolean ` | No | ` false ` | — |
| ` color ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
