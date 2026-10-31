---
aside: false
title: WellPlate
description: "Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# WellPlate

Interactive plate map with heatmaps, selection, and editing hooks. Supported formats are 6, 12, 24, 48, 54, 96, and 384 wells.

::: warning Deprecated prop
`showSampleTypeIndicator` is a no-op and is removed in **MINT 1.4**. The sample-type marker already encodes the type by shape, with `Q` / `i` glyphs for QC / iQC.
:::

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/WellPlate.vue">Source</a>
</div>

<demo vue="./demos/WellPlate.vue" title="WellPlate" description="A 96-well plate with heatmap colors and multiple selection. Click wells to select them." />

## Import

```ts
import { WellPlate } from "@morscherlab/mint-sdk/lab"
```

## Basic Usage

```vue
<WellPlate
  v-model="selectedWells"
  :format="384"
  :wells="wells"
  selection-mode="multiple"
  size="fill"
/>
```

## Selection

A click selects one well. Ctrl/Cmd-click toggles a well. Shift-click (or Shift+Enter, Shift+Space on a focused well) selects the rectangle from the anchor well to the clicked well. The anchor is the last well that got a plain click or a Ctrl/Cmd-click, or the start of a dragged rectangle. Ctrl/Cmd+Shift-click adds the rectangle to the current selection. Escape or an empty selection drops the anchor. Without an anchor, Shift-click toggles a well like Ctrl/Cmd-click. Range selection applies in `multiple` and `rectangle` modes.

## Decorate wells without changing sample data

`wellClass` and `wellStyle` let you mark a QC state or a focused well independently of sample type and heatmap values:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WellPlate, type WellClassResolver, type WellStyleResolver } from '@morscherlab/mint-sdk'

const selected = ref<string[]>([])
const flagged = new Set(['A1', 'B2'])
const wellClass: WellClassResolver = well => ({ 'qc-flagged': flagged.has(well.id) })
const wellStyle: WellStyleResolver = well =>
  well.id === 'A1' ? { outline: '2px solid var(--text-primary)', outlineOffset: '2px' } : undefined
</script>

<template>
  <WellPlate
    v-model="selected"
    :format="96"
    :show-well-ids="true"
    :well-class="wellClass"
    :well-style="wellStyle"
  />
  <p>Flagged wells: A1 and B2. A1 is the focused well.</p>
</template>

<style scoped>
:deep(.qc-flagged) { border-style: dashed; }
</style>
```

Both callbacks receive the resolved `Well` (including its `id`, `row`, `col`, and state). `wellClass` accepts a class string, array, or boolean map. `wellStyle` is merged after heatmap/sample styling, so it can override those styles; prefer an outline or border when the heatmap must remain visible. These hooks do not disable selection, edit data, or persist a QC flag. Supply a visible legend/text explanation rather than conveying meaning through color alone.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/WellPlate.vue).

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
| [` WellPlateSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L132) | See the linked SDK type definition. |
| [` Well `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L10) | See the linked SDK type definition. |

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

## Related

- [WellPlate playground](/sdk/components/well-plate)

[Back to component library](/sdk/components/)
