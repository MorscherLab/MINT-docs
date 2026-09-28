# MINT Docs: restructure + sync to 1.2.9

## Phase A: restructure (no content fixes yet)

- [x] A1 Version variable: markdown-it hook replaces `@MINT_VERSION@` (prose + code) from `versions.ts`; replace hand-written 1.2.6 pins.
- [x] A2 Move pages (git mv) into Use / Administer / Build / Reference; update config.ts nav + sidebars; fix internal links.
- [x] A3 Merge `sdk/operations/migrating-to-1.2` + `upgrading-sdk` -> `migrate-1.1-to-1.2` + evergreen `upgrading`; admin DB parts -> `admin/updates`.
- [x] A4 CLI: admin CLI page in `admin/cli`; `sdk/api/cli-reference` sole flag table; drop duplicate platform section.
- [x] A5 Single home per duplicated topic (plugin types, runtimes, migrations, component tables, proxy/first-run).
- [x] A6 "since X" notes + release tables -> `changelog.md` "Notable changes".
- [x] A7 Delete `sdk/frontend/components.md`, `playground.md`; FitPanel category; tutorial order roles=4, workflow=5.
- [ ] A8 Update README layout + CLAUDE.md architecture section.
- [ ] Build passes; commit.

## Phase B: facts to 1.2.9

- [ ] Bump versions.ts + SDK dep to 1.2.9; regenerate component props.
- [ ] Apply audit findings per section; new tutorial, 12 component pages, deprecation banners.
- [ ] Build + check-doc-versions + stale grep; commit.
