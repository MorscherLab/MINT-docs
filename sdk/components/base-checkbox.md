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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseCheckbox.vue">Source</a>
</div>

<demo vue="./demos/BaseCheckbox.vue" title="BaseCheckbox" description="A checkbox with a label. Click it to change the model value." />

## Import

```ts
import { BaseCheckbox } from "@morscherlab/mint-sdk"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/BaseCheckbox.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | No | ` false ` | — |
| ` type ` | ` 'checkbox' \| 'switch' ` | No | ` "checkbox" ` | checkbox (default) or an on/off switch. |
| ` indeterminate ` | ` boolean ` | No | ` false ` | Partially checked (e.g. select-all over a partial selection); sets aria-checked="mixed". |
| ` ariaLabel ` | ` string ` | No | ` undefined ` | Accessible name for the native input when no visible label is rendered (e.g. table rows). |
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` description ` | ` string ` | No | ` undefined ` | — |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | — |
| ` iconColor ` | ` string ` | No | ` undefined ` | — |
| ` iconBg ` | ` string ` | No | ` undefined ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` layout ` | ` 'inline' \| 'row' ` | No | ` "inline" ` | — |
| ` reverse ` | ` boolean ` | No | ` false ` | Switch only: place the switch before the label. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: boolean ` | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
