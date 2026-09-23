---
aside: false
title: ChemicalFormula
description: "Formula renderer with scientific typography and element-aware formatting."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ChemicalFormula

Formula renderer with scientific typography, optional MS adduct notation, and compact pill styling. Use [AdductText](/sdk/components/adduct-text) when only the adduct should be displayed.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/ChemicalFormula.vue">Source</a>
</div>

<ComponentPlayground name="ChemicalFormula" />

## Import

```ts
import { ChemicalFormula } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<ChemicalFormula formula="C6H12O6" />
<ChemicalFormula formula="C6H12O6" adduct="[M+H]+" pill size="sm" />
<ChemicalFormula :formula="null" empty-text="Not assigned" tone="muted" />
```

Pass a plain formula string; the component renders subscripts/charges without requiring HTML. `inline` defaults to `true`; `:inline="false"` uses a block element. `pill`, `size`, and `tone` control presentation. Empty/null/whitespace-only formulas show `emptyText`; an adduct on its own is not rendered when the formula is empty.

The default slot appends content after a nonempty formula and its adduct. This component displays notation; it does not infer an adduct or calculate an ion's m/z.

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.6**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.6/packages/sdk-frontend/src/components/ChemicalFormula.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` formula ` | ` string \| null ` | No | ` null ` | — |
| ` inline ` | ` boolean ` | No | ` true ` | — |
| ` adduct ` | ` string \| null ` | No | ` null ` | — |
| ` emptyText ` | ` string ` | No | ` '-' ` | — |
| ` pill ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'xs' \| 'sm' \| 'inherit' ` | No | ` 'inherit' ` | — |
| ` tone ` | ` 'primary' \| 'secondary' \| 'muted' ` | No | ` 'primary' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
