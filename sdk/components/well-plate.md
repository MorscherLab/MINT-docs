---
aside: false
title: WellPlate
description: "Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# WellPlate

Interactive plate map with heatmaps, selection, and editing hooks. Supported formats are 6, 12, 24, 48, 54, 96, and 384 wells.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/WellPlate.vue">Source</a>
</div>

<ComponentPlayground name="WellPlate" />

## Import

```ts
import { WellPlate } from "@morscherlab/mint-sdk/components"
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

## Decorate wells without changing sample data

In 1.2.6, `wellClass` and `wellStyle` let you mark a QC state or a focused well independently of sample type and heatmap values:

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

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/WellPlate.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string[] ` | No | ` () => [] ` | — |
| ` format ` | ` WellPlateFormat ` | No | ` 96 ` | — |
| ` wells ` | ` Record<string, Partial<Well>> ` | No | ` () => ({}) ` | — |
| ` selectionMode ` | ` WellPlateSelectionMode ` | No | ` 'multiple' ` | — |
| ` showLabels ` | ` boolean ` | No | ` true ` | — |
| ` showWellIds ` | ` boolean ` | No | ` false ` | — |
| ` showSampleTypeIndicator ` | ` boolean ` | No | ` false ` | — |
| ` heatmap ` | ` HeatmapConfig ` | No | ` () => ({ enabled: false }) ` | — |
| ` sampleColors ` | ` Record<string, string> ` | No | ` () => ({}) ` | — |
| ` zoom ` | ` number ` | No | ` 1 ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` WellPlateSize ` | No | ` 'md' ` | — |
| ` wellShape ` | ` WellShape ` | No | ` 'rounded' ` | — |
| ` showWellLabels ` | ` boolean ` | No | ` false ` | — |
| ` showBadges ` | ` boolean ` | No | ` false ` | — |
| ` editable ` | ` boolean ` | No | ` false ` | — |
| ` editFields ` | ` WellEditField[] ` | No | ` () => ['label', 'sampleType', 'injectionVolume', 'injectionCount', 'customMethod'] ` | — |
| ` defaultInjectionVolume ` | ` number ` | No | ` 5 ` | — |
| ` showLegend ` | ` boolean ` | No | ` false ` | — |
| ` legendItems ` | ` WellLegendItem[] ` | No | ` undefined ` | — |
| ` columnConditions ` | ` ColumnCondition[] ` | No | ` () => [] ` | — |
| ` rowConditions ` | ` RowCondition[] ` | No | ` () => [] ` | — |
| ` allowSampleDrop ` | ` boolean ` | No | ` false ` | — |
| ` sampleDropParser ` | ` WellSampleDropParser ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the plate grid with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` undefined ` | Error message. When set, the plate grid is replaced by an error state. null/undefined renders normally. |
| ` emptyMessage ` | ` string ` | No | ` undefined ` | Opt-in empty-state headline. A blank plate is meaningful, so the empty state only replaces the grid when this message is supplied and no wells carry data. |
| ` wellClass ` | ` WellClassResolver ` | No | ` undefined ` | Add semantic classes to individual wells without overloading sample data. |
| ` wellStyle ` | ` WellStyleResolver ` | No | ` undefined ` | Add or override individual well styles after heatmap/sample styling. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` WellPlateFormat `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L2) | See the linked SDK type definition. |
| [` Well `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L8) | See the linked SDK type definition. |
| [` WellPlateSelectionMode `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L4) | ` 'none' \| 'single' \| 'multiple' \| 'rectangle' \| 'drag' ` |
| [` HeatmapConfig `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L26) | See the linked SDK type definition. |
| [` WellPlateSize `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L5) | ` 'sm' \| 'md' \| 'lg' \| 'xl' \| 'fill' ` |
| [` WellShape `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L6) | ` 'circle' \| 'rounded' ` |
| [` WellEditField `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L57) | ` 'label' \| 'sampleType' \| 'injectionVolume' \| 'injectionCount' \| 'customMethod' ` |
| [` WellLegendItem `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L83) | See the linked SDK type definition. |
| [` ColumnCondition `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L97) | See the linked SDK type definition. |
| [` RowCondition `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L101) | See the linked SDK type definition. |
| [` WellSampleDropParser `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L77) | See the linked SDK type definition. |
| [` WellClassResolver `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L19) | See the linked SDK type definition. |
| [` WellStyleResolver `](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/types/componentLabTypes.ts#L20) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [WellPlate playground](/sdk/components/well-plate)

[Back to component library](/sdk/components/)
