---
aside: false
title: MoleculeInput
description: "MoleculeInput is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# MoleculeInput

MoleculeInput is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/MoleculeInput.vue">Source</a>
</div>

<demo vue="./demos/MoleculeInput.vue" title="MoleculeInput" description="Read-only molecule view that draws a structure from a SMILES string." />

## Import

```ts
import { MoleculeInput } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/MoleculeInput.vue).

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
| [` MoleculeData `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentLabTypes.ts#L265) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` error ` | ` message: string ` | — |
| ` update:modelValue ` | ` data: MoleculeData \| undefined ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
