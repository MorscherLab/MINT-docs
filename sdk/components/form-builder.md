---
aside: false
title: FormBuilder
description: "Control-model form renderer for experiment-design and plugin settings UIs."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# FormBuilder

Use `FormBuilder` to render a form from a control model that you build with `defineControlModel()`.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormBuilder.vue">Source</a>
</div>

<demo vue="./demos/FormBuilder.vue" title="FormBuilder" description="Form built from a schema. Edit the fields and watch the JSON values change." />

## Import

```ts
import { FormBuilder } from "@morscherlab/mint-sdk"
```

## Basic Usage

```vue
<FormBuilder :spec="designModel" v-model="designData" />
```

Build `designModel` with `defineControlModel()`. For control models, field types, validation and conditional fields, see the [FormBuilder guide](/sdk/frontend/form-builder).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/FormBuilder.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` ControlModelBinding ` | No | ` undefined ` | Control model built with defineControlModel(). Optional: without it the form is empty. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` undefined ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L153) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` data: Record<string, unknown> ` | — |
| ` submit ` | ` data: Record<string, unknown> ` | — |
| ` cancel ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
