# Components catalog

The frontend SDK ships ~88 Vue 3 components. This page documents the top 20 by likely usage in plugin frontends — layout primitives, form basics, dialogs, data displays, and domain widgets. For the rest, browse the [Histoire storybook](/sdk/frontend/) or [source](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend/src/components).

::: tip Imports
Every component is exported from the package root:

```ts
import { AppLayout, BaseButton, FormBuilder } from '@morscherlab/mint-sdk'
```
:::

## Layout

### `AppLayout`

Page shell with the platform's top bar, sidebar slot, and content slot. Use as the root of every plugin page rendered inside the platform.

```vue
<script setup lang="ts">
import { AppLayout } from '@morscherlab/mint-sdk'
</script>

<template>
  <AppLayout title="My plugin">
    <template #sidebar>
      <!-- optional plugin-specific sidebar -->
    </template>

    <!-- main content -->
    <h1>Welcome</h1>
  </AppLayout>
</template>
```

### `AppContainer`

Lighter shell for standalone screens (login, setup, error pages). No top bar; just centered content.

### `AppTopBar`

The platform's top bar component. Plugins normally don't render this directly — `AppLayout` includes one already.

### `AppSidebar`

Reusable sidebar with sectioned items. Use inside the `#sidebar` slot of `AppLayout` for plugins that want their own sidebar.

```vue
<AppSidebar
  :sections="[
    { title: 'Panels', items: [
      { label: 'All panels', to: '/all' },
      { label: 'My panels', to: '/mine' },
    ]},
  ]"
/>
```

## Form primitives

### `BaseButton`

Themed button with `variant`, `size`, `loading`, and `disabled` props. Honors the optical-centering rule for fill/active backgrounds.

```vue
<BaseButton variant="primary" :loading="saving" @click="save">
  Save
</BaseButton>

<BaseButton variant="danger" size="sm" @click="confirm">Delete</BaseButton>
<BaseButton variant="ghost">Cancel</BaseButton>
```

Variants: `primary`, `secondary`, `ghost`, `danger`, `cta` (orange CTA color). Sizes: `xs`, `sm`, `md` (default), `lg`.

### `BaseInput`

Text input with label, helper text, and error state. Supports `type` (`text`, `number`, `email`, `password`, …) and `v-model`.

```vue
<BaseInput
  v-model="name"
  label="Panel name"
  placeholder="e.g. Cisplatin dose-response"
  :error="errors.name"
/>
```

### `BaseSelect`

Themed `<select>` with options array and `v-model`.

```vue
<BaseSelect
  v-model="category"
  label="Category"
  :options="[
    { value: 'tox', label: 'Toxicology' },
    { value: 'eff', label: 'Efficacy' },
  ]"
/>
```

### `BaseCheckbox`

Single checkbox with label. Use `BaseRadioGroup` for grouped options or `BaseToggle` for boolean switches.

```vue
<BaseCheckbox v-model="includeBlanks" label="Include blanks" />
```

### `BaseTextarea`

Multi-line input. Auto-grows by default, capped at `maxRows`.

## Modals and dialogs

### `BaseModal`

Standard modal dialog. Controlled via `v-model:open`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseModal } from '@morscherlab/mint-sdk'

const showModal = ref(false)
</script>

<template>
  <BaseButton @click="showModal = true">Open</BaseButton>

  <BaseModal v-model:open="showModal" title="Edit panel">
    <p>Modal body content.</p>
    <template #footer>
      <BaseButton variant="ghost" @click="showModal = false">Cancel</BaseButton>
      <BaseButton variant="primary" @click="save">Save</BaseButton>
    </template>
  </BaseModal>
</template>
```

### `ConfirmDialog`

Pre-built confirm-or-cancel dialog. Returns the user's choice via the resolution of `open()`.

```vue
<script setup lang="ts">
import { ConfirmDialog } from '@morscherlab/mint-sdk'

const confirmRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

async function deletePanel(id: string) {
  const ok = await confirmRef.value!.open({
    title: 'Delete panel?',
    body: 'This cannot be undone.',
    variant: 'danger',
  })
  if (ok) await api.delete(`/panels/${id}`)
}
</script>

