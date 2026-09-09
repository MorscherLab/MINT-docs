---
aside: false
title: BaseRadioGroup
description: "BaseRadioGroup is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseRadioGroup

BaseRadioGroup is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseRadioGroup.vue">Source</a>
</div>

<ComponentPlayground name="BaseRadioGroup" />

## Import

```ts
import { BaseRadioGroup } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseRadioGroup.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | No | ` undefined ` | — |
| ` options ` | ` RadioOptionInput[] ` | Yes | — | — |
| ` name ` | ` string ` | Yes | — | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` direction ` | ` 'horizontal' \| 'vertical' ` | No | ` 'vertical' ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` variant ` | ` 'list' \| 'tile' ` | No | ` 'list' ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` RadioOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L118) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
