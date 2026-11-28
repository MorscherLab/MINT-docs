---
aside: false
title: FormField
description: "Label, hint, error, and accessibility wrapper for form controls."
---

<p class="mint-component-library__eyebrow">Forms</p>

# FormField

Use `FormField` around a form control to give it a label, a hint, an error and the matching accessibility attributes.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormField.vue">Source</a>
</div>

<demo vue="./demos/FormField.vue" title="FormField" description="Field wrapper with a label, hint and required mark. Type in the wrapped input." />

## Import

```ts
import { FormField } from "@morscherlab/mint-sdk"
```

## Row layout

`layout="row"` puts the label on the left and the control in a 7.5rem column. Use it for numbers, toggles and short selections. Keep long text controls stacked. Set `html-for` to the `id` of the input.

```vue
<FormField label="Replicates" html-for="replicates" layout="row">
  <input id="replicates" v-model.number="replicates" type="number" min="1" />
</FormField>
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormField.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` label ` | ` string ` | No | ` undefined ` | — |
| ` error ` | ` string ` | No | ` undefined ` | — |
| ` hint ` | ` string ` | No | ` undefined ` | — |
| ` required ` | ` boolean ` | No | ` false ` | — |
| ` showOptional ` | ` boolean ` | No | ` false ` | — |
| ` htmlFor ` | ` string ` | No | ` undefined ` | — |
| ` fieldId ` | ` string ` | No | ` undefined ` | Prefix for the label (-label), error and hint ids. |
| ` layout ` | ` 'stacked' \| 'row' ` | No | ` "stacked" ` | row puts the label left and the control in a fixed 7.5rem column. Use for numbers, toggles, short enums. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` default ` | ` { describedBy: string \| undefined; } ` | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
