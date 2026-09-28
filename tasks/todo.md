# MINT Docs: prepare for 1.3

Branch `docs/1.3` from `origin/main` (796bbf2, the 1.2.9 docs).
Source snapshot: MINT `origin/1.3-dev` @ `ec60dd49` (untagged). Verify with
`git show origin/1.3-dev:<path>`, not the local `MINT/` checkout. At release,
sync only `ec60dd49..v1.3.0`.

## Decisions (grilling 2026-09-28)
- Hold `docs/1.3` unmerged until v1.3.0; then sync `ec60dd49..v1.3.0` and merge with the release commit.
- Draft all non-blocked content now, one commit per section.
- PAT + MCP connection page: `guide/ai-and-api`; `admin/authentication` links to it.
- Plugin MCP: `sdk/recipes/mcp-tools`; signatures in `sdk/api/python`, CLI in `cli-reference`.
- Removed components: delete pages (no stubs); 1.2.9 archive keeps them.
- `guide/instruments`: short page.
- `plate-editor`: prose now; props table from the release-commit regeneration.
- `AGENTS.md`: leave untouched.

## Blocked on `@morscherlab/mint-sdk` 1.3.0 on npm (one release commit)

`build-docs.ts` and `update-component-props.ts` assert installed SDK == docs version.

- [ ] `versions.ts`: `currentDocsVersion = '1.3.0'`; add `{ version: '1.2.9', ref: '796bbf2…' }` to `archivedDocs`.
- [ ] `package.json` + `bun.lock`: `@morscherlab/mint-sdk ^1.3.0`.
- [ ] `check-doc-versions.ts`: add a 1.2.9-archive baseline assert (e.g. a 1.3-only CLI command absent).
- [ ] Regenerate component props: `bun scripts/update-component-props.ts ../MINT/packages/sdk-frontend` at `v1.3.0`.
- [ ] `bun run build` (current + both archives) passes.

## Content (draft against 1.3-dev now)

### Administer
- [x] `admin/updates.md`: upgrade path 1.1 → 1.2.x (≥ 1.2.2) → 1.3; startup refusal message; no downgrade to ≤ 1.2.1 after Alembic; scheduled updates (`updates.autoApply*`); restart supervisor (`mint platform daemon` / `MINT_RESTART_SUPERVISED=1`); `prepare-docker-upgrade.sh` removed (run from 1.2.x).
- [x] `admin/plugins.md`: plugin lock (`data/plugins/locks/`, history, rollback), source policy, disabled-plugin reasons (`dependency_lock`), mint-sdk range rejection, one-at-a-time operations, editable Update settings.
- [x] `admin/configuration.md`: `audit.retentionDays`, `auth.patMaxLifetimeDays`, `auth.allowRegistration`, `server.trustedProxyCidrs` for `platformOrigin`, env var now overrides nested `config.json` key, `MLD_*` alias warning.
- [x] `admin/authentication.md`: personal access tokens (admin Access Tokens section), password change revokes sessions, admin terminal re-check.
- [x] `admin/users-roles.md` + `reference/permissions.md`: `instruments.view` / `instruments.edit`; deprecated `PUT /api/users/{id}/role|activate|deactivate`.
- [x] `admin/install-docker.md`: `UV_CACHE_DIR` on data volume, `uv run --no-sync`, compose sets `MINT_RESTART_SUPERVISED`, `RFA_SERVER__RAW_FILES_PATH` removed.

### Use
- [x] New `guide/instruments.md` (`/instruments`; reservations stay in MS Planner).
- [x] New page: access tokens + MCP connection (account modal "AI & API", `claude mcp add …`, read-only tokens, tool list). → `guide/ai-and-api`.

### Build (SDK)
- [x] New `sdk/operations/migrate-1.2-to-1.3` with the plugin-author migration table; update evergreen `upgrading`.
- [x] MCP for plugins: `@mcp_tool` / `@mcp_prompt` / `@mcp_resource`, `mint mcp call`, naming `<plugin>_<name>`, permissions. → `sdk/recipes/mcp-tools`.
- [x] `sdk/api/cli-reference.md`: `mint auth token create|list|revoke`, `mint mcp call`, `mint sdk update --version`, `mint add migration` → `MigrationSpec`, `mint doctor` 1.3 checks.
- [x] `sdk/api/python.md`: 29 root exports and `PluginDataRepository` removed; `get_instrument_repository()`; `LegacyBaseline.from_plugin_history`; settings `access` schema.
- [x] `sdk/api/migrations.md`: legacy protocol deprecated (removal 1.4); failed legacy migration disables the plugin; `schema_version` → `schema_revision`.
- [x] `sdk/frontend/composables`: removed composables; `useRackEditor` undo/redo, `moveWell`/`assignWells`.
- [x] `sdk/components/`: delete `app-plugin-switcher`, `plate-map-editor`, `rack-editor`, `file-browser-modal`, `color-slider` (+ sidebar entries + inbound links); add `plate-editor`; deprecation banners on `instrument-state-badge`, `sequence-progress-bar`, `well-plate` (`showSampleTypeIndicator`); `progress-bar` drops `variant`/`steps`; update prose for changed components (FilePicker, PlotlyChart, ChartContainer, FitPanel, BaseModal, …).

### Changelog
- [x] `changelog.md`: "Notable changes in 1.3".

## Release sync notes
- Component pages left for regeneration: stale generated rows (`pluginSwitcher`, ProgressBar `variant`/`steps`/`currentStep`, WellPlate `showSampleTypeIndicator`), BaseSlider new props, empty `plate-editor` props block and its `blob/main` Source link; add `<ComponentPlayground name="PlateEditor" />` once the SDK is installed.
- `admin/updates` links `/v1.2.9/admin/updates#upgrading-from-mint-1-1`: resolves only after 1.2.9 joins `archivedDocs`.
- Also removed in 1.3 (pages deleted): DropdownButton, InstrumentAlertLog, InstrumentStatusCard, LcmsSequenceTable.

## Follow-ups (out of scope)
- `reference/troubleshooting.md` uses `docker compose logs mint`; the Compose service is `app`.
- `reference/faq.md` "How do I update MINT?" shows `pip install --upgrade mint`, matching neither install page.
- Untracked `AGENTS.md` is stale (`MorscherLab/mld`, `/cli/`); regenerate from CLAUDE.md or delete.
