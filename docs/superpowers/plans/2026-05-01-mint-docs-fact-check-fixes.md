# MINT-docs fact-check fixes — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every documented symbol, CLI flag, RBAC name, and behavioral claim in MINT-docs that doesn't match `MINT-platform/MINT/` source. Net pages 67 → 64 (delete 3 fictional pages); strict-mode build green at each commit.

**Architecture:** Six section-scoped commits ordered by user-facing blast radius. Per the spec at `docs/superpowers/specs/2026-05-01-mint-docs-fact-check-fixes-design.md`. Source-of-truth paths used throughout:
- `MINT-platform/MINT/packages/sdk-python/src/mint_sdk/` for Python SDK
- `MINT-platform/MINT/packages/sdk-frontend/src/` for frontend SDK
- `MINT-platform/MINT/api/` for platform-side details (RBAC, auth)

**Tech Stack:** VitePress 1.6 + Bun. Verification command: `bun run build` (must complete with no dead links and no Vue render errors).

---

## Pre-flight

### Task 0: Confirm clean baseline

- [ ] **Step 0.1: Confirm tree is clean and on `main` at the latest commit**

```bash
git status --short    # expect empty
git log -1 --oneline  # expect: c017f51 docs(spec): add fact-check fixes design spec
```

- [ ] **Step 0.2: Verify build is green before any further changes**

```bash
bun run build
# expect: build complete in <Ns>; no errors
```

If either check fails, stop and reconcile before proceeding.

---

## Task 1: User Manual purge — `mint serve` and RBAC

**Highest user-facing blast radius. Three sub-changes, one commit.**

**Files:**
- Modify: `get-started/install-direct.md`
- Modify: `get-started/install-docker.md`
- Modify: `get-started/install-hosted.md`
- Modify: `get-started/quickstart.md`
- Modify: `cli/overview.md`
- Modify: `cli/platform.md`
- Modify: `cli/configuration.md`
- Modify: `reference/permissions.md`
- Modify: `reference/troubleshooting.md`
- Modify: `workflow/members-roles.md`
- Modify: `workflow/marketplace.md` (drop the `marketplace.*` permission group reference)
- Modify: `.vitepress/config.ts` (sidebar)
- Delete: `cli/serve.md`
- Delete: `cli/plugin-dev.md`

### Step 1.1: Replace every `mint serve` reference with the real platform launcher

The platform is started via `uvicorn`, not `mint serve`. Across all install pages, replace:

```bash
# OLD (fictional)
mint serve --host 0.0.0.0 --port 8001
mint serve --port 8002
mint serve --migrate-only --config /etc/mint/config.json
```

with:

```bash
# NEW (real)
uvicorn api.main:app --host 127.0.0.1 --port 8001
uvicorn api.main:app --host 127.0.0.1 --port 8002
# Migrations run automatically on platform startup; there's no --migrate-only flag.
# To validate ahead of time, start the platform briefly and watch for migration logs.
```

For systemd units, replace the `ExecStart=/usr/local/bin/mint serve --host 0.0.0.0 --port 8001` line with:

```ini
ExecStart=/path/to/venv/bin/uvicorn api.main:app --host 127.0.0.1 --port 8001
```

For docker-compose, the container's CMD should be `uvicorn api.main:app --host 0.0.0.0 --port 8001` (the container is the boundary, not the host process).

- [ ] **Step 1.1.a:** Run grep to find every `mint serve` mention in markdown:

```bash
grep -rn "mint serve" --include="*.md" .
```

For each hit in `get-started/`, `cli/`, `reference/`, `workflow/`: rewrite per the table above. Note that the **CLI documentation** for the now-deleted `cli/serve.md` should not survive — its content is fictional.

- [ ] **Step 1.1.b:** Update install-direct's "Initialize the database" section. Replace the `mint serve --migrate-only` instruction with a paragraph explaining that platform migrations run automatically on first startup; admins can validate by starting the platform briefly and confirming no migration errors appear in logs.

### Step 1.2: Delete the two fictional / redundant CLI pages

```bash
rm cli/serve.md cli/plugin-dev.md
```

### Step 1.3: Rewrite `cli/overview.md`

Replace the existing content with a tighter orientation page. The `mint` CLI binary is delivered by the **`mint-sdk` package**, not the platform package. It serves two roles:

1. **Plugin development** (`mint init`, `mint dev`, `mint build`, `mint doctor`, `mint info`, `mint docs`, `mint sdk link/unlink/update`, `mint dev logs`) — covered in [Plugin Development → CLI reference](/sdk/api/cli-reference)
2. **Platform-data CLI** (`mint auth`, `mint experiment`, `mint project`, `mint status`) — covered on [Platform commands](/cli/platform) and [Configuration](/cli/configuration)

The page must:
- Drop every `mint serve` reference
- Drop the table entry "Start the local web application" — `mint` does not start the platform
- Verify that `mint --version` and `mint --help` are real (they are; the Typer app prints the SDK version)
- Cross-link to `/sdk/api/cli-reference` for the full plugin-dev surface

