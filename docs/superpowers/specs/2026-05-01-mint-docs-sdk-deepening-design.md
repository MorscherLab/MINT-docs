# MINT-docs SDK deepening — design

**Date:** 2026-05-01
**Status:** Approved (brainstorming complete)
**Author:** Claude Code (Opus 4.7) with the user

## Context

MINT-docs was scaffolded on 2026-05-01 from the LEAF-docs template. Three intentionally lightweight `/sdk/*.md` pages (`overview`, `python`, `frontend`) point readers at the existing developer site at `mld-platform/mld/site/`. The user has decided MINT-docs should become the **single source of truth** for both the user manual and the SDK reference; the existing `mld/site/` will be retired or repurposed.

The user's stated priority for SDK content is, in order:

1. **A — Conceptual / architecture** (lifecycle, isolation, `PlatformContext`, data model, migrations)
2. **B — Tutorials** (end-to-end walkthroughs)
3. **F — Operations / deployment** (packaging, publishing, CI, versioning)
4. **D — Recipes / patterns** (copy-paste-friendly how-tos)
5. **E — Frontend component catalog**

API reference (priority C) is explicitly de-emphasized — included as back-of-book reference, not the front door.

## Strategy

Two-track documentation:

| Track | Audience | URL prefixes |
|-------|----------|--------------|
| **User Manual** | Lab admins, scientists | `/get-started/`, `/workflow/`, `/cli/`, `/reference/` |
| **Plugin Development** | Plugin authors | `/sdk/` |

The two tracks share the same VitePress site, header, brand, and search index. The top navigation splits cleanly between them; the sidebar shows the active track only. Mirrors the Vue / Vite / VitePress documentation pattern (`/guide/` vs `/api/`).

## Information architecture

### User Manual track (lightly polished, mostly today's content)

- `/get-started/` — install-direct, install-docker, install-hosted, quickstart (no change)
- `/workflow/` — projects, experiments, members-roles, auth-passkeys, plugins, marketplace, updates (no change)
- `/cli/` — overview, serve, platform, configuration (the user-facing CLI commands). Today's `/cli/plugin-dev.md` is rewritten to a one-line redirect to `/sdk/tutorials/first-analysis-plugin`
- `/reference/` — ui-tour, permissions, troubleshooting, faq, glossary (no change)

### Plugin Development track (new, deep)

- `/sdk/concepts/` — 7 pages: `index`, `plugin-types`, `lifecycle`, `isolation`, `platform-context`, `data-model`, `migrations`
- `/sdk/tutorials/` — 5 pages: `index`, `first-analysis-plugin`, `design-plugin-with-tables`, `adding-a-frontend`, `plugin-roles`
- `/sdk/recipes/` — 11 pages: `index`, `reading-experiments`, `writing-results`, `managing-artifacts`, `querying-plugin-data`, `route-permissions`, `error-handling`, `logging-tracing`, `testing-plugins`, `backfill-migration`, `r-integration`
- `/sdk/frontend/` — 6 pages: `index`, `components`, `composables`, `design-tokens`, `theming`, `form-builder`
- `/sdk/operations/` — 7 pages: `index`, `packaging`, `publishing`, `ci-patterns`, `versioning`, `deploying`, `upgrading-sdk`
- `/sdk/api/` — 7 pages: `index`, `python`, `frontend`, `migrations`, `client`, `exceptions`, `cli-reference`

**Total new SDK pages:** 43. **Existing `/sdk/*.md` retired:** 3 (`overview`, `python`, `frontend`).

### Sidebar configuration

`.vitepress/config.ts` gets a single new sidebar entry rooted at `/sdk/` with six grouped sub-sections (concepts, tutorials, recipes, frontend, operations, api). The User Manual sidebars stay structurally as today.

### Top navigation

