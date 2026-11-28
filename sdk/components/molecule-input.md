---
aside: false
title: MoleculeInput
description: "Chemical structure editor (JSME) that emits a SMILES string."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# MoleculeInput

Use `MoleculeInput` to let the user draw or edit a chemical structure. The value is a SMILES string.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/MoleculeInput.vue">Source</a>
</div>

<demo vue="./demos/MoleculeInput.vue" title="MoleculeInput" description="Read-only molecule view that draws a structure from a SMILES string." />

## Import

```ts
import { MoleculeInput } from "@morscherlab/mint-sdk/lab"
```

With `readonly`, the input shows the structure in a [MoleculeView](/sdk/components/molecule-view) tile. An invalid input keeps the error border while it has focus.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/MoleculeInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` MoleculeData ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` height ` | ` number ` | No | ` 300 ` | — |
| ` showSmiles ` | ` boolean ` | No | ` true ` | — |
| ` placeholder ` | ` string ` | No | ` "Draw a chemical structure" ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` MoleculeData `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentLabTypes.ts#L273) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` error ` | ` message: string ` | — |
| ` update:modelValue ` | ` data: MoleculeData \| undefined ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
