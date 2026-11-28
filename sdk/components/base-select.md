---
aside: false
title: BaseSelect
description: "Themed select control with option objects, placeholder, and v-model support."
---

<p class="mint-component-library__eyebrow">Forms</p>

# BaseSelect

Themed select control with option objects, placeholder, and v-model support.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseSelect.vue">Source</a>
</div>

<demo vue="./demos/BaseSelect.vue" title="BaseSelect" description="A select with three options. Choose an option to change the model value." />

## Import

```ts
import { BaseSelect } from "@morscherlab/mint-sdk"
```

## Typed value

`BaseSelect` is generic over the option value type and over `multiple`. `v-model` and `update:modelValue` carry the type of `options` (an array with `multiple`). `InstanceType<typeof BaseSelect>` does not resolve; use `ComponentExposed` from `vue-component-type-helpers`.

```vue
<BaseSelect v-model="polarity" :options="[{ value: 'pos', label: 'Positive' }, { value: 'neg', label: 'Negative' }]" searchable />
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/BaseSelect.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` (M extends true ? T[] : T) \| null ` | No | ` null ` | The selected value; an array with multiple. |
| ` options ` | ` SelectOptionInput<T>[] ` | Yes | — | — |
| ` multiple ` | ` M ` | No | ` undefined ` | Bind an array and pick several options (chip field + checkbox listbox). |
| ` searchable ` | ` boolean ` | No | ` false ` | Single selection in a listbox with a search field. Ignored with multiple. |
| ` max ` | ` number ` | No | ` undefined ` | Most options a multiple select accepts. |
| ` placeholder ` | ` string ` | No | ` undefined ` | — |
| ` searchPlaceholder ` | ` string ` | No | ` undefined ` | Search field placeholder (searchable). |
| ` noResultsText ` | ` string ` | No | ` undefined ` | Text shown when the search matches no option (searchable). |
| ` disabled ` | ` boolean ` | No | ` false ` | — |
| ` invalid ` | ` boolean ` | No | ` false ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` ariaDescribedby ` | ` string ` | No | ` undefined ` | — |
| ` ariaLabelledby ` | ` string ` | No | ` undefined ` | Id of the visible label. searchable: the trigger is then named by the label and the selected value. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SelectOptionInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L118) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:modelValue ` | ` value: M extends true ? T[] : T ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` option ` | ` { option: SelectOption<OptionPrimitive>; selected: boolean; active: boolean; } ` | searchable only: custom option row. |
| ` footer ` | — | searchable only: content under the option list. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
