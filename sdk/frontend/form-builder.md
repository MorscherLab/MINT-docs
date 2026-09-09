# FormBuilder

`FormBuilder` in SDK **1.2.1** renders a full `FormSchema`, a compact `controls` object, or a `defineControlModel()` workspace model. Use the same model and value object for forms, settings, and sidebars so every control edits the same state.

## When to use FormBuilder vs. hand-rolled forms

| FormBuilder | Hand-rolled |
|-------------|-------------|
| Form structure is data — comes from a plugin's design schema or a config | Form structure is fixed and known at compile time |
| You need conditional fields ("if X then show Y") declaratively | Conditional logic is simple `v-if` |
| Field set varies per experiment type or per-tenant | Same form everywhere |
| Validation rules are declarative (required, min/max, regex) | Custom validation needs (e.g., async server-side checks per keystroke) |

Most experiment-design plugins use FormBuilder for their design view. Analysis plugins use it when they have parameter forms, settings panels, or generated `ControlWorkspaceView` pages.

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

## Compact controls

For new plugin UI, start with compact controls when your form is ordinary fields and sections. One compact model can feed `FormBuilder`, `SettingsModal`, `AppSidebar`, `AppTopBar` settings, and `ControlWorkspaceView`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormBuilder, defineControls } from '@morscherlab/mint-sdk'

const controls = defineControls({
  threshold: {
    type: 'number',
    label: 'Threshold',
    default: 0.05,
    min: 0,
    max: 1,
    section: 'analysis',
  },
  method: {
    label: 'Method',
    default: 'linear',
    options: ['linear', 'logistic'],
    section: 'analysis',
  },
  includeQc: {
    label: 'Include QC samples',
    default: true,
    section: 'filters',
  },
})

const values = ref({})
</script>

<template>
  <FormBuilder
    v-model="values"
    :controls="controls"
  />
</template>
```

The SDK infers field types and defaults from simple values where it can. String and number option arrays are accepted directly by `BaseSelect`, `BaseRadioGroup`, `SegmentedControl`, and `MultiSelect`, so you do not need to expand every option into `{ value, label }` unless labels differ from values.

When the same controls should drive an entire page shell, wrap them in a model:

```ts
import { defineControlModel } from '@morscherlab/mint-sdk'

const workspaceModel = defineControlModel({
  views: {
    run: {
      label: 'Run',
      sections: {
        analysis: {
          label: 'Analysis',
          controls: {
            threshold: { type: 'number', default: 0.05, min: 0, max: 1 },
            method: { default: 'linear', options: ['linear', 'logistic'] },
          },
        },
      },
    },
  },
})
```

```vue
<ControlWorkspaceView
  v-model="values"
  :model="workspaceModel"
  title="Analysis"
  sidebar-title="Run controls"
/>
```

`ControlWorkspaceView` already provides the page shell. Do not nest it inside a second workspace shell. Its default content is a `FormBuilder`; enable `show-form-actions` and handle `@submit` to run an analysis. Set `form-loading` while submitting and `form-disabled` when required experiment/input state is absent.

When several surfaces share defaults, put overrides in `controlOptions.initialValues`:

```vue
<ControlWorkspaceView
  v-model="values"
  :model="workspaceModel"
  :control-options="{ initialValues: { threshold: 0.1 } }"
  :show-form-actions="true"
  title="Analysis"
/>
```

Control definitions use `default`; full `FormFieldSchema` definitions use `defaultValue`. Values loaded from an experiment override those defaults. Do not reapply defaults on each render or replace values after a failed load.

Use a full `FormSchema` when you need exact JSON schema-like control over every section, wizard step, conditional rule, or custom field.

## Field types

| Type | Backed by | Notes |
|------|-----------|-------|
| `text` | `BaseInput` | Single-line text |
| `email`, `password`, `tel`, `url`, `search` | `BaseInput` | Native input semantics |
| `secret` | SDK secret field | Managed secret-reference editing |
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
| `path` | SDK path field | Path input defined by the form schema |

The canonical list is `FormFieldType` in `packages/sdk-frontend/src/types/form-builder.ts`. The internal registry is readable through `getFieldRegistryEntry(type)` from `@morscherlab/mint-sdk/composables`.

## Typed tags in 1.2.1

Full `FormFieldSchema` entries with `type: 'tags'` can set `itemType: 'number'`
to parse entered tags as numbers; `itemType: 'string'` keeps strings. Generated
job forms preserve numeric array defaults and constraints in 1.2.1. Keep the
backend's Pydantic model authoritative for submitted input validation.

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
          label: 'Replicates',
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
      validate: (value: unknown) =>
        value === 'untitled' ? 'Choose a descriptive name' : null,
    },
  },
}
```

Bind this as `:enhancements="enhancements"` on `FormBuilder`. Keep Pydantic validation on the backend as well; browser validation does not protect an endpoint from malformed requests.

## Access-aware controls in 1.2

Use nested `access` rules on fields/sections and other SDK access-aware UI definitions:

```ts
const adminField = {
  name: 'batch_limit',
  type: 'number' as const,
  label: 'Batch limit',
  defaultValue: 100,
  access: { permissions: ['plugins.configure'] },
}
```

The old flat `permissions`, `anyPermissions`, `requiresAdmin`, and `visibleFor` fields are deprecated in 1.2; the nested policy wins if both forms are supplied. These rules control visibility, not server authorization. Settings endpoints must still require the corresponding backend permission.

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
import { useExperimentSave, useExperimentStore } from '@morscherlab/mint-sdk'
import { useFormBuilder } from '@morscherlab/mint-sdk/composables'

const builder = useFormBuilder(schema, existingDesignData ?? {})
const selection = useExperimentStore()
const { saveDesign, isSaving, lastSavedAt, error } = useExperimentSave({
  pluginId: 'my-plugin',
})

async function handleSave() {
  if (!builder.validate()) return
  const id = selection.current?.id
  if (id === undefined) return
  const saved = await saveDesign(id, builder.form.data)
  if (!saved) return // Keep the form; render error and let the user retry.
}
```

`useExperimentSave` exposes `isSaving`, `isLoading`, `error`, `lastLoadedAt`, and `lastSavedAt` refs, plus explicit helpers for design data, compatibility analysis results, and current-experiment saves.

This save path requires a platform experiment and permission to write design data. For a complete page that loads data when picker selection changes and handles missing/failed loads, see [Platform integration](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment). For plugin-owned SQL tables, submit through your generated plugin client instead of the experiment design endpoint.

## Notes

- The full `FormSchema` is JSON-serializable — you can fetch it from your plugin's backend at runtime if it varies per experiment type or per tenant.
- Compact controls are best for code-owned plugin UI; full schemas are best when the backend owns the exact form shape.
- `FormBuilder` syncs external `v-model` changes back into its internal state, so shared values stay coherent when `AppSidebar`, `SettingsModal`, and the main form edit the same object.
- For very large schemas (50+ fields), split the schema into smaller `sections` or use a wizard with `steps` so only the relevant fields are visible at once.
- `multiselect`, `molecule`, and `concentration` fields can hold non-trivial state. Keep them in their own sections so re-renders are scoped.
- For wizards, prefer the `StepWizard` component wrapping multiple smaller `FormBuilder` instances over one giant schema.

## Related

- [Component Library → FormBuilder](/sdk/components/form-builder) — basic usage
- [Composables → useFormBuilder](/sdk/frontend/composables#useformbuilder) — programmatic API
- [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables) — design plugin context
