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
import type { FormSchema } from '@morscherlab/mint-sdk/types'

const schema: FormSchema = {
  sections: [
    {
      id: 'main',
      title: 'Panel',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Panel name',
          placeholder: 'e.g. Cisplatin dose-response',
          validation: { required: true },
        },
        {
          name: 'category',
          type: 'select',
          label: 'Category',
          props: {
            options: [
              { value: 'tox', label: 'Toxicology' },
              { value: 'eff', label: 'Efficacy' },
            ],
          },
          defaultValue: 'eff',
        },
        {
          name: 'replicates',
          type: 'number',
          label: 'Replicates',
          props: { min: 1, max: 12, step: 1 },
          defaultValue: 3,
        },
      ],
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
| `checkbox` | `BaseCheckbox` | Boolean checkbox |
| `toggle` | `BaseToggle` | Boolean switch |
| `select` | `BaseSelect` | Single choice from `options` |
| `multiselect` | `MultiSelect` | Multiple choices |
| `radio` | `BaseRadioGroup` | Compact single choice |
| `slider` | `BaseSlider` | Range-style numeric input |
| `tags` | `TagsInput` | Free-text tags |
| `date` | `DatePicker` | ISO date string |
| `datetime` | `DateTimePicker` | ISO timestamp |
| `time` | `TimePicker` | `HH:MM` string |
| `formula` | `FormulaInput` + `useChemicalFormula` | Chemical formula with parsing |
| `sequence` | `SequenceInput` | DNA / protein sequence input |
| `molecule` | `MoleculeInput` | Molecule structure input |
| `concentration` | `ConcentrationInput` + `useConcentrationUnits` | Value + unit picker |
| `unit` | `UnitInput` | Value + unit picker |
| `file` | `FileUploader` | Single or multi-file |

The canonical list is `FormFieldType` in `packages/sdk-frontend/src/types/form-builder.ts`. The internal registry is readable through `getFieldRegistryEntry(type)` from `@morscherlab/mint-sdk/composables`.

## Validation

Validation rules attached to fields:

```ts
const schema: FormSchema = {
  sections: [
    {
      id: 'main',
      title: 'Main',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          validation: { required: true, minLength: 3, maxLength: 200 },
        },
        {
          name: 'doi',
          type: 'text',
          label: 'DOI',
          validation: {
            pattern: { value: '^10\\.\\d{4,9}/.+$', message: 'Must look like 10.NNNN/...' },
          },
        },
        {
          name: 'replicates',
          type: 'number',
          validation: { required: true, min: 1, max: 12 },
        },
      ],
    },
  ],
}
```

Errors render below each field automatically. Use a template ref when you need imperative validation:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormBuilder } from '@morscherlab/mint-sdk'

const formRef = ref<InstanceType<typeof FormBuilder> | null>(null)

function submit() {
  if (!formRef.value?.validate()) return
  // safe to submit
}
</script>

<template>
  <FormBuilder ref="formRef" :schema="schema" v-model="data" @submit="submit" />
</template>
```

For custom rules, pass TypeScript-only `enhancements`:

```ts
const enhancements = {
  fields: {
    name: {
      validate: (value) => isDuplicate(value) ? 'Name already exists' : null,
    },
  },
}
```

## Conditional fields

Fields and sections can declare `condition` to render only when other fields meet a condition:

```ts
{
  name: 'subcategory',
  type: 'select',
  label: 'Subcategory',
  condition: { field: 'category', eq: 'tox' },
}
```

More complex conditions use `and`, `or`, and `not`:

```ts
{
  id: 'advanced',
  title: 'Advanced',
  condition: {
    or: [
      { field: 'expert_mode', eq: true },
      { and: [
        { field: 'category', eq: 'eff' },
        { field: 'replicates', gt: 6 },
      ]},
    ],
  },
}
```

Available operators: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `in`, `notIn`, `truthy`, `falsy`, `contains`, `and`, `or`, `not`.

## Programmatic control with `useFormBuilder`

For pages that need to drive the form imperatively (custom validation step, multi-step wizards):

```ts
import { useFormBuilder } from '@morscherlab/mint-sdk/composables'

const builder = useFormBuilder(schema, { replicates: 3 })

async function submit() {
  if (!builder.validate()) return
  await api.post('/my-plugin/panels', builder.form.data)
  builder.reset()
}
```

The composable returns `form.data`, `form.errors`, visibility helpers, wizard navigation helpers, and `validate()` / `reset()` methods.

## Custom rendering

The registry is not a public mutable API. To render a field with custom UI, use the `field:<name>` slot and keep the field in the schema so validation, visibility, and submission still work:

```vue
<FormBuilder :schema="schema" v-model="data">
  <template #field:dose="{ form }">
    <MyDosePicker
      :model-value="form.data.dose"
      @update:model-value="form.setFieldValue('dose', $event)"
    />
  </template>
</FormBuilder>
```

## Default values

Each field can declare a `defaultValue`. When the model is initialized empty, defaults populate. To override the platform's defaults from existing experiment data:

```ts
const builder = useFormBuilder(schema, existingDesignData ?? {})
```

Initial data overrides per-field defaults — that's intentional for editing flows. Read and write values through `builder.form.data`.

## Saving back to the experiment

For experiment-design plugins, pair FormBuilder with `useExperimentSave`:

```ts
import { useExperimentSave } from '@morscherlab/mint-sdk'
import { useFormBuilder } from '@morscherlab/mint-sdk/composables'

const builder = useFormBuilder(schema, existingDesignData ?? {})
const { save, isSaving, lastSavedAt, error } = useExperimentSave({
  pluginId: 'my-plugin',
})

async function handleSave() {
  if (!builder.validate()) return
  await save(1, { design: builder.form.data })
}
```

`useExperimentSave` exposes `isSaving`, `isLoading`, `error`, `lastLoadedAt`, and `lastSavedAt` refs, plus explicit helpers for design data, analysis results, and current-experiment saves.

## Notes

- The schema is JSON-serializable — you can fetch it from your plugin's backend at runtime if it varies per experiment type or per tenant.
- For very large schemas (50+ fields), split the schema into smaller `sections` or use a wizard with `steps` so only the relevant fields are visible at once.
- `multiselect`, `molecule`, and `concentration` fields can hold non-trivial state. Keep them in their own sections so re-renders are scoped.
- For wizards, prefer the `StepWizard` component wrapping multiple smaller `FormBuilder` instances over one giant schema.

## Related

- [Components → FormBuilder](/sdk/frontend/components#formbuilder) — basic usage
- [Composables → useFormBuilder](/sdk/frontend/composables#useformbuilder) — programmatic API
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — design plugin context
