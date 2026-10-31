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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ConcentrationInput.vue">Source</a>
</div>

<demo vue="./demos/ConcentrationInput.vue" title="ConcentrationInput" description="Value and unit input with a molecular weight. Change the value or the unit to convert the concentration." />

## Import

```ts
import { ConcentrationInput } from "@morscherlab/mint-sdk/lab"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/ConcentrationInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` ConcentrationValue ` | No | ` undefined ` | — |
| ` allowedUnits ` | ` ConcentrationUnit[] ` | No | ` undefined ` | — |
| ` showConversion ` | ` boolean ` | No | ` true ` | — |
| ` molecularWeight ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` undefined ` | — |
| ` max ` | ` number ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` placeholder ` | ` string ` | No | ` "Enter value" ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ConcentrationValue `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/useConcentrationUnits.ts#L9) | See the linked SDK type definition. |
| [` ConcentrationUnit `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/useConcentrationUnits.ts#L7) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: ConcentrationValue \| undefined ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
