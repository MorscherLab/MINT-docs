# FormBuilder

`FormBuilder` renders a control model that you build with `defineControlModel()`. Pass the model as the one `:spec` prop. Use the same model and value object for forms, settings and sidebars, so that every control edits the same state. For the props table, see [Component Library → FormBuilder](/sdk/components/form-builder).

`enhancements` and `actions` (the submit and cancel bar) are part of the control model, not separate props.

## When to use FormBuilder vs. hand-rolled forms

| FormBuilder | Hand-rolled |
|-------------|-------------|
| Form structure is data — comes from a plugin's design schema or a config | Form structure is fixed and known at compile time |
| You need conditional fields ("if X then show Y") declaratively | Conditional logic is simple `v-if` |
| Field set changes with the experiment type | Same form everywhere |
| Validation rules are declarative (required, min/max, regex) | Custom validation, for example an async server check on each keystroke |

Experiment-design plugins use FormBuilder for the design view. Analysis plugins use it for parameter forms, settings panels and the sidebar that `PluginWorkspaceView` generates.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormBuilder, defineControlModel } from '@morscherlab/mint-sdk'

const spec = defineControlModel({
  controls: {
    name: {
      type: 'text',
      label: 'Panel name',
      placeholder: 'e.g. Cisplatin dose-response',
      required: true,
    },
    category: {
      label: 'Category',
      options: [
        { value: 'tox', label: 'Toxicology' },
        { value: 'eff', label: 'Efficacy' },
      ],
      default: 'eff',
    },
    replicates: { type: 'number', label: 'Replicates', min: 1, max: 12, default: 3 },
  },
  actions: true,
})

const data = ref({})
</script>

<template>
  <FormBuilder v-model="data" :spec="spec" @submit="save" />
</template>
```

- `data.value` changes as the user types. Validation errors show below each field.
- `actions: true` shows the submit and cancel bar at the right: Cancel (a `secondary` button), then Submit. Without `actions`, there is no bar.
- In a wizard form with `actions`, the bar has the `StepWizard` layout. The step counter `n / total` is at the left. Cancel, Back and Next (Submit on the last step) are at the right. Back is disabled on step 1.
- The `submit` event carries only the values of the visible fields.

## Control models

A control model is the one definition for the form, the settings modal, the sidebar and the top-bar settings. The SDK infers field types and defaults from simple values where it can. `BaseSelect`, `BaseRadioGroup` and `SegmentedControl` accept arrays of strings or numbers as options. Use `{ value, label }` only when a label differs from its value.

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
            includeQc: { label: 'Include QC samples', default: true },
          },
        },
      },
    },
  },
  initialValues: { threshold: 0.1 },
  actions: { submitLabel: 'Run analysis', showCancel: false },
})
```

