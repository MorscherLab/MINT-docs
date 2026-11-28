---
aside: false
title: PluginIcon
description: "Plugin icon as a sized chip, from MINT icon JSON, SVG path data or an image URL."
---

<p class="mint-component-library__eyebrow">Layout</p>

# PluginIcon

Use `PluginIcon` to show the icon of a plugin. It reads MINT icon JSON, SVG path data, a raster data URL, or an `https://` or root-relative image URL. It refuses `http://`, protocol-relative and `data:image/svg+xml` URLs and shows the MINT placeholder icon instead.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PluginIcon.vue">Source</a>
</div>

<demo vue="./demos/PluginIcon.vue" title="PluginIcon" description="Plugin icons in three sizes and styles. Compare the plain, tinted and solid variants." />

## Import

```ts
import { PluginIcon } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PluginIcon.vue).

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
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
