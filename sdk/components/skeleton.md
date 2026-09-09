---
aside: false
title: Skeleton
description: "Skeleton is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# Skeleton

Skeleton is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Skeleton.vue">Source</a>
</div>

<ComponentPlayground name="Skeleton" />

## Import

```ts
import { Skeleton } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/Skeleton.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` variant ` | ` 'text' \| 'circular' \| 'rectangular' \| 'rounded' ` | No | ` 'text' ` | — |
| ` width ` | ` string \| number ` | No | ` undefined ` | — |
| ` height ` | ` string \| number ` | No | ` undefined ` | — |
| ` animation ` | ` 'pulse' \| 'wave' \| 'none' ` | No | ` 'wave' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
