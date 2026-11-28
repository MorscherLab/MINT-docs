# Theming

A plugin frontend follows the user's theme, accent palette and density when it uses the SDK styles and design tokens. This page tells you how to read and override these settings.

## Light, dark, system

The user selects Light, Dark or System in the settings modal of the top bar. The platform owns this choice. Do not add a theme switcher to a plugin.

A plugin follows the theme when it uses an SDK shell (`PluginWorkspaceView` in the current scaffold, or `AppLayout`) and design tokens.

To read or set the theme in code, use `useTheme`:

```ts
import { useTheme } from '@morscherlab/mint-sdk'

const { isDark, toggleTheme, setTheme } = useTheme()

setTheme('dark')
toggleTheme()
```

- `isDark` is the resolved theme. For `'system'`, it follows the OS.
- `setTheme()` accepts only `'light'` and `'dark'`. `toggleTheme()` changes between the two.
- The stored theme defaults to `'system'`. To return to the OS preference, set `useSettingsStore().theme = 'system'`.

The SDK settings store sets the `dark` class on `<html>` from the stored theme. For `'system'`, it follows `prefers-color-scheme` and its changes. `variables.css` defines the light values on `:root` and the dark values on `html.dark`:

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

The dark background is slate blue (`#0B1120`), not black. To get black, override `--bg-primary`.

In plugin CSS, put dark-only rules under `.dark`:

```css
.my-special-card {
  background: var(--bg-secondary);
}

.dark .my-special-card {
  border-color: var(--border-light);
}
```

## Density

The SDK settings store keeps `tableDensity` (`compact`, `normal` or `comfortable`; default `normal`). The settings modal labels it "Density". The store writes it to `<html data-density="...">`.

- Controls are compact by default. `compact` and `normal` use the same token values.
- `comfortable` makes controls and gaps larger. See the form-height and gutter rows in [Design tokens → Spacing, radius, and elevation](/sdk/frontend/design-tokens#spacing-radius-and-elevation).
- `tableDensityToSize()` gives the `sm`, `md` or `lg` size that SDK tables use for a density.

For content that must follow the density, use SDK components such as `DataFrame` and the workspace shells. In custom controls, use `var(--form-height-md)` and `var(--mint-gutter)`, not fixed sizes.

## Palettes

The user selects an accent palette in the settings. `colorPalette` is `default`, `colorblind`, `purple`, `ocean` or `forest`. The settings modal shows them as Teal, Colour-blind safe, Purple, Ocean and Forest. The settings store writes `html[data-palette]`.

- `styles/variables.css` gives each palette its light and dark values for `--color-primary`, `--color-primary-hover`, `--color-primary-pressed`, `--color-primary-soft` and `--color-primary-border`.
- Each palette has one accent in both themes. Text on the light fill is white. Text on the dark fill is `--text-on-accent` (dark).
- The colour-blind palette also sets the Okabe-Ito status colours (`--mint-success`, `--mint-error`, `--mint-warning`). Success and error then differ for every type of colour vision.
- A saved `viridis` becomes `purple`. A saved `pastel` or an unknown value becomes `default`.

The settings store has no palette hue helpers. Read a palette colour from its CSS token, for example under `[data-palette="ocean"]`.

## Brand overrides

A deployment can change the brand colour. It overrides the brand tokens in its own stylesheet:

```css
:root {
  --color-primary: #16A34A;
  --color-primary-hover: #15803D;
  --color-primary-pressed: #166534;
  --color-primary-soft: rgba(22, 163, 74, 0.10);
}
```

A plugin that uses tokens gets the override. A hardcoded hex code does not change. See [Design tokens → Don'ts](/sdk/frontend/design-tokens#don-ts).

## Accessibility

The SDK targets WCAG AA.

| Concern | What the SDK does |
|---------|-------------------|
| Text contrast | 4.5:1 minimum for body text, 3:1 for large text and UI controls, in light and dark. One accepted exception: white on the light accent is 3.74:1; see [Design tokens → Brand](/sdk/frontend/design-tokens#brand) |
| Focus indicators | Every interactive component shows a focus ring with `--focus-ring` and `--focus-ring-offset` |
| Disabled states | Lower opacity together with a second cue, such as a cursor change or a badge. Opacity alone fails WCAG |
| Colour-blind safety | Semantic colours do not rely on hue alone. They include icons or text labels |

Use the same patterns in custom components. Use `BaseButton` where it fits.

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

`:focus-visible` shows the focus ring for keyboard focus, not for a click. Use the `--focus-ring*` tokens with `box-shadow`; see [Design tokens → Focus](/sdk/frontend/design-tokens#focus).

## Reduced motion

The SDK obeys `prefers-reduced-motion: reduce` on every element:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Turn off custom animations with the same media query:

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

Do not put information only in motion. A user with reduced motion must get the same information.

## Right-to-left layouts

The SDK does not support right-to-left layouts. Its component styles use physical `left` and `right` margins, padding and positions, and have no `[dir="rtl"]` rules. `dir="rtl"` on `<html>` does not mirror SDK components. Your own markup can use logical properties (`ms-4`, `margin-inline-start`), but SDK components stay left-to-right.

## Fixed appearance

A view such as a print preview can need the same appearance in every theme. Set the tokens again in a local scope:

```vue
<template>
  <div class="theme-locked">
    <!-- content -->
  </div>
</template>

<style scoped>
.theme-locked {
  --bg-primary: #FFFFFF;
  --text-primary: #0F172A;
}
</style>
```

This scope ignores the user's theme. Use it only where the view requires it, and write down the reason.

## Custom tokens

You can add a new token family in a plugin. Do not rename an SDK token. See [Design tokens](/sdk/frontend/design-tokens) for the catalog and the [z-index layers](/sdk/frontend/design-tokens#layers).
