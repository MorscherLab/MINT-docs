# FormBuilder

`FormBuilder` is a schema-driven form engine in the frontend SDK. Used by experiment-design plugins to render their design schema, it eliminates per-plugin form boilerplate while keeping enough flexibility for custom field types and conditional logic.

## When to use FormBuilder vs. hand-rolled forms

| FormBuilder | Hand-rolled |
|-------------|-------------|
| Form structure is data — comes from a plugin's design schema or a config | Form structure is fixed and known at compile time |
| You need conditional fields ("if X then show Y") declaratively | Conditional logic is simple `v-if` |
| Field set varies per experiment type or per-tenant | Same form everywhere |
| Validation rules are declarative (required, min/max, regex) | Custom validation needs (e.g., async server-side checks per keystroke) |

Most experiment-design plugins use FormBuilder for their design view; analysis plugins typically don't need it.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormBuilder } from '@morscherlab/mint-sdk'
import type { FormSchema } from '@morscherlab/mint-sdk'

const schema: FormSchema = {
  fields: [
    {
      key: 'name',
      type: 'text',
      label: 'Panel name',
      required: true,
      placeholder: 'e.g. Cisplatin dose-response',
    },
    {
      key: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { value: 'tox', label: 'Toxicology' },
        { value: 'eff', label: 'Efficacy' },
      ],
      default: 'eff',
    },
    {
      key: 'replicates',
      type: 'number',
      label: 'Replicates',
      min: 1, max: 12, step: 1,
      default: 3,
    },
  ],
}

const data = ref({})
</script>

<template>
  <FormBuilder :schema="schema" v-model="data" />
</template>
```

`data.value` updates as the user types. Validation errors are rendered inline; submission state is managed by the wrapping page.

## Field types

| Type | Backed by | Notes |
|------|-----------|-------|
| `text` | `BaseInput` | Single-line text |
| `textarea` | `BaseTextarea` | Auto-grow multi-line |
| `number` | `NumberInput` | Numeric with min/max/step |
| `boolean` | `BaseCheckbox` or `BaseToggle` | Distinguished by `style` field |
| `select` | `BaseSelect` | Single choice from `options` |
| `multi-select` | `MultiSelect` | Multiple choices |
| `radio` | `BaseRadioGroup` | Compact single choice |
| `date` | `DatePicker` | ISO date string |
| `datetime` | `DateTimePicker` | ISO timestamp |
| `time` | `TimePicker` | `HH:MM` string |
| `formula` | `FormulaInput` + `useChemicalFormula` | Chemical formula with parsing |
| `concentration` | `ConcentrationInput` + `useConcentrationUnits` | Value + unit picker |
| `well-plate` | `WellPlate` + `useWellPlateEditor` | Plate-design field |
| `file` | `FileUploader` | Single or multi-file |
| `section` | `FormSection` | Collapsible group of fields |

The full list is exported from the SDK's `formBuilderRegistry`.

## Validation

Validation rules attached to fields:

```ts
const schema: FormSchema = {
  fields: [
    {
      key: 'name', type: 'text', label: 'Name',
      required: true,
      minLength: 3,
      maxLength: 200,
    },
    {
      key: 'doi', type: 'text', label: 'DOI',
      pattern: /^10\.\d{4,9}\/.+$/,
      patternMessage: 'Must look like 10.NNNN/...',
    },
    {
      key: 'replicates', type: 'number',
      required: true, min: 1, max: 12,
    },
  ],
}
```

Errors render below each field automatically. The aggregated error state is exposed via the `errors` event on `FormBuilder`:

```vue
<FormBuilder :schema="schema" v-model="data" @errors="onErrors" />
```

For custom rules, declare a `validate` function that returns an error message or `null`:

```ts
{
  key: 'name', type: 'text', label: 'Name',
  validate: async (value, ctx) => {
    if (await isDuplicate(value)) return 'Name already exists'
    return null
  }
}
```

## Conditional fields

Fields can declare `showIf` to render only when other fields meet a condition:

```ts
{
  key: 'subcategory',
  type: 'select',
  label: 'Subcategory',
  options: [...],
  showIf: { field: 'category', equals: 'tox' },
}
```

More complex conditions use the `evaluateCondition` helper:

```ts
{
  key: 'advanced',
  type: 'section',
  label: 'Advanced',
  showIf: {
    or: [
      { field: 'expert_mode', equals: true },
      { and: [
        { field: 'category', equals: 'eff' },
        { field: 'replicates', greaterThan: 6 },
      ]},
    ],
  },
}
```

Available operators: `equals`, `notEquals`, `greaterThan`, `lessThan`, `in`, `notIn`, `truthy`, `and`, `or`.

## Programmatic control with `useFormBuilder`

For pages that need to drive the form imperatively (custom validation step, multi-step wizards):

```ts
import { useFormBuilder } from '@morscherlab/mint-sdk'

const { fields, model, errors, validate, reset } = useFormBuilder({
  schema,
  initial: { replicates: 3 },
})

async function submit() {
  const ok = await validate()
  if (!ok) return
  await api.post('/api/my-plugin/panels', model.value)
  reset()
}
```

The composable returns reactive `model` and `errors`; `validate()` returns `true` when all fields pass.

## Custom field types

To add a field type not covered by the registry:

```ts
import { getFieldRegistryEntry } from '@morscherlab/mint-sdk'
import { defineComponent } from 'vue'

import MyCustomField from './MyCustomField.vue'

// Register at app startup, before any FormBuilder mounts
import { fieldRegistry } from '@morscherlab/mint-sdk'

fieldRegistry.register('my-custom', {
  component: MyCustomField,
  defaultValue: '',
  validate: (value) => /* return error or null */,
})
```

Then use `type: 'my-custom'` in your schema.

## Default values

Each field can declare a `default`. When `model` is initialized empty, defaults populate. To override the platform's defaults from existing experiment data:

```ts
const { model } = useFormBuilder({
  schema,
  initial: existingDesignData ?? {},   // pre-populate from server
})
```

Note that `initial` overrides per-field defaults — that's intentional for editing flows.

## Saving back to the experiment

For experiment-design plugins, pair FormBuilder with `useExperimentSave`:

```ts
import { useExperimentSave } from '@morscherlab/mint-sdk'

const { save, isSaving, lastSaved, conflict } = useExperimentSave({
  experimentId: 1,
  pluginId: 'my-plugin',
})

async function handleSave() {
  if (!await validate()) return
  await save(model.value)
}
```

`useExperimentSave` handles conflict detection (someone else edited the same experiment), surface the conflict via `conflict.value`.

## Notes

- The schema is JSON-serializable — you can fetch it from your plugin's backend at runtime if it varies per experiment type or per tenant.
- For very large schemas (50+ fields), use `<FormSection>` to group fields and lazy-render — the form rendering is `O(visible fields)`.
- `multi-select` and `well-plate` fields can hold non-trivial state. Keep them in their own sections so re-renders are scoped.
- For wizards, prefer the `StepWizard` component wrapping multiple smaller `FormBuilder` instances over one giant schema.

## Related

- [Components → FormBuilder](/sdk/frontend/components#formbuilder) — basic usage
- [Composables → useFormBuilder](/sdk/frontend/composables#useformbuilder) — programmatic API
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — design plugin context