Keep it short — 80-120 lines max. Use the audit's verified subcommand inventory.

### Step 1.4: Rewrite `cli/platform.md`

Cross-check every flag and subcommand against `mint_sdk/cli_commands/auth_cmd.py`, `experiment_cmd.py`, `project_cmd.py`, `status_cmd.py`. Read each file before editing.

For now, fix the most likely inaccuracies based on the audit:
- The page already enumerates `mint auth login/logout/status/refresh`, `mint experiment list/get/create/update`, `mint project list/get/create/archive`, `mint status` — re-read source to confirm exact flag names and any missing subcommands
- Drop any reference to `mint experiment delete <id>` if it doesn't exist in source — do not assume

Add a one-line note at the top: "These commands ship with the `mint-sdk` package; install via `uv tool install mint-sdk` per [Get Started](/get-started/install-direct)."

### Step 1.5: Verify `cli/configuration.md`

Re-read against `MINT-platform/MINT/api/config/models.py` (Pydantic config schema). Cross-check:
- `database.mode`, `database.url`, pool sizing
- `auth.jwtSecret`, `jwtTtlHours`, `passkeysEnabled`, `localLoginEnabled`, `sso`
- `plugins.loadFromEntryPoints`, `plugins.dataDir`, `plugins.pin`
- `marketplace.registryUrl`, `marketplace.requireApproval`
- `updates.enabled`, `updates.channel`, `updates.checkIntervalHours`, `updates.githubRepo`, `updates.autoInstall`
- `observability.tracing.enabled`, `tracing.exporter`, `tracing.endpoint`, `autoIssue`

Drop any field that doesn't exist in `models.py`. Add any field that exists in `models.py` but isn't documented (one-line summary each, no deep dive).

### Step 1.6: Rewrite `reference/permissions.md`

The 18 real permissions:

```
projects.view
projects.create
projects.edit
projects.delete
projects.manage_members

experiments.view
experiments.create
experiments.edit
experiments.delete

plugins.view
plugins.use
plugins.configure
plugins.install

users.view
users.invite
users.manage

platform.configure
platform.view_logs
```

Replace the page's existing tables (which used `project.*`/`experiment.*`/`plugin.*` singular and an invented `marketplace.*` group) with these. The five groups are now: `projects.*`, `experiments.*`, `plugins.*`, `users.*`, `platform.*`.

The system role mapping table needs updating:

| | Admin | Member | Viewer |
|---|---|---|---|
| `projects.view` | ✓ | ✓ | ✓ |
| `projects.create` | ✓ | ✓ | |
| `projects.edit` | ✓ | ✓ ¹ | |
| `projects.delete` | ✓ | | |
| `projects.manage_members` | ✓ | ✓ ¹ | |
| `experiments.view` | ✓ | ✓ | ✓ |
| `experiments.create` | ✓ | ✓ | |
| `experiments.edit` | ✓ | ✓ ² | |
| `experiments.delete` | ✓ | ✓ ² | |
| `plugins.view` | ✓ | ✓ | ✓ |
| `plugins.use` | ✓ | ✓ | |
| `plugins.configure` | ✓ | | |
| `plugins.install` | ✓ | | |
| `users.view` | ✓ | ✓ | ✓ |
| `users.invite` | ✓ | | |
| `users.manage` | ✓ | | |
| `platform.configure` | ✓ | | |
| `platform.view_logs` | ✓ | | |

¹ Within projects they own.
² Experiments they own or collaborate on.

(Re-read `api/permissions.py` to verify the exact role-permission map. The above is a reasonable starting point but may need adjustment.)

Drop the `marketplace.read / request_install / approve_install` rows entirely — they don't exist as platform RBAC permissions. Marketplace approval flow uses `plugins.install`. Update prose to match.

Drop the `experiment.manage_collaborators` row — doesn't exist (collaborators may be governed by `experiments.edit` or a per-experiment field).

Replace any reference to `plugin.read/install/uninstall/upgrade` with `plugins.view/install/use/configure` per the real names.

### Step 1.7: Update `workflow/members-roles.md`

Match the corrected permissions list. Specifically:

- The "18 permissions in 5 groups" sentence stays correct
- The table at "The 18 permissions" must be rewritten to use the real groups (`projects/experiments/plugins/users/platform`) and real action names
- Drop any mention of the `marketplace` permission group
- Update cross-links if the section anchors changed

### Step 1.8: Update `workflow/marketplace.md`

If it references `marketplace.read/request_install/approve_install` permissions: replace with `plugins.install` (which is what actually gates marketplace approval) and drop the rest.

### Step 1.9: Update sidebar in `.vitepress/config.ts`

Remove the deleted pages from the `/cli/` sidebar group:

```typescript
'/cli/': [
  {
    text: 'mint CLI',
    items: [
      { text: 'Overview', link: '/cli/overview' },
      { text: 'Platform commands', link: '/cli/platform' },
      { text: 'Configuration', link: '/cli/configuration' },
    ],
  },
],
```

(Remove the `mint serve` and `Plugin development` entries.)

