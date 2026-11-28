---
aside: false
title: NumberInput
description: "NumberInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# NumberInput

NumberInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/NumberInput.vue">Source</a>
</div>

<demo vue="./demos/NumberInput.vue" title="NumberInput" description="A number input with a unit label. Type a value or use the steppers to change it." />

## Import

```ts
import { NumberInput } from "@morscherlab/mint-sdk"
```

## Interaction

Increment/decrement buttons are always visible. Supplying both `min` and `max`
adds an in-field range fill that can be dragged to scrub the value. The field
has one Tab stop, the number input, which takes the label of the field as its
name. Arrow keys and PageUp/PageDown adjust values. Home and End move the caret.
Clearing the input emits `undefined`.

With `lazy`, the input writes the value on change (blur, Enter, a stepper or
arrow key, the end of a drag), as `v-model.lazy`. Use it for a field that saves
to the server.

## Bounded values and scrubbing

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NumberInput } from '@morscherlab/mint-sdk'

const tolerance = ref<number | undefined>(5)
</script>

<template>
  <fieldset>
    <legend>Mass tolerance</legend>
    <NumberInput v-model="tolerance" :min="0" :max="20" :step="0.1" unit="ppm" />
  </fieldset>
</template>
```

With both `min` and `max`, the input displays a range fill and supports dragging on the range surface. Dragging the number adjusts relative to its initial value, while ordinary clicks and double-clicks still support text editing. Steppers remain visible with or without bounds.

Arrow Up/Down adjust by `step`; Page Up/Down adjust by ten steps. Home/End move the caret. Clearing the input emits `undefined`, so include it in your model type. Keep `step` positive and validate submitted values on the backend.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/NumberInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number \| null ` | No | ` null ` | — |
| ` min ` | ` number ` | No | ` undefined ` | — |
| ` max ` | ` number ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` 1 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` unit ` | ` string ` | No | ` undefined ` | Unit label; with units, the selected unit value (v-model:unit). |
| ` units ` | ` UnitOption[] ` | No | ` undefined ` | Selectable units; renders the unit segment instead of the steppers. |
| ` precision ` | ` number ` | No | ` undefined ` | Decimal places kept when convertOnUnitChange converts the value. |
| ` convertOnUnitChange ` | ` boolean ` | No | ` false ` | Convert the value by the unit factors when the unit changes (needs units with factor). |
| ` lazy ` | ` boolean ` | No | ` false ` | Write the value on change, as v-model.lazy: on blur, Enter, a stepper or arrow key, or the end of a drag, not on each keystroke. Ignored with units. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UnitOption `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L7) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: number \| null ` | — |
| ` update:unit ` | ` unit: string ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
