# Frontend SDK

`@morscherlab/mint-sdk` **@MINT_VERSION@** provides Vue 3 components, composables, generated-contract clients, compact control schemas, and design tokens for custom plugin frontends. Use `mint init --mode standard` for a Vue workspace; choose `--mode generated` when Python parameters and SDK-rendered results cover the interface.

## Choose a frontend path

| Your plugin needs | Start with |
|-------------------|------------|
| A Python calculation, parameter form, and standard result views | `generated` mode; no custom frontend build |
| A custom results page with a small form | `standard` mode and its `PluginWorkspaceView` + `FormBuilder` scaffold |
| A full page driven by shared controls, settings, and sidebar values | `defineControlModel()` in `PluginWorkspaceView`'s `spec.sidebar.controls` |
| A custom top bar, sidebar, or navigation arrangement | `PluginWorkspaceView` slots; use `AppLayout` directly only when needed |

Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for the complete backend-to-Vue tutorial, then [Platform integration](/sdk/frontend/platform-integration) for login state, experiment selection, persistence, and server files.

## AppLayout or a workspace?

`AppLayout` is the layout primitive used **inside** `PluginWorkspaceView`. The two differ in how much behavior they provide:

| Component | Owns | Choose it when |
|-----------|------|----------------|
| [PluginWorkspaceView](/sdk/components/plugin-workspace-view) | `AppLayout`, default `AppTopBar`/`AppSidebar`, navigation, shared control values, the toast container, and optional experiment selection/save/detach and a jobs tray | Building a custom plugin frontend; this is the standard scaffold's default shell |
| [AppLayout](/sdk/components/app-layout) | Layout slots, sidebar positioning, floating cards, and optional mobile sidebar overlay | You need to compose your own shell and provide the topbar, sidebar, and their behavior |

`PluginWorkspaceView` leaves the main content to your slot. One `defineControlModel()` result in `spec.sidebar.controls` generates the sidebar sections, their forms, and the view pills. Choose one shell for a page. Nesting a workspace inside another `AppLayout` or workspace duplicates the shell.

If a page already has a workspace and only needs a form, place `FormBuilder`
inside its content instead of adding another workspace shell.

The scaffold's local `views/WorkspaceView.vue` is your **page content**, not another SDK shell. `App.vue` puts `<router-view />` straight into `PluginWorkspaceView`, and the view puts `SectionCard`s straight into the main pane. Do not wrap `<router-view />` in an `AppContainer`: a card `AppContainer` is a second card, and `mint doctor` warns on it. Keep the default shell and customize its slots before switching to `AppLayout` directly.

`spec.main` sets the main pane. `'plain'` (the default) renders the slot as it is: a full-bleed view, or one `SectionCard` with `fill`, as in the scaffold. `'card'` puts the slot in one scrolling card that stacks its children with the gutter. The scaffold puts the inputs in `spec.sidebar.controls` and the result in the main pane.

## What's in the package

| Category | Surface | Detail |
|----------|---------|--------|
| Components | Workspace, form, data, and biology components | [Component Library](/sdk/components/) provides component pages and playgrounds |
| Composables | Typed state and API helpers | [Composables](/sdk/frontend/composables) — generated clients, `useExperiment`, `usePlatform`, `useJobCenter`, `useRealtime`, `defineControlModel`, … |
| Onboarding | Tours, a "Getting started" checklist and what's-new hints | [Composables → Onboarding](/sdk/frontend/composables#onboarding) — `defineOnboarding`, `provideOnboarding` |
| Design tokens | About 110 CSS custom properties | [Design tokens](/sdk/frontend/design-tokens) — colors, spacing, motion, focus rings, layers |
| Theming | Light/dark, palette and density support | [Theming](/sdk/frontend/theming) — five accent palettes, density, `prefers-reduced-motion`, accessibility |
| FormBuilder + controls | Forms generated from one control model | [FormBuilder](/sdk/frontend/form-builder) — shared form/settings/sidebar definitions |

## Package entry points

The package root holds the base controls, forms, feedback, the workspace shell, the core composables, the stores, and the types. Domain components and helpers come from subpaths. Import each component by name from its entry. Do not install `MINTSdk` with `app.use()`: a global install keeps the whole SDK, Plotly included, in the first-load bundle. `mint doctor` warns on `app.use(MINTSdk)` ("Frontend SDK registration"), and gives an error for an SDK component that a template uses without an import.

