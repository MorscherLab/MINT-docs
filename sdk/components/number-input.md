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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/NumberInput.vue">Source</a>
</div>

<ComponentPlayground name="NumberInput" />

## Import

```ts
import { NumberInput } from "@morscherlab/mint-sdk/components"
```

## Interaction in 1.2.1

Increment/decrement buttons are always visible. Supplying both `min` and `max`
adds an in-field range indicator that can be dragged to scrub the value.
The range surface exposes `role="slider"`; it is no longer a separate native
range input. Arrow keys and PageUp/PageDown adjust values; Home/End jump to
bounds on the slider surface while retaining normal caret behavior in the text
input. Clearing the input emits `undefined`.

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

Arrow Up/Down adjust by `step`; Page Up/Down adjust by ten steps. Home/End jump to bounds only when the range surface has focus; inside the text input they retain caret behavior. Clearing the input emits `undefined`, so include it in your model type. Keep `step` positive and validate submitted values on the backend.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/NumberInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` undefined ` | — |
| ` max ` | ` number ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` 1 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` unit ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
