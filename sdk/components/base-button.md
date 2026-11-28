---
aside: false
title: BaseButton
description: "Tokenized action button with variants, sizes, loading, and disabled states."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseButton

Tokenized action button with variants, sizes, loading, and disabled states.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseButton.vue">Source</a>
</div>

<demo vue="./demos/BaseButton.vue" title="BaseButton" description="Primary, secondary and loading ghost buttons. Compare the three variants side by side." />

## Import

```ts
import { BaseButton } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<BaseButton variant="primary" :loading="saving" @click="save">
  Save
</BaseButton>
```

## Icons

Give an icon with the `icon` prop (a component, for example a Lucide icon) or the `icon-left` / `icon-right` slot.

- Beside a label, the icon is 14px at `sm` and `md` and 18px at `lg`. The gap to the label is 6px (8px at `lg`). The side that holds the icon has less padding.
- An icon-only button (`icon` and `label`, no default slot) is a square of 28, 32 or 40px with a 16px icon at each size. `label` is its accessible name and tooltip.
- An icon in the default slot keeps its own size and equal padding. Move it to a slot to get the sizes above:

```vue
<BaseButton variant="secondary">
  <template #icon-left><Plus class="mint-button__icon" /></template>
  Add sample
</BaseButton>
```

While `loading` is true, the spinner takes the place of the `icon` prop or the `icon-left` slot, so the label does not move. A primary button label has weight 600 at each size.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseButton.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` variant ` | ` ButtonVariant ` | No | ` "primary" ` | — |
| ` size ` | ` ButtonSize ` | No | ` "md" ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` type ` | ` 'button' \| 'submit' \| 'reset' ` | No | ` "button" ` | — |
| ` fullWidth ` | ` boolean ` | No | ` false ` | — |
| ` icon ` | ` Component ` | No | ` undefined ` | Icon component (for example a lucide icon) rendered before the label, or alone when there is no default slot. The loading spinner takes its place, and the place of the icon-left slot. |
| ` label ` | ` string ` | No | ` undefined ` | Accessible name and tooltip of an icon-only button. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ButtonVariant `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L11) | ` 'primary' \| 'secondary' \| 'cta' \| 'danger' \| 'success' \| 'ghost' ` |
| [` ButtonSize `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L12) | ` 'sm' \| 'md' \| 'lg' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` click ` | ` event: MouseEvent ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` icon-left ` | — | — |
| ` default ` | — | — |
| ` icon-right ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
