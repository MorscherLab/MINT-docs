# Theming

The SDK ships with light/dark theme support, table-density settings, and palette tokens out of the box. Plugin frontends adopt the active look automatically when they use the SDK style bundle and design tokens. This page covers what theming options exist, how to override them, and the accessibility guarantees you inherit.

## Light, dark, system

The platform exposes a theme switcher in the top action bar — Light / Dark / System. Plugins:

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

`setTheme()` and `toggleTheme()` accept only `'light'` and `'dark'`. The stored theme defaults to `'system'`; set `useSettingsStore().theme = 'system'` to return to the OS preference.

The SDK settings store toggles the `dark` class on `<html>` from the stored theme (for `'system'`, from `prefers-color-scheme` and its changes). `variables.css` defines light defaults on `:root` and dark overrides on `html.dark`:

```css
:root {
  --bg-primary: #F8FAFC;
  --text-primary: #1E293B;
}

html.dark {
  --bg-primary: #0F172A;
  --text-primary: #F8FAFC;
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

The SDK settings store tracks `tableDensity` (`compact`, `normal`, `comfortable`; default `normal`) for table-heavy views and mirrors it on `<html data-density="...">` for CSS. `tableDensityToSize()` maps it to the `sm` / `md` / `lg` size used by SDK tables. Prefer SDK table/list components such as `DataFrame`, `ExperimentDataViewer`, and generated workspace shells when density should follow the user's preference. For custom tables, read the settings store or expose a local density prop instead of hardcoding row height globally.

## Palette overrides

Users can choose a color palette in the SDK settings store (`colorPalette`: `default`, `colorblind`, `viridis`, or `pastel`). A non-default palette writes hue-shifted values for `--color-primary`, `--color-primary-hover`, `--color-primary-soft`, `--color-cta`, and `--color-cta-hover` onto `<html>` (`PALETTE_CSS_VARIABLES`, `paletteCssVariables()`); `default` writes nothing.

A deployment can re-skin the platform by overriding brand variables in its own stylesheet:

```css
/* In a custom deployment's style.css */
:root {
  --color-primary: #16A34A;        /* override default indigo with green */
  --color-primary-hover: #15803D;
  --color-primary-soft: rgba(22, 163, 74, 0.12);
}
```

Plugin frontends adopt the override automatically — that's the payoff of using tokens. **Don't hardcode brand hex codes**; you'll break the override path. See [Design tokens → Don'ts](/sdk/frontend/design-tokens#don-ts).

## Accessibility

The SDK targets **WCAG AA** out of the box:

| Concern | What the SDK does |
|---------|-------------------|
| Text contrast | 4.5:1 minimum for body text, 3:1 for large text and UI controls — verified against light and dark token combinations |
| Focus indicators | Every interactive component shows a visible focus ring using `--focus-ring` and `--focus-ring-offset` |
| Disabled states | Pair opacity reduction with a visual cue (cursor change, badge) — opacity alone fails WCAG |
| Colorblind safety | Semantic colors don't rely on hue alone; they include icons or text labels |

When you build custom components, follow the same patterns:

```vue
<button
  :disabled="loading"
  class="bg-mint-primary text-white rounded-mint px-4 py-2
         focus:outline-none focus:ring-2 focus:ring-mint-primary focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed">
  <span v-if="loading" class="i-mdi-loading animate-spin"></span>
  {{ label }}
</button>
```

`focus-visible:` is the modern replacement for `focus:` — focus rings appear only for keyboard users, not for click-induced focus.

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

- The dark mode default is **slate-blue**, not pure black. `--bg-primary` is `#0F172A`. True OLED black is reachable by overriding the variable but isn't the default.
- The SDK's variables file is opinionated about which tokens exist. Adding a new family in your plugin is fine; renaming an existing one is not.
- The platform's deployment can override `:root` to enforce a corporate identity. Plugin frontends inherit transparently.

## Related

- [Design tokens](/sdk/frontend/design-tokens) — full token catalog
- [Component Library](/sdk/components/) — every component honors theming
- [Composables → useTheme](/sdk/frontend/composables#other-notable-composables-one-line-each) — programmatic access
