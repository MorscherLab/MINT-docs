# Design tokens

Every visual aspect of the platform — color, spacing, radius, motion, shadows — is parameterized as a CSS custom property. The frontend SDK ships 500+ tokens in `styles/variables.css`, plus a Tailwind preset that exposes them as utilities. **Plugin frontends should reference tokens, never hex codes.**

## Why tokens

When a deployment overrides the platform's brand color (a lab might want a different primary), every plugin re-themes automatically — no per-plugin update needed. Hardcoded `#4F46E5` in your plugin breaks that.

Tokens also make light/dark/density work universally. The dark theme just changes the variable values; a plugin that uses `var(--bg-primary)` flips correctly without code changes.

## Setup

Both steps happen automatically with `mint init --add-frontend`. Manually:

```ts
// src/main.ts
import '@morscherlab/mint-sdk/styles/variables.css'
```

```ts
// tailwind.config.ts
import preset from '@morscherlab/mint-sdk/tailwind.preset'
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  presets: [preset],
}
```

## Token families

### Brand

| Variable | Meaning | Default light |
|----------|---------|---------------|
| `--color-primary` | Indigo brand color | `#4F46E5` |
| `--color-primary-hover` | Hover state | `#4338CA` |
| `--color-primary-active` | Active/pressed | `#3730A3` |
| `--color-primary-soft` | Soft tint for backgrounds | `rgba(79, 70, 229, 0.14)` |
| `--color-cta` | Orange CTA | `#F97316` |
| `--color-cta-hover` | CTA hover | `#EA580C` |

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
| `--bg-overlay` | Modal / popover backdrop |
| `--border-default` | Default 1px border color |
| `--border-strong` | Higher-contrast border |
| `--border-subtle` | Lower-contrast border |

### Text

| Variable | Use |
|----------|-----|
| `--text-primary` | Main text color |
| `--text-secondary` | Less-emphasized text (labels, captions) |
| `--text-muted` | Even more recessed (helper text) |
| `--text-inverse` | Text on dark backgrounds |

### Focus

| Variable | Use |
|----------|-----|
| `--focus-ring` | Color of the focus ring |
| `--focus-ring-offset` | Background outside the ring |
| `--focus-ring-width` | Ring thickness |

Every interactive component honors these. Custom components should follow the same pattern.

### Spacing and radius

Tailwind's standard scale (`p-2`, `p-4`, `rounded-lg`) backed by CSS variables. The SDK preset also exposes:

| Variable | Use |
|----------|-----|
| `--radius-default` | Component-level corner radius (`0.5rem`) |
| `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` | Standard scale |
| `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Elevation |
| `--transition-fast` | `150ms` |
| `--transition-default` | `200ms` |

### Motion

| Variable | Use |
|----------|-----|
| `--ease-default` | Standard easing curve |
| `--ease-in-out` | Symmetric easing |
| `--motion-disabled` | `0ms` — set when `prefers-reduced-motion: reduce` |

The SDK respects `prefers-reduced-motion` globally. Custom animations should multiply their duration by `var(--motion-disabled, 1)` or check the media query.

## Tailwind utilities

The preset maps every token to a utility. Use these in templates:

```vue
<div class="bg-bg-primary text-text-primary border border-border-default p-4 rounded-default">
  <h2 class="text-text-primary font-semibold">Title</h2>
  <p class="text-text-secondary text-sm">Subtitle</p>
  <div class="bg-bg-secondary p-3 rounded-md mt-2">Recessed content</div>
</div>
```

| Utility prefix | Maps to |
|----------------|---------|
| `bg-bg-*` | `var(--bg-*)` |
| `text-text-*` | `var(--text-*)` |
| `border-border-*` | `var(--border-*)` |
| `bg-mint-{success,error,warning,info}` / `bg-mint-{name}-bg` | Semantic backgrounds |
| `text-mint-{success,error,warning,info}` | Semantic text |
| `text-color-primary`, `bg-color-primary*` | Brand color |
| `rounded-default`, `rounded-sm`, `rounded-md`, … | Token-backed radii |

## Custom CSS

When utility classes aren't enough:

```vue
<style scoped>
.my-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-default) var(--ease-default);
}

.my-card:hover {
  box-shadow: var(--shadow-lg);
}

.my-card:focus-within {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

## Don'ts

- **Don't hardcode hex codes** — `color: #4F46E5;` won't re-theme. Use `var(--color-primary)` or the Tailwind utility.
- **Don't reach into the platform's frontend** — your plugin is its own bundle and shouldn't import platform code. Tokens are the contract.
- **Don't reinvent semantic colors** — `--mint-success` already exists. A different green from yours will look out of place.
- **Don't bake in `transition-duration: 150ms;`** — use `var(--transition-fast)` so reduced-motion users get the right behavior.

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
