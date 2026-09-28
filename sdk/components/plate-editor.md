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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/main/packages/sdk-frontend/src/components/PlateEditor.vue">Source</a>
</div>

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
| `export` | format string | No |
| `group-add` | — | No |
| `selection-change` | `wellIds[]` | No |

Bind the events in the last five rows yourself, for example `@group-add="addGroup"`. A `v-on` object shadows an `@listener` of the same name; to add behavior to a handled intent, wrap the listener in your own object:

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
- **Selection.** A plain click selects one well. Ctrl/Cmd-click or Shift-click toggles a well; a floating selection bar assigns groups.
- **History.** `history` shows Undo / Redo buttons, which follow `canUndo` / `canRedo`. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y work while focus is inside the editor; text fields keep their own undo.
- **Import / Export.** `import` opens a file picker (filtered by `importAccept`) and emits the `File`. `export` takes a list of formats and emits `export` with the chosen one. Parsing and writing files is up to the plugin.
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
<!-- props generated at release -->
<!-- sdk-props:end -->

## Related

- [WellPlate](/sdk/components/well-plate)
- [Composables: `useRackEditor`](/sdk/frontend/composables#userackeditor)

[Back to component library](/sdk/components/)
