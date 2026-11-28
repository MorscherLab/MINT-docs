---
aside: false
title: WellPlate
description: "Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# WellPlate

Use `WellPlate` to show and select wells on a plate, with heatmaps and editing hooks. Formats are 6, 12, 24, 48, 54, 96 and 384 wells.


<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/WellPlate.vue">Source</a>
</div>

<demo vue="./demos/WellPlate.vue" title="WellPlate" description="A 96-well plate with heatmap colors and multiple selection. Click wells to select them." />

## Import

```ts
import { WellPlate } from "@morscherlab/mint-sdk/lab"
```

## Basic Usage

Set the structure (format, selection mode, size, heatmap, well editor) once with `defineWellPlate()` and pass it as `spec`. The wells and the selected wells stay props.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WellPlate, defineWellPlate } from '@morscherlab/mint-sdk/lab'

const plate = defineWellPlate({ format: 384, selectionMode: 'multiple', size: 'fill' })
const selectedWells = ref<string[]>([])
</script>

<template>
  <WellPlate v-model="selectedWells" :spec="plate" :wells="wells" />
</template>
```

The sample-type marker shows the type by shape, with a `Q` glyph for QC and an `i` glyph for iQC.

## Selection

- A click selects one well.
- Ctrl/Cmd-click toggles a well.
- Shift-click (or Shift+Enter, Shift+Space on a focused well) selects the rectangle from the anchor well to the clicked well.
- Ctrl/Cmd+Shift-click adds the rectangle to the current selection.
- The anchor is the last well that got a plain click or a Ctrl/Cmd-click, or the start of a dragged rectangle. Escape or an empty selection drops the anchor. Without an anchor, Shift-click toggles a well like Ctrl/Cmd-click.

Range selection works in the `multiple` and `rectangle` selection modes.

## Decorate wells without changing sample data

Use the `wellClass` and `wellStyle` spec options to mark a well, for example a QC flag or a focused well. They do not change the sample type or the heatmap values.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WellPlate, defineWellPlate } from '@morscherlab/mint-sdk/lab'

const selected = ref<string[]>([])
const flagged = new Set(['A1', 'B2'])
const plate = defineWellPlate({
  format: 96,
  showWellIds: true,
  wellClass: well => ({ 'qc-flagged': flagged.has(well.id) }),
  wellStyle: well =>
    well.id === 'A1' ? { outline: '2px solid var(--text-primary)', outlineOffset: '2px' } : undefined,
})
</script>

<template>
  <WellPlate v-model="selected" :spec="plate" />
  <p>Flagged wells: A1 and B2. A1 is the focused well.</p>
</template>

<style scoped>
:deep(.qc-flagged) { border-style: dashed; }
</style>
```

- Both callbacks get the resolved `Well`, with its `id`, `row`, `col` and state.
- `wellClass` returns a class string, an array or a boolean map.
- `wellStyle` applies after the heatmap and sample styles, so it can override them. To keep the heatmap visible, use an outline or a border.
- The hooks do not disable selection, edit data or store a QC flag.
- Do not show meaning by color alone. Add a legend or a text.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/WellPlate.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` WellPlateSpec ` | No | ` {} ` | Structure built with defineWellPlate(). Optional: every option has a default. |
| ` modelValue ` | ` string[] ` | No | ` [] ` | Selected well ids. Bind with v-model. |
| ` wells ` | ` Record<string, Partial<Well>> ` | No | ` {} ` | Well data keyed by well id. |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the plate grid with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` undefined ` | Error message. When set, the plate grid is replaced by an error state. null/undefined renders normally. |
| ` emptyText ` | ` string ` | No | ` undefined ` | Opt-in empty-state headline. A blank plate is meaningful, so the empty state only replaces the grid when this message is supplied and no wells carry data. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` WellPlateSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L131) | See the linked SDK type definition. |
| [` Well `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L10) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` wellIds: string[] ` | — |
| ` well-click ` | ` wellId: string, event: MouseEvent ` | — |
| ` well-hover ` | ` wellId: string \| null, event?: MouseEvent \| undefined ` | — |
| ` selection-change ` | ` wellIds: string[] ` | — |
| ` context-menu ` | ` wellId: string, event: MouseEvent ` | — |
| ` well-move ` | ` sourceWellId: string, targetWellId: string ` | — |
| ` well-edit ` | ` wellId: string, data: WellEditData ` | — |
| ` well-clear ` | ` wellId: string ` | — |
| ` sample-drop ` | ` wellId: string, data: WellSampleDropData, event: DragEvent ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` well-editor ` | ` WellEditorSlotProps ` | — |
| ` loading ` | — | Replaces the default loading placeholder. |
| ` error ` | ` { error: string; } ` | Replaces the default error placeholder. |
| ` empty ` | — | Replaces the default empty placeholder. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
