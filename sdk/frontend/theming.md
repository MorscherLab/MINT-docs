# Theming

The SDK ships with light/dark theme support, five accent palettes, density settings, and design tokens out of the box. Plugin frontends adopt the active look automatically when they use the SDK style bundle and design tokens. This page covers what theming options exist, how to override them, and the accessibility guarantees you inherit.

## Light, dark, system

The settings modal of the top bar holds the theme choice: Light, Dark, or System. Plugins:

- **Inherit automatically** when they use the current scaffold's `<PluginWorkspaceView>` / `<AppContainer>` wrapper, or another SDK shell such as `<AppLayout>`, together with design tokens
- **Should not maintain a separate theme switcher** — the platform owns it

Programmatic access via `useTheme`:

```ts
import { useTheme } from '@morscherlab/mint-sdk'

const { isDark, toggleTheme, setTheme } = useTheme()
// isDark: resolved light/dark state (follows the OS when the theme is 'system')

setTheme('dark')
toggleTheme()
```

`setTheme()` accepts only `'light'` and `'dark'`. `toggleTheme()` switches between the two. The stored theme defaults to `'system'`; set `useSettingsStore().theme = 'system'` to return to the OS preference.

The SDK settings store toggles the `dark` class on `<html>` from the stored theme (for `'system'`, from `prefers-color-scheme` and its changes). `variables.css` defines light defaults on `:root` and dark overrides on `html.dark`:

```css
:root {
  --bg-primary: #F8FAFC;
  --text-primary: #0F172A;
}

html.dark {
  --bg-primary: #0B1120;
  --text-primary: #F1F5F9;
}
```

Custom CSS in your plugin can do the same — scope dark-specific overrides under `.dark`:

```css
.my-special-card {
  background: var(--bg-secondary);
}

.dark .my-special-card {
  /* darker accent only on dark theme */
  border-color: var(--border-light);
}
```

## Density

The SDK settings store tracks `tableDensity` (`compact`, `normal`, `comfortable`; default `normal`; the settings label is "Density") and mirrors it on `<html data-density="...">`. Controls are compact by default. `comfortable` changes the CSS tokens: `--form-height-sm/md/lg` go from 28/32/40 px to 32/36/48 px, and `--mint-gutter` goes from 8 px to 12 px. `compact` and `normal` use the same default token values. `tableDensityToSize()` maps the density to the `sm` / `md` / `lg` size used by SDK tables. Prefer SDK table/list components such as `DataFrame` and generated workspace shells when density should follow the user's preference. For custom controls, use `var(--form-height-md)` and `var(--mint-gutter)` instead of hardcoded sizes.

## Palettes

Users can choose an accent palette in the settings (`colorPalette`: `default`, `colorblind`, `purple`, `ocean`, or `forest`; shown as Teal, Colour-blind safe, Purple, Ocean, and Forest). The settings store writes `html[data-palette]`. `styles/variables.css` gives each palette its light and dark values for `--color-primary`, `--color-primary-hover`, `--color-primary-pressed`, `--color-primary-soft`, and `--color-primary-border`. Each palette is one accent in both themes: white text on the light fill, and `--text-on-accent` (dark) on the dark fill. The colour-blind palette also sets the Okabe-Ito status colours (`--mint-success`, `--mint-error`, `--mint-warning`), so success and error differ for every colour-vision type.

A saved `viridis` becomes `purple`, and a saved `pastel` or an unknown value becomes `default`. The settings store has no palette hue helpers. Read a palette colour from its CSS token, for example under `[data-palette="ocean"]`.

## Brand overrides

A deployment can re-skin the platform by overriding brand variables in its own stylesheet:

```css
/* In a custom deployment's style.css */
:root {
  --color-primary: #16A34A;        /* override the default teal with green */
  --color-primary-hover: #15803D;
  --color-primary-pressed: #166534;
  --color-primary-soft: rgba(22, 163, 74, 0.10);
}
```

Plugin frontends get the override automatically, because they use tokens. **Do not hardcode brand hex codes**: a hex code does not change with the override. See [Design tokens → Don'ts](/sdk/frontend/design-tokens#don-ts).

## Accessibility

The SDK targets **WCAG AA** out of the box:

| Concern | What the SDK does |
|---------|-------------------|
| Text contrast | 4.5:1 minimum for body text, 3:1 for large text and UI controls — verified against light and dark token combinations. One accepted exception: white on the light accent `#0D9488` is 3.74:1 |
| Focus indicators | Every interactive component shows a visible focus ring using `--focus-ring` and `--focus-ring-offset` |
| Disabled states | Pair opacity reduction with a visual cue (cursor change, badge) — opacity alone fails WCAG |
| Colorblind safety | Semantic colors do not rely on hue alone; they include icons or text labels |

When you build custom components, follow the same patterns:

```vue
<button :disabled="loading" class="my-button">
  <LoadingSpinner v-if="loading" tone="inherit" />
  {{ label }}
</button>

<style scoped>
.my-button {
  background: var(--color-primary);
  color: var(--text-on-accent);
  border-radius: var(--radius);
  padding: 0.375rem 1rem;
  transition: background-color var(--mint-transition);
}
.my-button:hover:not(:disabled) { background: var(--color-primary-hover); }
.my-button:focus-visible { outline: none; box-shadow: var(--focus-ring-offset); }
.my-button:disabled { opacity: var(--mint-disabled-opacity); cursor: not-allowed; }
</style>
```

`:focus-visible` shows the focus ring only for keyboard users, not for click-induced focus. The `--focus-ring*` tokens are `box-shadow` values: use them with `box-shadow`, never with `outline`. Prefer the SDK `BaseButton` where it fits.

## Reduced motion

The SDK honors `prefers-reduced-motion: reduce` globally:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

For a plugin's custom animations:

```css
.fade-in {
  animation: fade-in 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .fade-in {
    animation: none;
  }
}
```

Keep motion non-essential; reduced-motion users should get the same information without animation.

## Right-to-left layouts

The SDK does not support right-to-left layouts. Its component styles use physical `left`/`right` margins, padding, and positions, and ship no `[dir="rtl"]` rules, so setting `dir="rtl"` on `<html>` does not mirror SDK components. Plugins may use logical properties (`ms-4`, `margin-inline-start`) in their own markup, but SDK components will stay left-to-right.

## Skipping themes

If a particular plugin really needs a fixed appearance regardless of user theme (rare — e.g., a print preview):

```vue
<template>
  <div class="theme-locked">
    <!-- Force light tokens here -->
  </div>
</template>

<style scoped>
.theme-locked {
  /* Reset dark mode within this scope */
  --bg-primary: #FFFFFF;
  --text-primary: #0F172A;
  /* ... */
}
</style>
```

This breaks the user's preference within that scope — use sparingly and document why.

## Notes

- The dark mode default is **slate-blue**, not pure black. `--bg-primary` is `#0B1120`. To get true OLED black, override the variable.
- The SDK's variables file is opinionated about which tokens exist. Adding a new family in your plugin is fine; renaming an existing one is not.
- The platform's deployment can override `:root` to enforce a corporate identity. Plugin frontends inherit transparently.

## Related

- [Design tokens](/sdk/frontend/design-tokens) — full token catalog
- [Component Library](/sdk/components/) — every component honors theming
- [Composables → useTheme](/sdk/frontend/composables#other-notable-composables-one-line-each) — programmatic access
- [Design tokens](/sdk/frontend/design-tokens#layers) — z-index layers for dropdowns, trays, and toasts
