---
aside: false
title: DoseCalculator
description: "DoseCalculator is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Lab widgets</p>

# DoseCalculator

DoseCalculator is a lab widgets component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DoseCalculator.vue">Source</a>
</div>

<ComponentPlayground name="DoseCalculator" />

## Import

```ts
import { DoseCalculator } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DoseCalculator.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` mode ` | ` CalculatorMode \| 'auto' ` | No | ` 'auto' ` | — |
| ` molecularWeight ` | ` number ` | No | ` undefined ` | — |
| ` targetWells ` | ` string[] ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` CalculatorMode `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DoseCalculator.vue#L18) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
