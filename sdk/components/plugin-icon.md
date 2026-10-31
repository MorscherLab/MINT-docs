---
aside: false
title: PluginIcon
description: "PluginIcon is a layout component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Layout</p>

# PluginIcon

PluginIcon is a layout component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PluginIcon.vue">Source</a>
</div>

<ComponentPlayground name="PluginIcon" />

## Import

```ts
import { PluginIcon } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PluginIcon.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` icon ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'topbar' \| 'lg' ` | No | ` 'md' ` | — |
| ` variant ` | ` 'solid' \| 'tinted' ` | No | ` 'solid' ` | — |
| ` tone ` | ` Tone ` | No | ` undefined ` | @deprecated v2 design: the tile is always the neutral accent-soft tile, so the tone has no visible effect. Removed in 1.5. |
| ` color ` | ` string ` | No | ` undefined ` | @deprecated v2 design: the tile is always the neutral accent-soft tile, so the color has no visible effect. Removed in 1.5. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
