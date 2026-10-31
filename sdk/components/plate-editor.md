---
aside: false
title: PlateEditor
description: "Controlled multi-plate editor over WellPlate: plate tabs, format and slot, group assignment, and a single-well inspector."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# PlateEditor

Controlled multi-plate editor over [WellPlate](/sdk/components/well-plate): plate tabs, format and slot controls, group assignment, well drag, sample drop, and a single-well inspector.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PlateEditor.vue">Source</a>
</div>

<demo vue="./demos/PlateEditor.vue" title="PlateEditor" description="A 96-well rack with blanks, QC and samples. Select wells, edit them, and undo or redo changes." />

## Import

```ts
import { PlateEditor } from "@morscherlab/mint-sdk/lab"
```

## Basic Usage

`PlateEditor` never changes its `modelValue` (`Rack[]`). Every action is emitted as an intent for the caller to apply. The shortest setup lets [`useRackEditor()`](/sdk/frontend/composables#userackeditor) hold the plates and apply the intents:

```vue
<script setup lang="ts">
import { PlateEditor, useRackEditor, type Rack } from '@morscherlab/mint-sdk'

const initial: Rack[] = [
  { id: 'rack-1', name: 'Rack 1', format: 54, slot: 'R', injectionVolume: 5, wells: {} },
  { id: 'rack-2', name: 'Rack 2', format: 96, slot: 'G', injectionVolume: 5, wells: {} },
]

const { racks, activeRackId, plateEditorListeners, canUndo, canRedo } = useRackEditor(initial)
</script>

<template>
  <PlateEditor
    :model-value="racks"
    :active-rack-id="activeRackId"
    slots
    fill-series
    history
    :can-undo="canUndo"
    :can-redo="canRedo"
    v-on="plateEditorListeners"
  />
</template>
```

`useRackEditor()` copies the initial racks, so your objects are not mutated. Its undo history holds 50 steps.

## Intents

| Event | Payload | Handled by `plateEditorListeners` |
|---|---|---|
| `update:activeRackId` | `rackId` | Yes |
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

Bind the events in the last six rows yourself, for example `@group-add="addGroup"`. A `v-on` object shadows an `@listener` of the same name; to add behavior to a handled intent, wrap the listener in your own object:

```ts
const listeners = {
  ...plateEditorListeners,
  'fill-series': (rackId: string) => {
    notify(rackId)
    plateEditorListeners['fill-series'](rackId)
  },
}
```

If you handle `assign` yourself, set `well.group = groupId` and keep `well.sampleType` (`'sample'` for an empty well). The group colors the well; `sampleType` (sample / blank / qc / iqc) sets its marker.

## Capabilities

Features are opt-in props: `formats`, `slots`, `reorder`, `wellDrag`, `groups`, `wellFields`, `sampleDrop`, `import` / `importAccept`, `export`, `clear`, `fillSeries`, `history`, `maxRacks` / `minRacks`, `readonly`, and `size` (default `xs`: compact square wells, names in the tooltip only).

- **Groups rail and inspector.** At an editor width of 720px and wider, a right rail lists the groups (swatch, name, well count, and a "New group" row that emits `group-add`); without `groups` it lists the sample types. With one well selected, the rail holds the single-well inspector. Narrower, the rail collapses and the inspector opens as a popover. The `#well-editor` slot replaces the inspector in both places.
- **Selection.** A plain click selects one well. Ctrl/Cmd-click toggles a well. Shift-click (or Shift+Enter, Shift+Space) selects the rectangle from the anchor well to the clicked well. The anchor is the last well that got a plain click or a Ctrl/Cmd-click, or the start of a dragged rectangle. Ctrl/Cmd+Shift-click adds the rectangle to the current selection. Escape, an empty selection, or a switch to another plate drops the anchor. Without an anchor, Shift-click toggles a well like Ctrl/Cmd-click. A floating selection bar assigns groups.
- **History.** `history` shows Undo / Redo buttons, which follow `canUndo` / `canRedo`. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y work while focus is inside the editor; text fields keep their own undo.
- **Import / Export.** `import` shows an Import button. `importMode` sets what it offers: `'file'` (default) opens a file picker, filtered by `importAccept`, and emits the `File`; `'paste'` opens a Paste dialog and emits the confirmed text, unparsed, on `import-text`; `'both'` offers both in a menu. The Paste dialog opens empty each time and does not emit blank text. `export` takes a list of formats and emits `export` with the chosen one. With `import` and `export`, one "Import / Export" menu holds all the items. Parsing and writing files is up to the plugin.
- **Clear.** `clear="confirm"` asks first; `clearConfirm` sets the dialog's `title`, `message`, `confirmLabel`, and `variant`. `clear="undo"` clears at once and relies on Undo. `false` hides the button.
- **Fill Series.** `fillSeriesWhenFull="disable"` (default) disables the button on a full plate; `"emit"` keeps it enabled and still emits `fill-series`, so the plugin can show its own message.
- **Read-only.** `readonly` removes the editing controls; `well-click` still fires.

Slots: `#well-editor`, `#tab-extra` (tab bar), `#toolbar-extra` (toolbar). Keyboard shortcuts listen on the component, never on the document.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PlateEditor.vue).

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
| [` PlateEditorSpec `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L184) | See the linked SDK type definition. |
| [` Rack `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L110) | See the linked SDK type definition. |

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

## Related

- [WellPlate](/sdk/components/well-plate)
- [Composables: `useRackEditor`](/sdk/frontend/composables#userackeditor)

[Back to component library](/sdk/components/)
