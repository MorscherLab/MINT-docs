---
aside: false
title: MetadataSheet
description: "Spreadsheet-style editor for per-run sample metadata: factor columns with grouping roles, Excel copy and paste, CSV and Excel import."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# MetadataSheet

Spreadsheet-style editor for per-run sample metadata. Each row is one run. Each column is one factor, such as treatment or time. The sheet derives the group of each sample from the factor columns and marks missing and non-numeric values.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/components/MetadataSheet.vue">Source</a>
</div>

<demo vue="./demos/MetadataSheet.vue" title="MetadataSheet" description="Four samples and one blank with three factor columns. Edit a cell, drag the fill handle, or paste a table from Excel." />

## Import

```ts
import { MetadataSheet, mergeMetadataSheet } from "@morscherlab/mint-sdk/lab"
```

`MetadataSheet` is new in 1.5.1.

## Basic Usage

Bind both `v-model:rows` and `v-model:columns`. An edit of a column (label, kind, role, unit) updates `columns`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { MetadataSheet, type MetadataSheetColumn, type MetadataSheetRow } from '@morscherlab/mint-sdk/lab'

const columns = ref<MetadataSheetColumn[]>([
  { key: 'treatment', label: 'Treatment', kind: 'text', role: 'group' },
  { key: 'time', label: 'Time', kind: 'number', role: 'order', unit: 'h' },
])
const rows = ref<MetadataSheetRow[]>([])
</script>

<template>
  <MetadataSheet v-model:rows="rows" v-model:columns="columns" run-hint="from files" />
</template>
```

## Data model

| Type | Fields |
|------|--------|
| `MetadataSheetColumn` | `key` (stable id), `label`, `kind` (`'text'` or `'number'`), `role`, `unit` (shown next to the label of a number column) |
| `MetadataSheetRow` | `run` (run name; rows match by it on import), `type` (a value of `types`), `values` (keyed by column `key`) |
| `MetadataSheetType` | `value`, `label`. The default types are `sample`, `blank` and `qc`. Only rows of `sampleType` take factor values |

A column has one of four roles:

| Role | Meaning |
|------|---------|
| `group` | Groups samples. Each distinct value is its own group |
| `order` | Groups samples and orders them, for example time or dose |
| `rep` | Replicate label. Its values collapse into replicates of one group |
| `info` | Free annotation. It does not take part in grouping |

The group of a sample is the joined values of its `group` and `order` columns. A sample with a missing grouping value has no group. The footer counts samples, missing cells, non-numeric cells and cells "to check".

## Editing

- Click or drag to select cells. Type to edit. `Enter`, `Tab` and the arrow keys move. `Escape` cancels an edit. `Delete` clears the selected cells.
- Drag the fill handle to repeat values down a column.
- `Cmd+Z` (or `Ctrl+Z`) undoes the last change (100 steps).
- `Cmd+C` and `Cmd+V` (or `Ctrl`) exchange tab-separated cells with Excel.
- A pasted block or an imported CSV or `.xlsx` file whose header names the run column is merged by run name. The run column is the first header that reads `run`, `sample`, `file`, `name`, `sample name`, `file name` or `run name`, or equals `runLabel`. A header such as `Time (h)` sets the unit of a number column. Column kinds and roles are guessed. The user can change them in the column menu.
- The run column is at most 20rem wide. A longer run name, such as a file path, is cut at its start, so its end stays visible. The full name shows on hover.

## Who owns the runs

The `runs` prop sets who adds rows.

| `runs` | Run names | An import or header paste | Empty sheet |
|--------|-----------|---------------------------|-------------|
| `'editable'` (default) | Typed, renamed, unique. Rows can be added, pasted past the end or deleted | Adds a row for each new run name | Takes a dropped, uploaded or pasted table, or "Start blank" |
| `'imported'` | Read-only | Adds a row for each new run name | Takes a table |
| `'fixed'` | Read-only. The host owns the rows, for example one row for each data file | Fills only the rows that match | Offers no upload |

Every row that an import or a header paste adds is also emitted as `add-runs`, after `update:rows` carried it. Use the event to react to new runs.

`runsEditable` is deprecated. Use `runs` instead: `true` is `'editable'` and `false` is `'fixed'`. When both are set, `runs` wins. 2.0 removes `runsEditable`.

## Locking, validation and import

- `lockedColumns` is a list of column keys. The cells, name and existence of these columns are fixed. The user can still change their kind and role.
- `columnsAddable: false` stops new columns from the "+" button, a wide paste or an import.
- `validateCell(value, column, row)` is a host rule for filled cells. Return a message to mark the cell like a non-numeric value. The message shows on hover and the footer counts the cell "to check". Return `null` to accept. The value stays editable.
- Pass `experiments` to show the "From experiment" menu. It is hidden when the list is empty. A choice emits `import-experiment` with `'fill'` or `'replace'`. The host loads the design of that experiment and merges it with `mergeMetadataSheet`.

```ts
import { mergeMetadataSheet } from '@morscherlab/mint-sdk/lab'

