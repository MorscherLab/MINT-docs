# Frontend SDK

`@morscherlab/mint-sdk` **1.2.1** provides Vue 3 components, composables, generated-contract clients, compact control schemas, and design tokens for custom plugin frontends. Use `mint init --mode standard` for a Vue workspace; choose `--mode generated` when Python parameters and SDK-rendered results cover the interface.

## Choose a frontend path

| Your plugin needs | Start with |
|-------------------|------------|
| A Python calculation, parameter form, and standard result views | `generated` mode; no custom frontend build |
| A custom results page with a small form | `standard` mode and its `PluginWorkspaceView` + `FormBuilder` scaffold |
| A full page driven by shared controls, settings, and sidebar values | `defineControlModel()` + `ControlWorkspaceView` |
| A built-in biological data template | `BioTemplatePresetWorkspaceView` or `BioTemplatePackWorkspaceView` |
| A custom top bar, sidebar, or navigation arrangement | `PluginWorkspaceView` slots; use `AppLayout` directly only when needed |

Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for the complete backend-to-Vue tutorial, then [Platform integration](/sdk/frontend/platform-integration) for login state, experiment selection, persistence, and server files.

## AppLayout or a workspace?

`AppLayout` is the layout primitive used **inside** both workspace components. They share the same topbar/sidebar/content arrangement, but provide different amounts of behavior:

| Component | Owns | Choose it when |
|-----------|------|----------------|
| [PluginWorkspaceView](/sdk/components/plugin-workspace-view) | `AppLayout`, default `AppTopBar`/`AppSidebar`, navigation, shared control values, and optional experiment selection/save/detach | Building a custom plugin frontend; this is the standard scaffold's default shell |
| [ControlWorkspaceView](/sdk/components/control-workspace-view) | `AppLayout`, `AppTopBar`, `AppSidebar`, and a default `FormBuilder`, bound through `useControlWorkspace()` | A control model should generate the page's forms, settings, sidebar, and shared values |
| [AppLayout](/sdk/components/app-layout) | Layout slots, sidebar positioning, floating cards, and optional mobile sidebar overlay | You need to compose your own shell and provide the topbar, sidebar, and their behavior |

`PluginWorkspaceView` and `ControlWorkspaceView` overlap in control and layout support; they are alternative page shells. The first leaves the main content to your slot and adds plugin navigation and `experiment-shell`; the second renders a form by default and wires model-derived settings automatically. Choose one shell for a page. Nesting either workspace inside another `AppLayout` or workspace duplicates the shell.

If a page already has a workspace and only needs a form, place `FormBuilder`
inside its content instead of adding another workspace shell.

The scaffold's local `views/WorkspaceView.vue` is your **page content**, not another SDK shell. Its normal nesting is `PluginWorkspaceView` → `AppContainer` → `WorkspaceView`. `AppContainer` supplies content spacing and scrolling. Keep the default shell and customize its slots before switching to `AppLayout` directly.

## What's in the package

| Category | Surface | Detail |
|----------|---------|--------|
| Components | Workspace, form, data, and biology components | [Component Library](/sdk/components/) provides component pages and playgrounds |
| Composables | Typed state and API helpers | [Composables](/sdk/frontend/composables) — generated clients, `useCurrentExperiment`, `usePluginSettings`, `defineControlModel`, … |
| Design tokens | 500+ CSS custom properties | [Design tokens](/sdk/frontend/design-tokens) — colors, spacing, motion, focus rings |
| Theming | Light/dark/density support | [Theming](/sdk/frontend/theming) — `prefers-reduced-motion`, palette overrides, accessibility |
| FormBuilder + controls | Schema-driven forms from either full schemas or compact controls | [FormBuilder](/sdk/frontend/form-builder) — shared form/settings/sidebar definitions |

## Setup checklist

If you scaffolded with `mint init --mode standard`, all of this is already done. `generated` mode uses the SDK-managed UI and usually has no `frontend/` directory. For a manual setup:

1. **Install**
   ```bash
   bun add @morscherlab/mint-sdk@^1.2.1
   ```

2. **Import design tokens** in your app entry:
   ```css
   /* src/style.css */
   @import "tailwindcss";
   @import "@morscherlab/mint-sdk/styles";
   ```

