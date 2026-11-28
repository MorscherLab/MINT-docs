---
aside: false
title: PlateEditor
description: "Controlled multi-plate editor over WellPlate: plate tabs, format and slot, group assignment, and a single-well inspector."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# PlateEditor

Use `PlateEditor` to edit one or more plates on top of [WellPlate](/sdk/components/well-plate): plate tabs, format and slot, group assignment, well drag, sample drop and a single-well inspector.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PlateEditor.vue">Source</a>
</div>

<demo vue="./demos/PlateEditor.vue" title="PlateEditor" description="A 96-well rack with blanks, QC and samples. Select wells, edit them, and undo or redo changes." />

## Import

```ts
import { PlateEditor } from "@morscherlab/mint-sdk/lab"
```

The component has no frame of its own. Put it in a [SectionCard](/sdk/components/section-card#content-in-a-card).

## Basic Usage

`PlateEditor` never changes its `modelValue` (`Rack[]`). It emits each action as an intent, and the caller applies it. In the shortest setup, [`useRackEditor()`](/sdk/frontend/composables#userackeditor) holds the plates and applies the intents. Set the features once with `definePlateEditor()` and pass them as `spec`.

```vue
<script setup lang="ts">
import { PlateEditor, definePlateEditor, useRackEditor } from '@morscherlab/mint-sdk/lab'
import type { Rack } from '@morscherlab/mint-sdk'

const initial: Rack[] = [
  { id: 'rack-1', name: 'Rack 1', format: 54, slot: 'R', injectionVolume: 5, wells: {} },
  { id: 'rack-2', name: 'Rack 2', format: 96, slot: 'G', injectionVolume: 5, wells: {} },
]

const { racks, activeRackId, plateEditorListeners, canUndo, canRedo } = useRackEditor(initial)
const editor = definePlateEditor({ slots: true, fillSeries: true, history: true })
</script>

<template>
  <PlateEditor
    :model-value="racks"
    v-model:active-rack="activeRackId"
    :spec="editor"
    :can-undo="canUndo"
    :can-redo="canRedo"
    v-on="plateEditorListeners"
  />
</template>
```

## Intents

| Event | Payload | Handled by `plateEditorListeners` |
|---|---|---|
| `update:activeRack` | `rackId` | Yes |
| `rack-add`, `rack-remove`, `rack-reorder` | —, `rackId`, `rackIds[]` | Yes |
| `update:format`, `update:slot` | `rackId`, format / slot | Yes |
| `well-edit`, `well-clear`, `well-move` | `rackId`, well ids, edit data | Yes |
| `sample-drop` | `rackId`, `wellId`, drop data, `DragEvent` | Yes |
| `assign` | `rackId`, `wellIds[]`, `groupId` (`undefined` clears) | Yes |
| `clear`, `fill-series` | `rackId` | Yes |
| `undo`, `redo` | — | Yes |
| `well-click` | `rackId`, `wellId` | No |
| `import` | `File` | No |
| `import-text` | pasted text (unparsed) | No |
| `export` | format string | No |
| `group-add` | — | No |
| `selection-change` | `wellIds[]` | No |

Bind the events in the last six rows yourself, for example `@group-add="addGroup"`. A `v-on` object hides an `@listener` of the same name. To add behavior to a handled intent, wrap the listener in your own object:

```ts
const listeners = {
  ...plateEditorListeners,
  'fill-series': (rackId: string) => {
    notify(rackId)
    plateEditorListeners['fill-series'](rackId)
  },
}
```

If you handle `assign` yourself, set `well.group = groupId` and keep `well.sampleType` (`'sample'` for an empty well). The group sets the color of the well. `sampleType` (sample, blank, qc, iqc) sets its marker.

## Capabilities

Turn features on in the `spec`: `formats`, `slots`, `reorder`, `wellDrag`, `groups`, `wellFields`, `sampleDrop`, `import` / `importAccept`, `export`, `clear`, `fillSeries`, `history`, `maxRacks` / `minRacks` and `size`. The default `size` is `xs`: compact square wells, with the names in the tooltip only. `readonly` stays a prop.

- Groups rail and inspector: at an editor width of 720px and more, a right rail lists the groups (swatch, name, well count and a "New group" row that emits `group-add`). Without `groups`, it lists the sample types. With one well selected, the rail holds the single-well inspector. On a narrower editor, the rail collapses and the inspector opens as a popover. The `#well-editor` slot replaces the inspector in both places.
- Selection: the keys are the same as in [WellPlate](/sdk/components/well-plate#selection). A switch to another plate also drops the anchor. A floating selection bar assigns groups.
- History: `history` shows Undo and Redo buttons, which follow `canUndo` and `canRedo`. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y work while the focus is in the editor. Text fields keep their own undo.
- Import and export: `import` shows an Import button. With `importMode: 'file'` (default), it opens a file picker filtered by `importAccept` and emits the `File`. With `'paste'`, it opens a Paste dialog and emits the confirmed text, unparsed, on `import-text`. The dialog opens empty and does not emit blank text. `'both'` offers both in a menu. `export` takes a list of formats and emits `export` with the chosen one. With `import` and `export`, one "Import / Export" menu holds all the items. The plugin parses and writes the files.
- Clear: `clear: 'confirm'` (default) asks first. `clearConfirm` sets the `title`, `message`, `confirmLabel` and `tone` of the dialog. `clear: 'undo'` clears at once and shows Undo. `false` hides the button.
- Fill series: on a full plate, `fillSeriesWhenFull: 'disable'` (default) disables the button. `'emit'` keeps it enabled and emits `fill-series`, so the plugin can show its own message.
- Read-only: `readonly` removes the editing controls. `well-click` still fires.

The slots are `#well-editor`, `#tab-extra` (tab bar) and `#toolbar-extra` (toolbar). Keyboard shortcuts listen on the component, never on the document.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/PlateEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` PlateEditorSpec ` | No | ` {} ` | Structure built with definePlateEditor(). Optional: every option has a default. |
| ` modelValue ` | ` Rack[] ` | Yes | — | The plates. Never mutated; changes arrive as emitted intents. |
| ` activeRack ` | ` string ` | No | ` undefined ` | Id of the active plate. Bind with v-model:active-rack; unbound, the tabs keep their own choice. |
| ` canUndo ` | ` boolean ` | No | ` false ` | — |
| ` canRedo ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | No editing controls; well clicks still emit well-click. |
| ` hint ` | ` string ` | No | ` undefined ` | Footer text while nothing is selected; replaces the built-in selection hint. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PlateEditorSpec `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L183) | See the linked SDK type definition. |
| [` Rack `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L109) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` clear ` | ` rackId: string ` | — |
| ` well-click ` | ` rackId: string, wellId: string ` | — |
| ` selection-change ` | ` wellIds: string[] ` | — |
| ` well-move ` | ` rackId: string, sourceWellId: string, targetWellId: string ` | — |
| ` well-edit ` | ` rackId: string, wellId: string, data: WellEditData ` | — |
| ` well-clear ` | ` rackId: string, wellId: string ` | — |
| ` sample-drop ` | ` rackId: string, wellId: string, data: WellSampleDropData, event: DragEvent ` | — |
| ` update:activeRack ` | ` rackId: string ` | — |
| ` rack-add ` | — | — |
| ` rack-remove ` | ` rackId: string ` | — |
| ` rack-reorder ` | ` rackIds: string[] ` | — |
| ` update:format ` | ` rackId: string, format: WellPlateFormat ` | — |
| ` update:slot ` | ` rackId: string, slot: SlotPosition ` | — |
| ` assign ` | ` rackId: string, wellIds: string[], groupId: string \| undefined ` | — |
| ` fill-series ` | ` rackId: string ` | — |
| ` import ` | ` file: File ` | — |
| ` import-text ` | ` text: string ` | — |
| ` export ` | ` format: string ` | — |
| ` group-add ` | — | — |
| ` undo ` | — | — |
| ` redo ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` well-editor ` | ` PlateEditorWellEditorSlotProps ` | Replaces the default single-well inspector, in the rail or the popover. |
| ` tab-extra ` | — | Extra controls at the right end of the tab bar. |
| ` toolbar-extra ` | — | Extra controls at the right end of the toolbar. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
