---
aside: false
title: SegmentedControl
description: "Segmented button group for one choice."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SegmentedControl

Use `SegmentedControl` to choose one option from a few, shown as joined buttons.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SegmentedControl.vue">Source</a>
</div>

<demo vue="./demos/SegmentedControl.vue" title="SegmentedControl" description="Card-style segmented control with option descriptions. Click an option to change the model value." />

## Import

```ts
import { SegmentedControl } from "@morscherlab/mint-sdk"
```

## Sizing

The card variant sizes to its content. Add `full-width` to fill the container. The `color` of an option shows a small swatch before its label.

```vue
<SegmentedControl v-model="mode" :options="modes" variant="card" full-width />
```

## Icons

The `icon` of an option (SVG path data, as in `BaseTabs`) shows before its label. With `iconOnly`, the segment shows only the icon, and the label becomes its `aria-label` and `title`. An option without an icon keeps its label.

```vue
<SegmentedControl v-model="layout" :options="layouts" variant="card" size="sm" icon-only />
```

## Typed value

`SegmentedControl` is generic over the option value type. `v-model` and `update:modelValue` carry the type of `options`. `InstanceType<typeof SegmentedControl>` does not resolve; use `ComponentExposed` from `vue-component-type-helpers`.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SegmentedControl.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` T \| null ` | Yes | — | The selected value; null selects no option. |
| ` options ` | ` SelectOptionInput<T>[] ` | Yes | — | — |
| ` variant ` | ` SegmentedControlVariant ` | No | ` "card" ` | — |
| ` size ` | ` SegmentedControlSize ` | No | ` "md" ` | — |
| ` fullWidth ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` disabledValues ` | ` OptionPrimitive[] ` | No | ` [] ` | — |
| ` iconOnly ` | ` boolean ` | No | ` false ` | Draws only each option's icon; the label becomes the option's accessible name and tooltip. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L118) | See the linked SDK type definition. |
| [` SegmentedControlVariant `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L396) | ` 'simple' \| 'card' ` |
| [` SegmentedControlSize `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L397) | ` 'sm' \| 'md' \| 'lg' ` |
| [` OptionPrimitive `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L99) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: T ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
