# MINT-docs fact-check fixes — design

**Date:** 2026-05-01
**Status:** Approved (brainstorming complete)
**Author:** Claude Code (Opus 4.7) with the user

## Context

The MINT-docs site at `mint-docs.morscherlab.org` was deepened to 67 pages on 2026-05-01 (per `2026-05-01-mint-docs-sdk-deepening-design.md`). A subsequent audit against the live MINT-platform source revealed substantial inaccuracies, especially in the SDK section (heavy reliance on extrapolated symbol names and CLI flags that don't exist) and a major issue in the User Manual (every install page references a fictional `mint serve` command).

The user picked direction **A: truth-first slim-down** — cut speculative content, keep only what's verifiable against source. API Reference becomes the canonical surface; recipes and tutorials shrink to verified material.

## Audit findings (concise)

### Critical inaccuracies

| # | Issue | Pages affected |
|---|-------|----------------|
| 1 | `mint serve` doesn't exist; platform starts via `uvicorn api.main:app` | get-started/install-direct, install-docker, install-hosted; cli/serve, cli/overview |
| 2 | `mint_sdk.testing` invented exports (`InMemoryExperimentRepository`, `make_experiment`, `in_memory_runner`) — real exports: `make_test_plugin`, `build_test_app`, `RecordingContext`, `write_standalone_plugin_module` | recipes/testing-plugins; tutorials 1, 2, 4 |
| 3 | `MINTClient.from_env()` doesn't exist — constructor reads `MINT_URL`/`MINT_TOKEN` directly | api/client; recipes |
| 4 | `client.users` and `client.artifacts` don't exist — real: `client.auth`, `client.experiments`, `client.projects`, `client.plugins` | api/client; recipes/managing-artifacts |
| 5 | `mint init` flags `--routes-prefix`, `--with-migrations`, `--add-frontend` (later) don't exist | every tutorial; api/cli-reference |
| 6 | `MigrationRunner` methods (`upgrade_to_latest`, `upgrade_to`, `current_revision`, `pending_revisions`) don't exist — only `run()` and `discover()` | api/migrations; recipes/testing-plugins; concepts/migrations |
| 7 | CSS variables: only `@morscherlab/mint-sdk/styles` is exported; `/styles/variables.css` sub-path is invented | tutorials/adding-a-frontend; frontend/design-tokens |

### Important inaccuracies

- `mint build` real flags: `--output-dir` (not `--output`), `--vendor-deps` (not `--no-deps`); `--check` doesn't exist
- `mint dev` undocumented: `--host`, `--platform-dir`, `--prefix`
- `useApi` real shape: `{client, get, post, put, patch, delete, upload, download, buildUrl, buildWsUrl}` (docs claimed only `{get, post, delete}`)
- `useExperimentSelector` real shape: `{experiments, total, selectedExperiment, filters, isLoading, error, page, hasMore, sortKey, experimentTypes, projects, groupedByProject, fetch, loadMore, reset, select, clear, fetchFilterOptions}` (docs claimed `{experiments, selected, search, isLoading, refresh}`)
- **RBAC group names invented**: docs documented `marketplace.*` group; real fifth group is `users.*`. Real permission set:
  - `projects.*` (5): `view`, `create`, `edit`, `delete`, `manage_members`
  - `experiments.*` (4): `view`, `create`, `edit`, `delete`
  - `plugins.*` (4): `view`, `use`, `configure`, `install`
  - `users.*` (3): `view`, `invite`, `manage`
  - `platform.*` (2): `configure`, `view_logs`
- `MigrationOps.column` factory doesn't exist; real methods include undocumented `backfill` and `alter_column`
- Component count: real 87, docs claimed ~88
- Composable count: real 27 functions (28 export blocks), docs claimed 29
- `api.dependencies.permissions.require_permission` cannot be imported by plugin code (platform-internal)

### Real surface I haven't documented

- `mint dev logs --follow/--lines/--list/--clear`
- `mint doctor --deps --fix`
- `AnalysisPlugin.export_tree() / export_summary() / export_csv()`
- `RecordingContext.set_current_user()`
- `MINTClient.auth` resource client
- `MigrationOps.backfill()` and `alter_column()`

## Strategy

**Truth-first slim-down.** No speculative content survives:

- Every code import is `grep`-checked against `mint_sdk/__init__.py`
- Every CLI flag is checked against `cli.py` and the relevant `*_command.py`
- Every Vue composable / component is `grep`-checked against the frontend SDK's `index.ts`
- Where a symbol exists in source but is internal/unstable, the page says "see source" with a GitHub link rather than enumerating internals

## Page deltas

| Section | Before | After | Change |
|---------|--------|-------|--------|
| `/sdk/concepts/` | 7 | 7 | Light fixes (RBAC names; `MigrationRunner.run()`/`discover()` only; symbol verification) |
| `/sdk/tutorials/` | 5 | 5 | Fix `mint init` flag list (real: `--type`, `--name`, `--description`, `--no-frontend`, `--ai-assistant`, `--yes`, `--force`, `--no-install`, `--no-git`, `--author`, `--email`); rewrite testing-harness sections using real `make_test_plugin` / `build_test_app` / `RecordingContext`; remove `mint init . --add-frontend` claim — explain frontend must be opt-out at creation, not opt-in later |
| `/sdk/recipes/` | 11 | **10** | DELETE `managing-artifacts.md`. Fold verified "artifact-ID-in-result" pattern into `writing-results.md` as one short section. Rewrite `testing-plugins.md` against the real testing harness. Verify every other recipe's symbols. |
| `/sdk/frontend/` | 6 | 6 | Fix counts (87 components, 27 composables); fix `useApi` shape (10 methods); fix `useExperimentSelector` shape; fix CSS variables import path to `@morscherlab/mint-sdk/styles` |
| `/sdk/operations/` | 7 | 7 | Fix `mint build` flags; add `mint dev logs`; verify CI templates against real flag set |
| `/sdk/api/` | 7 | 7 | **Heavy** rewrite of `client.md` (auth/experiments/projects/plugins; drop users/artifacts/from_env), `migrations.md` (run+discover; remove invented methods), `cli-reference.md` (every real flag). Add the undocumented surface to `python.md`. Fix `frontend.md` shapes. |
| `/cli/` (User Manual) | 5 | **3** | DELETE `serve.md` (fictional command) and `plugin-dev.md` (redundant redirect). Rewrite `overview.md` as platform-data CLI orientation (`mint auth/experiment/project/status`); keep `platform.md` and `configuration.md` (verified). |
| `/get-started/` | 4 | 4 | Replace every `mint serve …` with `uvicorn api.main:app …`. Update systemd unit. Update docker-compose entrypoint. Verify the rest of each install page against actual platform behavior. |
| `/reference/permissions.md` | 1 | 1 | Real 18 permissions across 5 groups (`projects.*`, `experiments.*`, `plugins.*`, `users.*`, `platform.*`). Drop invented `marketplace.*` group. Update role-permission matrix. |
| `/workflow/members-roles.md` | 1 | 1 | Match `permissions.md` and the real RBAC model |

**Net page change**: 67 → 64 site pages (−3, all User Manual side; SDK section drops 1 recipe).

## Out of scope

- Redesigning the two-track structure (the user confirmed A, not C)
- Adding new tutorials or recipes beyond verification fixes
- Screenshot population
- Home page changes beyond the dedupe already shipped
- Brand / theme changes
- Auto-generated API docs from code (Sphinx, TypeDoc) — manual reference only

## Implementation approach

Single execution session, ordered to keep the build green at every commit:

1. **User Manual fixes (highest user-facing blast radius)**: `mint serve` purge across install pages; `cli/serve.md` and `cli/plugin-dev.md` deletion; `cli/overview.md` rewrite; `reference/permissions.md` real RBAC; `workflow/members-roles.md` updated matrix
2. **`/sdk/api/` (canonical reference)**: heavy rewrite of `client.md`, `migrations.md`, `cli-reference.md`; updates to `python.md` and `frontend.md`
3. **`/sdk/concepts/` (semantic anchor)**: light fixes to `migrations.md`, `data-model.md`, `platform-context.md`
4. **`/sdk/tutorials/`**: rewrite testing-harness sections; correct `mint init` flag enumeration; fix `adding-a-frontend.md`
5. **`/sdk/recipes/`**: delete managing-artifacts; fold the workaround into writing-results; rewrite testing-plugins; verify others
6. **`/sdk/frontend/` and `/sdk/operations/`**: counts, shapes, flags
7. Build → push → verify deployed site

Six section-scoped commits + one final verification commit.

## Verification on completion

- `bun run build` passes with `ignoreDeadLinks: false` strict mode
- 64 HTML pages emitted (67 today − 3 deletes)
- Every code block referencing `mint_sdk` symbols cross-checked against the package's `__init__.py`
- Every CLI flag enumeration cross-checked against `cli.py`
- Visual spot-check via agent-browser of `/sdk/api/cli-reference`, `/reference/permissions`, `/get-started/install-direct`

## Risk and mitigation

| Risk | Mitigation |
|------|------------|
| Source symbol surface drifts during the rewrite | Read source freshly when touching each page; cite source path in HTML comments at the head of changed sections |
| Truth-cut goes too far (deletes useful illustrative content) | Distinguish "invented surface" (cut) from "illustrative pattern with no fake imports" (keep) — `r-integration` recipe is the canonical example of the latter |
| Sidebar / nav drift after deletes | Update `.vitepress/config.ts` in the same commit as the page delete |
| User Manual / SDK section cross-link breakage after `cli/*` slim-down | Run grep for every deleted page's URL across all markdown; update or remove broken links before the commit |

## Spec self-review

- ✅ No "TBD" / "TODO" / vague requirements
- ✅ Internal consistency: page deltas (67 − 3 = 64) match the section-by-section breakdown; deletions enumerated; rewrite scope per page is concrete
- ✅ Scope: single implementation pass; six commit-sized sections plus final verification
- ✅ Ambiguity: explicit on what "verify" means (grep against source); explicit on which pages stay vs. shrink vs. delete; explicit on real RBAC permission names

## Next

Invoke `superpowers:writing-plans` to draft the implementation plan, then `superpowers:executing-plans` to execute.
