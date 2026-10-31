---
aside: false
title: BasePill
description: "Compact status label for tables, metadata, and small state indicators."
---

<p class="mint-component-library__eyebrow">Data display</p>

# BasePill

Compact status label for tables, metadata, and small state indicators.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BasePill.vue">Source</a>
</div>

<ComponentPlayground name="BasePill" />

## Import

```ts
import { BasePill } from "@morscherlab/mint-sdk/components"
```

## Status dots in 1.2.1

Use `dot` to add a leading dot in the pill's semantic tone. Keep the text label
so status does not depend on color alone.

```vue
<BasePill variant="success" dot>Completed</BasePill>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BasePill.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` tone ` | ` Tone ` | No | ` 'neutral' ` | Semantic color |
| ` variant ` | ` PillVariant ` | No | ` 'soft' ` | Tinted fill (soft) or a 1px border in the tone color (outline) |
| ` color ` | ` string ` | No | ` undefined ` | Custom accent color (any CSS color); replaces the tone's accent for the dot, tint and border |
| ` size ` | ` PillSize ` | No | ` 'md' ` | Size of the pill |
| ` removable ` | ` boolean ` | No | ` false ` | Show remove button |
| ` disabled ` | ` boolean ` | No | ` false ` | Disable interaction |
| ` icon ` | ` boolean ` | No | ` false ` | Show icon slot |
| ` dot ` | ` boolean ` | No | ` false ` | Leading status dot in the pill's tone color |
| ` pulse ` | ` boolean ` | No | ` false ` | Animate the status dot (live status) |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Tone `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L4) | ` 'neutral' \| 'primary' \| 'cta' \| 'success' \| 'warning' \| 'error' \| 'info' ` |
| [` PillVariant `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L378) | ` 'soft' \| 'outline' ` |
| [` PillSize `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L380) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
