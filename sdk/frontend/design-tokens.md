# Design tokens

Every visual aspect of the platform — color, radius, focus rings, shadows, layers, and common component states — is parameterized as a CSS custom property. The frontend SDK ships about 110 tokens in `styles/variables.css` (MINT design v2). **Plugin frontends should reference tokens, never hex codes.** Tailwind CSS is optional; to use a token as a utility, map it in your own `@theme` block (see [Tailwind utilities](#tailwind-utilities)).

## Why tokens

When a user chooses another accent palette, or a deployment overrides the platform's brand color, every plugin re-themes automatically — no per-plugin update needed. A hardcoded `#0D9488` in your plugin breaks that.

Tokens also make light/dark/density work universally. The dark theme just changes the variable values; a plugin that uses `var(--bg-primary)` flips correctly without code changes.

## Setup

`mint init --mode standard` scaffolds these imports for you. `generated` mode uses the SDK-managed UI and does not need a plugin-authored Vue bundle. Manual setup:

```css
/* frontend/src/style.css */
@import "tailwindcss";
@import "@morscherlab/mint-sdk/styles";
```

## Token families

### Brand

MINT has one teal accent. The accent tokens follow the user's palette (`html[data-palette]`, see [Theming](/sdk/frontend/theming#palettes)); the values below are the default Teal palette.

| Variable | Meaning | Light | Dark |
|----------|---------|-------|------|
| `--color-primary` | Accent: filled buttons, links, focus | `#0D9488` | `#2DD4BF` |
| `--color-primary-hover` | Hover state, and accent ink on cards | `#0F766E` | `#5EEAD4` |
| `--color-primary-pressed` | Pressed state | `#115E59` | `#99F6E4` |
| `--color-primary-soft` | Soft tint for backgrounds | `rgba(13, 148, 136, 0.10)` | `rgba(45, 212, 191, 0.12)` |
| `--color-primary-border` | Border of a soft accent surface | `#99F6E4` | `rgba(45, 212, 191, 0.35)` |
| `--text-on-accent` | Text and icons on an accent fill | `#FFFFFF` | `#0B1120` |
| `--color-primary-light` | Light accent | `#5EEAD4` | `#5EEAD4` |
| `--color-primary-50`, `-100`, `-500`, `-600` | Fixed teal scale, the same in both themes | `#F0FDFA`, `#CCFBF1`, `#14B8A6`, `#0D9488` | same |
| `--mint-primary` | Alias of `--color-primary` | | |
| `--mint-brand`, `--mint-brand-hover`, `--mint-brand-soft` | MINT brand mark color, hover, tint | `#7BD0B5`, `#5FB89A`, `rgba(123, 208, 181, 0.12)` | same |

Always use `--text-on-accent` for text and icons on an accent fill, never `white`. White on the light accent `#0D9488` is 3.74:1, a known accepted exception.

`--color-cta`, `--color-cta-hover`, and `--color-purple` are aliases of the accent. They remain until MINT 1.5, and `mint doctor` warns when a plugin uses them.

### Entity accents (retired)

Experiments and projects no longer have their own hues. `--color-experiment*` and `--color-project*` (base, `-hover`, `-soft`, `-border`) alias slate neutrals until MINT 1.5, and `mint doctor` warns on them. Tell entities apart by icon and label, not by hue.

Use brand tokens for: links, primary buttons, focused inputs, the most-prominent action on a screen.

### Semantic feedback

| Variable | Use |
|----------|-----|
| `--mint-success` | Successful operations |
| `--mint-error` | Errors, destructive actions |
| `--mint-warning` | Warnings, "needs review" states |
| `--mint-info` | Informational notices |

Semantic colors mark state only. Every semantic color has `--mint-{name}-bg` and `--mint-{name}-border`. Success, error, and warning also have `--mint-{name}-hover`; info has no hover token. Only warning has a text token, `--mint-warning-text`, for readable labels on `--mint-warning-bg`.

### Surfaces

| Variable | Use |
|----------|-----|
| `--bg-primary` | The main page background (`#F8FAFC` light, `#0B1120` dark) |
| `--bg-secondary` | Card / panel surface |
| `--bg-tertiary` | Recessed surface (e.g., inside a card) |
| `--bg-card` | Card surface alias |
| `--bg-hover` | Hover background |
| `--border-color` | Default 1px border color |
| `--border-light` | Low-contrast border |
| `--border-strong` | Strong border: hover state of a field, dashed outlines |

### Text

| Variable | Use |
|----------|-----|
| `--text-primary` | Main text color |
| `--text-secondary` | Less-emphasized text (labels, captions) |
| `--text-muted` | Even more recessed (helper text) |
| `--text-secondary-strong` | Label color for secondary/ghost buttons; stays at WCAG AA on `--bg-tertiary` |

### Focus

| Variable | Use |
|----------|-----|
| `--focus-ring` | Full box-shadow value for a solid focus ring |
| `--focus-ring-offset` | Full box-shadow value with an offset ring |
| `--focus-ring-error` | Error focus ring |
| `--focus-ring-soft` | Softer translucent focus ring |
| `--focus-ring-soft-error` | Softer translucent error focus ring |

Every interactive component honors these. Custom components should follow the same pattern.

### Spacing, radius, and elevation

Tailwind's standard scale (`p-2`, `p-4`, `gap-3`) works as usual. The design is flat: borders, not shadows. Only floating layers (popovers, menus, dialogs) have a shadow. SDK-specific radius, shadow, form-height, and transition tokens are:

| Variable | Use |
|----------|-----|
| `--radius-sm`, `--radius`, `--radius-md`, `--radius-lg` | Radius scale: 3, 4, 6, and 8 px |
| `--shadow-sm`, `--shadow`, `--card-shadow` | `none`: cards are flat |
| `--shadow-md`, `--shadow-lg`, `--mint-shadow-pop` | Floating layers only |
| `--form-height-sm`, `--form-height-md`, `--form-height-lg` | Input/control heights: 28, 32, and 40 px (32, 36, and 48 px at comfortable density) |
| `--mint-gutter` | Gap between controls: 0.5rem (0.75rem at comfortable density) |
| `--mint-page-inset` | Distance from the outermost cards to the window edge: 1rem in every density |
| `--mint-transition` | Shared component transition (`120ms ease`), colour only |

### Layers

Stacking order, from low to high: modal, jobs tray, onboarding tour, floating panels, tooltips and toasts.

| Variable | Value | Layer |
|----------|-------|-------|
| `--mint-z-modal` | 50 | Modals |
| `--mint-z-tray` | 1000 | `JobsStatusTray` |
| `--mint-z-tour` | 1100 | Onboarding tour layer |
| `--mint-z-popover` | 1200 | Dropdown panels, menus, and tooltips |
| `--mint-z-toast` | 9999 | Toasts |

Use these tokens for your own layers, so a dropdown opens above the jobs tray and the tour. The panels of `BaseSelect` (`multiple` and `searchable`), `DatePicker`, `ActionMenu`, and the `NumberInput` unit menu use fixed positioning, so they stay visible inside a scrolling `BaseModal` body instead of being cut off at the modal edge. They follow their trigger when the page scrolls or resizes, and Escape closes them.

### Motion

| Token or rule | Use |
|---------------|-----|
| `--mint-transition` | Simple custom hover/focus transitions (`120ms ease`) |
| `--mint-ease-out-quart` | The SDK's standard easing curve (`cubic-bezier(0.25, 1, 0.5, 1)`) |
| `@media (prefers-reduced-motion: reduce)` | The SDK globally shortens animation and transition durations |

The SDK respects `prefers-reduced-motion` globally. Custom animations should either use the same media query or keep motion non-essential. Do not add hover lift, glow, or blur.

### Data colors

| Variable | Use |
|----------|-----|
| `--mint-sample-1` … `--mint-sample-9` | Categorical sample color scale (the SDK mirrors it in `SAMPLE_COLOR_SCALE`, `src/utils/color.ts`, for canvas and SVG) |
| `--mint-slot-r`, `--mint-slot-g`, `--mint-slot-b`, `--mint-slot-y` | Rack and plate slot positions |

### Other tokens

| Variable | Use |
|----------|-----|
| `--font-sans` | Geist stack for UI text |
| `--font-mono` | Geist Mono stack for codes, m/z, retention times, counts, and timestamps |
| `--mint-disabled-opacity` | Opacity of disabled controls (`0.6`) |
| `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-hover` | Scrollbar colors |
| `--mint-toast-offset-top` | Top offset of the toast stack. Not declared in the stylesheet: a mounted `AppTopBar` sets it on `<html>` to its bottom edge plus 1rem and updates it on resize and scroll. The toast stack falls back to `1rem` |

Legacy aliases still used by some components: `--mint-bg-primary`, `--mint-bg-secondary`, `--mint-bg-card`, `--mint-bg-hover`, `--mint-bg-input`, `--mint-text-primary`, `--mint-text-secondary`, `--mint-text-muted`, `--mint-text-inverse`, `--mint-border`, `--mint-border-focus`. Use the canonical `--bg-*`, `--text-*`, and `--border-*` names in new code.

## Tailwind utilities

Tailwind CSS is optional. The SDK stylesheet is complete without it, and `tailwindcss` is not a peer dependency. The SDK ships no `*-mint-*` utility classes, no Tailwind preset, and no legacy global classes such as `.btn-primary`, `.card`, or `.alert-success`. Use `BaseButton`, `SectionCard`, `BaseInput`, and `AlertBox`.

With Tailwind v4, map the tokens you need in your own `@theme` block. The values stay theme-aware because they reference the SDK custom properties:

```css
@import "tailwindcss";
@import "@morscherlab/mint-sdk/styles";

@theme inline {
  --color-mint-primary: var(--color-primary);
  --color-mint-danger: var(--mint-error);
  --radius-mint: var(--radius-md);
}
```

Then `bg-mint-primary`, `text-mint-danger`, and `rounded-mint` resolve to the tokens. For tokens you did not map, use Tailwind's arbitrary value syntax:

```vue
<div class="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[color:var(--border-color)] p-4 rounded-[var(--radius-md)]">
  <h2 class="font-semibold">Title</h2>
  <p class="text-[var(--text-secondary)] text-sm">Subtitle</p>
</div>
```

## Custom CSS

When utility classes are not sufficient:

```vue
<style scoped>
.my-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: border-color var(--mint-transition);
}

.my-card:hover {
  border-color: var(--border-strong);
}

.my-card:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-soft);
}
</style>
```

## Don'ts

- **Do not hardcode hex codes** — `color: #0D9488;` does not re-theme. Use `var(--color-primary)` or a Tailwind utility that you mapped in `@theme`.
- **Do not use `white` on an accent fill** — use `var(--text-on-accent)`.
- **Do not use a `--focus-ring*` token as `outline`** — they are `box-shadow` values.
- **Do not import code from the platform frontend** — your plugin is its own bundle. Tokens are the contract.
- **Do not make new semantic colors** — `--mint-success` already exists. A different green from yours will look out of place.
- **Do not repeat transition values** — use `var(--mint-transition)` or the SDK's components/utilities where possible.

## Auditing your plugin

A quick check before merging plugin frontend changes:

```bash
# Find any hardcoded hex codes in your plugin's Vue / CSS
grep -rE "#[0-9a-fA-F]{6}\b" src/ frontend/src/
```

Hits are usually candidates for `var(--…)` substitution.

## Notes

- Token names are stable across SDK minor versions. The aliases `--color-cta*`, `--color-purple`, `--color-experiment*`, and `--color-project*` leave in 1.5 — check the changelog.
- The platform may override variables in its own root stylesheet (`packages/sdk-frontend/src/styles/variables.css` is the master; the platform's `frontend/src/style.css` can `:root { --color-primary: ...; }` to re-skin).
- Plugin Histoire stories should be reviewed in light, dark, AND white backgrounds — every story file declares them.

## Related

- [Theming](/sdk/frontend/theming) — palette overrides, density, accessibility
- [Component Library](/sdk/components/) — every component reads tokens
- The token source: `packages/sdk-frontend/src/styles/variables.css`