| Entry | Contents |
|-------|----------|
| `@morscherlab/mint-sdk` | `BaseButton`, `SplitButton`, `BaseInput`, `BaseSelect`, `BaseModal`, `FormBuilder`, `SettingsModal`, `DataFrame`, `PluginWorkspaceView`, `AppContainer`, `SectionCard`, … ; `useToast`, `useTheme`, `usePlatform`, `useExperiment`, `useRequest`, `providePluginIdentity`, `defineControlModel`, `definePluginWorkspaceView`, `defineDataFrame`; `useAuthStore`, `useSettingsStore`, `useExperimentStore`; `MintApiError`; the types |
| `@morscherlab/mint-sdk/lab` | Plates, samples, dose, chemistry (`MoleculeInput`, `MoleculeView`), charts, sequences, instruments, plugin panel sections (`PanelSections`), scheduling components; `useRackEditor`, `useConcentrationUnits`, and the `time`, `dose` and `formula` namespaces |
| `@morscherlab/mint-sdk/shell` | `AppTopBar`, `AppSidebar`, `AppLayout`, `LayoutResizeHandle`; `defineOnboarding`, `provideOnboarding`, `useOnboarding`; focus, keyboard, selection, and sort helpers |
| `@morscherlab/mint-sdk/data` | Experiment and artifact pickers, `FilePicker`, `JobsStatusTray`, `VersionConflictDialog`, `StaleFormBanner`, `LiveDesignForm`; `useVersionedSave`, `useArtifacts`, `useExperimentData`, `useExperimentSelector`, `useExperimentNumber`, `useLiveDesign`, file-picker adapters |
| `@morscherlab/mint-sdk/runtime` | Generated-UI views and renderers; `useRealtime`, `usePresence`, `PresenceAvatars`; `useJobCenter`, `useFormBuilder`, `preloadFormFieldTypes`, and the helpers that generated clients use (`createClient`; the deprecated `useApi`) |
| `@morscherlab/mint-sdk/permissions` | Permission helpers such as `hasAllPermissions` and `isAdminUser` |
| `@morscherlab/mint-sdk/host` | MINT platform only (`setSession`, `setSessionUser`, `setAuthRequired`). Plugins do not import it |
| `@morscherlab/mint-sdk/stores`, `@morscherlab/mint-sdk/types` | The stores and the types. The root also exports them |
| `@morscherlab/mint-sdk/install` | The `MINTSdk` Vue plugin. It remains for compatibility. Do not use it in new code |
| `@morscherlab/mint-sdk/styles` | The single stylesheet |