### Step 1.10: Update `reference/troubleshooting.md` and any other cross-links

```bash
grep -rn "/cli/serve\|/cli/plugin-dev" --include="*.md" --include="*.ts" .
```

For any hit in markdown content: rewrite or remove.

### Step 1.11: Build

```bash
bun run build
```

Expected: build passes; 65 HTML pages emitted (67 today − 2 deletes; the 1 recipe delete comes in Task 5). All internal links resolve.

### Step 1.12: Commit

```bash
git add -A
git commit -m "$(cat <<'COMMIT'
docs(user-manual): purge mint serve, fix RBAC, slim cli/ track

mint serve doesn't exist — the platform starts via
'uvicorn api.main:app'. Replace every reference across get-started/
install pages, cli/overview, and reference/troubleshooting.

cli/serve.md (entirely fictional) and cli/plugin-dev.md (redundant
redirect) deleted. cli/overview.md rewritten as a thin orientation
page; cli/platform and cli/configuration kept and verified against
mint_sdk/cli_commands/ and api/config/models.py.

reference/permissions.md and workflow/members-roles.md rewritten
against api/permissions.py: real groups are projects/experiments/
plugins/users/platform (no marketplace.* group). 18 permissions
total; matrix updated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 2: `/sdk/api/` heavy rewrites

**Files:**
- Modify: `sdk/api/python.md`
- Modify: `sdk/api/frontend.md`
- Modify: `sdk/api/migrations.md`
- Modify: `sdk/api/client.md`
- Modify: `sdk/api/exceptions.md`
- Modify: `sdk/api/cli-reference.md`
- (Read-only) `sdk/api/index.md` — only update if a deleted symbol is referenced

### Step 2.1: Verify Python SDK exports against source

```bash
grep -E '^from|^import' \
  /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/__init__.py
```

The current `python.md` is mostly accurate but should add:

- `MINTClient` (already there) but note that the constructor reads `MINT_URL` / `MINT_TOKEN` from env — there is no `from_env()` method
- `AnalysisPlugin.export_tree()`, `export_summary()`, `export_csv()` (all real, in the convenience-methods table — confirm)
- `AnalysisPlugin.delete_design()`, `delete_analysis()` (already there — confirm)

### Step 2.2: Rewrite `sdk/api/client.md`

Read source first:

```bash
ls /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/client/resources/
cat /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/client/client.py
```

Real resource clients (per the audit): `auth`, `experiments`, `projects`, `plugins`. **Not real:** `users`, `artifacts`, `health` as a method, `from_env()`.

Rewrite the page to:

1. Drop the "Three ways to construct" section. Replace with a single section showing the env-aware constructor:

```python
from mint_sdk import MINTClient

# Reads MINT_URL and MINT_TOKEN from env
async with MINTClient() as client:
    ...

# Or pass them explicitly:
async with MINTClient(url="https://mint.example.org", token="...") as client:
    ...
