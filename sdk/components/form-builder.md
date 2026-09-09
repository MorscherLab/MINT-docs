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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/FormBuilder.vue">Source</a>
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

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/FormBuilder.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` schema ` | ` FormSchema ` | No | ` undefined ` | Full form or wizard schema. Takes precedence when controls is also provided. |
| ` model ` | ` ControlModel \| ControlModelBinding ` | No | ` undefined ` | Model returned by defineControlModel(), or a raw nested ControlModel for one-step form generation. |
| ` controls ` | ` ControlSchema ` | No | ` undefined ` | Compact control schema used to generate a flat FormSchema. |
| ` controlOptions ` | ` ControlWorkspaceOptions ` | No | ` () => ({}) ` | Options passed to compact control schema generation, including shared initialValues. |
| ` modelValue ` | ` Record<string, unknown> ` | No | ` undefined ` | — |
| ` enhancements ` | ` FormEnhancements<Record<string, unknown>> ` | No | ` undefined ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | — |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` undefined ` | — |
| ` readonly ` | ` boolean ` | No | ` false ` | — |
| ` showActions ` | ` boolean ` | No | ` true ` | Show the default or slotted form actions. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` FormSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/form-builder.ts#L133) | See the linked SDK type definition. |
| [` ControlModel `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L173) | See the linked SDK type definition. |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L187) | See the linked SDK type definition. |
| [` ControlSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L140) | See the linked SDK type definition. |
| [` ControlWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L155) | See the linked SDK type definition. |
| [` FormEnhancements `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/form-builder.ts#L164) | See the linked SDK type definition. |

<!-- sdk-props:end -->

## Related

- [FormBuilder deep dive](/sdk/frontend/form-builder)

[Back to component library](/sdk/components/)
