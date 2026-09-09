---
aside: false
title: ConcentrationInput
description: "ConcentrationInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# ConcentrationInput

ConcentrationInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ConcentrationInput.vue">Source</a>
</div>

<ComponentPlayground name="ConcentrationInput" />

## Import

```ts
import { ConcentrationInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/ConcentrationInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ConcentrationValue ` | No | ` undefined ` | — |
| ` allowedUnits ` | ` ConcentrationUnit[] ` | No | ` undefined ` | — |
| ` showConversion ` | ` boolean ` | No | ` true ` | — |
| ` molecularWeight ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` undefined ` | — |
| ` max ` | ` number ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` placeholder ` | ` string ` | No | ` 'Enter value' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ConcentrationValue `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/useConcentrationUnits.ts#L9) | See the linked SDK type definition. |
| [` ConcentrationUnit `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/useConcentrationUnits.ts#L7) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
