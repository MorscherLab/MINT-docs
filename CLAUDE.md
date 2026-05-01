# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

User-facing documentation site for [MINT](https://github.com/MorscherLab/mld) — Mass-spec INtegrated Toolkit (formerly MLD). Built with VitePress, deployed to **mint-docs.morscherlab.org** via GitHub Pages on every push to `main`.

This repo contains the **user-facing manual**: install, guide walkthroughs, UI tour, FAQ, glossary, plus user-level `mint` CLI usage (`/cli/`) and a thin SDK overview (`/sdk/`) that links out. Developer-internal material (full SDK API reference, plugin internals, frontend component catalog, extension points) lives in `MorscherLab/mld/sdk` — do not duplicate it here. When in doubt, link out.

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

VitePress reads markdown from the project root recursively, but `srcExclude` in `.vitepress/config.ts` skips `README.md` and `node_modules/**`. Five content directories drive the navigation:

- `get-started/` — install paths (Linux direct, Linux Docker, hosted MINT) and the 5-minute quickstart. MINT is supported on Linux servers only — there is intentionally no desktop / macOS / Windows install path.
- `workflow/` — the platform user guide (projects, experiments, members, auth, plugins, marketplace, updates)
- `cli/` — User Manual side of the `mint` CLI: `overview` (orientation), `platform` (auth/experiment/project/status), `configuration` (`config.json` schema). The `mint` CLI is shipped by the `mint-sdk` package and is **not** the platform launcher (the platform runs via `uvicorn api.main:app`).
- `sdk/` — full Plugin Development track: concepts, tutorials, recipes, frontend, operations, api. Six sub-sections.
- `reference/` — UI tour, RBAC permission reference, troubleshooting, FAQ, glossary

Plus `index.md` (home), `team.md` (Vue components from `vitepress/theme`), and `changelog.md` (links out to GitHub Releases — release notes themselves are not maintained here).

`.vitepress/config.ts` is the single source of truth for nav bar, sidebar groups, search, and the GitHub edit-link pattern. **Adding a page requires two edits**: create the `.md` file, then register it in the matching `sidebar` group in `config.ts` — otherwise it won't appear in navigation.

`.vitepress/theme/` only adds `custom.css` on top of the default theme (MINT brand color overrides — indigo primary + orange CTA). The brand palette there is intentionally kept in sync with `packages/sdk-frontend/src/styles/variables.css` in the mld repo — change both together if you change either. `.vitepress/public/` ships static assets straight to the site root — notably `CNAME` (custom domain) and `mint-icon.png` (mastered in `mld/assets/MINT-ICON-1024x1024@1x.png`). The Vite config sets `publicDir` explicitly so the CNAME survives builds run from any cwd.

Edit links in the footer point to `MorscherLab/MINT-docs` on GitHub. The dev server uses `lastUpdated` git timestamps, which is why CI checks out with `fetch-depth: 0`.

## Conventions for content edits

- The audience is lab scientists and lab admins, not core developers — keep tone task-oriented, prefer screenshots and short steps over prose.
- Screenshot placeholders use the convention `> [Screenshot: description of what should be shown]` as a blockquote — these are TODOs for the actual image. Match this pattern when drafting new pages so they're easy to grep for and replace later.
- Internal links use VitePress clean URLs (no `.md` extension, since `cleanUrls: true`).
- `ignoreDeadLinks: false` — broken internal links fail the build, so verify links resolve before committing.
- The home page (`index.md`) uses VitePress's `layout: home` frontmatter with `hero` + `features`; don't convert it to a regular markdown page.
- For anything related to platform internals (SDK function signatures, schema details, plugin loader internals, RBAC model code), link out to the mld repository rather than restating it here.
- The MINT name is canonical post-`v1.0.0`. Use `mint-sdk` / `@morscherlab/mint-sdk` / `mint` CLI / `MINT_` env vars when referring to current versions; only mention the legacy `mld` / `MLD_` names when explicitly documenting migration from older versions.
