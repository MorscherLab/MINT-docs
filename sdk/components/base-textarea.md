---
aside: false
title: BaseTextarea
description: "Multi-line input for notes, descriptions, and longer user-entered text."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseTextarea

Multi-line input for notes, descriptions, and longer user-entered text.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseTextarea.vue">Source</a>
</div>

<ComponentPlayground name="BaseTextarea" />

## Import

```ts
import { BaseTextarea } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseTextarea.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string ` | No | ` undefined ` | — |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` error ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` rows ` | ` number ` | No | ` 3 ` | — |
| ` resize ` | ` 'none' \| 'vertical' \| 'horizontal' \| 'both' ` | No | ` 'vertical' ` | — |
| ` maxlength ` | ` number ` | No | ` undefined ` | — |
| ` ariaDescribedby ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
