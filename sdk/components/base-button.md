---
aside: false
title: BaseButton
description: "Tokenized action button with variants, sizes, loading, and disabled states."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseButton

Tokenized action button with variants, sizes, loading, and disabled states.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseButton.vue">Source</a>
</div>

<ComponentPlayground name="BaseButton" />

## Import

```ts
import { BaseButton } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<BaseButton variant="primary" :loading="saving" @click="save">
  Save
</BaseButton>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/BaseButton.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` variant ` | ` ButtonVariant ` | No | ` 'primary' ` | — |
| ` size ` | ` ButtonSize ` | No | ` 'md' ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` type ` | ` 'button' \| 'submit' \| 'reset' ` | No | ` 'button' ` | — |
| ` fullWidth ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ButtonVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L7) | ` 'primary' \| 'secondary' \| 'cta' \| 'danger' \| 'success' \| 'ghost' ` |
| [` ButtonSize `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L8) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
