---
aside: false
title: SegmentedControl
description: "SegmentedControl is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SegmentedControl

SegmentedControl is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SegmentedControl.vue">Source</a>
</div>

<ComponentPlayground name="SegmentedControl" />

## Import

```ts
import { SegmentedControl } from "@morscherlab/mint-sdk/components"
```

## Sizing in 1.2.1

The card variant sizes to its content. Add `full-width` when the choice control
should fill its container.

```vue
<SegmentedControl v-model="mode" :options="modes" variant="card" full-width />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SegmentedControl.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | Yes | — | — |
| ` options ` | ` SegmentedOptionInput[] ` | Yes | — | — |
| ` variant ` | ` SegmentedControlVariant ` | No | ` 'card' ` | — |
| ` size ` | ` SegmentedControlSize ` | No | ` 'md' ` | — |
| ` fullWidth ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` disabledValues ` | ` Array<string \| number> ` | No | ` () => [] ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SegmentedOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L326) | See the linked SDK type definition. |
| [` SegmentedControlVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L328) | ` 'simple' \| 'card' ` |
| [` SegmentedControlSize `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L329) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
