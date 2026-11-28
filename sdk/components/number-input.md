---
aside: false
title: NumberInput
description: "Number input with steppers, an optional unit, and drag-to-scrub between min and max."
---

<p class="mint-component-library__eyebrow">Forms</p>

# NumberInput

Use `NumberInput` to enter a number, with an optional unit or unit menu.

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

- The stepper buttons always show, with or without bounds.
- The field has one Tab stop, the number input. It takes the label of the field as its name.
- Arrow Up and Down change the value by `step`. Page Up and Page Down change it by ten steps. Home and End move the caret.
- Clearing the input emits `undefined`, so include `undefined` in your model type.
- With `lazy`, the input writes the value on change (blur, Enter, a stepper or arrow key, the end of a drag), like `v-model.lazy`. Use it for a field that saves to the server.

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

With both `min` and `max`, the field shows a range fill. A drag on the range changes the value from its start value. A click or a double-click still edits the text. Keep `step` positive, and validate the submitted value on the backend.

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
