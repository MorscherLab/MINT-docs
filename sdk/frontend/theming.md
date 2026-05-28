# Theming

The SDK ships with light/dark theme support, table-density settings, and palette tokens out of the box. Plugin frontends adopt the active look automatically when they use the SDK style bundle and design tokens. This page covers what theming options exist, how to override them, and the accessibility guarantees you inherit.

## Light, dark, system

The platform exposes a theme switcher in the user's avatar menu — Light / Dark / System. Plugins:

- **Inherit automatically** when they use the current scaffold's `<PluginWorkspaceView>` / `<AppContainer>` wrapper, or another SDK shell such as `<AppLayout>`, together with design tokens
- **Should not maintain a separate theme switcher** — the platform owns it

Programmatic access via `useTheme`:

```ts
import { useTheme } from '@morscherlab/mint-sdk'

const { isDark, toggleTheme, setTheme } = useTheme()
// isDark: ComputedRef<boolean> — current resolved light/dark state

setTheme('dark')
toggleTheme()
```

The dark class lives on `<html>` — `html.dark { ... }`. The SDK's `variables.css` defines both light defaults and dark overrides:

```css
:root {
  --bg-primary: #F8FAFC;
  --text-primary: #1E293B;
}

.dark {
  --bg-primary: #0F172A;
  --text-primary: #F8FAFC;
}
```

Custom CSS in your plugin can do the same — wrap dark-specific overrides in `.dark`:

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

The SDK settings store tracks `tableDensity` (`compact`, `normal`, `comfortable`) for table-heavy views and settings panels. Prefer SDK table/list components such as `DataFrame`, `ExperimentDataViewer`, and generated workspace shells when density should follow the user's preference. For custom tables, read the settings store or expose a local density prop instead of hardcoding row height globally.

## Palette overrides

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
| Hit targets | Buttons / inputs / checkboxes meet 44×44 px on touch viewports |
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

## RTL support

Right-to-left layouts work via Tailwind's RTL plugin and CSS logical properties (`margin-inline-start`, `padding-inline-end`, …). The SDK uses logical properties everywhere; plugins should follow suit:

```vue
<!-- Good -->
<div class="ms-4">…</div>            <!-- margin-inline-start -->

<!-- Avoid -->
<div class="ml-4">…</div>            <!-- physical margin-left, breaks RTL -->
```

RTL isn't enabled by default — labs that need it set the `dir="rtl"` attribute on `<html>` and the SDK adapts.

## Optical centering

The SDK applies a 1px upward shift (`padding-top: -1px; padding-bottom: +1px;`) on components where a fill / shadow / active background makes vertical text position dominant — buttons, dropdown triggers, tabs, segmented controls, nav pills. This compensates for Fira Sans' cap-letter mid-point sitting ~5.6% above the em-box center.

You don't apply this manually — the SDK's components handle it. If you build a custom component that fits the pattern (filled background + centered text), copy the precedent from `BaseButton.vue` or `BasePill.vue`.

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
- [Components](/sdk/frontend/components) — every component honors theming
- [Composables → useTheme](/sdk/frontend/composables#usetheme) — programmatic access
