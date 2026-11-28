---
aside: false
title: ScientificNumber
description: "Read-only number in plain, scientific or SI-prefix notation, with unit and copy button."
---

<p class="mint-component-library__eyebrow">Data display</p>

# ScientificNumber

Use `ScientificNumber` to show a measured value in plain, scientific (×10ⁿ) or SI-prefix notation.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ScientificNumber.vue">Source</a>
</div>

<demo vue="./demos/ScientificNumber.vue" title="ScientificNumber" description="Two numbers in scientific and compact notation. Compare how each notation shows a value." />

## Import

```ts
import { ScientificNumber } from "@morscherlab/mint-sdk/lab"
```

## Copying

- The copy button shows on hover and on keyboard focus, and always on touch devices. It confirms with `Copied <value>`.
- The copy button and a selection inside the number copy the canonical string (`6.022e23 mol⁻¹`). A selection across the number pastes `10^23`.
- Screen readers read `6.022 × 10^23`.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/ScientificNumber.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` value ` | ` number ` | Yes | — | — |
| ` precision ` | ` number ` | No | ` 3 ` | — |
| ` notation ` | ` NumberNotation ` | No | ` "auto" ` | — |
| ` unit ` | ` string ` | No | ` undefined ` | — |
| ` copyable ` | ` boolean ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` NumberNotation `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L4) | ` 'auto' \| 'scientific' \| 'engineering' \| 'compact' ` |

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
