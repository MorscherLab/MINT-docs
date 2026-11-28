---
aside: false
title: BaseRadioGroup
description: "Radio button group in list or tile layout."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseRadioGroup

Use `BaseRadioGroup` to pick one option from a short list, shown as a list or as tiles.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseRadioGroup.vue">Source</a>
</div>

<demo vue="./demos/BaseRadioGroup.vue" title="BaseRadioGroup" description="Tile radio group with three sample types. Click a tile to change the model value." />

## Import

```ts
import { BaseRadioGroup } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseRadioGroup.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | No | ` undefined ` | — |
| ` options ` | ` SelectOptionInput[] ` | Yes | — | — |
| ` name ` | ` string ` | Yes | — | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` direction ` | ` 'horizontal' \| 'vertical' ` | No | ` "vertical" ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` variant ` | ` 'list' \| 'tile' ` | No | ` "list" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L118) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: string \| number ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
