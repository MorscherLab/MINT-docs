# Components catalog

The frontend SDK ships about 90 Vue component exports. This page documents the most-used surface for plugin frontends — layout primitives, form basics, dialogs, data displays, and domain widgets. For live previews, browse the [component playground](/sdk/frontend/playground); for exhaustive props and variants, run Histoire locally or browse the [source](https://github.com/MorscherLab/MINT/tree/main/packages/sdk-frontend/src/components).

::: tip Imports
Every component is exported from the package root:

```ts
import { PluginWorkspaceView, BaseButton, FormBuilder } from '@morscherlab/mint-sdk'
```
:::

## Layout

### `PluginWorkspaceView`

Current `mint init` frontends use this as the root plugin shell. It provides the plugin title area, optional page selector, settings/theme affordances, and sidebar wiring expected by the platform.

```vue
<script setup lang="ts">
import { AppContainer, PluginWorkspaceView } from '@morscherlab/mint-sdk'
import { pluginPageSelectorItems } from './generated/mint-plugin'
</script>

<template>
  <PluginWorkspaceView
    title="My plugin"
    subtitle="Dashboard"
    :page-selector="pluginPageSelectorItems"
    current-page-selector-id="dashboard"
    show-theme-toggle
    show-settings
  >
    <AppContainer scrollable>
      <router-view />
    </AppContainer>
  </PluginWorkspaceView>
</template>
```

### `AppLayout`

Lower-level page shell with optional topbar and sidebar slots plus a content slot. Use it when you need to build a custom shell instead of the scaffolded `PluginWorkspaceView`.

```vue
<script setup lang="ts">
import { AppLayout } from '@morscherlab/mint-sdk'
</script>

<template>
  <AppLayout>
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

The platform's top bar component. Plugins normally don't render this directly unless they are providing an explicit `#topbar` slot to `AppLayout`.

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

Variants: `primary`, `secondary`, `ghost`, `danger`, `success`, `cta` (orange CTA color). Sizes: `sm`, `md` (default), `lg`.

### `BaseInput`

Text input with placeholder, error state, size, numeric bounds, and `v-model`. Wrap it in `FormField` when you need a label, hint, or validation message.

```vue
<FormField label="Panel name" :error="errors.name" field-id="panel-name">
  <template #default="{ describedBy }">
    <BaseInput
      v-model="name"
      placeholder="e.g. Cisplatin dose-response"
      :error="Boolean(errors.name)"
      :aria-describedby="describedBy"
    />
  </template>
</FormField>
```

### `BaseSelect`

Themed `<select>` with options array and `v-model`. Use `FormField` for the label.

```vue
<FormField label="Category">
  <BaseSelect
    v-model="category"
    placeholder="Choose a category"
    :options="[
      { value: 'tox', label: 'Toxicology' },
      { value: 'eff', label: 'Efficacy' },
    ]"
  />
</FormField>
```

### `BaseCheckbox`

Single checkbox with label. Use `BaseRadioGroup` for grouped options or `BaseToggle` for boolean switches.

```vue
<BaseCheckbox v-model="includeBlanks" label="Include blanks" />
```

### `BaseTextarea`

Multi-line input with `rows`, `resize`, `maxlength`, error state, and `v-model`.

```vue
<FormField label="Notes" hint="Visible to collaborators">
  <BaseTextarea v-model="notes" :rows="4" resize="vertical" />
</FormField>
```

## Modals and dialogs

### `BaseModal`

Standard modal dialog. Controlled with `v-model`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseModal } from '@morscherlab/mint-sdk'

const showModal = ref(false)
</script>

<template>
  <BaseButton @click="showModal = true">Open</BaseButton>

  <BaseModal v-model="showModal" title="Edit panel">
    <p>Modal body content.</p>
    <template #footer>
      <BaseButton variant="ghost" @click="showModal = false">Cancel</BaseButton>
      <BaseButton variant="primary" @click="save">Save</BaseButton>
    </template>
  </BaseModal>
