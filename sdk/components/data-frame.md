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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/DataFrame.vue">Source</a>
</div>

<demo vue="./demos/DataFrame.vue" title="DataFrame" description="Sortable results table with search and row selection. Sort columns, resize them, and select rows." />

## Import

```ts
import { DataFrame } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<DataFrame
  :columns="columns"
  :data="rows"
  row-key="id"
  searchable
  sortable
  resizable
  :column-widths="columnWidths"
  sticky-header
  deletable
  delete-label="Remove row"
  @update:column-widths="columnWidths = $event"
  @delete-row="removeRow"
/>
```

## Newer Table Controls

`DataFrame` can now handle two common analysis-table editing tasks without custom table chrome:

| Prop / event | Use |
|--------------|-----|
| `resizable` | Adds drag handles on column headers |
| `columnWidths` / `update:columnWidths` | Control column widths in px when you want to persist user changes |
| `deletable` | Adds a trailing delete action column |
| `deleteLabel` | Tooltip and accessible label for the delete action |
| `delete-row` | Emits the row object and row index after the delete action |

Leave `columnWidths` unset for uncontrolled resizing inside the table. Pass it with `v-model:column-widths` when you want to store widths in plugin settings.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/DataFrame.vue).

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
| [` DataFrameSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L469) | See the linked SDK type definition. |
| [` SortState `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L425) | See the linked SDK type definition. |

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