async function onImportExperiment(experiment, mode) {
  const incoming = await loadDesignAsSheet(experiment.id) // your code
  const merged = mergeMetadataSheet({ rows: rows.value, columns: columns.value }, incoming, mode)
  columns.value = merged.columns
  rows.value = merged.rows
}
```

`mergeMetadataSheet(sheet, incoming, mode)` matches rows by run name and columns by label (case-insensitive). It adds an unknown column. `'fill'` writes only empty cells. `'replace'` also overwrites. An empty incoming value never clears a cell. The result also holds `filled`, `replaced`, `unknownRuns` (incoming runs with no row, which are not added) and `addedColumns`.

## Toolbar

The `actions` slot adds host buttons before Undo. An empty sheet shows only these host actions, and no toolbar when the host has none. The drop zone is the one import entry of an empty sheet. Filter, Import, Copy sheet and Paste appear when the sheet has rows. The `empty` slot replaces the drop zone.

## Helpers

The `lab` entry also exports the pure helpers that the component uses. The type of the whole sheet is `MetadataSheetData`.

| Helper | Use |
|--------|-----|
| `mergeMetadataSheet` | Merge an incoming sheet by run name and column label |
| `metadataSheetFromTable` | Read a table (first row is the header) as a sheet |
| `metadataSheetToTsv` | Write the sheet as tab-separated text with a header row |
| `metadataGroupKey`, `metadataGroupId`, `metadataSampleGroups` | Group label, group identity and replicate count of each group |
| `metadataTypeFromText`, `isMetadataHeaderRow`, `guessMetadataRole` | Parse typed text, detect a header row, guess a column role |

<!-- sdk-props:start -->
## Props

MINT SDK **1.5.5**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/components/MetadataSheet.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` rows ` | ` MetadataSheetRow[] ` | Yes | — | — |
| ` columns ` | ` MetadataSheetColumn[] ` | Yes | — | — |
| ` types ` | ` readonly MetadataSheetType[] ` | No | ` DEFAULT_METADATA_TYPES ` | Row types. Only sampleType rows take factor values. |
| ` sampleType ` | ` string ` | No | ` "sample" ` | — |
| ` runLabel ` | ` string ` | No | ` "Run" ` | Header of the run column. |
| ` runHint ` | ` string ` | No | ` undefined ` | Small note under the run header, e.g. "from files". |
| ` showType ` | ` boolean ` | No | ` true ` | Show the type column. |
| ` experiments ` | ` readonly MetadataSheetExperiment[] ` | No | ` [] ` | Experiments offered by the "From experiment" menu. The menu is hidden when empty. |
| ` linkedExperiment ` | ` string \| null ` | No | ` null ` | Code of the experiment the sheet came from; shown on the source button. |
| ` runs ` | ` MetadataSheetRuns ` | No | ` undefined ` | Who adds rows. editable: run names are user data (typed, renamed, added, deleted; "Start blank"), and an import adds rows for new names. imported: names are read-only, but an import adds rows for new names. fixed: the host owns the rows, e.g. one per data file; an import only fills matching rows, and an empty sheet offers no upload. Rows an import adds are also emitted as add-runs. Overrides runsEditable. |
| ` runsEditable ` | ` boolean ` | No | ` true ` | — |
| ` lockedColumns ` | ` readonly string[] ` | No | ` [] ` | Keys of columns whose cells, name and existence are fixed (kind and role stay editable). |
| ` columnsAddable ` | ` boolean ` | No | ` true ` | Allow new columns from "+", a wide paste or an import. |
| ` validateCell ` | ` (value: string, column: MetadataSheetColumn, row: MetadataSheetRow) => string \| null ` | No | ` undefined ` | Host rule for a filled factor cell: a message marks the cell (shown on hover) and counts in the footer; null accepts the value. Values stay editable; the sheet only warns. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` MetadataSheetRow `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/utils/metadataSheet.ts#L20) | See the linked SDK type definition. |
| [` MetadataSheetColumn `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/utils/metadataSheet.ts#L10) | See the linked SDK type definition. |
| [` MetadataSheetType `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/utils/metadataSheet.ts#L28) | See the linked SDK type definition. |
| [` MetadataSheetExperiment `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/components/MetadataSheet.vue#L33) | See the linked SDK type definition. |
| [` MetadataSheetRuns `](https://github.com/MorscherLab/MINT/blob/v1.5.5/packages/sdk-frontend/src/utils/metadataSheet.ts#L39) | ` 'editable' \| 'imported' \| 'fixed' ` |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:rows ` | ` rows: MetadataSheetRow[] ` | — |
| ` update:columns ` | ` columns: MetadataSheetColumn[] ` | — |
| ` add-runs ` | ` rows: MetadataSheetRow[] ` | — |
| ` import-experiment ` | ` experiment: MetadataSheetExperiment, mode: "fill" \| "replace" ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` actions ` | — | Extra toolbar buttons, before Undo. |
| ` empty ` | ` { pickFile: () => void; } ` | Replaces the drop zone shown while the sheet has no rows. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
