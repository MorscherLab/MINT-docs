---
aside: false
title: Avatar
description: "Avatar is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# Avatar

Avatar is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/Avatar.vue">Source</a>
</div>

<ComponentPlayground name="Avatar" />

## Import

```ts
import { Avatar } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/Avatar.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` name ` | ` string ` | No | ` undefined ` | — |
| ` initials ` | ` string ` | No | ` undefined ` | — |
| ` src ` | ` string ` | No | ` undefined ` | — |
| ` alt ` | ` string ` | No | ` '' ` | — |
| ` size ` | ` 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' ` | No | ` 'md' ` | — |
| ` color ` | ` string ` | No | ` undefined ` | — |
| ` status ` | ` 'online' \| 'away' \| 'busy' \| 'offline' ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