<template>
  <ConfirmDialog ref="confirmRef" />
</template>
```

## Feedback

### `AlertBox`

Inline banner — info / warning / error / success.

```vue
<AlertBox variant="warning" title="Heads up">
  Three panels need approval.
</AlertBox>
```

### `ToastNotification` / `useToast`

Toasts are typically dispatched via the `useToast` composable rather than rendered directly. See [Composables](/sdk/frontend/composables#usetoast).

### `EmptyState`

Use when a list / view has no items yet.

```vue
<EmptyState
  title="No panels yet"
  description="Create your first panel to get started."
  icon="grid"
>
  <template #action>
    <BaseButton variant="primary" @click="create">New panel</BaseButton>
  </template>
</EmptyState>
```

## Data display

### `DataFrame`

Tabular display for analysis results — rows/columns, sticky headers, sortable, optional virtualization for large data.

```vue
<DataFrame
  :columns="[
    { key: 'sample', label: 'Sample', sticky: true },
    { key: 'concentration', label: 'Concentration (uM)', align: 'right' },
    { key: 'response', label: 'Response (%)', align: 'right' },
  ]"
  :rows="rows"
  :loading="loading"
/>
```

### `FileUploader`

Drag-and-drop file uploader with progress and validation. Hits the platform's artifact API by default; supply a custom upload handler when you need different routing.

```vue
<FileUploader
  :accept="['.csv', '.xlsx']"
  :max-size-mb="100"
  @uploaded="onUploaded"
/>
```

### `BasePill`

Compact label / status indicator.

```vue
<BasePill variant="success">Completed</BasePill>
<BasePill variant="warning">Needs review</BasePill>
```

Variants: `default`, `primary`, `success`, `warning`, `error`, `info`.

## Multi-step

### `StepWizard`

Multi-step form with progress indicator. Steps register themselves via slots.

```vue
<StepWizard v-model:current="currentStep">
  <StepWizardStep title="Basics">
    <BaseInput v-model="data.name" label="Name" />
  </StepWizardStep>

  <StepWizardStep title="Drugs">
    <!-- drug picker -->
  </StepWizardStep>

  <StepWizardStep title="Review">
    <!-- summary -->
  </StepWizardStep>
</StepWizard>
```

## Domain widgets

### `FormBuilder`

Schema-driven form engine. Used by experiment-design plugins to render their design schema.

```vue
<FormBuilder :schema="designSchema" v-model="designData" />
```

Schema and value shape: see [FormBuilder deep dive](/sdk/frontend/form-builder).

### `WellPlate`

Visual well-plate editor (96-well, 384-well, 1536-well). Read-only display or interactive editor with `useWellPlateEditor`.

```vue
<WellPlate
  format="96"
  :wells="wells"
  :on-well-click="(well) => editWell(well)"
/>
```

### `ChemicalFormula`

Renders a chemical formula with proper subscripts and elemental highlighting. Pairs with `useChemicalFormula` for parsing.

```vue
<ChemicalFormula formula="C2H5OH" :show-mw="true" />
```

## Auxiliary

### `Tooltip`

Hover-triggered tooltip with smart positioning.

```vue
<Tooltip text="Saved at 14:32">
  <BaseButton>Hover me</BaseButton>
</Tooltip>
```

## Where to go next

| Need | Destination |
|------|-------------|
| The full ~88 component catalog | [Histoire storybook](/sdk/frontend/) — browse with full props + variants |
| A typed reactive helper for one of these | [Composables](/sdk/frontend/composables) |
| Override the brand palette | [Design tokens](/sdk/frontend/design-tokens), [Theming](/sdk/frontend/theming) |
| Schema-driven forms | [FormBuilder](/sdk/frontend/form-builder) |

## Related

- [Tutorials → Adding a frontend](/sdk/tutorials/adding-a-frontend) — components in context
- [Composables](/sdk/frontend/composables) — `useApi`, `useExperimentSelector`, `useFormBuilder`
- [Design tokens](/sdk/frontend/design-tokens) — Tailwind utilities backed by CSS variables
