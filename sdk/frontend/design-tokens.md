# Design tokens

Every visual property of the platform is a CSS custom property: colour, type size, radius, focus rings, shadows, layers and common component states. The frontend SDK declares about 125 tokens in `styles/variables.css` (MINT design v2). Use tokens in plugin frontends, not hex codes. A token follows the user's theme, palette and density, and a brand override of the deployment. A hardcoded `#0D9488` does not.

## Setup

`mint init --mode standard` adds the style import and the Geist font link. For a manual setup, see [Frontend SDK → Setup checklist](/sdk/frontend/#setup-checklist). The `styles` export does not import the fonts, because `@tailwindcss/vite` drops an `@import url(...)` inside it.

With `moduleResolution: "bundler"` (the `mint init` template), TypeScript 6 accepts `import '@morscherlab/mint-sdk/styles'` with no `declare module`.

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

Use the brand tokens for links, primary buttons, focused inputs and the main action of a screen.

For text and icons on an accent fill, use `--text-on-accent`, not `white`. White on the light accent `#0D9488` is 3.74:1, an accepted exception to WCAG AA.

`--color-cta`, `--color-cta-hover` and `--color-purple` are aliases of the accent. They remain until MINT 2.0. `mint doctor` warns when a plugin uses them.

### Entity accents (retired)

Experiments and projects have no hues of their own. `--color-experiment*` and `--color-project*` (base, `-hover`, `-soft`, `-border`) are aliases of slate neutrals until MINT 2.0. `mint doctor` warns on them. Identify entities by icon and label, not by hue.

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

### Type scale

Each font size in the SDK is one of ten tokens. Plugin CSS sets a font size with a token too.

| Token | Size | Role |
|-------|------|------|
| `--font-size-2xs` | 11px | Field labels, the smallest pills and badges |
| `--font-size-xs` | 12px | Column captions and small group headings (weight 500, sentence case, no letter-spacing), helper and error text, mono codes, ids, counts and timestamps, pills and badges |
| `--font-size-sm` | 13px | Table cells and list rows, `sm` and `md` controls, card and section titles |
| `--font-size-md` | 14px | Tile names |
| `--font-size-lg` | 15px | Modal and top-bar titles |
| `--font-size-xl` | 16px | `lg` controls |
| `--font-size-2xl` | 18px | Larger text, for example the `ResourceCard` `lg` name |
| `--font-size-3xl` | 20px | Larger text |
| `--font-size-4xl` | 24px | Larger text |
| `--font-size-display` | 40px | Larger text |

The `.text-sm` utility class of the SDK is 13px, the same step as `--font-size-sm`. `.text-xs` is 12px. To keep another size, set it with a token on a plugin class:

```css
.run-table__caption {
  font-size: var(--font-size-xs);
}
```

The `mint lint` rule `font-size-token` (on by default, and part of the "Design rules" check of `mint doctor`) accepts `var(--font-size-*)` without a fallback or `inherit`. It reports `px`, `rem`, keywords, `calc()`, a `font` shorthand with such a size and a Tailwind arbitrary size class such as `text-[11px]`. `em` and `%` are accepted only for subscripts, superscripts and charge marks. For another exception, add `/* mint-lint-ignore font-size-token: <reason> */` above the declaration.

### Focus

| Variable | Use |
|----------|-----|
| `--focus-ring` | Full box-shadow value for a solid focus ring |
| `--focus-ring-offset` | Full box-shadow value with an offset ring |
| `--focus-ring-error` | Error focus ring |
| `--focus-ring-soft` | Softer translucent focus ring |
| `--focus-ring-soft-error` | Softer translucent error focus ring |

Each token is a full `box-shadow` value. Use it with `box-shadow`, not `outline`. Every interactive SDK component uses these tokens; use them in custom components too.

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
| `@media (prefers-reduced-motion: reduce)` | The SDK shortens all animations and transitions; see [Theming → Reduced motion](/sdk/frontend/theming#reduced-motion) |

Do not add hover lift, glow or blur.

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
| `--mint-scrim` | Overlay behind a modal (`rgba(15, 23, 42, 0.45)` in both themes). Use it for your own overlay |
| `--mint-strip-bg` | Background of strip content (`AlertBox`, `EmptyState variant="inline"`) in a `SectionCard` |
| `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-hover` | Scrollbar colors |
| `--mint-toast-offset-top` | Top offset of the toast stack. `AppTopBar` sets it; see [Toast positioning](/sdk/components/app-toast-container#toast-positioning) |

Legacy aliases still used by some components: `--mint-bg-primary`, `--mint-bg-secondary`, `--mint-bg-card`, `--mint-bg-hover`, `--mint-bg-input`, `--mint-text-primary`, `--mint-text-secondary`, `--mint-text-muted`, `--mint-text-inverse`, `--mint-border`, `--mint-border-focus`. Use the canonical `--bg-*`, `--text-*`, and `--border-*` names in new code.

## Tailwind utilities

Tailwind CSS is optional; see [Setup checklist](/sdk/frontend/#setup-checklist). The SDK ships no `*-mint-*` utility classes, no Tailwind preset, and no legacy global classes such as `.btn-primary`, `.card`, or `.alert-success`. Use `BaseButton`, `SectionCard`, `BaseInput`, and `AlertBox`.

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

Use tokens in component CSS when a utility class is not sufficient:

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

- Do not hardcode hex codes. `color: #0D9488;` does not follow the theme. Use `var(--color-primary)` or a Tailwind utility that you mapped in `@theme`.
- Do not use `white` on an accent fill. Use `var(--text-on-accent)`.
- Do not use a `--focus-ring*` token as `outline`. The tokens are `box-shadow` values.
- Do not import code from the platform frontend. The plugin is its own bundle, and the tokens are the contract.
- Do not make new semantic colours. Use `--mint-success` and the other semantic tokens.
- Do not repeat transition values. Use `var(--mint-transition)` or the SDK components.
- Do not write a literal font size. Use a `--font-size-*` token; see [Type scale](#type-scale).

## Auditing your plugin

1. Run `mint lint` before each push. Its design rules report literal colours, literal font sizes, retired tokens and other token misuse.
2. Run `mint lint --explain <rule>` to see the reason for a rule.
3. Before you merge a frontend change, search for hex codes:
   ```bash
   grep -rE "#[0-9a-fA-F]{6}\b" src/ frontend/src/
   ```
4. Replace each hit with a `var(--…)` token, unless the colour must not follow the theme.

## Token stability

Token names do not change in an SDK minor version. The retired aliases above remain until MINT 2.0. The token source is `packages/sdk-frontend/src/styles/variables.css`. A deployment can override any token on `:root`; see [Theming → Brand overrides](/sdk/frontend/theming#brand-overrides).