3. **Install the Vue plugin** before Pinia/router:
   ```ts
   // src/main.ts
   import { createApp } from 'vue'
   import { createPinia } from 'pinia'
   import { MINTSdk } from '@morscherlab/mint-sdk'
   import App from './App.vue'
   import './style.css'

   createApp(App).use(MINTSdk).use(createPinia()).mount('#app')
   ```

4. **Keep the scaffold's Vite configuration**: Vue/Pinia aliases and deduplication, the `/api` proxy to port 8003, and the plugin route prefix as `base`. The single-page standard scaffold does not need Vue Router; add routing when you add pages.

5. **Use the plugin workspace shell** in your root component. The standard scaffold wraps `WorkspaceView` in `PluginWorkspaceView` and `AppContainer`. For additional pages, use the generated contract's page-selector metadata.

6. **Regenerate the typed contract** after backend route or metadata changes:
   ```bash
   mint sdk generate
   ```

   Commit both generated files:

   - `frontend/src/generated/mint-plugin.contract.json`
   - `frontend/src/generated/mint-plugin.ts`

   Fresh scaffolds also add `uv run mint sdk generate --check` to CI so stale generated clients fail before release.

## Generated plugin client first

For plugin API calls, start with the generated client instead of hand-building URLs with `useApi()`:

```ts
import {
  useGeneratedPluginClient,
  useGeneratedPluginContract,
} from './generated/mint-plugin'

const pluginClient = useGeneratedPluginClient()
const pluginContract = useGeneratedPluginContract()
// The standard scaffold's /analyze endpoint takes only a JSON body.
const result = await pluginClient.analyze({ value: 2.5 })
const analyzeUrl = pluginContract.buildEndpointUrl('analyze')
```

The generated file exports endpoint names, endpoint metadata, route/API prefixes, page selector items, settings helpers, URL builders, and upload/download/SSE helpers. Drop down to `useApi()` only for platform APIs that are not part of your plugin contract.

Body-only endpoints take the body directly. Endpoints combining parameters and a body use `{ pathParams, query, body }` with the exact generated field names. Run `mint docs contract .` to inspect your plugin's signatures. Generated calls throw `MintApiError` for HTTP failures; see [typed errors](/sdk/frontend/composables#typed-http-errors-in-1-2).

## New and updated 1.2 patterns

- **Experiment selection:** `ExperimentSelectorModal` writes to `useExperimentStore()`; `PluginWorkspaceView experiment-shell` uses the same store. Read `current`, `currentId`, `isResolving`, and `error` instead of retaining a duplicate record.
- **Charts:** `PlotlyChart` renders native Plotly `data`/`layout`/`config`, loads Plotly lazily, follows theme and container size, and handles empty/loading/error states.
- **Server files:** `useFileBrowser()` + `FileBrowserModal` browse configured read-only mounts and return path references. `FileUploader` remains the local browser-file picker.
- **Access rules:** use nested `access: { permissions: [...] }` on access-aware controls and actions. Flat `permissions`, `anyPermissions`, `requiresAdmin`, and `visibleFor` fields are deprecated in 1.2.
- **HTTP errors:** generated clients use `MintApiError`; raw `useApi({ typedErrors: true })` opts into the same normalized error shape.

## Component library

The frontend SDK now has a standalone component section and a local Histoire storybook:

- [Component Library](/sdk/components/) — one page per exported component, with props tables (types, required status, defaults, and source descriptions) and a live package-backed playground

The full Histoire lab runs locally during SDK development:

```bash
cd packages/sdk-frontend
bun run story:dev
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

| # | Page | What you'll learn |
|---|------|-------------------|
| 1 | [Component Library](/sdk/components/) | Component pages, imports, source links, and playground |
| 2 | [Composables](/sdk/frontend/composables) | Generated clients, settings, current experiment, controls, and forms |
| 3 | [Design tokens](/sdk/frontend/design-tokens) | The CSS variable families and Tailwind v4 usage |
| 4 | [Theming](/sdk/frontend/theming) | Light/dark, density, palette override, accessibility |
| 5 | [FormBuilder](/sdk/frontend/form-builder) | Schema-driven form engine for experiment design |

## Source

[`MINT v1.2.1/packages/sdk-frontend`](https://github.com/MorscherLab/MINT/tree/v1.2.1/packages/sdk-frontend) — the release source used for this guide. Use `mint docs frontend <Name>` against your installed SDK for exact local signatures.

## Next

→ [Component Library](/sdk/components/) — component pages and playground
→ [Composables](/sdk/frontend/composables) — typed reactive hooks
