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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BasePill.vue">Source</a>
</div>

<ComponentPlayground name="BasePill" />

## Import

```ts
import { BasePill } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BasePill.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` variant ` | ` PillVariant ` | No | ` 'default' ` | Visual style variant |
| ` color ` | ` PillColor ` | No | ` undefined ` | Semantic color modifier — use with variant="outline" for colored outlines |
| ` size ` | ` PillSize ` | No | ` 'md' ` | Size of the pill |
| ` removable ` | ` boolean ` | No | ` false ` | Show remove button |
| ` disabled ` | ` boolean ` | No | ` false ` | Disable interaction |
| ` icon ` | ` boolean ` | No | ` false ` | Show icon slot |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PillVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L321) | ` 'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'outline' ` |
| [` PillColor `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L323) | ` 'neutral' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' ` |
| [` PillSize `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L325) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
