---
aside: false
title: BaseCheckbox
description: "Single checkbox control for boolean plugin settings and form fields."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseCheckbox

Single checkbox control for boolean plugin settings and form fields.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseCheckbox.vue">Source</a>
</div>

<ComponentPlayground name="BaseCheckbox" />

## Import

```ts
import { BaseCheckbox } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseCheckbox.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | No | ` false ` | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | — |
| ` iconColor ` | ` string ` | No | ` undefined ` | — |
| ` iconBg ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` variant ` | ` 'default' \| 'row' ` | No | ` 'default' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
