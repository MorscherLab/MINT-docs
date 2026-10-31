---
aside: false
title: FormBuilder
description: "Schema-driven form renderer for experiment-design and plugin settings UIs."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# FormBuilder

Schema-driven form renderer for experiment-design and plugin settings UIs.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/FormBuilder.vue">Source</a>
</div>

<ComponentPlayground name="FormBuilder" />

## Import

```ts
import { FormBuilder } from "@morscherlab/mint-sdk/components"
```

## Basic Usage

```vue
<FormBuilder :schema="designSchema" v-model="designData" />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/FormBuilder.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` spec ` | ` ControlModelBinding ` | No | ` undefined ` | Control model built with defineControlModel(). Optional: without it the form is empty. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` undefined ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L156) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [FormBuilder deep dive](/sdk/frontend/form-builder)

[Back to component library](/sdk/components/)
