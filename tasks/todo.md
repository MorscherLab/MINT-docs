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

# Sync to v1.3.0 (plan 2026-10-02)

Branch `docs/1.3-beta10-sync` off `docs/1.3` (2be7118). New source snapshot:
MINT tag `v1.3.0` @ `552241f4` (5 commits after beta.10 `977ec0a9`). PRs #5 and #6 already
cover device-code `mint auth login`, the forced second factor, the removal of
`useAuth` / `usePasskey` / `useWellPlateEditor`, and `file_browser_router`.
Verify every fact with `git show v1.3.0:<path>`. The changelog is a pointer,
not a source: it contradicts itself (packages "Added" says `mint auth login`
asks for a password; "Upgrading" says password sign-in is gone).

## Wrong today (fix first)
- [x] `sdk/operations/migrate-1.2-to-1.3.md:183-187`: peers now require vue ^3.5.43, pinia ^4.0.3, vue-router ^5.3.1, tailwindcss ^4.3.3; pinia 2/3 and vue-router 4 are refused.
- [x] `sdk/components/sequence-progress-bar.md`, `instrument-state-badge.md`: drop Deprecated banners; badge adds `never` / `inactive`.

## Administer
- [x] Install pages + `admin/updates`: Python 3.14, `python:3.14-slim`, cp314 wheels for plugin dependencies.
- [x] `admin/updates` + `admin/plugins`: Bearer-only plugin requests (401 `auth.required`, 503 `auth.unavailable`, no public paths); plugins with own ingest keys break. Scheduled batch pairs plugin releases for the new version; fails instead of disabling.
- [x] `admin/authentication`: Service Tokens section (Admin → Service Tokens, one plugin + instrument subset, 90/365/never, audit events); admin passkey reset (`DELETE /api/admin/users/{id}/passkeys`).
- [x] `admin/users-roles`: 72-byte password limit.
- [x] `admin/plugins`: `.mint` without `manifest.json` rejected; `/api/updates/sdk` removed (platform update carries the SDK); `psycopg2-binary` gone (asyncpg only); offline `find-links` bundles need `uvicorn[standard]` wheels.
- [x] `reference/troubleshooting`: startup phase log lines; plugin 401 after upgrade.

## Use
- [x] `guide/instruments`: pill nav, live-status list (chips, search, Show inactive, List/Board), `/instruments/:id` detail (run, ETA, alerts + Acknowledge, Archive/Restore), Home card. Labels from `frontend/src/views/`.
- [x] Plugin display names in Home, plugin page, settings (`guide/ui-tour` or `guide/marketplace`).

## Build (SDK, Python)
- [x] `sdk/api/python`: `@mint_plugin(display_name=)`; `PluginCapabilities.instrument_status_write`, `serves_instrument_alerts`; `InstrumentRepository.report_status`, `InstrumentLiveStatus`; `mint_sdk.instrument_alerts`; `current_service_caller` / `resolve_service_caller`; `analysis_result_writers`; removed `mint_sdk.logging`, `register_plugin_exception_handlers`, LC-MS helpers; `mint_sdk.lcms` / `mint_sdk.templates` deprecation warnings.
- [x] New recipe `sdk/recipes/instrument-status` (daemon → service token → `report_status`, alerts router). One home; python.md links to it.
- [x] `sdk/recipes/route-permissions` or `platform-context`: every plugin route needs a Bearer; `auth=False` only for service-token routes.
- [x] Generated UI: artifact `Path` inputs (`kind: 'artifact-path'`, `jobs/artifacts`).
- [x] `sdk/api/cli-reference`: `mint instruments`; `mint doctor` warning vs error + `--strict`; `mint sdk update` raises `requires-python`, leaves AI instruction files unchanged; `mint init` floors; `MINT_PLATFORM_STARTUP_WAIT`.

## Build (SDK, frontend)
- [x] Plotly 4: `PlotlyChart` `showSendToCloud: false`, types from `plotly.js-dist-min`, drop `@types/plotly.js` and module shims; removed mapbox traces.
- [x] `plate-editor` prose: `importMode` / `import-text`, Shift-range selection (also `well-plate`).
- [x] Deprecated banners (removal 1.4, no SDK replacement): SmartGroupModal/FieldRecipe/Manual, GroupAssigner, AutoGroupModal, BioTemplate* views/renderer, ReagentList/Editor, ExperimentTimeline, SampleLegend, FitPanel, DoseDesignWorkspaceView (→ ControlWorkspaceView); composables page likewise.
- [x] `PillNavItem.dot`, instrument types (`InstrumentLiveStatus`, …; `InstrumentAlertBody` removed).

## Migration + changelog
- [x] `migrate-1.2-to-1.3`: Python 3.14 + Starlette 1.0 removals + sqlmodel aware datetimes + httpx2; Bearer-only plugin routes; service tokens replace ingest keys; Plotly 4; new removals/deprecations above; the 5 new table rows.
- [x] `changelog.md` Notable changes: Python 3.14, Bearer-only plugin auth, service tokens, Plotly 4, new deprecations.

## Release sync notes (add)
- Generated props still stale for PlateEditor `importMode`, InstrumentStateBadge states, PlotlyChart types. Regenerate at v1.3.0.

## Execution
Workflow, one agent per section (admin, guide, sdk-python, sdk-frontend), `model: "sonnet"` / effort medium, each writes its files and reports facts with source paths; then one `opus` adversarial verify agent per section against `977ec0a9`; then migration + changelog inline (depends on the rest). One commit per section; `bun run build` after each. PR into `docs/1.3`.

## Decisions (grilling 2026-10-02)
- 1.2.10 items: `docs/1.3` only; no patch on `main`.
- Instrument status for plugin authors: new `sdk/recipes/instrument-status`.
- Snapshot: tag `v1.3.0` (552241f4).
- Content only. The release commit (versions.ts, archive, SDK pin, props) is a separate PR after npm `@morscherlab/mint-sdk` 1.3.0 (npm `latest` is 1.2.10 on 2026-10-02).
- PR into `docs/1.3`. Workflow as planned. `tasks/todo.md` in its own final commit.

## Result (2026-10-02)
- Workflow `wf_829b54be-482`: 4 writers (sonnet) + 4 verifiers (opus); verifiers fixed 45 errors/gaps. Migration guide and changelog written inline. `bun run build` passes; every `#anchor` in changed files resolves in `.vitepress/dist`.

## Follow-ups (not done)
- `admin/users-roles` / `reference/troubleshooting`: self-registered accounts stay inactive until **Activate user**; add a "Waiting for approval" entry.
- `admin/authentication` PAT table: "the proxy does not forward the token" is true for the proxy only; in-process plugins still receive a PAT (`api/dependencies/plugin_visibility.py` drops `Authorization` only for service tokens).
- `sdk/frontend/platform-integration.md:15`, `composables.md` still point at the deprecated `useExperimentSave` (no SDK replacement exists).
- Release commit: component action-bar Source links (`blob/v1.2.9`, `plate-editor` `blob/main`) and `plotly-chart` "Release source" line; generated InstrumentStateBadge props lack `never` / `inactive`.
- `reference/glossary`: define "service token".
