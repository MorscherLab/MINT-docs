# Design tokens

Every visual aspect of the platform — color, radius, focus rings, shadows, and common component states — is parameterized as a CSS custom property. The frontend SDK ships the tokens in `styles/variables.css`, plus Tailwind v4 compatibility utilities for the classes used by SDK components. **Plugin frontends should reference tokens, never hex codes.**

## Why tokens

When a deployment overrides the platform's brand color (a lab might want a different primary), every plugin re-themes automatically — no per-plugin update needed. Hardcoded `#4F46E5` in your plugin breaks that.

Tokens also make light/dark/density work universally. The dark theme just changes the variable values; a plugin that uses `var(--bg-primary)` flips correctly without code changes.

## Setup

Frontend scaffolding is included by default with `mint init` (skipped when `--no-frontend` is passed). Manual setup:

```css
/* frontend/src/style.css */
@import "tailwindcss";
@import "@morscherlab/mint-sdk/styles" layer(mint-sdk);
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
| `--mint-brand` | MINT brand mark color | `#7BD0B5` |

Use brand tokens for: links, primary buttons, focused inputs, the most-prominent action on a screen.

### Semantic feedback

| Variable | Use |
|----------|-----|
| `--mint-success` | Successful operations |
| `--mint-error` | Errors, destructive actions |
| `--mint-warning` | Warnings, "needs review" states |
| `--mint-info` | Informational notices |

Each ships variants: `--mint-{name}-bg`, `--mint-{name}-border`, `--mint-{name}-text`.

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
| `--mint-text-inverse` | Legacy alias for text on dark backgrounds |

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
| `--mint-transition` | Shared component transition (`150ms ease`) |

### Motion

| Variable | Use |
|----------|-----|
| Rule | Use |
|------|-----|
| `@media (prefers-reduced-motion: reduce)` | The SDK globally shortens animation and transition durations |
| `--mint-transition` | Use for simple custom hover/focus transitions |

The SDK respects `prefers-reduced-motion` globally. Custom animations should either use the same media query or keep motion non-essential.

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
- [Components](/sdk/frontend/components) — every component reads tokens
- The token source: `packages/sdk-frontend/src/styles/variables.css`
