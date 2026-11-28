# Frontend SDK

`@morscherlab/mint-sdk` @MINT_VERSION@ gives custom plugin frontends Vue 3 components, composables, generated API clients, control models and design tokens. Use it in a plugin that you scaffold with `mint init --mode standard`. A `generated` plugin uses the SDK-managed UI and needs no frontend build; see [Plugin types](/sdk/concepts/plugin-types).

## Choose a frontend path

| Your plugin needs | Start with |
|-------------------|------------|
| A Python calculation, a parameter form and standard result views | `generated` mode, with no custom frontend |
| A custom results page with a small form | `standard` mode and its `PluginWorkspaceView` + `FormBuilder` scaffold |
| A full page driven by shared controls, settings and sidebar values | `defineControlModel()` in `spec.sidebar.controls` of `PluginWorkspaceView` |
| A custom top bar, sidebar or navigation | `PluginWorkspaceView` slots; use `AppLayout` directly only when the slots are not sufficient |

Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for the full backend-to-Vue tutorial. Then read [Platform integration](/sdk/frontend/platform-integration) for login state, experiment selection, persistence and server files.

## AppLayout or a workspace?

`AppLayout` is the layout primitive inside `PluginWorkspaceView`.

| Component | Owns | Choose it when |
|-----------|------|----------------|
| [PluginWorkspaceView](/sdk/components/plugin-workspace-view) | `AppLayout`, the default `AppTopBar` and `AppSidebar`, navigation, shared control values, the toast container, and optional experiment selection, save, detach and a jobs tray | You build a custom plugin frontend. It is the default shell of the standard scaffold |
| [AppLayout](/sdk/components/app-layout) | Layout slots, sidebar position, floating cards and an optional mobile sidebar overlay | You compose your own shell and supply the top bar, the sidebar and their behavior |

`PluginWorkspaceView` gives the main content to your slot. One `defineControlModel()` result in `spec.sidebar.controls` generates the sidebar sections, their forms and the view pills.

