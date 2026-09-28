---
aside: false
title: ScientificNumber
description: "ScientificNumber is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ScientificNumber

ScientificNumber is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/ScientificNumber.vue">Source</a>
</div>

<ComponentPlayground name="ScientificNumber" />

## Import

```ts
import { ScientificNumber } from "@morscherlab/mint-sdk/components"
```

## Copying

The copy button appears on hover, on keyboard focus, and always on touch devices, and confirms with `Copied <value>`. Screen readers hear `6.022 × 10^23`, and a text selection across the number pastes `10^23`. The copy button, and a selection inside the number, copy the canonical string (`6.022e23 mol⁻¹`).

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.9**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/components/ScientificNumber.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` value ` | ` number ` | Yes | — | — |
| ` precision ` | ` number ` | No | ` 3 ` | — |
| ` notation ` | ` NumberNotation ` | No | ` 'auto' ` | — |
| ` unit ` | ` string ` | No | ` undefined ` | — |
| ` copyable ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` NumberNotation `](https://github.com/MorscherLab/MINT/blob/v1.2.9/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L4) | ` 'auto' \| 'scientific' \| 'engineering' \| 'compact' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
