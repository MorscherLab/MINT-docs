# Frontend SDK (`@morscherlab/mint-sdk`)

`@morscherlab/mint-sdk` is the Vue 3 component library plugin frontends use. It ships ~96 components, ~27 composables, a Tailwind preset, and 500+ design-token CSS variables — all tuned to the platform's design language so plugins feel native.

::: warning Authoritative reference
The component catalog is large and evolves quickly. Browse the live storybook (`bun run story:dev` in `packages/sdk-frontend`, port 6006) or the source at [`packages/sdk-frontend`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend) for the current API. This page covers what's in the SDK and how to wire it up — not every component.
:::

## Install

```bash
# In a plugin frontend
bun add @morscherlab/mint-sdk
# or
npm install @morscherlab/mint-sdk
```

Add the SDK's Tailwind preset and CSS variables to your build:

```ts
// tailwind.config.ts
import preset from '@morscherlab/mint-sdk/tailwind.preset'
export default { presets: [preset], content: ['./src/**/*.{vue,ts}'] }
```

```ts
// main.ts
import '@morscherlab/mint-sdk/styles/variables.css'
```

If you scaffolded with `mint init`, this is already done.

## Component categories

The catalog is organized into a handful of broad areas. Browse `packages/sdk-frontend/src/components/` or the storybook for the authoritative list.

| Category | Examples |
|----------|----------|
| **Layout** | `AppLayout`, `AppTopBar`, `AppSidebar`, `Card`, `Modal`, `StepWizard` |
| **Forms** | `FormBuilder`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `DatePicker`, `MoleculeInput` |
| **Tables and grids** | `DataFrame`, `WellPlate`, `PlateMapEditor` |
| **Charts** | Light wrappers around Plotly that respect the platform palette |
| **Workflow** | `ExperimentTimeline`, `ScheduleCalendar`, `AuditTrail`, `DoseCalculator` |
| **Domain widgets** | `ChemicalFormula`, `MoleculeInput`, `PlateMapEditor`, … |

## Composables

Composables encapsulate the wiring needed to talk to the platform from inside a plugin frontend.

| Composable | What it returns |
|------------|-----------------|
| `useApi()` | A typed fetch helper that points at `/api`, with auth + tracing baked in |
| `useAuth()` | Current user, login/logout actions, role/permission helpers |
| `usePlatformContext()` | The current project / experiment context (when the plugin is mounted inside a project) |
| `useExperimentSelector()` | Picker UI + reactive selected experiment |
| `useExperimentData()` | Fetch a specific experiment's design + analysis results |
| `useFormBuilder()` | Drives `FormBuilder` for plugin-defined schemas |
| `useTheme()` | Read/write theme + density preferences |
| `useToast()` | Programmatic notifications using the platform's toast stack |

## Stores

The SDK exposes Pinia stores you can either consume directly or merge into your plugin's own store layer:

| Store | Holds |
|-------|-------|
| `useAuthStore` | Current user, JWT, login state |
| `usePlatformStore` | Active project, experiment, feature flags |
| `useNotificationsStore` | The toast stack used by `useToast` |

## Design tokens

500+ CSS custom properties live in `@morscherlab/mint-sdk/styles/variables.css` — colors, spacing, radii, shadows, motion. Every component reads from these, and the Tailwind preset also references them, so theming the platform also themes plugin frontends.

The most-used token families:

| Family | Examples |
|--------|----------|
| `--color-primary*` | Indigo brand color and hover states |
| `--color-cta*` | Orange CTA color and hover states |
| `--mint-{success,error,warning,info}` | Semantic feedback colors |
| `--bg-{primary,secondary,tertiary}` | Surface backgrounds |
| `--text-{primary,secondary,muted}` | Foreground text |
| `--focus-ring`, `--focus-ring-offset` | Focus ring used by every interactive component |

::: tip Don't hardcode brand colors
Reference the CSS variables (`bg-bg-primary`, `text-text-secondary`) instead of literal hex codes. That keeps your plugin in sync if the platform's theme is overridden in a particular deployment.
:::

## Histoire storybook

The SDK ships a Histoire storybook with one story file per component:

```bash
cd packages/sdk-frontend
bun run story:dev    # http://localhost:6006/
```

Stories include reactive playgrounds (`HstText`, `HstSelect`, `HstCheckbox`, `HstSlider`, `HstNumber`) and the canonical usage examples. Treat it as a living component reference.

## Wiring a plugin frontend

A minimal plugin Vue page:

```vue
<script setup lang="ts">
import { AppLayout, Card, useApi, useExperimentSelector } from '@morscherlab/mint-sdk'

const api = useApi()
const { selected } = useExperimentSelector()
</script>

<template>
  <AppLayout>
    <Card>
      <h2>My plugin</h2>
      <p v-if="selected">Working on {{ selected.code }}</p>
    </Card>
  </AppLayout>
</template>
```

The SDK assumes Vue 3 Composition API with `<script setup>`, TypeScript, and Tailwind — that's the platform's stack.

## Reference

→ [`packages/sdk-frontend`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend) — source and README
→ Histoire storybook (`bun run story:dev`) — live component catalog
→ [`sdk/site/`](https://github.com/MorscherLab/mld/tree/main/sdk/site) — full SDK reference site

## Next

→ [Python SDK](/sdk/python) — backend half of the plugin contract
→ [Plugin development](/cli/plugin-dev) — scaffold, run, package
