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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/MoleculeInput.vue">Source</a>
</div>

<ComponentPlayground name="MoleculeInput" />

## Import

```ts
import { MoleculeInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/MoleculeInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` MoleculeData ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` height ` | ` number ` | No | ` 300 ` | — |
| ` showSmiles ` | ` boolean ` | No | ` true ` | — |
| ` placeholder ` | ` string ` | No | ` 'Draw a chemical structure' ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` MoleculeData `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentLabTypes.ts#L179) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
