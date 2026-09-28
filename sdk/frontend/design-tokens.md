# Design tokens

Every visual aspect of the platform — color, radius, focus rings, shadows, and common component states — is parameterized as a CSS custom property. The frontend SDK ships the tokens in `styles/variables.css`, plus Tailwind v4 compatibility utilities for the classes used by SDK components. **Plugin frontends should reference tokens, never hex codes.**

## Why tokens

When a deployment overrides the platform's brand color (a lab might want a different primary), every plugin re-themes automatically — no per-plugin update needed. Hardcoded `#4F46E5` in your plugin breaks that.

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

| Variable | Meaning | Default light |
|----------|---------|---------------|
| `--color-primary` | Indigo brand color | `#6366F1` |
| `--color-primary-hover` | Hover state | `#4F46E5` |
| `--color-primary-light` | Light accent | `#93C5FD` |
| `--color-primary-soft` | Soft tint for backgrounds | `rgba(99, 102, 241, 0.12)` |
| `--color-cta` | Orange CTA | `#F97316` |
| `--color-cta-hover` | CTA hover | `#EA580C` |
| `--color-purple` | Purple accent | `#8B5CF6` |
| `--mint-brand`, `--mint-brand-hover`, `--mint-brand-soft` | MINT brand mark color, hover, tint | `#7BD0B5`, `#5FB89A`, `rgba(123, 208, 181, 0.12)` |

### Entity accents

Experiments use cyan and projects use sky blue. Each has a base, `-hover`, `-soft` (icon chips and pills), and `-border` (pill outline) token.

| Variable | Default light |
|----------|---------------|
| `--color-experiment`, `--color-experiment-hover`, `--color-experiment-soft`, `--color-experiment-border` | `#06B6D4`, `#0891B2`, `rgba(6, 182, 212, 0.12)`, `rgba(6, 182, 212, 0.3)` |
| `--color-project`, `--color-project-hover`, `--color-project-soft`, `--color-project-border` | `#0EA5E9`, `#0284C7`, `rgba(14, 165, 233, 0.12)`, `rgba(14, 165, 233, 0.32)` |

Use brand tokens for: links, primary buttons, focused inputs, the most-prominent action on a screen.

### Semantic feedback

| Variable | Use |
|----------|-----|
| `--mint-success` | Successful operations |
| `--mint-error` | Errors, destructive actions |
| `--mint-warning` | Warnings, "needs review" states |
| `--mint-info` | Informational notices |

Every semantic color has `--mint-{name}-bg` and `--mint-{name}-border`. Success, error, and warning also have `--mint-{name}-hover`; info has no hover token. Only warning has a text token, `--mint-warning-text`, for readable labels on `--mint-warning-bg`.

### Surfaces

| Variable | Use |
|----------|-----|
| `--bg-primary` | The main page background |
| `--bg-secondary` | Card / panel surface |
| `--bg-tertiary` | Recessed surface (e.g., inside a card) |
| `--bg-card` | Card surface alias |
| `--bg-hover` | Hover background |
| `--border-color` | Default 1px border color |
| `--border-light` | Low-contrast border |

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

### Spacing and radius

Tailwind's standard scale (`p-2`, `p-4`, `gap-3`) works as usual. SDK-specific radius, shadow, form-height, and transition tokens are:

| Variable | Use |
|----------|-----|
| `--radius` | Default radius (`0.375rem`) |
| `--radius-sm`, `--radius-md`, `--radius-lg` | Standard radius scale |
| `--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg` | Elevation |
| `--form-height-sm`, `--form-height-md`, `--form-height-lg` | Input/control heights |
| `--card-shadow` | The single shadow used by every SDK card |
| `--mint-transition` | Shared component transition (`150ms ease`) |

### Motion

| Token or rule | Use |
|---------------|-----|
| `--mint-transition` | Simple custom hover/focus transitions (`150ms ease`) |
| `--mint-ease-out-quart` | The SDK's standard easing curve (`cubic-bezier(0.25, 1, 0.5, 1)`) |
| `@media (prefers-reduced-motion: reduce)` | The SDK globally shortens animation and transition durations |

The SDK respects `prefers-reduced-motion` globally. Custom animations should either use the same media query or keep motion non-essential.

### Data colors