```

2. Drop the `client.users` and `client.artifacts` sections entirely.

3. Add a `client.auth` section briefly describing what it exposes (read source for methods).

4. For `client.experiments`, `client.projects`, `client.plugins`: re-read source to confirm exact method names. Drop any method that doesn't exist; add any missing one.

5. Update the "Pagination" example to use the real method shape.

6. Drop the "Authentication and tokens" subsection's claim about a `~/.config/mint/cli.json` file format. Replace with: "Tokens come from `mint auth login` (which stores them) — the env vars `MINT_URL` and `MINT_TOKEN` are picked up automatically when the client is constructed without arguments."

### Step 2.3: Rewrite `sdk/api/migrations.md`

Read source:

```bash
cat /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/migrations/runner.py
cat /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/migrations/ops.py
```

Replace the `MigrationRunner` section. Real public surface: `run(migrations, *, tables_already_exist=False)` and `discover(package_path)` (static). Drop `upgrade_to_latest`, `upgrade_to`, `current_revision`, `pending_revisions`.

Replace the `MigrationOps` methods table with the real list:

| Method | Signature |
|--------|-----------|
| `add_column(table, column)` | Add a column to an existing table |
| `drop_column(table, column_name)` | Drop a column |
| `rename_column(table, old, new)` | Rename a column |
| `alter_column(table, column_name, ...)` | Alter column type/constraints (read signature from source) |
| `create_table(name, columns)` | Create a new table |
| `drop_table(name)` | Drop a table |
| `create_index(name, table, columns, *, unique=False)` | Create an index |
| `drop_index(name)` | Drop an index |
| `backfill(...)` | Chunked data backfill helper (read signature from source) |
| `execute(sql, params=None)` | Run raw SQL |

Drop the `column(name, type, ...)` factory method — it doesn't exist; columns are constructed as raw SQLAlchemy `sa.Column`. Update the "Portable types" section to clarify that the type-string convention (e.g., `"jsonb"`) is a documentation convenience reflecting SQLAlchemy types passed by callers, not an SDK-defined enum.

### Step 2.4: Rewrite `sdk/api/cli-reference.md`

Read source:

```bash
cat /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/cli.py
```

For each top-level command (`init`, `build`, `doctor`, `info`, `docs`, `dev`, `sdk`, `auth`, `experiment`, `project`, `status`, `logs`?): re-enumerate real flags from the Typer decorators. Specifically:

- `mint init` real flags: `--type/-t`, `--name/-n`, `--description/-d`, `--no-frontend`, `--ai-assistant`, `--yes/-y`, `--no-install`, `--no-git`, `--force`, `--author`, `--email`. **Drop:** `--routes-prefix`, `--with-migrations`, `--add-frontend`, the `--type analysis|experiment-design|tool` claim (only two values).
- `mint build` real flags: `--no-frontend`, `--output-dir`, `--vendor-deps`. **Drop:** `--output`, `--check`, `--no-deps`.
- `mint dev` real flags: `--port/-p`, `--host`, `--no-frontend`, `--platform`, `--platform-dir`, `--prefix`. Document `--platform` as a boolean switch (not `--platform <URL>`).
- `mint dev logs` is a sub-subcommand: flags `--follow`, `--lines`, `--list`, `--clear` (read from source).
- `mint doctor` — verify flags include `--deps`, `--fix` (per audit's undocumented surface).
- `mint sdk` subcommands: `link`, `unlink`, `update`. `update` has additional flags `--scope patch|minor|major`, `--dry-run`, `--no-sync` per audit.
- `mint auth/experiment/project` — verify per the corresponding `*_cmd.py` files.

Update the exit codes section only if `cli.py` actually defines them; otherwise drop the claim that codes mean specific things.

### Step 2.5: Update `sdk/api/frontend.md`

- Component count: change ~88 → 87 (real count)
- Composable count: change 29 → 27 (real count)
- Composables index: re-list every composable name from `packages/sdk-frontend/src/composables/index.ts` (already enumerated in the spec audit)

### Step 2.6: Verify `sdk/api/exceptions.md`

The exception taxonomy is verified accurate. Light pass: confirm the 8 classes match `exceptions.py` and that constructor signatures haven't drifted.

### Step 2.7: Build

```bash
bun run build
```

Expected: build passes.

### Step 2.8: Commit

```bash
git add -A
git commit -m "$(cat <<'COMMIT'
docs(sdk/api): rewrite client/migrations/cli-reference against source

- client.md: drop client.users / client.artifacts / from_env()
  (none exist). Add client.auth. Update construction pattern to
  the env-aware constructor.
- migrations.md: drop fictional upgrade_to_latest/upgrade_to/
  current_revision/pending_revisions. Document real run() and
  discover() only. Replace MigrationOps method table with real
  surface (add_column, drop_column, rename_column, alter_column,
  create_table, drop_table, create_index, drop_index, backfill,
  execute). Drop the invented column() factory.
- cli-reference.md: every flag rebuilt from cli.py. mint init no
  longer claims --routes-prefix / --with-migrations / --add-frontend.
  mint build uses --output-dir / --vendor-deps. mint dev gains
  --host / --platform-dir / --prefix. Add mint dev logs
  sub-subcommand and mint doctor --deps/--fix flags.
- frontend.md: counts updated to 87 components / 27 composables.
- python.md / exceptions.md: verified, light fixes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 3: `/sdk/concepts/` light fixes

**Files:**
- Modify: `sdk/concepts/migrations.md`
- Modify: `sdk/concepts/data-model.md`
- Modify: `sdk/concepts/platform-context.md`
- (Read-only) other concept pages — verify but don't rewrite unless drift found

### Step 3.1: Update `sdk/concepts/migrations.md`

- Replace any `MigrationRunner.upgrade_to_*` references with the real `run()` flow
- Replace the `column(name, type, ...)` snippet with raw SQLAlchemy Column usage. Example pattern:

```python
import sqlalchemy as sa
from mint_sdk.migrations import PluginMigration, MigrationOps


class Migration(PluginMigration):
    revision = "001"
    description = "create panels table"

    async def upgrade(self, ops: MigrationOps) -> None:
        await ops.create_table(
            "panels",
            [
                sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True),
                          primary_key=True),
                sa.Column("experiment_id", sa.Integer, nullable=False),
                sa.Column("name", sa.String(200), nullable=False),
            ],
        )
        await ops.create_index("idx_panels_experiment", "panels", ["experiment_id"])
```

(Read `ops.py` for the actual `create_table` signature; adapt the example to match.)

### Step 3.2: Update `sdk/concepts/data-model.md`

- Verify `Experiment` dataclass field list against `mint_sdk/repositories.py`
- Verify `DesignData`, `PluginAnalysisResult`, `User`, `UserPluginRole` dataclass fields
- Drop any field that doesn't exist; add any that's missing

### Step 3.3: Verify `sdk/concepts/platform-context.md`

- Confirm `PlatformContext` accessor list (already verified accurate per audit)
- Update the `require_plugin_role` example if needed for real signature

### Step 3.4: Spot-check other concept pages

