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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DataFrame.vue">Source</a>
</div>

<ComponentPlayground name="DataFrame" />

## Import

```ts
import { DataFrame } from "@morscherlab/mint-sdk/components"
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

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DataFrame.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` data ` | ` Record<string, unknown>[] ` | Yes | — | Array of data objects |
| ` columns ` | ` DataFrameColumn[] ` | Yes | — | Column definitions |
| ` rowKey ` | ` string \| ((row: Record<string, unknown>) => string \| number) ` | No | ` undefined ` | Unique key for each row (property name or function) |
| ` striped ` | ` boolean ` | No | ` true ` | Alternate row background colors |
| ` bordered ` | ` boolean ` | No | ` true ` | Show table borders |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` undefined ` | Table size. Left unset, it follows the platform's tableDensity setting (compact → sm, normal → md, comfortable → lg) and falls back to md when no settings store is installed. |
| ` stickyHeader ` | ` boolean ` | No | ` false ` | Make header sticky on scroll |
| ` maxHeight ` | ` string \| number ` | No | ` undefined ` | Maximum table height (enables vertical scroll) |
| ` loading ` | ` boolean ` | No | ` false ` | Show loading overlay |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the table body is replaced by an error state instead of the empty state. null/undefined renders normally. |
| ` emptyText ` | ` string ` | No | ` 'No data' ` | Empty state message |
| ` sortable ` | ` boolean ` | No | ` false ` | Enable column sorting |
| ` sort ` | ` SortState \| null ` | No | ` undefined ` | Current sort state (controlled mode) |
| ` pagination ` | ` PaginationState \| false ` | No | ` false ` | Pagination state or false to disable |
| ` searchable ` | ` boolean ` | No | ` false ` | Enable search input |
| ` searchPlaceholder ` | ` string ` | No | ` 'Search...' ` | Search input placeholder |
| ` searchKeys ` | ` string[] ` | No | ` undefined ` | Column keys to search (defaults to all) |
| ` selectable ` | ` boolean ` | No | ` false ` | Enable row selection with checkboxes |
| ` selectedKeys ` | ` (string \| number)[] ` | No | ` () => [] ` | Currently selected row keys |
| ` clickableRows ` | ` boolean ` | No | ` false ` | Make each body row act as a click/keyboard target. |
| ` deletable ` | ` boolean ` | No | ` false ` | Show a trailing action column with a per-row delete button. |
| ` deleteLabel ` | ` string ` | No | ` 'Delete row' ` | Tooltip / aria-label for the row delete button. |
| ` resizable ` | ` boolean ` | No | ` false ` | Allow dragging a column's right edge to resize it. |
| ` columnWidths ` | ` Record<string, number> ` | No | ` undefined ` | Controlled column widths in px, keyed by column key (omit for uncontrolled). |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` DataFrameColumn `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L378) | See the linked SDK type definition. |
| [` SortState `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L370) | See the linked SDK type definition. |
| [` PaginationState `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L398) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables)

[Back to component library](/sdk/components/)
