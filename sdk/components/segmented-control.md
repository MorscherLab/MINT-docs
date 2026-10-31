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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SegmentedControl.vue">Source</a>
</div>

<demo vue="./demos/SegmentedControl.vue" title="SegmentedControl" description="Card-style segmented control with option descriptions. Click an option to change the model value." />

## Import

```ts
import { SegmentedControl } from "@morscherlab/mint-sdk"
```

## Sizing in 1.2.1

The card variant sizes to its content. Add `full-width` when the choice control
should fill its container. An option's `color` renders a small swatch before its label.

```vue
<SegmentedControl v-model="mode" :options="modes" variant="card" full-width />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SegmentedControl.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | Yes | — | — |
| ` options ` | ` SelectOptionInput[] ` | Yes | — | — |
| ` variant ` | ` SegmentedControlVariant ` | No | ` "card" ` | — |
| ` size ` | ` SegmentedControlSize ` | No | ` "md" ` | — |
| ` fullWidth ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` disabledValues ` | ` Array<string \| number> ` | No | ` [] ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L117) | See the linked SDK type definition. |
| [` SegmentedControlVariant `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L373) | ` 'simple' \| 'card' ` |
| [` SegmentedControlSize `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L374) | ` 'sm' \| 'md' \| 'lg' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: string \| number ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