MINT 1.5.0 removed the 160 names that the 1.3 root exported with a `@deprecated` tag. The root does not export them. `mint doctor` reports each such import and names the subpath. Examples in this guide import from the subpaths. MINT 1.6 deprecates `useApi` and 21 types; see [Deprecated in 1.6](/sdk/api/frontend#deprecated-in-1-6). For the 1.5 to 1.6 changes, see [Migrate from 1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6). For the 1.4 to 1.5 changes, see [Migrate from 1.4 to 1.5](/sdk/operations/migrate-1.4-to-1.5). For the 1.3 to 1.4 changes, see [Migrate from 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4).

## Setup checklist

If you scaffolded with `mint init --mode standard`, all of this is already done. `generated` mode uses the SDK-managed UI and usually has no `frontend/` directory. For a manual setup:

1. **Install** in the `frontend/` directory. The `mint` CLI runs frontend commands through Vite+ (`vp`):
   ```bash
   vp add @morscherlab/mint-sdk@^@MINT_VERSION@
   ```
   Peer dependencies: `vue` ^3.5.43, `pinia` ^4.0.3, and optionally `vue-router` ^5.3.1. pinia 2 and 3 and vue-router 4 do not satisfy these ranges. Tailwind CSS is optional: the stylesheet is complete without it, and `tailwindcss` is not a peer dependency.

   If the plugin renders a chart, also add Plotly. See [Charts need Plotly](#charts-need-plotly).
   ```bash
   vp add plotly.js-dist-min
   ```

   The SDK does not install `axios`. If plugin code imports `axios`, add it to the plugin `package.json`.

2. **Import design tokens** in your app entry:
   ```css
   /* src/style.css */
   @import "tailwindcss";
   @import "@morscherlab/mint-sdk/styles";
   ```

   The stylesheet does not load the Geist fonts. Add this link to the `<head>` of `index.html`. Inside the platform, the platform loads the fonts, so nothing changes there.
   ```html
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" />
   ```

3. **Create the app** with Pinia. Do not call `app.use(MINTSdk)`. `providePluginIdentity()` gives the standalone `AppTopBar` the plugin name, subtitle, and icon from the generated contract:
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

4. **Keep the scaffold's Vite configuration**: the `@tailwindcss/vite` plugin, Vue/Pinia aliases and deduplication, the `/api` proxy to `MINT_DEV_BACKEND_URL` (`mint dev` sets it to the backend port; the fallback is port 8003), and the plugin route prefix as `base`.

5. **Use the plugin workspace shell** in your root component. The standard scaffold puts `<router-view />` in `PluginWorkspaceView`, the sidebar form in `spec.sidebar.controls`, and the state in `src/stores/analysis.ts`. For additional pages, add routes: the generated contract gives the page selector its pages.

6. **Regenerate the typed contract** after backend route or metadata changes:
   ```bash
   mint sdk generate
   ```

   Commit both generated files:

   - `frontend/src/generated/mint-plugin.contract.json`
   - `frontend/src/generated/mint-plugin.ts`

   Fresh scaffolds also add `uv run mint sdk generate --check` to CI so stale generated clients fail before release.

## Generated plugin client first

For plugin API calls, use the generated client. Do not build URLs by hand:

```ts
import { endpointUrl, useClient } from './generated/mint-plugin'

const client = useClient()
// The standard scaffold's analyze endpoint takes only a JSON body.
const result = await client.analyze({ value: 2.5 })
const analyzeUrl = endpointUrl('analyze')
```

The generated file exports `useClient`, `useSettings`, `useJobs`, `useStream`, `upload`, `download`, `endpointUrl`, `contract`, `contractHash`, `apiPrefix`, `settingsSchema`, and `settingsForm`, with the endpoint names and types of your plugin.

`useApi()` is deprecated and MINT 2.0 removes it. For platform data, use the SDK composable for that data, for example `useExperiment()`, `useArtifacts()` or `useExperimentNumber()`. For an external, non-MINT HTTP API, use `fetch`. See [Composables → `useApi`](/sdk/frontend/composables#useapi).

Body-only endpoints take the body directly. Endpoints combining parameters and a body use `{ pathParams, query, body }` with the exact generated field names. Run `mint docs contract .` to inspect your plugin's signatures. Generated calls throw `MintApiError` for HTTP failures; see [typed errors](/sdk/frontend/composables#typed-http-errors-in-1-2).

## Current patterns

- **Experiment selection:** `ExperimentSelectorModal` writes to `useExperimentStore()`; `PluginWorkspaceView` with `spec.experiment: true` uses the same store. In a platform page, the integration script keeps the store and the `experiment_id` URL parameter in step. Read the experiment with `useExperiment()`; do not keep a duplicate record or write your own route sync.
- **Modals:** `BaseModal`, `ConfirmDialog`, `SettingsModal`, and the selector modals bind `v-model:open`.
- **Jobs:** `PluginWorkspaceView` with `spec.jobs` shows the viewer's job in the top bar and opens a [`JobsStatusTray`](/sdk/frontend/composables#jobs-tray). See [Composables](/sdk/frontend/composables#jobs-tray).
- **Onboarding:** `provideOnboarding()` in the root component adds tours, a checklist, and a Help button to `AppTopBar`. See [Onboarding](/sdk/frontend/composables#onboarding).
- **Charts:** [PlotlyChart](/sdk/components/plotly-chart) renders native Plotly traces (the plugin declares `plotly.js-dist-min`), supports a custom Plotly build, pauses work with `active`, and emits point clicks when `clickEvents` is enabled. Both it and [ChartContainer](/sdk/components/chart-container) support `variant="frame"` plus header, subhead, legend, and footer slots.
- **Chemical annotations:** [ChemicalFormula](/sdk/components/chemical-formula) accepts optional adducts, empty values, and pill styling. [AdductText](/sdk/components/adduct-text) displays adduct notation on its own.
- **Plate decorations:** [WellPlate](/sdk/components/well-plate) accepts `wellClass` and `wellStyle` callbacks in its `defineWellPlate()` spec for per-well visual annotations without changing sample data.
- **Controls and panes:** `BaseSelect` with `searchable` searches descriptive choices, and with `multiple` it selects several; [NumberInput](/sdk/components/number-input) supports steppers, units, and drag scrubbing. [LayoutResizeHandle](/sdk/components/layout-resize-handle) and `useManualLayoutResize()` provide keyboard/pointer resizing.
- **Server files:** [FilePicker](/sdk/components/file-picker) with `usePlatformFilePickerAdapter()` browses configured read-only mounts and returns path references; decode them with `decodePlatformPickerPath()`. Its refresh action explicitly refreshes the server's bounded metadata cache. `FileUploader` remains the local browser-file picker.
- **Access rules:** use `usePlatform().can('use' | 'configure' | 'admin')` for the three plugin access levels. Use nested `access: { permissions: [...] }` on access-aware controls and actions.
- **HTTP errors:** generated clients reject with `MintApiError`.
- **Content in cards:** content components (`DataFrame`, `MetadataSheet`, `ChartContainer`, `PlateEditor` and others) have no frame of their own. Put them in a `SectionCard`. See [SectionCard](/sdk/components/section-card#content-in-a-card).
- **Panels and live designs:** [PanelSections](/sdk/components/panel-sections) draws the sections of a plugin panel. [LiveDesignForm](/sdk/components/live-design-form) with `useLiveDesign()` edits a live design that saves itself.
- **Structure as a spec:** the complex components (`PluginWorkspaceView`, `AppTopBar`, `AppSidebar`, `FormBuilder`, `SettingsModal`, `DataFrame`, `WellPlate`, `PlateEditor`) take one `:spec`, built in `<script setup>` with the matching `define…()` helper. The `tone`, `invalid`, and `options` props are the same on every component that has them.

## Charts need Plotly

The plugin declares `plotly.js-dist-min` in its own frontend dependencies when it renders one of these components: `PlotlyChart`, `GeneratedPlotlyResult`, `GeneratedResultRenderer`, `GeneratedPluginView`, `InstrumentStatusPanels` or `PanelSections`.

1. Go to the `frontend/` directory.
2. Run `vp add plotly.js-dist-min`.
3. Run `mint doctor --strict`. The check "Frontend chart dependency" must pass.

A plugin without the dependency still builds and runs on MINT 1.x, because the SDK still installs Plotly. `mint doctor` gives a warning that `--strict` counts. MINT 2.0 makes the check an error, and a chart then shows its error state. A chart that always gets its own build in the `plotly` prop (`:plotly="Plotly"`) does not need the package. A custom build must be Plotly 4.1.2 or later.

## Form fields that load on first use

`FormBuilder`, `SettingsModal` and the generated UI load the components of the `path`, `file`, `molecule`, `formula` and `sequence` field types when a form first shows such a field. Until the component arrives, the field keeps its label and a box of its height. Values, validation, `submit` and `v-model` do not change. If the chunk does not load, the field shows an error with a **Retry** button.

In a test that finds one of these fields right after mount (`find`, `findComponent` or `global.stubs`), load them first:

```ts
import { beforeAll } from 'vitest'
import { preloadFormFieldTypes } from '@morscherlab/mint-sdk/runtime'

beforeAll(() => preloadFormFieldTypes())
```

A `field:<name>` slot renders its own component at once.

## Type scale

Each SDK font size is a `--font-size-*` token. Medium controls are 13px, field hints and errors 12px, card and section titles 13px. See [Design tokens → Type scale](/sdk/frontend/design-tokens#type-scale). In plugin CSS, set a font size with a token: the `mint lint` rule `font-size-token` reports a literal size.

## Supported browsers

The SDK supports Baseline 2024 browsers: Chrome 116, Edge 116, Firefox 124 and Safari 17.4 (iOS 17.4), or newer. An older browser gets no polyfill. `useRequest` with a `signal` needs `AbortSignal.any`.

## Component library

The frontend SDK now has a standalone component section and a local Histoire storybook:

- [Component Library](/sdk/components/) — one page per exported component, with props tables (types, required status, defaults, and source descriptions) and a live package-backed playground

The full Histoire lab runs locally during SDK development:

```bash
cd packages/sdk-frontend
pnpm run story:dev
# → http://localhost:6006
```

Stories include:

- The component's normal rendering
- Reactive playgrounds with `Hst*` controls (`HstText`, `HstSelect`, `HstCheckbox`, `HstSlider`, `HstNumber`)
- Light, dark, and white backgrounds for visual review
- Common variant grids

Use the public component pages for props and playgrounds, these guides for composition patterns, and local Histoire for additional interactive stories. Run `mint docs frontend <Name>` to inspect the SDK installed in your plugin project.

## Conventions

- **Vue 3 Composition API only** — `<script setup lang="ts">` everywhere
- **TypeScript** — every component has typed props
- **Tokenized utilities or CSS, not inline styles** — prefer `class="text-[var(--text-secondary)]"` or component CSS using `var(--text-secondary)` over hardcoded colors
- **CSS variables, not hex codes** — your plugin's UI should re-theme automatically when the platform's palette is overridden

## Reading order

| # | Page | Contents |
|---|------|-------------------|
| 1 | [Component Library](/sdk/components/) | Component pages, imports, source links, and playground |
| 2 | [Composables](/sdk/frontend/composables) | Generated clients, settings, current experiment, controls, and forms |
| 3 | [Design tokens](/sdk/frontend/design-tokens) | The CSS variable families and Tailwind v4 usage |
| 4 | [Theming](/sdk/frontend/theming) | Light/dark, density, palettes, accessibility |
| 5 | [FormBuilder](/sdk/frontend/form-builder) | Forms generated from one control model |

## Source

[`MINT v@MINT_VERSION@/packages/sdk-frontend`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend) — the release source used for this guide. Use `mint docs frontend <Name>` against your installed SDK for exact local signatures.

## Next

→ [Component Library](/sdk/components/) — component pages and playground
→ [Composables](/sdk/frontend/composables) — typed reactive hooks
