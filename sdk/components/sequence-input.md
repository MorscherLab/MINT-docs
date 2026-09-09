---
aside: false
title: SequenceInput
description: "SequenceInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# SequenceInput

SequenceInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/SequenceInput.vue">Source</a>
</div>

<ComponentPlayground name="SequenceInput" />

## Import

```ts
import { SequenceInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/SequenceInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` '' ` | — |
| ` type ` | ` SequenceType ` | No | ` 'auto' ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` showStats ` | ` boolean ` | No | ` true ` | — |
| ` showTools ` | ` boolean ` | No | ` true ` | — |
| ` maxLength ` | ` number ` | No | ` undefined ` | — |
| ` placeholder ` | ` string ` | No | ` 'Paste or type sequence...' ` | — |
| ` rows ` | ` number ` | No | ` 6 ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SequenceType `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/useSequenceUtils.ts#L1) | ` 'dna' \| 'rna' \| 'protein' \| 'auto' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
