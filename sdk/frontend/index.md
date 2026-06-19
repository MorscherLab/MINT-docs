# Frontend SDK

`@morscherlab/mint-sdk` is the Vue 3 component library and composable set used by every plugin frontend. It ships about 90 component exports, 60+ public composables/helpers, a Vue install plugin, generated-contract clients, compact control schemas, and a comprehensive design-token system — all tuned to the platform's design language so plugin frontends feel native without per-plugin theming.

## What's in the package

| Category | Surface | Detail |
|----------|---------|--------|
| Components | 90+ component exports | [Component Library](/sdk/components/) documents each export and embeds a playground on each component page |
| Composables | 60+ typed composables/helpers | [Composables](/sdk/frontend/composables) — `useApi`, `useGeneratedPluginClient`, `useCurrentExperiment`, `usePluginSettings`, `defineControlModel`, … |
| Design tokens | 500+ CSS custom properties | [Design tokens](/sdk/frontend/design-tokens) — colors, spacing, motion, focus rings |
| Theming | Light/dark/density support | [Theming](/sdk/frontend/theming) — `prefers-reduced-motion`, palette overrides, accessibility |
| FormBuilder + controls | Schema-driven forms from either full schemas or compact controls | [FormBuilder](/sdk/frontend/form-builder) — shared form/settings/sidebar definitions |

## Setup checklist

If you scaffolded with `mint init` and did not pass `--no-frontend`, all of this is already done. For a manual setup:

1. **Install**
   ```bash
   bun add @morscherlab/mint-sdk
   ```

2. **Import design tokens** in your app entry:
   ```css
   /* src/style.css */
   @import "tailwindcss";
   @import "@morscherlab/mint-sdk/styles" layer(mint-sdk);
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

4. **Use the plugin workspace shell** in your root component. The current scaffold wraps route content in `PluginWorkspaceView` and `AppContainer`, and reads page-selector data from `frontend/src/generated/mint-plugin.ts`.

5. **Regenerate the typed contract** after backend route or metadata changes:
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
  useGeneratedPluginSettings,
} from './generated/mint-plugin'

const pluginClient = useGeneratedPluginClient()
const pluginContract = useGeneratedPluginContract()
const settings = useGeneratedPluginSettings()

await pluginClient.analyze({
  pathParams: { experimentId: 42 },
  body: { parameters: { threshold: 0.05 } },
})

const analyzeUrl = pluginContract.buildEndpointUrl('analyze', {
  pathParams: { experimentId: 42 },
})
```

The generated file exports endpoint names, endpoint metadata, route/API prefixes, page selector items, settings helpers, URL builders, and upload/download/SSE helpers. Drop down to `useApi()` only for platform APIs that are not part of your plugin contract.

## Component library

The frontend SDK now has a standalone component section and a local Histoire storybook:

- [Component Library](/sdk/components/) — one page per exported component, with a live package-backed playground on each component page

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

Treat the showcase as the public component reference. The pages here cover patterns and the most-used parts of the API; local Histoire covers every component and every prop.

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

[`MINT/packages/sdk-frontend`](https://github.com/MorscherLab/MINT/tree/main/packages/sdk-frontend) — the full source. When this manual seems out of date, the source is authoritative.

## Next

→ [Component Library](/sdk/components/) — component pages and playground
→ [Composables](/sdk/frontend/composables) — typed reactive hooks
