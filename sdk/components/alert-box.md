---
aside: false
title: AlertBox
description: "Inline status, warning, error, and success messages for plugin screens."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# AlertBox

Inline status, warning, error, and success messages for plugin screens.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AlertBox.vue">Source</a>
</div>

<ComponentPlayground name="AlertBox" />

## Import

```ts
import { AlertBox } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<AlertBox type="warning" title="Review required">
  Three samples need QC approval before publishing.
</AlertBox>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AlertBox.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` type ` | ` AlertType ` | No | ` 'info' ` | — |
| ` title ` | ` string ` | No | ` undefined ` | — |
| ` dismissible ` | ` boolean ` | No | ` false ` | — |
| ` actionLabel ` | ` string ` | No | ` undefined ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` AlertType `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/components.ts#L54) | ` 'success' \| 'error' \| 'warning' \| 'info' ` |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