```bash
grep -E "MINTClient|mint_sdk\.testing|mint serve|require_permission" sdk/concepts/*.md
```

Fix any hits.

### Step 3.5: Build + commit

```bash
bun run build
git add -A
git commit -m "$(cat <<'COMMIT'
docs(sdk/concepts): fix MigrationRunner API and column construction

- migrations.md: replace fictional MigrationRunner.upgrade_to_* with
  the real run()/discover() flow. Replace ops.column() factory with
  raw sa.Column usage.
- data-model.md: verify dataclass fields against repositories.py.
- platform-context.md: verified accurate; light edits.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 4: `/sdk/tutorials/` rewrites

**Files:**
- Modify: `sdk/tutorials/index.md`
- Modify: `sdk/tutorials/first-analysis-plugin.md`
- Modify: `sdk/tutorials/design-plugin-with-tables.md`
- Modify: `sdk/tutorials/adding-a-frontend.md`
- Modify: `sdk/tutorials/plugin-roles.md`

### Step 4.1: Read the real testing harness

```bash
cat /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-python/src/mint_sdk/testing/__init__.py
```

Real exports: `make_test_plugin`, `build_test_app`, `RecordingContext`, `write_standalone_plugin_module`. Read each function's signature from the source files referenced by the `__init__.py`.

### Step 4.2: Rewrite testing sections in `first-analysis-plugin.md`

Replace the existing "Add a unit test" section's code block (which referenced invented `InMemoryExperimentRepository` / `make_experiment` / `StandalonePlatformContext`) with real-harness usage:

```python
# tests/test_plugin.py
import pytest
from mint_sdk.testing import RecordingContext, make_test_plugin

from hello_mint.plugin import HelloMintPlugin


@pytest.fixture
async def plugin():
    p = HelloMintPlugin()
    ctx = RecordingContext()
    await p.initialize(ctx)
    yield p
    await p.shutdown()


@pytest.mark.asyncio
async def test_health_endpoint(plugin):
    # Use build_test_app + httpx.AsyncClient for HTTP-level tests
    ...
```

(Read the actual `RecordingContext` shape and `build_test_app` signature; adapt the example to what the real symbols expose.)

### Step 4.3: Fix `mint init` flag list in `first-analysis-plugin.md`

Replace the prompt table with the real flags. The interactive prompts are answered by reading the source. The flag list:

```bash
mint init <plugin-name> \
  --type analysis \
  --description "Hello world analysis plugin" \
  --no-frontend                  # skip frontend scaffolding
```

Drop the `--routes-prefix` and `--with-migrations` claims from prompts and flags. The `routes_prefix` is derived from the plugin name; migrations are scaffolded based on `--type` (or always present, depending on the template — read `init_command.py` to confirm).

### Step 4.4: Rewrite `design-plugin-with-tables.md`

- Same `mint init` correction as 4.3
- Replace `MigrationRunner` references with `run()` flow
- Replace `column(name, type, ...)` examples with `sa.Column` per Task 3.1
- Verify the migration example actually runs (read `init_command.py` to see what scaffolded migrations look like)

### Step 4.5: Rewrite `adding-a-frontend.md`

The tutorial currently claims `mint init . --add-frontend` — this doesn't work. Rewrite to:

- Note that frontend scaffolding is opt-in at `mint init` time via the absence of `--no-frontend`
- For projects that scaffolded with `--no-frontend` and now want a frontend: document the manual addition (create `frontend/` directory, copy a scaffold from the SDK or another plugin, install bun deps)
- Keep the rest of the tutorial (Vue components, useApi, etc.) — those are accurate per audit

Fix the CSS variables import path:

```ts
// OLD
import '@morscherlab/mint-sdk/styles/variables.css'

// NEW
import '@morscherlab/mint-sdk/styles'
```

Fix the `useApi` shape — show the real `{client, get, post, put, patch, delete, upload, download, buildUrl, buildWsUrl}` surface.

### Step 4.6: Update `plugin-roles.md`

- Verify the `require_plugin_role` and `PluginRoleRepository` examples
- Correct the `useApi` shape if used
- Drop any fictional testing helper

### Step 4.7: Update `tutorials/index.md`

If the prereqs section claims specific symbols that change, update.

### Step 4.8: Build + commit

```bash
bun run build
git add -A
git commit -m "$(cat <<'COMMIT'
docs(sdk/tutorials): real testing harness, real mint init flags

- first-analysis-plugin: tests use RecordingContext + make_test_plugin
  + build_test_app from mint_sdk.testing (real exports).
- mint init flag tables corrected: --type, --name, --description,
  --no-frontend, --ai-assistant, --yes, --force. Drop fictional
  --routes-prefix and --with-migrations.
- adding-a-frontend: drop fictional 'mint init . --add-frontend'
  later-add path. Frontend is opt-in at scaffold time. Fix CSS
  variables import to '@morscherlab/mint-sdk/styles'. useApi shape
  updated to real {client, get, post, put, patch, delete, upload,
  download, buildUrl, buildWsUrl}.