To drive a whole page from the model, pass it to `PluginWorkspaceView` as `spec.sidebar.controls`. See [Composables → `defineControlModel`](/sdk/frontend/composables#definecontrolmodel-and-usecontrolworkspace) for the example, and [AppLayout or a workspace?](/sdk/frontend/#applayout-or-a-workspace) for the shell rules.

Form-wide props:

- `loading`: set it while the form submits.
- `disabled`: set it when the experiment or a required input is missing.
- `readonly` and `size` (`sm`, `md`, `lg`).

Precedence of values: values loaded from an experiment override `initialValues` of the model, and `initialValues` override the `default` of each control. Do not apply the defaults again on each render. Do not replace the values after a failed load.

Control options: `type`, `label`, `default`, `placeholder`, `hint`, `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `email`, `validation`, `condition`, `access`, `options`, `section`, `view`, `order`, `colSpan`, `props`, and `sidebar`. Section options: `label`, `description`, `columns` (1, 2, or 3), `condition`, `access`, `defaultOpen`, and `showToggle`.

A raw `FormSchema` (sections, wizard `steps`, and exact field definitions) is still the type of the `sidebar.forms` entries and the argument of `useFormBuilder()`. `FormBuilder` itself takes only `spec`.

## Field types

| Type | Backed by | Notes |
|------|-----------|-------|
| `text` | `BaseInput` | Single-line text |
| `email`, `password`, `tel`, `url`, `search` | `BaseInput` | Native input semantics |
| `secret` | `SecretInput` | Managed secret-reference editing |
| `textarea` | `BaseInput type="textarea"` | Multi-line text |
| `number` | `NumberInput` | Numeric with min/max/step |
| `checkbox` | `BaseCheckbox` | Boolean checkbox |
| `toggle` | `BaseCheckbox type="switch"` | Boolean switch |
| `select` | `BaseSelect` | Single choice from `options` |
| `multiselect` | `BaseSelect multiple` | Multiple choices |
| `radio` | `BaseRadioGroup` | Compact single choice |
| `slider` | `BaseSlider` | Range-style numeric input |
| `tags` | `TagsInput` | Free-text tags |
| `date` | `DatePicker` | ISO date string |
| `datetime` | `DatePicker type="datetime"` | ISO timestamp |
| `time` | `DatePicker type="time"` | `HH:MM` string |
| `formula` | `FormulaInput` | Chemical formula with parsing |
| `sequence` | `SequenceInput` | DNA / protein sequence input |
| `molecule` | `MoleculeInput` | Molecule structure input |
| `concentration` | `ConcentrationInput` | Value + unit picker |
| `unit` | `NumberInput` with `units` | Value + unit picker |
| `file` | `FileUploader` | Single or multi-file |
| `path` | `GeneratedPathInput` | Server path reference from a read-only mount |

The canonical list is `FormFieldType` in `packages/sdk-frontend/src/types/form-builder.ts`. The internal registry is readable through `getFieldRegistryEntry(type)` from `@morscherlab/mint-sdk/runtime`.

### Field types that load on first use

The components of the `path`, `file`, `molecule`, `formula` and `sequence` types load when a form first shows such a field. The other types, `date`, `time` and `datetime` included, load with the form. This applies to `FormBuilder`, `SettingsModal` and the generated UI.

- Until the component arrives, the field keeps its label and a box of its height. Values, validation, `submit` and `v-model` work as before.
- When the chunk does not load, the field shows an error with a **Retry** button, and the console logs the error one time. When the retry also fails, the message asks for a page reload.
- For these types, `getFieldRegistryEntry(type).component` returns the loading wrapper.
- A `field:<name>` slot renders its own component at once.

In a test that finds one of these fields right after mount (`find`, `findComponent` or `global.stubs`), load the components first:

```ts
import { beforeAll } from 'vitest'
import { preloadFormFieldTypes } from '@morscherlab/mint-sdk/runtime'

beforeAll(() => preloadFormFieldTypes())
```

## Typed tags

Raw `FormFieldSchema` entries (not control definitions) with `type: 'tags'` can set
`itemType: 'number'` to parse entered tags as numbers; `itemType: 'string'` keeps
strings. Generated job forms preserve numeric array defaults and constraints. Keep the
backend's Pydantic model authoritative for submitted input validation.

## Validation

Validation rules attach to each control:

```ts
const spec = defineControlModel({
  controls: {
    name: { type: 'text', label: 'Name', required: true, minLength: 3, maxLength: 200 },
    doi: {
      type: 'text',
      label: 'DOI',
      pattern: { value: '^10\\.\\d{4,9}/.+$', message: 'Must look like 10.NNNN/...' },
    },
    replicates: { type: 'number', label: 'Replicates', required: true, min: 1, max: 12 },
  },
})
```

A `validation` object (`FieldValidation`) works as well. Errors render below each field automatically. Use a template ref when you need imperative validation:

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
  <FormBuilder ref="formRef" :spec="spec" v-model="data" @submit="submit" />
</template>
```

`FormBuilder` exposes `form`, `builder`, `validate()`, `reset()`, `updateSchema()`, `goNext()`, `goBack()`, and `goToStep()`.

For custom rules, set TypeScript-only `enhancements` in the control model:

```ts
const spec = defineControlModel({
  controls: { name: { type: 'text', label: 'Name' } },
  enhancements: {
    fields: {
      name: {
        validate: (value: unknown) =>
          value === 'untitled' ? 'Choose a descriptive name' : null,
      },
    },
  },
})
```

`enhancements` also takes `onSubmit`, `transform`, and `onFieldChange`, and each field takes `visible`, `options`, and `props` callbacks for dynamic behavior. Keep Pydantic validation on the backend as well; browser validation does not protect an endpoint from malformed requests.

## Access-aware controls

Use nested `access` rules on controls/sections and other SDK access-aware UI definitions:

```ts
const controls = {
  batch_limit: {
    type: 'number',
    label: 'Batch limit',
    default: 100,
    access: { permissions: ['plugins.configure'] },
  },
}
```

An `access` rule controls only what the form shows. It is not authorization: the settings endpoint must require the permission on the backend. See [`usePlatform`](/sdk/frontend/composables#useplatform).

## Conditional fields

Controls and sections can declare `condition` to render only when other fields meet a condition:

```ts
{
  subcategory: {
    type: 'select',
    label: 'Subcategory',
    condition: { field: 'category', eq: 'tox' },
  },
}
```

More complex conditions use `and`, `or`, and `not`:

```ts
{
  sections: {
    advanced: {
      label: 'Advanced',
      condition: {
        or: [
          { field: 'expert_mode', eq: true },
          { and: [
            { field: 'category', eq: 'eff' },
            { field: 'replicates', gt: 6 },
          ]},
        ],
      },
      controls: { /* ... */ },
    },
  },
}
```

Available operators: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `in`, `notIn`, `truthy`, `falsy`, `contains`, `and`, `or`, `not`.

## Programmatic control with `useFormBuilder`

To control the form from code, for example a custom validation step or a multi-step wizard, use `useFormBuilder` from `@morscherlab/mint-sdk/runtime`. It takes a raw `FormSchema`:

```ts
import { useFormBuilder } from '@morscherlab/mint-sdk/runtime'
import type { FormSchema } from '@morscherlab/mint-sdk/types'

const schema: FormSchema = {
  sections: [
    { id: 'main', title: 'Main', fields: [{ name: 'replicates', type: 'number', label: 'Replicates' }] },
  ],
}
const builder = useFormBuilder(schema, { replicates: 3 })

async function submit() {
  if (!builder.validate()) return
  await client.savePanel({ body: builder.form.data })
  builder.reset()
}
```

The composable returns `form.data`, `form.errors`, visibility helpers, wizard navigation helpers, and `validate()` / `reset()` / `updateSchema()` methods. The third argument takes `enhancements`.

## Custom rendering

The field registry is not a public API that you can change. To render a field with custom UI, use the `field:<name>` slot. Keep the field in the model, so that validation, visibility and submission still work.

- `section:<id>` replaces the body of a section.
- `section:<id>:after` adds content after a section.
- `actions` replaces the default action bar.

```vue
<FormBuilder :spec="spec" v-model="data">
  <template #field:dose="{ form }">
    <MyDosePicker
      :model-value="form.data.dose"
      @update:model-value="form.setFieldValue('dose', $event)"
    />
  </template>
</FormBuilder>
```

## Default values

Each control can declare a `default`. An empty value object gets the defaults. To edit existing experiment data, bind the loaded values with `v-model`. The loaded values override the defaults.

```ts
const data = ref(existingDesignData ?? {})
```

With `useFormBuilder`, pass the data as the second argument and read it from `builder.form.data`.

## Saving back to the experiment

The SDK has no composable that writes design data. Submit the form to a plugin endpoint through the generated client; see [Platform integration → Select, load, edit, and save an experiment](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment). A plugin that declares `Metadata.design` gets every write validated against its schema. For plugin-owned SQL tables, submit through the generated client in the same way.

## Large and dynamic forms

- A raw `FormSchema` is JSON-serializable. If the form changes with the experiment type, fetch the schema from the plugin backend at run time. Use it with `useFormBuilder` or in `sidebar.forms`. Use a control model for UI that the plugin code owns.
- `FormBuilder` copies external `v-model` changes into its state. `AppSidebar`, `SettingsModal` and the main form can edit the same object.
- For a model with 50 or more fields, split the controls into `sections` or `views`, so that only the related fields show at a time.
- `multiselect`, `molecule` and `concentration` fields can hold large state. Put them in their own sections, so that a re-render stays local.
- For a wizard, use `StepWizard` around several small `FormBuilder` instances instead of one large model.

For a design plugin example, see [Tutorials → Design plugin with tables](/sdk/tutorials/design-plugin-with-tables).
