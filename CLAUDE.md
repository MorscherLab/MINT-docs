# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

User-facing documentation site for [MINT](https://github.com/MorscherLab/MINT) — Mass-spec INtegrated Toolkit (formerly MLD). Built with VitePress, deployed to **mint-docs.morscherlab.org** via GitHub Pages on every push to `main`.

This repo contains the **user-facing manual** and the **Plugin Development** documentation track: install, workflow walkthroughs, UI tour, FAQ, glossary, admin-level `mint` CLI usage (`/admin/cli`), SDK concepts, tutorials, recipes, frontend component/composable guidance, operations, and API reference. The platform repository is still the source of truth for implementation, so verify SDK signatures and schema details against `../MINT-platform/MINT` before changing reference pages.

## Commands

Bun-managed (see `bunfig.toml` — `linker = "hoisted"` is required for VitePress).

```bash
bun install
bun run dev      # http://localhost:17174/  (strictPort, will fail if taken)
bun run build    # outputs to .vitepress/dist/
bun run preview  # serve the built site
```

There are no tests, linters, or formatters configured. CI only runs `bun install --frozen-lockfile` + `bun run build`.

## Architecture

VitePress reads markdown from the project root recursively, but `srcExclude` in `.vitepress/config.ts` skips `README.md` and `node_modules/**`. Four content directories drive the navigation:

- `guide/` — **Use MINT** (lab scientists): quickstart, access, data model, projects, experiments, instruments, AI assistants and API access (tokens, MCP), marketplace (browse/request), UI tour.
- `admin/` — **Administer MINT** (lab admins): install (direct, Docker; Linux servers only — no desktop/macOS/Windows path), reverse proxy + first run, `config.json` configuration, users & roles, authentication, plugin management, updates (incl. upgrading from 1.1), and the `mint` CLI for admins. The `mint` CLI ships in `mint-sdk[cli]` and is **not** the platform launcher. `sdk/api/cli-reference` is the only full command/flag table.
- `sdk/` — full Plugin Development track: concepts, tutorials, recipes, frontend, operations, api. Six sub-sections.
- `reference/` — RBAC permission reference, troubleshooting, FAQ, glossary

Plus `index.md` (home), `team.md` (Vue components from `vitepress/theme`), and `changelog.md` (links out to GitHub Releases — release notes themselves are not maintained here).

`.vitepress/config.ts` is the single source of truth for nav bar, sidebar groups, search, and the GitHub edit-link pattern. **Adding a page requires two edits**: create the `.md` file, then register it in the matching `sidebar` group in `config.ts` — otherwise it won't appear in navigation.

`.vitepress/theme/` only adds `custom.css` on top of the default theme (MINT brand color overrides — indigo primary + orange CTA). The brand palette there is intentionally kept in sync with `packages/sdk-frontend/src/styles/variables.css` in the MINT platform repo — change both together if you change either. `.vitepress/public/` ships static assets straight to the site root — notably `CNAME` (custom domain) and `mint-icon.png` (mastered in the platform repo as `frontend/public/logo.png`). The Vite config sets `publicDir` explicitly so the CNAME survives builds run from any cwd.

Edit links in the footer point to `MorscherLab/MINT-docs` on GitHub. The dev server uses `lastUpdated` git timestamps, which is why CI checks out with `fetch-depth: 0`.

## Conventions for content edits

- Write `@MINT_VERSION@` for the documented release (install pins, `blob/v@MINT_VERSION@/` source links); a markdown-it hook in `config.ts` substitutes `currentDocsVersion` from `.vitepress/versions.ts`. Guides describe current behavior only — per-release notes go in `changelog.md` under "Notable changes".
- Each topic has one home (plugin types: `sdk/concepts/plugin-types`; runtimes: `sdk/concepts/isolation`; migration mechanics: `sdk/api/migrations`; components: `sdk/components/`). Link instead of copying.

- The audience is lab scientists and lab admins, not core developers — keep tone task-oriented, prefer screenshots and short steps over prose.
- Screenshot placeholders use the convention `> [Screenshot: description of what should be shown]` as a blockquote — these are TODOs for the actual image. Match this pattern when drafting new pages so they're easy to grep for and replace later.
- Internal links use VitePress clean URLs (no `.md` extension, since `cleanUrls: true`).
- `ignoreDeadLinks: false` — broken internal links fail the build, so verify links resolve before committing.
- The home page (`index.md`) uses VitePress's `layout: home` frontmatter with `hero` + `features`; don't convert it to a regular markdown page.
- For SDK function signatures, schema details, plugin loader internals, and RBAC model code, check the MINT platform source before editing. Keep reference pages concise and link to source files for details that are likely to churn.
- The MINT name is canonical post-`v1.0.0`. Use `mint-sdk` / `@morscherlab/mint-sdk` / `mint` CLI / `MINT_` env vars when referring to current versions; only mention the legacy `mld` / `MLD_` names when explicitly documenting migration from older versions.
