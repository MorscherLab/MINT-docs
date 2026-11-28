---
aside: false
title: MoleculeView
description: "Read-only SMILES structure drawing, bare or as a tile with the SMILES and a copy button."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# MoleculeView

Use `MoleculeView` to draw a structure from a SMILES string, without editing.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/MoleculeView.vue">Source</a>
</div>

<demo vue="./demos/MoleculeView.vue" title="MoleculeView" description="Citrate as a tile with the SMILES footer, and aspirin as a bare drawing with the SMILES under it." />

## Import

```ts
import { MoleculeView } from "@morscherlab/mint-sdk/lab"
```

## Basic Usage

```vue
<MoleculeView smiles="CC1CC(=O)O1" :height="120" />
<MoleculeView smiles="OC(=O)CC(O)(CC(O)=O)C(O)=O" variant="tile" :height="200" />
```

- `variant="bare"` (the default) shows only the drawing. `showSmiles` adds the SMILES under it.
- `variant="tile"` adds a border and a footer with the SMILES and a copy button. `compact` removes the footer.
- Without `height`, the drawing fills its container.
- The drawing follows the light or dark theme.
- When the SMILES does not parse, the component shows the SMILES as text and emits `error`.
- The renderer (`smiles-drawer`) loads when the component mounts, so a page without a structure does not load it.

To let the user type or edit a structure, use [MoleculeInput](/sdk/components/molecule-input). `MoleculeInput` with `readonly` shows the structure in a `MoleculeView` tile.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/MoleculeView.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` smiles ` | ` string ` | Yes | — | — |
| ` variant ` | ` 'bare' \| 'tile' ` | No | ` "bare" ` | — |
| ` height ` | ` number ` | No | ` undefined ` | Height in px. Without it, the drawing fills its container. |
| ` showSmiles ` | ` boolean ` | No | ` false ` | Bare variant: show the SMILES under the drawing. |
| ` compact ` | ` boolean ` | No | ` false ` | Tile variant: hide the SMILES footer. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` error ` | ` message: string ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