```
[ MINT logo ] [ User Manual ▼ ] [ Plugin Development ▼ ] [ Reference ▼ ] [ Open MINT ]
                  Get Started        Concepts                   UI Tour
                  Guide              Tutorials                  Permissions
                  CLI                Recipes                    Troubleshooting
                  Changelog          Frontend                   FAQ
                                     Operations                 Glossary
                                     API Reference
```

`Reference` keeps the user-facing reference pages (it's about the platform, not the SDK).

## Migration approach

The existing developer site at `mld-platform/mld/site/` has substantive material:

- `site/sdk/` — api-reference, best-practices, core-concepts, data-models, deployment, design-rules, error-handling, frontend-sdk, guides, publishing, repositories
- `site/python/` — api-reference, exceptions, migrations, plugin-guide, plugin-migrations, r-integration
- `site/frontend/` — api-reference, components, composables, theming
- `site/guide/` — building-plugins, getting-started, plugin-development, sdk-plugin-development-guide, skill-setup
- `site/cli/` — client, commands

**Approach:** read each existing page, rewrite into the new MINT-docs taxonomy. Preserve the technical content; restructure for the new sub-section boundaries (concepts vs tutorials vs recipes vs api); rewrite voice to match MINT-docs (precise, scientific tone). Where the existing site is thin, generate from the SDK source: `packages/sdk-python/src/mint_sdk/` and `packages/sdk-frontend/src/`.

**Mapping (representative; complete mapping during plan execution):**

| Existing page | Destination |
|---------------|-------------|
| `site/sdk/core-concepts.md` | `/sdk/concepts/index.md` + `/sdk/concepts/plugin-types.md` |
| `site/sdk/data-models.md` | `/sdk/concepts/data-model.md` |
| `site/sdk/repositories.md` | `/sdk/concepts/platform-context.md` + `/sdk/recipes/*` |
| `site/python/plugin-migrations.md` | `/sdk/concepts/migrations.md` + `/sdk/recipes/backfill-migration.md` |
| `site/sdk/error-handling.md` | `/sdk/recipes/error-handling.md` + `/sdk/api/exceptions.md` |
| `site/python/r-integration.md` | `/sdk/recipes/r-integration.md` |
| `site/frontend/components.md` | `/sdk/frontend/components.md` (top ~20 components by usage) |
| `site/frontend/composables.md` | `/sdk/frontend/composables.md` |
| `site/frontend/theming.md` | `/sdk/frontend/theming.md` + `/sdk/frontend/design-tokens.md` |
| `site/sdk/publishing.md` | `/sdk/operations/publishing.md` |
| `site/sdk/deployment.md` | `/sdk/operations/deploying.md` |
| `site/python/api-reference.md` | `/sdk/api/python.md` |
| `site/cli/commands.md` | `/sdk/api/cli-reference.md` |
| `site/guide/getting-started.md` | `/sdk/tutorials/index.md` + `/sdk/tutorials/first-analysis-plugin.md` |

## Code examples strategy

- **Runnable**, not pseudocode. Examples assume `mint init` scaffolds and use real symbols from `mint_sdk`.
- **End-to-end ownership**: each tutorial owns one runnable example; recipes link back to the relevant tutorial rather than re-inventing setup.
- **Frontmatter import lists** at the top of every code block so a reader can copy the entire block and have it work.
- **No `# TODO`-style placeholders** in code. If we don't know an exact symbol, we name it accurately by reading the SDK source first.

## Diagrams strategy

- **Mermaid** for sequence and state diagrams: plugin lifecycle, isolation flow, migration runner, request path through `PlatformContext`.
- **ASCII / Markdown tables** for simple trees, matrices, comparisons.
- **No screenshots in `/sdk/`** — code is the artifact, not the UI.
- The User Manual track keeps its `> [Screenshot: ...]` placeholders unchanged.

## User Manual changes

Light, scoped to keep the SDK track discoverable:

- `index.md` (home) — add a clear "For plugin authors" CTA to `/sdk/concepts/` alongside the existing Get Started / Quickstart / Hosted CTAs
- `.vitepress/config.ts` — top-nav restructure (User Manual / Plugin Development / Reference); per-track sidebars
- `cli/plugin-dev.md` — replace with a 5-line pointer to `/sdk/tutorials/first-analysis-plugin`
- Footer copy unchanged

## Frontmatter and conventions

- All `/sdk/` pages use VitePress clean URLs (no `.md` in links)
- Mermaid via the standard fenced-block syntax (VitePress 1.x supports it natively when `markdown.theme` includes the right configuration; we'll add a small `.vitepress/config.ts` block to enable it via the `mermaid-plugin-vitepress` plugin if not already on)
- Code blocks declare a language tag (`python`, `typescript`, `vue`, `bash`, `toml`, `json`)
- Cross-links from User Manual track into `/sdk/` pages where relevant (e.g., `/workflow/plugins.md` already links to `/sdk/overview` — update to `/sdk/concepts/`)

## Success criteria

1. Build passes (`bun run build`) with `ignoreDeadLinks: false` — every internal link resolves
2. Sidebar correctly shows the active track only on each page
3. A plugin author landing on `/sdk/` can:
   - Understand the plugin model in 5 minutes (concepts/index)
   - Build a working hello-world plugin in 30 minutes (tutorials/first-analysis-plugin)
   - Find a copy-paste pattern for the 10 most common tasks (recipes)
   - Look up the canonical CLI flag or SDK symbol when needed (api)
4. A lab scientist landing on `/get-started/` is unaffected — nav doesn't crowd them with SDK content
5. The home page communicates clearly that there are two audiences

## Out of scope

- Screenshot population (will be added later by maintainers)
- Per-component prop tables for every Vue component — only the top ~20 by usage
- Translation; English only
- `mld/site/` retirement / redirect rules — separate decision after MINT-docs SDK content is up
- Auto-generated API docs from code (e.g., Sphinx, TypeDoc) — manual reference only for now
- Mermaid plugin install verification beyond a single working diagram
- Visual regression / snapshot tests for the docs site

## Implementation notes

- VitePress 1.x is in use; sidebar config is per-prefix (`/sdk/` gets its own group)
- `srcExclude` already excludes `README.md`, `CLAUDE.md`, `node_modules/**`; `docs/**` was added in this commit so this spec file doesn't render as a site page
- The 43 new pages will be drafted in a logical writing order: Concepts → Tutorials (so tutorials can reference concept pages) → Recipes → Frontend → Operations → API Reference. Sidebars wire up after each section is drafted to keep the build green throughout

## Risk and mitigation

| Risk | Mitigation |
|------|------------|
| Sidebar / nav drift between top nav and per-track sidebars | Single `config.ts`, both derived from the same array of section objects |
| Code examples drift from real SDK exports | Read from `packages/sdk-python/src/mint_sdk/` and `packages/sdk-frontend/src/` before writing each example; cite the source path in the page's `<!-- spec note -->` HTML comment |
| Page count blow-up making the sidebar unwieldy | Cap at 43 pages; aggressively de-duplicate (recipes that just restate concept pages get cut) |
| Mermaid not rendering | Verify with one diagram on `concepts/lifecycle.md` first; if it fails, fall back to ASCII for all diagrams |
| Too many pages to write in one pass causing fatigue and errors | Structured plan with per-section commit points; build runs after each section |

## Spec self-review

- ✅ No "TBD" / "TODO" / vague requirements
- ✅ Internal consistency: page count (43) matches breakdown (7+5+11+6+7+7); IA matches priority order
- ✅ Scope: single implementation plan can cover this; the 43 pages divide cleanly into 6 commit-sized sections
- ✅ Ambiguity: explicit on URL prefix (`/sdk/`), example runnability (real symbols), and screenshot policy (none in `/sdk/`)
