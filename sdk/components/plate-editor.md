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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/PlateEditor.vue">Source</a>
</div>

<ComponentPlayground name="PlateEditor" />

## Import

```ts
import { PlateEditor } from "@morscherlab/mint-sdk/components"
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

## Plate-map data

A BioTemplate `plate-map` binding renders `PlateEditor` with the template's samples as `groups` and the format pinned to the plate format. To edit stored plate-map data by hand, convert it to racks:

```ts
import { racksFromPlateState, toPlateMapEditorState } from '@morscherlab/mint-sdk/templates'

const racks = racksFromPlateState(toPlateMapEditorState(template))
```

`racksFromPlateState` assigns slots in order and moves each well's sample id from `sampleType` to `group`. Both helpers belong to the biology `templates` exports, which are scheduled to leave the core SDK in MINT 1.4.

<!-- sdk-props:start -->
## Props

MINT SDK **1.3.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/components/PlateEditor.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` Rack[] ` | Yes | — | The plates. Never mutated; changes arrive as emitted intents. |
| ` activeRackId ` | ` string ` | No | ` undefined ` | — |
| ` formats ` | ` WellPlateFormat[] ` | No | ` () => [54, 96] ` | Formats offered by the format control; one entry hides it. |
| ` slots ` | ` boolean \| SlotPosition[] ` | No | ` false ` | R/G/B/Y slot buttons: true for all four, a list for a subset. |
| ` reorder ` | ` boolean ` | No | ` true ` | Reorder plate tabs by drag or Alt+←/→. |
| ` wellDrag ` | ` boolean ` | No | ` false ` | Show the Drag toggle that moves / swaps wells (well-move). |
| ` groups ` | ` SampleType[] \| false ` | No | ` false ` | Groups for the selection bar; a well's group holds the group id and colors it. |
| ` wellFields ` | ` WellEditField[] \| false ` | No | ` () => ['label', 'sampleType', 'injectionVolume', 'injectionCount', 'customMethod'] ` | Fields of the single-well inspector; false turns the inspector off. |
| ` sampleDrop ` | ` boolean \| WellSampleDropParser ` | No | ` false ` | Accept dropped samples: true reads JSON payloads, a parser may return null to reject. |
| ` import ` | ` boolean ` | No | ` false ` | Show an Import button: a chosen file emits import, pasted text import-text (see importMode). |
| ` importMode ` | ` 'file' \| 'paste' \| 'both' ` | No | ` 'file' ` | What import offers: a file picker, a paste dialog whose text import-text emits unparsed, or both. |
| ` importAccept ` | ` string ` | No | ` undefined ` | The file picker's accept filter for import, e.g. '.csv'. |
| ` export ` | ` string[] \| false ` | No | ` false ` | Export formats offered in the Import / Export menu; each emits export. |
| ` clear ` | ` 'confirm' \| 'undo' \| false ` | No | ` 'confirm' ` | Clear-plate button: ask first, clear with an Undo button, or hide it. |
| ` clearConfirm ` | ` PlateEditorClearConfirm ` | No | ` undefined ` | Text and variant of the clear="confirm" dialog; unset fields keep the defaults. |
| ` history ` | ` boolean ` | No | ` false ` | Show Undo / Redo (also shown when clear is 'undo'); they only emit intents. |
| ` canUndo ` | ` boolean ` | No | ` false ` | — |
| ` canRedo ` | ` boolean ` | No | ` false ` | — |
| ` fillSeries ` | ` boolean ` | No | ` false ` | Show the Fill Series button. |
| ` fillSeriesWhenFull ` | ` 'disable' \| 'emit' ` | No | ` 'disable' ` | On a full plate: disable Fill Series, or keep it enabled and still emit fill-series (e.g. to show a toast). |
| ` maxRacks ` | ` number ` | No | ` 10 ` | — |
| ` minRacks ` | ` number ` | No | ` 1 ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | No editing controls; well clicks still emit well-click. |
| ` size ` | ` WellPlateSize ` | No | ` 'xs' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` Rack `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L108) | See the linked SDK type definition. |
| [` WellPlateFormat `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L2) | See the linked SDK type definition. |
| [` SlotPosition `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L38) | ` 'R' \| 'G' \| 'B' \| 'Y' ` |
| [` SampleType `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L126) | See the linked SDK type definition. |
| [` WellEditField `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L59) | ` 'label' \| 'sampleType' \| 'injectionVolume' \| 'injectionCount' \| 'customMethod' ` |
| [` WellSampleDropParser `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L79) | See the linked SDK type definition. |
| [` PlateEditorClearConfirm `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L118) | See the linked SDK type definition. |
| [` WellPlateSize `](https://github.com/MorscherLab/MINT/blob/v1.3.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L5) | ` 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'fill' ` |

<!-- sdk-props:end -->

## Related

- [WellPlate](/sdk/components/well-plate)
- [Composables: `useRackEditor`](/sdk/frontend/composables#userackeditor)

[Back to component library](/sdk/components/)
