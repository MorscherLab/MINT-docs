---
aside: false
title: BaseToggle
description: "BaseToggle is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseToggle

BaseToggle is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseToggle.vue">Source</a>
</div>

<ComponentPlayground name="BaseToggle" />

## Import

```ts
import { BaseToggle } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/BaseToggle.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | No | ` false ` | — |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` ariaLabel ` | ` string ` | No | ` undefined ` | Accessible switch name; defaults to the visual label, then "Toggle". |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | — |
| ` iconColor ` | ` string ` | No | ` undefined ` | — |
| ` iconBg ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` reverse ` | ` boolean ` | No | ` false ` | — |
| ` variant ` | ` 'default' \| 'row' ` | No | ` 'default' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
