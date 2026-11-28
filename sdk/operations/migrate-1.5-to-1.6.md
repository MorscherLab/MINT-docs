# Migrate from MINT 1.5 to 1.6

This guide moves a plugin from MINT 1.5 to 1.6. The Python SDK removes nothing in 1.6, and the frontend SDK only deprecates. A plugin built for SDK 1.4 or 1.5 with the range `mint-sdk>=1.x,<2.0` loads on a 1.6 platform unchanged. The plugin toolchain changes: the `mint` CLI runs every frontend command through the global Vite+ CLI `vp`, new plugins use pnpm, and `mint lint` is the one lint command. Administrators must also read [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5) before they upgrade the platform.

## Before upgrading

1. Remove a `sqlalchemy<2.1` cap and a `mint-sdk` range that excludes 1.6 from the plugin requirements. See [Changes without a new plugin release](#changes-without-a-new-plugin-release).
2. Check the database code of the plugin for the SQLAlchemy 2.1 flush, the FastAPI `null` body and the aware UTC `datetime`.
3. Install Vite+ 1.5.1 or later on each development machine and in CI. See [Install Vite+](#install-vite).
4. Install the 1.6 CLI: `uv tool install --force 'mint-sdk[cli]==@MINT_VERSION@'`.
5. Commit or stash your work. `mint migrate` stops on a dirty git tree.

## Changes without a new plugin release

A plugin runs on the `mint-sdk` and the libraries of the platform. These changes apply to a released plugin on a 1.6 platform. You do not build a new release for them:

| Change | Effect on plugin code |
|---|---|
| SQLAlchemy 2.1 | A session flushes before each statement, also before a `text()` or Core statement. Pending objects from `session.add()` go to the database earlier than with SQLAlchemy 2.0. SQLAlchemy 2.1 uses psycopg 3 for a `postgresql://` URL that names no driver: name the driver (`postgresql+asyncpg://`, `postgresql+psycopg2://`) in a standalone database URL to keep the current driver |
| FastAPI 0.163 | A JSON `null` body value is a value, not "omitted". `Body(default=…)` with `null` gives 422, or `None` when the type allows it. Before, the default applied |
| Platform payloads | A payload without a timestamp parses to an aware UTC `datetime` (the epoch). Before, it was a naive local one. Compare it with aware values |

The platform disables a plugin at the first 1.6 start when the plugin requirements do not resolve against the 1.6 platform lock. Admin > Plugins shows the reason. The two usual causes:

- A `mint-sdk` range that excludes 1.6, such as `mint-sdk<1.6`. The plugin stays disabled until a release that admits 1.6 is installed.
- A cap below a new platform floor, such as `sqlalchemy<2.1`. The 1.6 platform lock has SQLAlchemy 2.1, FastAPI 0.163 and Starlette 1.10. Remove the cap.

A plugin page runs the frontend SDK that the plugin bundles. The frontend SDK changes of 1.6 apply to a plugin only after the plugin moves `@morscherlab/mint-sdk` to 1.6.

## What changes for plugin code

| Surface | Action for 1.6 | Section |
|---|---|---|
| Toolchain | Install Vite+ 1.5.1 or later | [Install Vite+](#install-vite) |
| Frontend package manager | Run `mint migrate` once. Commit `pnpm-lock.yaml` and `mint-lint-baseline.json` | [Run `mint migrate`](#run-mint-migrate) |
| SDK packages | Run `uv run mint sdk update --version @MINT_VERSION@` | [Update both SDK packages](#update-both-sdk-packages) |
| Checks | Run `mint doctor --strict` and `mint lint`. Fix the new findings | [Check with `mint doctor` and `mint lint`](#check-with-mint-doctor-and-mint-lint) |
| Migration files | Do not change a revision file of a released tag | [Released revisions](#released-revisions) |
| Frontend code | Declare `axios` and `plotly.js-dist-min` where you use them, move off `useApi`, load lazy form fields in tests | [Frontend changes](#frontend-changes) |
| Plugin pages | Look at each page: type scale, frames and button icons change | [Frontend changes](#frontend-changes) |

## Install Vite+

The 1.6 CLI runs every frontend command through the global `vp`: `vp install`, `vp install --frozen-lockfile`, `vp run <script>` and `vp add -E <package>`. This applies to `mint dev`, `mint build`, `mint init`, `mint sdk update` and `mint migrate`, also for a plugin that still uses bun or npm. The CLI does not call bun, pnpm or npm itself and has no fallback. Without `vp` on `PATH`, or with a `vp` older than 1.5.1, these commands stop with exit 1 and print the install commands.

1. Install Vite+ 1.5.1 or later:

   ```bash
   curl -fsSL https://vite.plus | bash              # macOS, Linux
   brew install voidzero-dev/vite-plus/vp           # Homebrew
   irm https://vite.plus/ps1 | iex                  # Windows PowerShell
   ```

2. Check the version:

   ```bash
   vp --version
   ```

3. In CI, add the step `uses: voidzero-dev/setup-vp@v1.22.0` with `working-directory: frontend` before the first `vp`, `mint build` or `mint doctor` command. The "Global vp" check of `mint doctor` fails without `vp`. `mint migrate` makes this change in a workflow that `mint init` generated. See [CI patterns](/sdk/operations/ci-patterns).

`mint sdk link` and `mint sdk unlink` are the exception. They still call `bun link` or `pnpm link`.

## Run `mint migrate`

`mint migrate` moves a standard plugin frontend from bun or npm to pnpm and Vite+, and adds the `mint lint` setup. Run it once in each plugin. Show the plan first:

```bash
mint migrate --dry-run
mint migrate
```

Run the global 1.6 `mint` from step 4 of [Before upgrading](#before-upgrading): a 1.5 SDK in `uv.lock` has no `migrate` command, so `uv run mint migrate` fails before the SDK update. `--dry-run` writes nothing and does not need `vp`. A dirty git tree stops the command; `--force` overrides that check. A second run changes nothing.

The command makes these changes:

- `frontend/package.json`: the `packageManager` field (`pnpm@…`), `vp` in place of the `vite` and `vitest` commands of the scripts, the `lint`, `fmt` and `fmt:check` scripts, and the Vite+ dependencies. A `devEngines.packageManager` that names another manager changes to pnpm.
- `frontend/pnpm-workspace.yaml`, with `minimumReleaseAgeExclude: ['@morscherlab/*']`. pnpm does not install a package version younger than one day by default; the entry lets pnpm lock a new frontend SDK on the day that uv locks the new `mint-sdk`.
- `frontend/vite.config.ts` imports `defineConfig` from `vite-plus`.
- `bun.lock` or `package-lock.json` is removed. `pnpm-lock.yaml` is written.
- The CI steps that `mint init` generated: `Setup Bun` becomes `voidzero-dev/setup-vp`, and the `bun install` and `bun run` frontend step becomes `vp` commands.
- The `mint lint` setup: ruff in the dev dependency group, the frontend `lint` script `uv run mint -C .. lint`, `uv run mint lint` in place of each `uv run ruff check .` line of the workflows, and a `## Lint` section in each agent instructions file.
- After the install, it locks the frontend SDK release that `uv.lock` holds for `mint-sdk` (`vp add -E`) and runs the "SDK version alignment" check of `mint doctor`.
- It formats the sources with `vp fmt` until `fmt:check` passes (at most 3 passes), then runs type-check, test, lint, fmt:check and build with `vp run`.
- It runs `mint lint` on the whole project. When `mint lint` reports findings, it writes them to `mint-lint-baseline.json`.

Until every step passes, the old lockfile and the old `node_modules` wait in `.frontend-before-mint-migrate/` next to the frontend. A failed step, other than lint, restores every file. After a hard stop, the next run stops, lists what that directory holds and gives the steps to go back.

The command reports these files and does not edit them: Dockerfiles, shell scripts, hand-written workflows and other files that still name bun, and a `.gitignore` line that ignores `uv.lock`. Edit them yourself. A `frontend/vite.config.js` or `vite.config.mjs` next to `vite.config.ts` stops the migration before it writes a file, because Vite+ loads that file first. Delete the stale file.

At the end, the command lists the toolchain files and the formatted sources apart. Commit the two lists in two commits. Include `frontend/pnpm-lock.yaml` and `mint-lint-baseline.json` in the toolchain commit. CI installs from the lockfile, and `mint lint` in CI fails on each finding that the baseline does not accept.

Without `mint migrate`, a bun or npm plugin keeps working: `vp` forwards to the manager of the lockfile, and `mint doctor` shows the "Package manager" warning "not migrated: run `mint migrate`", which `--strict` does not count.

A plugin made before 1.6 still proxies `/api` of the frontend dev server to port 8003. `mint dev` gives the frontend dev server `MINT_DEV_BACKEND_URL`, the backend URL in use. To follow it, change the proxy target in `vite.config.ts`:

```ts
target: process.env.MINT_DEV_BACKEND_URL ?? 'http://localhost:8003',
```

## Update both SDK packages

```bash
uv run mint sdk update --version @MINT_VERSION@ --dry-run
uv run mint sdk update --version @MINT_VERSION@
```

`mint sdk update --version X` raises each `mint-sdk` floor below `X` to `X`, in the dependencies, the optional dependencies and the dependency groups. The `requires_mint` of the bundle follows. A release with a 1.6 floor installs only on a 1.6 platform. Keep a 1.5 floor when the plugin must also install on 1.5 and uses no 1.6 API. Details: [Upgrading the SDK](/sdk/operations/upgrading).

`mint sdk update`, `mint init --force`, `mint build` and `mint dev` stop with exit 1 when `uv.lock` locks a `mint-sdk` of a newer minor than the running `mint`. Run the command through the plugin environment:

```bash
uv run mint build
```

The frontend `lint` script and the `Lint` step of the workflows need mint-sdk 1.6 in `uv.lock`. With an older SDK, `mint lint` is not a command.

## Check with `mint doctor` and `mint lint`

```bash
uv run mint doctor --strict
uv run mint lint
```

The 1.6 `mint doctor` has these new checks:

| Check | Result | Counts for `--strict` |
|---|---|---|
| Released revisions | Error when a file of the `Metadata.database` migration package of the latest git tag changed or is gone in the working tree | Yes (error) |
| Frontend chart dependency | Warning when the plugin renders an SDK chart component and does not declare `plotly.js-dist-min` | Yes |
| Deprecated SDK APIs | Warning for each import of a deprecated frontend SDK export, with the replacement | Yes |
| Global vp | Error when `vp` is missing, prints no version or is older than 1.5.1. Warning when the global `vp` and the locked `vite-plus` differ | Error yes, version warning no |
| Package manager | Shows the manager that `vp` runs and the evidence. "not migrated" warning for bun, npm or no `vite-plus` | "not migrated" no; a conflict between the declared field and the lockfile, or two lockfiles, yes |
| Lockfile tracking | Warning when `uv.lock` is git-ignored while `pnpm-lock.yaml` is tracked | No |
| Design rules | Runs the design rules of `mint lint` and warns with the count of new findings | Yes |
| Panels | Warning for a removed panel id of the latest tag, panel `experiment_types` outside `Metadata.experiment_types`, and an `experiment.design` panel without `"design"` in `writes` | Yes |
| Analysis launch offer | Hint to set `analysis_offer = False` for an analysis plugin with no page, no frontend and no `@job` | No |

`mint lint` runs three parts: the MINT design rules, ruff and oxlint, each with the SDK preset. It exits 1 on a new finding. Work with the baseline:

1. Run `mint lint` before each push. CI runs it.
2. Run `mint lint --no-baseline` to see the accepted findings.
3. Run `mint lint --explain <rule>` to read the reason of a design rule.
4. After you fix accepted findings, run `mint lint --write-baseline`, so no stale entry stays.
5. For an exception, add the comment `mint-lint-ignore <rule>: <reason>` above the line.

The design rules include the layout rules `workspace-sidebar`, `experiment-field`, `nested-card`, `one-primary-action` and `wizard-in-modal`, and design-system rules such as `button-order`, `destructive-variant`, `sentence-case` and `font-size-token`. The full rule list and the configuration are in [`mint lint`](/sdk/api/cli-reference#mint-lint).

## Released revisions

The platform stores a checksum of each applied migration revision. When a released revision file changes, the platform disables the plugin on upgrade ("Migration checksum or owner mismatch"). The "Released revisions" check of `mint doctor` compares the files of the `Metadata.database` package with the latest git tag. It names each file that the working tree changed or removed. New files pass. Without a tag, the check is skipped.

Restore the released file and put the change in a new revision. Keep formatters off the revision package, for example with an `exclude` in `[tool.ruff]`. See [Migrations](/sdk/concepts/migrations).

## Frontend changes

These changes apply after the plugin moves `@morscherlab/mint-sdk` to 1.6. Details are on the [Frontend](/sdk/frontend/) pages and in the [frontend API reference](/sdk/api/frontend).

| Change | Action |
|---|---|
| `axios` is not a dependency of the SDK | A plugin that imports `axios` adds it to `frontend/package.json` (`vp add axios`). `useApi().client` is not an axios instance |
| `useApi` and 19 types are deprecated | Use the generated `useClient()` for plugin routes and `useExperimentNumber` for experiment numbers. They keep working; MINT 2.0 removes them. `mint doctor --strict` fails on each import |
| Charts | A plugin that renders `PlotlyChart`, `PanelSections` or a generated result view declares `plotly.js-dist-min`: run `vp add plotly.js-dist-min` in `frontend/` |
| Lazy form fields | `FormBuilder`, `SettingsModal` and the generated UI load the `path`, `file`, `molecule`, `formula` and `sequence` fields on first use. A test that finds one of these fields right after mount calls `beforeAll(() => preloadFormFieldTypes())` (from `@morscherlab/mint-sdk/runtime`) |
| Type scale | Every SDK font size is a `--font-size-*` token. Medium controls are 13px. The `mint lint` rule `font-size-token` reports literal font sizes in plugin CSS |
| Frames | Content components such as `MetadataSheet`, `ChartContainer` and `PlateEditor` draw no box of their own. Wrap one that sits straight on a page in a `SectionCard` |
| `BaseButton` | An icon beside a label is 2px smaller. Move an icon from the default slot to `#icon-left` or `#icon-right` |
| `PluginWorkspaceView` | The main pane is one card. Remove an `AppContainer` around `<router-view />`. Set `main: 'plain'` for a full-bleed view |
| Browsers | The supported browsers are Chrome 116, Edge 116, Firefox 124 and Safari 17.4, or newer |

## New plugin APIs

These APIs are new in 1.6. A plugin that uses one needs `mint-sdk>=@MINT_VERSION@`. See the [Python SDK reference](/sdk/api/python).

| Area | Change |
|---|---|
| Panels | `@panel(id, slot=, title=, access=, experiment_types=, actions=)` adds a tab to the Design data or Analysis artifacts card of the experiment page. `Harness.panel` calls a panel in a test. See [Plugin panels](/sdk/recipes/panels) |
| Jobs | `Job.effect` (`"read"`, `"write"`, `"destructive"`). MCP asks for confirmation before a destructive job |
| Analysis offer | `Metadata.analysis_offer = False` removes the plugin from the analysis launch list of the experiment page |
| Live designs | `Design(live=True)` with a `schema`: the platform draws the design form and saves each field by itself. See [Live designs](/sdk/recipes/live-design) |
| MCP skills | `Metadata.skills`. See [MCP skills](/sdk/recipes/mcp-skills) |

## Check the result

```bash
uv run mint doctor --strict
uv run mint lint
uv run pytest
cd frontend && vp run type-check && vp run test && vp run build && cd ..
uv run mint build
```

Open each plugin page in `mint dev` and in the platform. Check the font sizes, the frames of the content components and the button icons. Then release the plugin. See [Publishing](/sdk/operations/publishing).