- Use one shell for each page. A workspace inside another `AppLayout` or workspace shows two shells.
- If a page has a workspace and needs a form, put `FormBuilder` in its content. Do not add a second workspace.
- The scaffold file `views/WorkspaceView.vue` is page content, not a shell. `App.vue` puts `<router-view />` straight into `PluginWorkspaceView`, and the view puts `SectionCard`s into the main pane. Do not wrap `<router-view />` in an `AppContainer`; see [AppContainer](/sdk/components/app-container).
- `spec.main` sets the surface of the main pane; see [PluginWorkspaceView → Main pane](/sdk/components/plugin-workspace-view#main-pane).
- Customize the slots of the default shell before you change to `AppLayout`.

## What's in the package

| Area | Page |
|------|------|
| Components: workspace, form, data and biology components | [Component Library](/sdk/components/) |
| Composables: generated clients, `useExperiment`, `usePlatform`, `useJobCenter`, `useRealtime`, `defineControlModel` | [Composables](/sdk/frontend/composables) |
| Onboarding: tours, a "Getting started" checklist and what's-new hints | [Composables → Onboarding](/sdk/frontend/composables#onboarding) |
| Design tokens: colors, spacing, motion, focus rings, layers | [Design tokens](/sdk/frontend/design-tokens) |
| Theming: light and dark, five accent palettes, density, reduced motion | [Theming](/sdk/frontend/theming) |
| Forms from one control model | [FormBuilder](/sdk/frontend/form-builder) |

## Package entry points

The package root holds the base controls, forms, feedback components, the workspace shell, the core composables, the stores and the types. Domain components and helpers come from subpaths. [Frontend SDK reference → Entry points](/sdk/api/frontend#entry-points) lists the contents of each entry.

Import each component by name from its entry. Do not install `MINTSdk` with `app.use()`: a global install keeps the whole SDK, Plotly included, in the first-load bundle. `MINTSdk` (also at `@morscherlab/mint-sdk/install`) remains only for compatibility. `mint doctor` warns on `app.use(MINTSdk)` ("Frontend SDK registration"). It gives an error when a template uses an SDK component without an import.

To upgrade from an earlier release, see [Upgrading](/sdk/operations/upgrading).

## Setup checklist

`mint init --mode standard` does all of these steps. For a manual setup, do the steps below.

1. Go to the `frontend/` directory. The `mint` CLI runs frontend commands through Vite+ (`vp`).
2. Install the SDK:
   ```bash
   vp add @morscherlab/mint-sdk@^@MINT_VERSION@
   ```
   The peer dependencies are `vue` ^3.5.43, `pinia` ^4.0.3 and, optionally, `vue-router` ^5.3.1. pinia 2 and 3 and vue-router 4 do not satisfy these ranges.
3. If the plugin renders a chart, add Plotly. See [Charts need Plotly](#charts-need-plotly).
4. If plugin code imports `axios`, add it to the plugin `package.json`. The SDK does not install `axios`.
5. Import the styles in your app entry. Tailwind CSS is optional: the SDK stylesheet is complete without it, and `tailwindcss` is not a peer dependency.
   ```css
   /* src/style.css */
   @import "tailwindcss";
   @import "@morscherlab/mint-sdk/styles";
   ```
6. Add the Geist fonts to the `<head>` of `index.html`. The stylesheet does not load them. Inside the platform, the platform loads the fonts.
   ```html
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" />
   ```
7. Create the app with Pinia. Call `providePluginIdentity()`: it gives the standalone `AppTopBar` the plugin name, subtitle and icon from the generated contract.
   ```ts
   // src/main.ts
   import { createApp } from 'vue'
   import { createPinia } from 'pinia'
   import { providePluginIdentity } from '@morscherlab/mint-sdk'
   import App from './App.vue'
   import { contract } from './generated/mint-plugin'
   import './style.css'

   const app = createApp(App)
   app.use(createPinia())
   providePluginIdentity(contract)
   app.mount('#app')
   ```
8. Keep the Vite configuration of the scaffold: the `@tailwindcss/vite` plugin, the Vue and Pinia aliases and deduplication, the `/api` proxy to `MINT_DEV_BACKEND_URL`, and the plugin route prefix as `base`. `mint dev` sets `MINT_DEV_BACKEND_URL` to the backend port. The fallback is port 8003.
9. Put `<router-view />` in `PluginWorkspaceView` in the root component. The standard scaffold puts the sidebar form in `spec.sidebar.controls` and the state in `src/stores/analysis.ts`. For more pages, add routes: the generated contract gives the page selector its pages.
10. After a change to backend routes or metadata, generate the typed contract again:
    ```bash
    mint sdk generate
    ```
11. Commit both generated files: `frontend/src/generated/mint-plugin.contract.json` and `frontend/src/generated/mint-plugin.ts`. A new scaffold adds `uv run mint sdk generate --check` to CI, so a stale client fails before release.

## Generated plugin client first

Call plugin routes through the generated client. Do not build URLs by hand. See [Composables → Generated plugin clients](/sdk/frontend/composables#generated-plugin-clients) for the exports and call shapes. `useApi()` is deprecated; see [Composables → `useApi`](/sdk/frontend/composables#useapi).

## Current patterns

- **Experiment selection:** read the experiment with `useExperiment()`. Do not keep a copy of the record or write your own route sync. See [Platform integration](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment).
- **Modals:** `BaseModal`, `ConfirmDialog`, `SettingsModal` and the selector modals bind `v-model:open`.
- **Jobs:** `PluginWorkspaceView` with `spec.jobs` shows the job of the viewer in the top bar and opens a [`JobsStatusTray`](/sdk/frontend/composables#jobs-tray).
- **Onboarding:** `provideOnboarding()` in the root component adds tours, a checklist and a Help button to `AppTopBar`. See [Onboarding](/sdk/frontend/composables#onboarding).
- **Charts:** [PlotlyChart](/sdk/components/plotly-chart) renders native Plotly traces. Use [ChartContainer](/sdk/components/chart-container) for another chart library. Both support `variant="frame"` and the header, subhead, legend and footer slots.
- **Chemical annotations:** [ChemicalFormula](/sdk/components/chemical-formula) accepts optional adducts, empty values and pill styling. [AdductText](/sdk/components/adduct-text) shows adduct notation alone.
- **Plate decorations:** the `defineWellPlate()` spec of [WellPlate](/sdk/components/well-plate) accepts `wellClass` and `wellStyle` callbacks. They mark wells without a change to the sample data.
- **Controls and panes:** `BaseSelect` with `searchable` searches long choice lists, and with `multiple` it selects several. [NumberInput](/sdk/components/number-input) supports steppers, units and drag scrubbing. [LayoutResizeHandle](/sdk/components/layout-resize-handle) and `useManualLayoutResize()` resize panes with the keyboard or the pointer.
- **Server files:** [FilePicker](/sdk/components/file-picker) with `usePlatformFilePickerAdapter()` browses read-only server mounts. See [Platform integration → Browse server files](/sdk/frontend/platform-integration#browse-server-files). `FileUploader` picks local browser files.
- **Access rules:** use `usePlatform().can()` for the plugin access levels; see [`usePlatform`](/sdk/frontend/composables#useplatform). Put `access: { permissions: [...] }` on access-aware controls and actions.
- **HTTP errors:** generated clients reject with `MintApiError`. See [Typed HTTP errors](/sdk/frontend/composables#typed-http-errors-in-1-2).
- **Content in cards:** content components have no frame. Put them in a `SectionCard`; see [SectionCard](/sdk/components/section-card#content-in-a-card).
- **Form fields that load on first use:** some field types load their component when a form first shows them. See [FormBuilder](/sdk/frontend/form-builder#field-types-that-load-on-first-use).
- **Panels and live designs:** [PanelSections](/sdk/components/panel-sections) draws the sections of a plugin panel. [LiveDesignForm](/sdk/components/live-design-form) with `useLiveDesign()` edits a live design that saves itself.
- **Structure as a spec:** `PluginWorkspaceView`, `AppTopBar`, `AppSidebar`, `FormBuilder`, `SettingsModal`, `DataFrame`, `WellPlate` and `PlateEditor` take one `:spec`. Build it in `<script setup>` with the matching `define…()` helper. The `tone`, `invalid` and `options` props are the same on every component that has them.

## Charts need Plotly

The plugin declares `plotly.js-dist-min` in its frontend dependencies when it renders one of these components: `PlotlyChart`, `GeneratedPlotlyResult`, `GeneratedResultRenderer`, `GeneratedPluginView`, `InstrumentStatusPanels` or `PanelSections`.

1. Go to the `frontend/` directory.
2. Run `vp add plotly.js-dist-min`.
3. Run `mint doctor --strict`. The check "Frontend chart dependency" must pass.

On MINT 1.x, a plugin without the dependency still builds and runs, because the SDK still installs Plotly. `mint doctor` gives a warning, and `--strict` counts it. MINT 2.0 makes the check an error, and the chart then shows its error state. A chart that always gets its own build in the `plotly` prop (`:plotly="Plotly"`) does not need the package. A custom build must be Plotly 4.1.2 or later.

## Type scale

Set each font size in plugin CSS with a `--font-size-*` token. The `mint lint` rule `font-size-token` reports a literal size. See [Design tokens → Type scale](/sdk/frontend/design-tokens#type-scale).

## Supported browsers

The SDK supports the browsers in [Supported browsers](/guide/access#supported-browsers) and adds no polyfill. `useRequest` with a `signal` needs `AbortSignal.any`.

## Conventions

- Use the Vue 3 Composition API with `<script setup lang="ts">`.
- Give every component typed props.
- Use tokens in utility classes or component CSS, not inline styles. For example, write `class="text-[var(--text-secondary)]"` or `color: var(--text-secondary)`.
- Use CSS variables, not hex codes, so the plugin follows a palette or brand override. See [Design tokens](/sdk/frontend/design-tokens).

## Source

[`MINT v@MINT_VERSION@/packages/sdk-frontend`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend) is the release source for this guide. Run `mint docs frontend <Name>` to see the exact signatures of the SDK in your plugin project. The [Component Library](/sdk/components/) has props tables and playgrounds; its [maintainer storybook](/sdk/components/#sdk-maintainer-storybook) section covers Histoire.
