# Frontend SDK

`@morscherlab/mint-sdk` is the Vue 3 component library and composable set used by every plugin frontend. It ships ~88 components, ~29 composables, a Tailwind preset, and a comprehensive design-token system — all tuned to the platform's design language so plugin frontends feel native without per-plugin theming.

## What's in the package

| Category | Surface | Detail |
|----------|---------|--------|
| Components | ~88 Vue 3 SFCs | [Components catalog](/sdk/frontend/components) covers the top 20 with usage; the remainder is browseable in the source and Histoire storybook |
| Composables | ~29 typed composables | [Composables](/sdk/frontend/composables) — `useApi`, `useAuth`, `useExperimentSelector`, `useFormBuilder`, … |
| Design tokens | 500+ CSS custom properties | [Design tokens](/sdk/frontend/design-tokens) — colors, spacing, motion, focus rings |
| Theming | Light/dark/density support | [Theming](/sdk/frontend/theming) — `prefers-reduced-motion`, palette overrides, accessibility |
| FormBuilder | Schema-driven form engine | [FormBuilder](/sdk/frontend/form-builder) — used by experiment-design plugins |

## Setup checklist

If you scaffolded with `mint init --add-frontend`, all of this is already done. For a manual setup:

1. **Install**
   ```bash
   bun add @morscherlab/mint-sdk
   ```

2. **Import design tokens** in your app entry:
   ```ts
   // src/main.ts
   import '@morscherlab/mint-sdk/styles'
   ```

3. **Wire the Tailwind preset**:
   ```ts
   // tailwind.config.ts
   import type { Config } from 'tailwindcss'
   import preset from '@morscherlab/mint-sdk/tailwind.preset'

   export default {
     content: ['./index.html', './src/**/*.{vue,ts}'],
     presets: [preset],
   } satisfies Config
   ```

4. **Wrap your app in `AppLayout`** (when running inside the platform shell). For standalone pages, use `AppContainer` instead.

## Histoire storybook

The frontend SDK ships a Histoire storybook with one story file per component:

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

Treat the storybook as the live component reference. The pages here cover patterns and the most-used parts of the API; the storybook covers every component and every prop.

## Conventions

- **Vue 3 Composition API only** — `<script setup lang="ts">` everywhere
- **TypeScript** — every component has typed props
- **Tailwind utilities, not inline styles** — prefer `class="bg-bg-primary text-text-secondary"` over `:style="{ ... }"`
- **CSS variables, not hex codes** — your plugin's UI should re-theme automatically when the platform's palette is overridden

## Reading order

| # | Page | What you'll learn |
|---|------|-------------------|
| 1 | [Components](/sdk/frontend/components) | Catalog of the top 20 components with usage examples |
| 2 | [Composables](/sdk/frontend/composables) | Full list with deep dives on the 7 most-used |
| 3 | [Design tokens](/sdk/frontend/design-tokens) | The CSS variable families and the Tailwind preset |
| 4 | [Theming](/sdk/frontend/theming) | Light/dark, density, palette override, accessibility |
| 5 | [FormBuilder](/sdk/frontend/form-builder) | Schema-driven form engine for experiment design |

## Source

[`MINT/packages/sdk-frontend`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend) — the full source. When this manual seems out of date, the source is authoritative.

## Next

→ [Components](/sdk/frontend/components) — catalog with usage
→ [Composables](/sdk/frontend/composables) — typed reactive hooks