</template>
```

### `ConfirmDialog`

Pre-built confirm-or-cancel dialog. Control it with `v-model` and handle `confirm` / `cancel` events.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, ConfirmDialog, useApi } from '@morscherlab/mint-sdk'

const api = useApi()
const confirmingDelete = ref(false)
const pendingPanelId = ref<string | null>(null)

function askDelete(id: string) {
  pendingPanelId.value = id
  confirmingDelete.value = true
}

async function confirmDelete() {
  if (!pendingPanelId.value) return
  await api.delete(`/panels/${pendingPanelId.value}`)
  confirmingDelete.value = false
  pendingPanelId.value = null
}
</script>

<template>
  <BaseButton variant="danger" @click="askDelete(panel.id)">Delete</BaseButton>
  <ConfirmDialog
    v-model="confirmingDelete"
    title="Delete panel?"
    message="This cannot be undone."
    variant="danger"
    confirm-label="Delete"
    @confirm="confirmDelete"
  />
</template>
```

## Feedback

### `AlertBox`

Inline banner — info / warning / error / success.

```vue
<AlertBox type="warning" title="Heads up">
  Three panels need approval.
</AlertBox>
```

### Toasts / `useToast`

Toasts are dispatched via the `useToast` composable. The SDK registers the toast host through its install plugin, so plugin pages normally do not render a toast component directly. See [Composables](/sdk/frontend/composables#usetoast).

### `EmptyState`

Use when a list / view has no items yet.

```vue
<EmptyState
  title="No panels yet"
  description="Create your first panel to get started."
  action-label="New panel"
  @action="create"
>
</EmptyState>
```

## Data display

### `DataFrame`

Tabular display for analysis results — data/columns, sticky headers, sorting, search, pagination, and row selection.

```vue
<DataFrame
  :columns="[
    { key: 'sample', label: 'Sample', sortable: true },
    { key: 'concentration', label: 'Concentration (uM)', align: 'right' },
    { key: 'response', label: 'Response (%)', align: 'right' },
  ]"
  :data="rows"
  :loading="loading"
  sortable
  sticky-header
/>
```

### `FileUploader`

Drag-and-drop file picker with type and size validation. It emits selected files; your route or generated client does the upload.

```vue
<FileUploader
  accept=".csv,.xlsx"
  :max-size="100 * 1024 * 1024"
  multiple
  @upload="uploadFiles"
  @error="toast.error"
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

Multi-step form with progress indicator. Pass a `steps` array and provide one named slot per step id.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { StepWizard, type WizardStep } from '@morscherlab/mint-sdk'

const currentStep = ref(0)
const steps: WizardStep[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'drugs', label: 'Drugs' },
  { id: 'review', label: 'Review' },
]
</script>

<StepWizard v-model="currentStep" :steps="steps">
  <template #step-basics>
    <!-- basic fields -->
  </template>
  <template #step-drugs>
    <!-- drug picker -->
  </template>
  <template #step-review>
    <!-- summary -->
  </template>
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
| Live component examples | [Component playground](/sdk/frontend/playground) — curated previews and searchable index |
| The full component catalog | Local Histoire storybook — browse with full props + variants |
| A typed reactive helper for one of these | [Composables](/sdk/frontend/composables) |
| Override the brand palette | [Design tokens](/sdk/frontend/design-tokens), [Theming](/sdk/frontend/theming) |
| Schema-driven forms | [FormBuilder](/sdk/frontend/form-builder) |

## Related

- [Tutorials → Adding a frontend](/sdk/tutorials/adding-a-frontend) — components in context
- [Composables](/sdk/frontend/composables) — `useApi`, `useExperimentSelector`, `useFormBuilder`
- [Design tokens](/sdk/frontend/design-tokens) — Tailwind utilities backed by CSS variables
