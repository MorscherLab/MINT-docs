---
aside: false
title: UnitInput
description: "UnitInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# UnitInput

UnitInput is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/UnitInput.vue">Source</a>
</div>

<ComponentPlayground name="UnitInput" />

## Import

```ts
import { UnitInput } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/UnitInput.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` number ` | No | ` undefined ` | — |
| ` unit ` | ` string ` | No | ` undefined ` | — |
| ` units ` | ` UnitOption[] ` | Yes | — | — |
| ` precision ` | ` number ` | No | ` undefined ` | — |
| ` min ` | ` number ` | No | ` undefined ` | — |
| ` max ` | ` number ` | No | ` undefined ` | — |
| ` step ` | ` number ` | No | ` undefined ` | — |
| ` placeholder ` | ` string ` | No | ` 'Enter value' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` convertOnUnitChange ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UnitOption `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L7) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
