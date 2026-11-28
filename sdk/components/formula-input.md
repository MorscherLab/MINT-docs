---
aside: false
title: FormulaInput
description: "Text input for chemical formulas with a rendered preview and the molecular weight."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FormulaInput

Use `FormulaInput` to enter a chemical formula, for example `Ca(OH)2` or `CuSO4·5H2O`.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormulaInput.vue">Source</a>
</div>

<demo vue="./demos/FormulaInput.vue" title="FormulaInput" description="Chemical formula field. Type a formula and read its formatted preview." />

## Import

```ts
import { FormulaInput } from "@morscherlab/mint-sdk/lab"
```

## Behavior

- Without focus, the field shows the rendered formula. With focus, it shows the raw text.
- A fixed `MW · value · g/mol` segment shows the molecular weight.
- An unknown element or a formula that does not parse puts the field in the error state and names the symbol.
- The field accepts all 118 elements, hydrates (`·` or `*`) and trailing charges (`SO4^2-`, `Fe2+`, `NH4+`).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormulaInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` "" ` | — |
| ` showPreview ` | ` boolean ` | No | ` true ` | — |
| ` showMW ` | ` boolean ` | No | ` true ` | — |
| ` placeholder ` | ` string ` | No | ` "e.g. Ca(OH)2" ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: string ` | — |
| ` mw ` | ` mw: number \| null ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
