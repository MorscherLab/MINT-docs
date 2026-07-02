---
title: DataFrame
description: "Searchable, sortable, selectable table for dense experiment and analysis results."
---

<p class="mint-component-library__eyebrow">Data display</p>

# DataFrame

Searchable, sortable, selectable table for dense experiment and analysis results.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/DataFrame.vue">Source</a>
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

## Related

- [Design plugin with tables](/sdk/tutorials/design-plugin-with-tables)

[Back to component library](/sdk/components/)
