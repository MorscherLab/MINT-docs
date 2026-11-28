---
aside: false
title: DataFrame
description: "Searchable, sortable, selectable table for dense experiment and analysis results."
---

<p class="mint-component-library__eyebrow">Data display</p>

# DataFrame

Searchable, sortable, selectable table for dense experiment and analysis results.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/DataFrame.vue">Source</a>
</div>

<demo vue="./demos/DataFrame.vue" title="DataFrame" description="Sortable results table with search and row selection. Sort columns, resize them, and select rows." />

## Import

```ts
import { DataFrame } from "@morscherlab/mint-sdk"
```

## Basic Usage

Build the structure with `defineDataFrame()` in `<script setup>` and pass it as `spec`. Bind the state with `v-model`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DataFrame, defineDataFrame } from '@morscherlab/mint-sdk'

const table = defineDataFrame({
  rowKey: 'id',
  columns: [
    { key: 'sample', label: 'Sample', sortable: true },
    { key: 'intensity', label: 'Intensity', align: 'right', sortable: true },
  ],
  searchable: true,
  resizable: true,
  deletable: true,
  deleteLabel: 'Remove row',
  stickyHeader: true,
})
const columnWidths = ref<Record<string, number>>({})
</script>

<template>
  <SectionCard title="Peaks">
    <DataFrame :spec="table" :data="rows" v-model:column-widths="columnWidths" @delete-row="removeRow" />
  </SectionCard>
</template>
```

## Table controls

| Spec option / event | Use |
|---------------------|-----|
| `resizable` | Adds drag handles on column headers |
| `v-model:column-widths` | Column widths in px, when you want to keep user changes |
| `deletable` | Adds a trailing delete action column |
| `deleteLabel` | Tooltip and accessible label for the delete action |
| `delete-row` | Emits the row object and row index after the delete action |

Leave `columnWidths` unbound for resizing inside the table only. Bind it when you want to store widths in plugin settings. Without `bordered`, the table has no frame of its own: put it in a [SectionCard](/sdk/components/section-card#content-in-a-card).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/DataFrame.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` DataFrameSpec ` | No | ` {} ` | Structure built with defineDataFrame(). Optional: every option has a default. |
| ` data ` | ` Record<string, unknown>[] ` | Yes | — | Array of data objects |
| ` loading ` | ` boolean ` | No | ` false ` | Show loading overlay |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the table body is replaced by an error state. |
| ` emptyText ` | ` string ` | No | ` "No data" ` | Empty state message |
| ` sort ` | ` SortState \| null ` | No | ` undefined ` | Current sort state. Bind with v-model:sort; unbound, the table keeps its own. |
| ` selected ` | ` (string \| number)[] ` | No | ` [] ` | Selected row keys. Bind with v-model:selected. |
| ` page ` | ` number ` | No | ` undefined ` | Current page (1-indexed) when spec.pagination is set. Bind with v-model:page; unbound, the table keeps its own. |
| ` columnWidths ` | ` Record<string, number> ` | No | ` undefined ` | Column widths in px keyed by column key. Bind with v-model:column-widths; unbound, the table keeps its own. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` DataFrameSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L492) | See the linked SDK type definition. |
| [` SortState `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L448) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:sort ` | ` sort: SortState \| null ` | — |
| ` update:page ` | ` page: number ` | — |
| ` update:selected ` | ` keys: (string \| number)[] ` | — |
| ` update:columnWidths ` | ` widths: Record<string, number> ` | — |
| ` row-click ` | ` row: Record<string, unknown>, index: number ` | — |
| ` cell-click ` | ` value: unknown, column: DataFrameColumn<Record<string, unknown>>, row: Record<string, unknown> ` | — |
| ` delete-row ` | ` row: Record<string, unknown>, index: number ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` error ` | ` { error: string; } ` | — |
| ` empty ` | — | — |
| ` loading ` | — | — |
| ` footer ` | — | — |

<!-- sdk-props:end -->

## Related

- [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables)

[Back to component library](/sdk/components/)