- design-plugin-with-tables: MigrationRunner.run() flow; sa.Column
  for column construction; migration scaffold matches mint init.
- plugin-roles: verified.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 5: `/sdk/recipes/` — delete + fold + rewrite

**Files:**
- Delete: `sdk/recipes/managing-artifacts.md`
- Modify: `sdk/recipes/writing-results.md` (absorb the verified artifact pattern)
- Modify: `sdk/recipes/testing-plugins.md` (rewrite against real harness)
- Modify: `sdk/recipes/index.md` (drop the deleted entry; reorganize TOC)
- Modify: `sdk/recipes/error-handling.md` (drop `require_permission` claim)
- Modify: `sdk/recipes/route-permissions.md` (drop `require_permission` claim)
- Modify: `sdk/recipes/logging-tracing.md` (verify against `mint_sdk/logging.py`)
- Modify: `sdk/recipes/reading-experiments.md` (verify ExperimentRepository methods)
- Modify: `sdk/recipes/querying-plugin-data.md` (light verification)
- Modify: `sdk/recipes/backfill-migration.md` (use real `MigrationOps.backfill`)
- Modify: `sdk/recipes/r-integration.md` (light pass — verified illustrative)
- Modify: `.vitepress/config.ts` (sidebar: drop managing-artifacts)

### Step 5.1: Delete the speculative artifact recipe

```bash
rm sdk/recipes/managing-artifacts.md
```

### Step 5.2: Add the verified artifact pattern to `writing-results.md`

Insert a new section near the end (before "Notes"):

```markdown
## Artifacts produced by analysis

Plugin-produced files (e.g., a CSV report) live in MINT's artifact
storage, managed by the platform. The verified pattern is:

1. Compute the file in your plugin
2. Upload via the platform's REST API (the platform issues a token
   that the plugin's process can use to call back) and capture the
   returned artifact ID
3. Embed the artifact ID in `PluginAnalysisResult.result` so the
   frontend can render a download link

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        csv_bytes = self._compute_report(experiment_id)
        artifact_id = await self._upload_to_platform(csv_bytes,
                                                     filename="report.csv")
        await self.save_analysis(experiment_id, {
            "report_artifact_id": artifact_id,
        })
```

The exact upload mechanism depends on the platform version. There is
no `client.artifacts` resource in `MINTClient` at this time; consult
the platform's REST API or wait for SDK support.
```

(Confirm this is accurate by reading the platform's REST API for artifacts before committing.)

### Step 5.3: Rewrite `testing-plugins.md`

Replace the fixture section's invented exports with real ones. The real `mint_sdk.testing` surface (4 helpers) supports a different testing pattern than the in-memory-repository one I documented:

```python
# tests/conftest.py
import pytest
from mint_sdk.testing import RecordingContext, make_test_plugin, build_test_app

from my_plugin.plugin import MyPlugin


@pytest.fixture
async def plugin():
    p = MyPlugin()
    ctx = RecordingContext()
    # RecordingContext.set_current_user(...) seeds the auth dependency for this request
    await p.initialize(ctx)
    yield p
    await p.shutdown()


@pytest.fixture
async def app(plugin):
    return build_test_app(plugin)


@pytest.fixture
async def client(app):
    from httpx import AsyncClient, ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