| Variable | Use |
|----------|-----|
| `--mint-sample-1` … `--mint-sample-9` | Categorical sample color scale (the SDK mirrors it in `SAMPLE_COLOR_SCALE`, `src/utils/color.ts`, for canvas and SVG) |
| `--mint-slot-r`, `--mint-slot-g`, `--mint-slot-b`, `--mint-slot-y` | Rack and plate slot positions |

### Other tokens

| Variable | Use |
|----------|-----|
| `--font-mono` | Fira Code stack for data, code, and routes |
| `--mint-disabled-opacity` | Opacity of disabled controls (`0.6`) |
| `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-hover` | Scrollbar colors |
| `--mint-toast-offset-top` | Top offset of the toast stack. Not declared in the stylesheet: a mounted `AppTopBar` sets it on `<html>` to its bottom edge plus 1rem and updates it on resize and scroll. The toast stack falls back to `1rem` |

Legacy aliases still used by some components: `--mint-bg-primary`, `--mint-bg-secondary`, `--mint-bg-card`, `--mint-bg-hover`, `--mint-bg-input`, `--mint-text-primary`, `--mint-text-secondary`, `--mint-text-muted`, `--mint-text-inverse`, `--mint-border`, `--mint-border-focus`. Use the canonical `--bg-*`, `--text-*`, and `--border-*` names in new code.

## Tailwind utilities

Use the SDK compatibility utilities or Tailwind v4 arbitrary values in templates:

```vue
<div class="bg-bg-secondary text-text-primary border border-border p-4 rounded-mint">
  <h2 class="text-text-primary font-semibold">Title</h2>
  <p class="text-text-secondary text-sm">Subtitle</p>
  <div class="bg-bg-hover p-3 rounded-mint-sm mt-2">Recessed content</div>
</div>
```

| Utility prefix | Maps to |
|----------------|---------|
| `bg-bg-secondary`, `bg-bg-hover`, `bg-bg-input` | Background tokens |
| `text-text-primary`, `text-text-secondary`, `text-text-muted` | Text tokens |
| `border-border` | `var(--border-color)` |
| `bg-mint-{primary,cta,success,error,warning,info,danger}` | Brand / semantic backgrounds |
| `text-mint-{success,error,warning,info}` | Semantic text |
| `text-mint-primary`, `bg-mint-primary`, `border-mint-primary` | Brand color |
| `rounded-mint`, `rounded-mint-sm`, `rounded-mint-lg` | SDK radius utilities |

For tokens without a named utility, use Tailwind's arbitrary value syntax:

```vue
<p class="text-[var(--text-muted)] border-[color:var(--border-light)]">
  Helper text
</p>
```

## Custom CSS

When utility classes aren't enough:

```vue
<style scoped>
.my-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--mint-transition);
}

.my-card:hover {
  box-shadow: var(--shadow-lg);
}

.my-card:focus-within {
  box-shadow: var(--focus-ring);
}
</style>
```

## Don'ts

- **Don't hardcode hex codes** — `color: #4F46E5;` won't re-theme. Use `var(--color-primary)` or the Tailwind utility.
- **Don't reach into the platform's frontend** — your plugin is its own bundle and shouldn't import platform code. Tokens are the contract.
- **Don't reinvent semantic colors** — `--mint-success` already exists. A different green from yours will look out of place.
- **Don't bake in repeated transition values** — use `var(--mint-transition)` or the SDK's components/utilities where possible.

## Auditing your plugin

A quick check before merging plugin frontend changes:

```bash
# Find any hardcoded hex codes in your plugin's Vue / CSS
grep -rE "#[0-9a-fA-F]{6}\b" src/ frontend/src/
```

Hits are usually candidates for `var(--…)` substitution.

## Notes

- Token names are stable across SDK minor versions. Major bumps may introduce new families or rename existing ones — check the changelog.
- The platform may override variables in its own root stylesheet (`packages/sdk-frontend/src/styles/variables.css` is the master; the platform's `frontend/src/style.css` can `:root { --color-primary: ...; }` to re-skin).
- Plugin Histoire stories should be reviewed in light, dark, AND white backgrounds — every story file declares them.

## Related

- [Theming](/sdk/frontend/theming) — palette overrides, density, accessibility
- [Component Library](/sdk/components/) — every component reads tokens
- The token source: `packages/sdk-frontend/src/styles/variables.css`
