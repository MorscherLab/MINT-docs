---
aside: false
title: ChemicalFormula
description: "Formula renderer with scientific typography and element-aware formatting."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ChemicalFormula

Use `ChemicalFormula` to show a formula with subscripts and charges, as text or as a pill. To show only an adduct, use [AdductText](/sdk/components/adduct-text).

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ChemicalFormula.vue">Source</a>
</div>

<demo vue="./demos/ChemicalFormula.vue" title="ChemicalFormula" description="Two chemical formulas with subscript digits. Compare how the component formats each formula." />

## Import

```ts
import { ChemicalFormula } from "@morscherlab/mint-sdk/lab"
```

## Basic Usage

```vue
<ChemicalFormula formula="C6H12O6" />
<ChemicalFormula formula="C6H12O6" adduct="[M+H]+" pill size="sm" />
<ChemicalFormula :formula="null" empty-text="Not assigned" tone="muted" />
```

- Pass a plain formula string. The component renders the subscripts and charges; no HTML is necessary.
- `inline` defaults to `true`. `:inline="false"` uses a block element.
- `pill`, `size` and `tone` set the appearance.
- An empty, null or whitespace-only formula shows `emptyText`. The adduct does not show without a formula.

- The default slot adds content after a formula and its adduct.
- The component only shows notation. It does not find an adduct or calculate the m/z of an ion.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ChemicalFormula.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` formula ` | ` string \| null ` | No | ` null ` | — |
| ` inline ` | ` boolean ` | No | ` true ` | — |
| ` adduct ` | ` string \| null ` | No | ` null ` | — |
| ` emptyText ` | ` string ` | No | ` "-" ` | — |
| ` pill ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'xs' \| 'sm' \| 'inherit' ` | No | ` "inherit" ` | — |
| ` tone ` | ` 'primary' \| 'secondary' \| 'muted' ` | No | ` "primary" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