(Read each real helper's source to align the example with actual signatures.)

The "Testing migrations" section needs to drop `in_memory_runner` (fictional). Replace with: "Use a temporary SQLite DB and run the plugin's migrations through `MigrationRunner.run(...)` directly. See `MigrationRunner` reference for the runner's API."

### Step 5.4: Drop `require_permission` claims

In `error-handling.md` and `route-permissions.md`: any reference to importing `require_permission` from `api.dependencies.permissions` must be removed. Plugins authenticate via `context.get_current_user_dependency()` and authorize via `context.require_plugin_role(...)`. The platform's RBAC permissions are checked by the platform itself for routes it serves directly; plugin routes use the plugin role mechanism.

### Step 5.5: Update `backfill-migration.md`

Use the real `MigrationOps.backfill` helper (read its signature from source) where appropriate, or document the manual chunked-update pattern with `ops.execute` if that's what the SDK actually exposes.

### Step 5.6: Verify other recipes

```bash
grep -E "from_env|InMemoryExperimentRepository|make_experiment|in_memory_runner|client\.users|client\.artifacts" sdk/recipes/*.md
```

Any hit: fix.

### Step 5.7: Update `recipes/index.md`

- Drop the "Managing artifacts" entry from the topic-grouped TOC
- Move the "Artifacts" mention into the "Writing results" recipe's description

### Step 5.8: Update sidebar

In `.vitepress/config.ts`, remove the managing-artifacts entry from the `/sdk/` recipes group:

```typescript
{
  text: 'Recipes',
  items: [
    { text: 'Overview', link: '/sdk/recipes/' },
    { text: 'Reading experiments', link: '/sdk/recipes/reading-experiments' },
    { text: 'Writing results', link: '/sdk/recipes/writing-results' },
    // Managing artifacts entry removed
    { text: 'Querying plugin data', link: '/sdk/recipes/querying-plugin-data' },
    { text: 'Route permissions', link: '/sdk/recipes/route-permissions' },
    { text: 'Error handling', link: '/sdk/recipes/error-handling' },
    { text: 'Logging & tracing', link: '/sdk/recipes/logging-tracing' },
    { text: 'Testing plugins', link: '/sdk/recipes/testing-plugins' },
    { text: 'Backfill migrations', link: '/sdk/recipes/backfill-migration' },
    { text: 'R integration', link: '/sdk/recipes/r-integration' },
  ],
},
```

### Step 5.9: Sweep cross-links

```bash
grep -rn "/sdk/recipes/managing-artifacts" --include="*.md" --include="*.ts" .
```

For each hit: rewrite to `/sdk/recipes/writing-results#artifacts-produced-by-analysis` (or the actual section anchor) or just remove.

### Step 5.10: Build + commit

```bash
bun run build
git add -A
git commit -m "$(cat <<'COMMIT'
docs(sdk/recipes): delete managing-artifacts; rewrite testing-plugins

- managing-artifacts.md DELETED — the SDK has no client.artifacts
  resource. The only verified pattern (embed artifact ID in result
  JSON) is folded into writing-results.md as a short section.
- testing-plugins.md rewritten against the real testing harness:
  RecordingContext + make_test_plugin + build_test_app +
  write_standalone_plugin_module. Drop fictional
  InMemoryExperimentRepository / make_experiment / in_memory_runner.
- error-handling and route-permissions: drop the claim that
  plugins import require_permission from api.dependencies (they
  can't — that's platform-internal). Authorization in plugin
  routes uses context.require_plugin_role().
- backfill-migration: use real MigrationOps.backfill helper.
- index.md and sidebar updated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 6: `/sdk/frontend/` and `/sdk/operations/` fixes

**Files:**
- Modify: `sdk/frontend/index.md`
- Modify: `sdk/frontend/components.md`
- Modify: `sdk/frontend/composables.md`
- Modify: `sdk/frontend/design-tokens.md`
- Modify: `sdk/frontend/theming.md`
- Modify: `sdk/frontend/form-builder.md`
- Modify: `sdk/operations/index.md`
- Modify: `sdk/operations/packaging.md`
- Modify: `sdk/operations/publishing.md`
- Modify: `sdk/operations/ci-patterns.md`
- Modify: `sdk/operations/versioning.md`
- Modify: `sdk/operations/deploying.md`
- Modify: `sdk/operations/upgrading-sdk.md`

### Step 6.1: Update component / composable counts

Across `frontend/index.md`, `frontend/components.md`, `frontend/composables.md`: change `~88` → `87` and `~29` / `~27` → `27` consistently.

### Step 6.2: Fix `useApi` shape in `composables.md`

Update the deep-dive to show the full real surface:

```ts
const api = useApi()
// api.client     — underlying typed fetch client
// api.get<T>()
// api.post<T>()
// api.put<T>()
// api.patch<T>()
// api.delete<T>()
// api.upload(...)
// api.download(...)
// api.buildUrl(...)
// api.buildWsUrl(...)
```

### Step 6.3: Fix `useExperimentSelector` shape in `composables.md`

Replace with the real return:

```ts
const {
  experiments,
  total,
  selectedExperiment,
  filters,        // contains .search, .status, .type, etc.
  isLoading,
  error,
  page,
  hasMore,
  sortKey,
  experimentTypes,
  projects,
  groupedByProject,
  fetch,
  loadMore,
  reset,
  select,
  clear,
  fetchFilterOptions,
} = useExperimentSelector(...)
```

### Step 6.4: Fix the design-tokens import path in `design-tokens.md`

Replace any reference to `@morscherlab/mint-sdk/styles/variables.css` with `@morscherlab/mint-sdk/styles`.

### Step 6.5: Verify component catalog

Spot-check the top-20 component names against `packages/sdk-frontend/src/components/`:

```bash
ls /Users/estrella/Developer/MorscherLab/MINT-platform/MINT/packages/sdk-frontend/src/components/ | grep -v "\.story\." | grep "^Avatar\|^BaseButton\|^FormBuilder\|^WellPlate\|^DataFrame"
```

Adjust catalog entries if any name has changed.

### Step 6.6: Fix `mint build` flags in `operations/packaging.md`

Replace the flag table:

| Flag | Effect |
|------|--------|
| `--no-frontend` | Skip the frontend build step |
| `--output-dir` | Override `dist/` |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in) |

Drop `--output`, `--no-deps`, `--check`.

### Step 6.7: Update `operations/ci-patterns.md`

Update the GitHub Actions templates to use the real flag set. Specifically, replace `mint build --check` with `mint build --output-dir tmp-build` (or simply remove the validation step — `mint doctor` does most of the same work).

Add a `mint dev logs` example if relevant in the testing-against-platform-dev section.

### Step 6.8: Verify `operations/upgrading-sdk.md`

The `mint sdk update` flags include `--scope patch|minor|major`, `--dry-run`, `--no-sync` per the audit. Update the flag table.

### Step 6.9: Light verification of the rest

`frontend/theming.md`, `form-builder.md`, `operations/{index,publishing,versioning,deploying}.md`: spot-check for any `mint serve`, `from_env`, fictional CLI flags, or invented symbols. Fix in place.

### Step 6.10: Build + commit

```bash
bun run build
git add -A
git commit -m "$(cat <<'COMMIT'
docs(sdk/frontend, sdk/operations): counts, shapes, flags fixed

- frontend counts updated to 87 components / 27 composables across
  index.md, components.md, composables.md.
- composables.md: useApi shape shows real 10-method surface;
  useExperimentSelector shape shows real 18-field return.
- design-tokens.md: CSS variables import path is
  '@morscherlab/mint-sdk/styles' (the only exported sub-path).
- operations/packaging.md: mint build flags corrected (--output-dir,
  --vendor-deps; drop --output, --check, --no-deps).
- operations/ci-patterns.md: GitHub Actions templates use real flags.
- operations/upgrading-sdk.md: mint sdk update --scope/--dry-run/
  --no-sync flags added.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
```

---

## Task 7: Final verification

### Step 7.1: Clean rebuild

```bash
rm -rf .vitepress/cache .vitepress/dist
bun run build
```

Expected: zero errors, zero warnings, `build complete`.

### Step 7.2: Page count

```bash
find .vitepress/dist -name "*.html" | wc -l
```

Expected: 64 (67 today − 3 deletes: `cli/serve.html`, `cli/plugin-dev.html`, `sdk/recipes/managing-artifacts.html`).

### Step 7.3: Final cross-link sweep

```bash
grep -rn "/sdk/recipes/managing-artifacts\|/cli/serve\|/cli/plugin-dev\|mint serve\|MINTClient\.from_env\|InMemoryExperimentRepository\|in_memory_runner\|require_permission" \
  --include="*.md" --include="*.ts" \
  . 2>&1 | grep -v "^docs/superpowers/"
```

Expected: zero hits in any rendered page (markdown content) or sidebar/nav config. Hits inside `docs/superpowers/{specs,plans}/` are OK (they describe the audit history).

### Step 7.4: Live site spot-check via agent-browser

```bash
agent-browser open https://mint-docs.morscherlab.org/sdk/api/cli-reference
# ... wait for the deploy from the prior commits to settle
agent-browser get text h1
agent-browser screenshot /tmp/cli-ref-after.png
```

Check the rendered page no longer contains `--routes-prefix`, `--with-migrations`, `--check`, `--no-deps`. Same for `/reference/permissions`, `/sdk/api/client`, `/sdk/recipes/testing-plugins`.

### Step 7.5: Push

```bash
git push
```

Watch the CI deploy:

```bash
RUN_ID=$(gh run list --repo MorscherLab/MINT-docs --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --repo MorscherLab/MINT-docs --exit-status
```

### Step 7.6: Update memory

Update `~/.claude/projects/-Users-estrella-Developer-MorscherLab-MINT-docs/memory/project_mint_docs.md` to reflect the corrected page count (64) and the verification discipline ("every code example was grep-checked against MINT-platform source on 2026-05-01").

Add a new memory file `~/.claude/projects/-Users-estrella-Developer-MorscherLab-MINT-docs/memory/feedback_fact_check_discipline.md` capturing the lesson: when scaffolding docs from extrapolation, every symbol must be grep-checked against source before merge; otherwise the speculation becomes load-bearing in tutorials and recipes.

### Step 7.7: Done

If every step passed, the fact-check fixes are complete. The site at `mint-docs.morscherlab.org` reflects only what's verifiable against MINT-platform source.

---

## Self-review

- ✅ **Spec coverage:** Every page in the spec's "Page deltas" table maps to a task. User Manual `mint serve` purge → Task 1. RBAC fix → Task 1. `cli/` slim → Task 1. `/sdk/api/` rewrites → Task 2. `/sdk/concepts/` light fixes → Task 3. `/sdk/tutorials/` rewrites → Task 4. `/sdk/recipes/` delete+fold+rewrite → Task 5. `/sdk/frontend/` and `/sdk/operations/` → Task 6. Verification → Task 7.

- ✅ **Placeholder scan:** Each task references real symbols by name, real flag names, real file paths. The few "read source to confirm exact signature" instructions point at specific files (`init_command.py`, `runner.py`, `ops.py`, etc.) so the executor knows which file to read.

- ✅ **Type / name consistency:** `MINTClient` (uppercase), `mint_sdk` (snake_case package), `mint-sdk` (kebab PyPI name), `make_test_plugin` / `build_test_app` / `RecordingContext` / `write_standalone_plugin_module` (the four real testing exports), `MigrationOps` methods (real list of 10), `MigrationRunner.run() / discover()` (the only real methods) — all consistent across tasks.

- ✅ **Scope:** Single execution session, six commit-sized sections plus final verification. Page count delta (67 → 64) matches what the spec demands. Build verification at every commit.
