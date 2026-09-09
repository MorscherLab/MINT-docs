---
aside: false
title: FormField
description: "Label, hint, error, and accessibility wrapper for form controls."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FormField

Label, hint, error, and accessibility wrapper for form controls.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FormField.vue">Source</a>
</div>

<ComponentPlayground name="FormField" />

## Import

```ts
import { FormField } from "@morscherlab/mint-sdk/components"
```

## Row layout in 1.2.1

`layout="row"` places the label on the left and a short control in a 7.5rem
column. Use it for numbers, toggles and short selections; leave long text
controls stacked. Connect `html-for` to the actual input's `id`.

```vue
<FormField label="Replicates" html-for="replicates" layout="row">
  <input id="replicates" v-model.number="replicates" type="number" min="1" />
</FormField>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/FormField.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` error ` | ` string ` | No | ` undefined ` | — |
| ` hint ` | ` string ` | No | ` undefined ` | — |
| ` required ` | ` boolean ` | No | ` false ` | — |
| ` showOptional ` | ` boolean ` | No | ` false ` | — |
| ` htmlFor ` | ` string ` | No | ` undefined ` | — |
| ` fieldId ` | ` string ` | No | ` undefined ` | — |
| ` layout ` | ` 'stacked' \| 'row' ` | No | ` 'stacked' ` | row puts the label left and the control in a fixed 7.5rem column. Use for numbers, toggles, short enums. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
