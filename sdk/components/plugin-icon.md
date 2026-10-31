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

<demo vue="./demos/PluginIcon.vue" title="PluginIcon" description="Plugin icons in three sizes and styles. Compare the plain, tinted and solid variants." />

## Import

```ts
import { PluginIcon } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PluginIcon.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` icon ` | ` string ` | No | ` undefined ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'topbar' \| 'lg' ` | No | ` "md" ` | — |
| ` variant ` | ` 'solid' \| 'tinted' ` | No | ` "solid" ` | — |
| ` tone ` | ` Tone ` | No | ` undefined ` | — |
| ` color ` | ` string ` | No | ` undefined ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
