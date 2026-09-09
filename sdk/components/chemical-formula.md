---
aside: false
title: ChemicalFormula
description: "Formula renderer with scientific typography and element-aware formatting."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ChemicalFormula

Formula renderer with scientific typography and element-aware formatting.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ChemicalFormula.vue">Source</a>
</div>

<ComponentPlayground name="ChemicalFormula" />

## Import

```ts
import { ChemicalFormula } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<ChemicalFormula formula="C6H12O6" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/ChemicalFormula.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` formula ` | ` string ` | Yes | — | — |
| ` inline ` | ` boolean ` | No | ` true ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
