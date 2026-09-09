---
aside: false
title: DropdownButton
description: "DropdownButton is a forms component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Forms</p>

# DropdownButton

DropdownButton is a forms component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DropdownButton.vue">Source</a>
</div>

<ComponentPlayground name="DropdownButton" />

## Import

```ts
import { DropdownButton } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/DropdownButton.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` string \| number ` | No | ` undefined ` | Selected option value |
| ` options ` | ` SelectOptionInput<string \| number>[] ` | Yes | — | Available options |
| ` placeholder ` | ` string ` | No | ` undefined ` | Placeholder text when no option is selected |
| ` variant ` | ` ButtonVariant ` | No | ` 'secondary' ` | Button style variant |
| ` size ` | ` ButtonSize ` | No | ` 'md' ` | Button size |
| ` disabled ` | ` boolean ` | No | ` false ` | Disable interaction |
| ` loading ` | ` boolean ` | No | ` false ` | Show loading spinner |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L85) | See the linked SDK type definition. |
| [` ButtonVariant `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L7) | ` 'primary' \| 'secondary' \| 'cta' \| 'danger' \| 'success' \| 'ghost' ` |
| [` ButtonSize `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L8) | ` 'sm' \| 'md' \| 'lg' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
