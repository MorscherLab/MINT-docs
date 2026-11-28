# CLI reference

All commands and flags of the `mint` CLI in v@MINT_VERSION@. Run `mint <command> --help` for the options of your installed version.

Source: [`mint_sdk/cli/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli) and the `*_command.py` modules in [`mint_sdk/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk).

## Install and choose the environment

To install the CLI, see [Install the toolchain](/sdk/install). The CLI needs Python 3.14 or later and the `[cli]` extra.

In a plugin project, run `uv run mint ...` to use the SDK of the project. `mint init` puts `mint-sdk[cli,server]` in the dev group and keeps plain `mint-sdk` as the runtime dependency. A plugin with database tables also needs `[local-db]`.

| Requirement | Use it for |
|---|---|
| `mint-sdk` | Python SDK/runtime imports, such as `Plugin` and `MINTClient` |
| `mint-sdk[cli]` | The `mint` commands; adds Typer and `httpx2` |
| `mint-sdk[cli,server]` | Plugin development with the CLI and Uvicorn |

The CLI runs every frontend command through the global Vite+ CLI `vp`: `vp install`, `vp install --frozen-lockfile`, `vp run <script>` and `vp add -E <package>`. For a plugin with a frontend, `mint init`, `mint dev`, `mint build`, `mint sdk update` and `mint migrate` need `vp` 1.5.1 or later on `PATH`. Without it, they stop with exit 1 and print the install commands:

```bash
curl -fsSL https://vite.plus | bash              # macOS, Linux
brew install voidzero-dev/vite-plus/vp           # Homebrew
irm https://vite.plus/ps1 | iex                  # Windows PowerShell
vp --version
```

`vp` selects the package manager of the frontend from the first of these that exists:

1. The `packageManager` field of `frontend/package.json` (or of the workspace root that contains it), else its `devEngines.packageManager` field.
2. `pnpm-workspace.yaml`.
3. The lockfile: `pnpm-lock.yaml`, `package-lock.json`, `bun.lock` or `bun.lockb`.
4. None: pnpm. A plugin made before 1.6 keeps bun.

Set `VP_LOG` to print the output of each `vp` command. Otherwise the CLI captures it.

`mint sdk update`, `mint init --force`, `mint build` and `mint dev` stop with exit 1 when `uv.lock` locks a `mint-sdk` of a newer minor than the running `mint`. Run `uv run mint <command>` in the plugin to use its own `mint`.


## A complete development loop

```bash
mint init lab-qc --mode standard --type analysis --ai-assistant codex --yes
cd lab-qc
uv run mint dev
# Stop the dev server with Ctrl+C before continuing.
uv run mint docs contract
uv run mint sdk generate
uv run mint sdk generate --check
uv run mint doctor --strict
uv run mint lint
uv run pytest
uv run mint build
uv run mint verify
```

`mint verify` needs Docker. To install on a running platform, see [Deploying](/sdk/operations/deploying).

## Top-level

```
mint [-C DIR] [--url URL] [--version] [--help] <command>
```

| Flag | Effect |
|------|--------|
| `-C DIR` | Run as if `mint` started in `DIR`, like `git -C`. A plugin command takes no path argument: use `mint -C DIR doctor` |
| `--url URL` | Platform to talk to: a URL, or part of a host name from `mint platform auth hosts` |
| `--version`, `-V` | Print the SDK version and exit |
| `--install-completion` | Install shell completion for the current shell |
| `--show-completion` | Print the shell completion script |
| `--help` | Show top-level help |

## Platform commands

These commands talk to a running platform. Sign in first with `mint platform auth login`.

### `mint platform status`

```bash
mint platform status
```

Prints:

- The configured host (`MINT_URL`, or the stored default) and the stored username, or "Not logged in".
- Whether the platform is reachable, and the loaded plugins with their versions.
- Whether the token is valid, and the credential in use: type (session or access token), read-only state, expiry and source (`MINT_TOKEN` or the stored credential).

### `mint platform restart`

```bash
mint platform restart [--yes|-y] [--json]
```

Asks the platform to restart its server process (`POST /api/admin/restart`). Without `--yes`, it asks for confirmation. It exits non-zero when the platform reports a failure.

### `mint platform auth`

Tokens are stored per host in `~/.config/mint/credentials.json`, or `$XDG_CONFIG_HOME/mint/credentials.json` when `XDG_CONFIG_HOME` is set. The file is written with mode `0600`.

| Command | Purpose |
|---------|---------|
| `mint platform auth login [--url URL] [--name NAME] [--read-only]` | Sign in with a device code and store the personal access token; see [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli). `--read-only` asks for a read-only token. `--name` gives the host a short name (asked on the first login when omitted). A host without a scheme gets `https://` |
| `mint platform auth login --token [--url URL]` | Store an existing personal access token instead (prompted, or read from stdin) |
| `mint platform auth logout [--url URL]` | Revoke the stored personal access token on the platform and discard it (default: the current host). If the platform cannot be reached, the command says so and still discards the local copy; revoke the token in Profile |
| `mint platform auth hosts` | List the hosts with a stored credential and their names. `*` marks the default |
| `mint platform auth use <host>` | Make a stored host the default (offline; `status` verifies it) |
| `mint platform auth name <host> <name>` | Give a stored host a short name for `--url` and `use` (offline) |
| `mint platform auth status` | Print the host, user, role, the credential in use (type, read-only state, expiry, source) and whether the platform accepts it |
| `mint platform auth token create <name> [--days 30\|90\|365] [--read-only] [--json]` | Issue a personal access token (default lifetime 90 days) and print it once, with a `claude mcp add` command for the platform's `/mcp` endpoint |
| `mint platform auth token list [--json]` | List your personal access tokens by prefix, access, expiry and last use |
| `mint platform auth token revoke <token-id>` | Revoke one of your tokens (ID from `token list`) |

`mint platform auth token create` refuses to run under a personal access token: a token cannot issue tokens. Sign in again with `mint platform auth login`, or create the token in Profile. `--read-only` and `--token` do not combine. The browser opens only on a local terminal, not over SSH or without a display.

A personal access token works as `MINT_TOKEN` for the CLI and `MINTClient`, and as the Bearer token for MCP clients. See [AI Assistants and API Access](/guide/ai-and-api).

### `mint platform instruments`

```bash
mint platform instruments [NAME_OR_ID] [--all] [--json]
```

Without an argument, lists the instruments with their live status: state, sample, progress, ETA, unacknowledged alerts and time since the last report. An instrument without a report shows `(no report)`.

With `NAME_OR_ID`, shows the details and status of one instrument. The command matches the name first (case-insensitive, deactivated instruments included), then the ID. A name that matches more than one instrument is an error.

`--all` adds deactivated instruments to the list. `--json` prints JSON. The command needs the `instruments.view` permission. From Python, use [`MINTClient.instruments`](/sdk/api/client#instruments).

### `mint platform experiment`

| Command | Purpose |
|---------|---------|
| `mint platform experiment list [--status S] [--type T] [--project-id ID] [--search Q] [--mine] [--since YYYY-MM-DD] [--before YYYY-MM-DD] [--limit N] [--json]` | List experiments (default limit 20) |
| `mint platform experiment get <id> [--json]` | Show one experiment |
| `mint platform experiment create <name> [--type T] [--project-id ID] [--notes TEXT] [--json]` | Create an experiment (default type `custom`) |
| `mint platform experiment update <id> [--name N] [--status S] [--type T] [--project-id ID] [--notes TEXT] [--json]` | Update an experiment |
| `mint platform experiment data <id> [--format json\|csv] [--view raw\|tree\|summary]` | Print design data (defaults `json`, `raw`) |
| `mint platform experiment results <id> [--plugin ID] [--json]` | Print analysis results, optionally one plugin's |
| `mint platform experiment delete <id> [--yes\|-y]` | Delete an experiment immediately |
| `mint platform experiment types [--json]` | List experiment types |
| `mint platform experiment next-seq <experiment_type> [--json]` | Preview the next experiment code for a type |

### `mint platform project`

| Command | Purpose |
|---------|---------|
| `mint platform project list [--search Q] [--status active\|archived\|completed] [--mine] [--limit N] [--json]` | List projects (default limit 100) |
| `mint platform project get <id> [--json]` | Show one project |
| `mint platform project create <name> [--description\|-d D] [--json]` | Create a project |
| `mint platform project update <id> [--name N] [--description\|-d D] [--status active\|archived\|completed] [--json]` | Update project metadata |
| `mint platform project delete <id> [--yes\|-y]` | Delete a project |
| `mint platform project experiments <id> [--limit N] [--json]` | List experiments in a project (default limit 100) |
| `mint platform project members <id> [--json]` | List project members |

### `mint platform plugin`

A published plugin is a `.mint` bundle. Install it with `mint platform plugin upload` or `mint platform plugin github install`. The platform does the dependency checks, bundle extraction and settings writes. The signed-in user needs the matching plugin permissions. `--force` skips the dependency conflict checks.

| Command | Purpose |
|---------|---------|
| `mint platform plugin list [--json]` | List loaded plugins with their state (`enabled`, `disabled`, or `error` with the migration error under the row), the plugins that the dependency lock disabled with the reason, and installed plugin packages |
| `mint platform plugin snapshots [--json]` | List the plugin lock history (rollback points), newest first |
| `mint platform plugin rollback <snapshot-id> [--yes\|-y] [--json]` | Apply a previous plugin lock: reinstall its plugin versions and uninstall the plugins it does not hold. Restart the platform afterwards (`mint platform restart`) |
| `mint platform plugin install <source> [--force] [--json]` | Install a package name, Git URL, or server-visible local path |
| `mint platform plugin upload <bundle.mint> [--force] [--json]` | Upload and install a `.mint` bundle from the local machine |
| `mint platform plugin upgrade <package-name> [--force] [--json]` | Upgrade through the platform plugin manager |
| `mint platform plugin update <package-name> [--force] [--json]` | Update from the package's registered GitHub source |
| `mint platform plugin uninstall <package-name> [--yes\|-y] [--json]` | Uninstall a plugin package |
| `mint platform plugin github install <repo-or-url> [--tag TAG] [--asset-pattern GLOB] [--force] [--json]` | Install a GitHub release asset (default pattern `*.mint`) |
| `mint platform plugin github releases <repo-or-url> [--asset-pattern GLOB] [--json]` | List releases and matching assets |
| `mint platform plugin config get <plugin-name>` | Print plugin settings and their revision |
| `mint platform plugin config set <plugin-name> --revision REV (--json-config JSON \| --file\|-f settings.json)` | Replace plugin settings |
| `mint platform plugin config update <plugin-name> (--json-config JSON \| --file\|-f settings.json)` | Shallow-patch plugin settings |
| `mint platform plugin index list [--json]` | List extra package index URLs |
| `mint platform plugin index set <url> [<url> ...] [--json]` | Replace extra package index URLs |
| `mint platform plugin runtime external <name> <target-url> [--prefix PATH] [--version LABEL] [--frontend-dir DIR] [--base-path PATH] [--rewrite\|--pass-through] [--json]` | Register an already running plugin server (prefix defaults to `/NAME`) |
| `mint platform plugin runtime docker <name> <image> [--prefix PATH] [--container-port N] [--host-port N] [--container-name NAME] [--platform-url URL] [--network NAME] [--json]` | Register a container for the platform to run (container port defaults to 8000) |

`config get` returns the revision that `config set` needs. Copy it unchanged; a stale revision fails with a conflict. Keep the secret references that the platform returns; do not replace them with masked values. Runtime paths and URLs must be reachable from the platform host; see [Isolation](/sdk/concepts/isolation).

### `mint platform admin`

The signed-in user needs the matching permissions. There are no plugin roles: give a user the `plugins.configure` permission through a role.

| Command | Purpose |
|---------|---------|
| `mint platform admin feedback [--limit N] [--offset N] [--json]` | Read user feedback, newest first (needs `platform.view_logs`; limit 1-500, default 50) |
| `mint platform admin user list [--json]` | List users |
| `mint platform admin user get <user-id> [--json]` | Show one user |
| `mint platform admin user create <username> [--password P] [--email E] [--role SLUG] [--first-name F] [--last-name L] [--shortname S] [--json]` | Create a user (password prompted if omitted; role defaults to `member`) |
| `mint platform admin user update <user-id> [--email E] [--role SLUG] [--password P] [--first-name F] [--last-name L] [--shortname S] [--json]` | Update a user |
| `mint platform admin user delete <user-id> [--yes\|-y]` | Delete a user |
| `mint platform admin user activate <user-id>` / `deactivate <user-id>` | Enable or disable an account |
| `mint platform admin role list [--json]` | List roles |
| `mint platform admin role permissions [--json]` | List assignable permissions |
| `mint platform admin role create <name> --slug SLUG --permissions LIST [--description\|-d D] [--color HEX] [--project-scope all\|assigned] [--plugin-access SPEC] [--json]` | Create a role (`--permissions` is comma-separated or `all`; `--plugin-access` is `all`, a comma list, or a JSON list) |
| `mint platform admin role update <role-id> [--name N] [--description\|-d D] [--color HEX] [--project-scope all\|assigned] [--plugin-access SPEC] [--permissions LIST] [--default\|--not-default] [--json]` | Update a role |
| `mint platform admin role delete <role-id> [--yes\|-y]` | Delete a role |

### `mint platform debug`

Read-only diagnostics.

| Command | Purpose |
|---------|---------|
| `mint platform debug summary [--check-updates] [--json]` | Diagnostics summary; `--check-updates` also queries GitHub-backed update checks |
| `mint platform debug health [--json]` | Public health endpoint |
| `mint platform debug system [--json]` | Admin system snapshot |
| `mint platform debug config [--json]` | Safe admin configuration |
| `mint platform debug logs [--limit\|-n N] [--offset N] [--level L] [--search Q] [--plugin ID] [--json]` | Parsed platform logs (default 50 entries) |
| `mint platform debug updates [--check] [--json]` | Update diagnostics; `--check` queries configured update sources |

### `mint platform update`

| Command | Purpose |
|---------|---------|
| `mint platform update check [--json]` | Check platform and plugin update sources |
| `mint platform update apply [--yes\|-y] [--pair-all] [--disable PACKAGE ...] [--json]` | Apply the latest platform update (admin) |

When installed plugins do not support the new platform SDK, the platform answers 409 `update.pairing_required`, and `update apply` asks you to confirm the plugin changes. With `--yes` or `--json`, confirm them with flags:

- `--pair-all` accepts every plugin release that the platform pairs with the update.
- `--disable PACKAGE` accepts that the update disables this plugin. Give one flag for each plugin.

A plugin that you do not name is never disabled: the command exits 1 and names the missing flags. See [Plugins that exclude the new platform version](/admin/updates#plugins-that-exclude-the-new-platform-version).

### `mint libraries`

Manages the [library store](/admin/libraries) of read-only reference files. It is a top-level command.

- Without `--local`, it talks to the platform of `--url` or the default host. The signed-in user needs `platform.configure`.
- With `--local`, it uses the standalone store in `~/.mint/libraries`, for plugin development.

A library reference is `publisher/name`. The only publisher is `platform`.

| Command | Purpose |
|---------|---------|
| `mint libraries import <source> --name NAME --version VERSION [--media-type T] [--license TEXT] [--meta JSON] [--promote] [--local]` | Import a file or directory as a new version. On the platform, `<source>` is a path inside `incoming/` of `libraries.path` (for example `incoming/gnps.mgf`), and the command waits for the hash. With `--local`, it is a local path. `--promote` makes the version the latest |
| `mint libraries list [--local] [--json]` | List the libraries with the version, state, latest marker and size |
| `mint libraries promote <ref> <version> [--local]` | Make a published version the latest. The platform hashes it again first |
| `mint libraries retire <ref> <version> [--local]` | Retire a version that is not the latest |
| `mint libraries restore <ref> <version> [--local]` | Publish a retired version again |
| `mint libraries delete <ref> <version> [--yes\|-y] [--local]` | Delete a retired version and its files. Asks for confirmation without `--yes` |

An error prints `Error: <code>: <message>` and exits with code 1. The codes are `library.*`; see [Libraries -> Errors](/admin/libraries#errors).

## Run commands

`mint daemon` runs the plugin of the current project in the foreground, for Docker, Linux or WSL. The MINT platform has its own launcher, `mint-platform serve` (see [Install on Linux](/admin/install-direct)). `mint platform daemon` does not exist.

```bash
mint daemon [--host HOST] [--port|-p N] [--app TARGET] [--forwarded-allow-ips IPS] [--cpu-slots N] [--max-concurrent-per-user N]
mint -C DIR daemon     # serve another project directory
```

| Flag | Effect |
|------|--------|
| `--host` | Bind host (default `0.0.0.0`) |
| `--port`, `-p` | Bind port (default `8001`) |
| `--app` | Uvicorn application factory target (default `mint_sdk.app:create_app`) |
| `--forwarded-allow-ips` | Proxy IPs or CIDRs that Uvicorn trusts (default `127.0.0.1,::1`) |
| `--cpu-slots` | Global CPU concurrency slots (sets `MINT_JOB_CPU_SLOTS`) |
| `--max-concurrent-per-user` | Concurrent jobs per user across sessions (sets `MINT_JOB_MAX_CONCURRENT_PER_USER`) |

It needs `mint-sdk[server]`. In a hand-written command, Dockerfile or process unit, use `mint_sdk.app:create_app --factory`. `mint_sdk.runtime:create_plugin_app` and plugin-written factories do not work.

## Develop commands

These act on a plugin project. Run them from the plugin directory, or use `mint -C DIR <command>` for another directory. None of them takes a path argument.

### `mint init`

Scaffold a new plugin project.

```bash
mint init [DIRECTORY] [flags]
```

| Flag | Effect |
|------|--------|
| `DIRECTORY` (positional) | Target directory (default `.`) |
| `--name`, `-n` | Plugin name (human-readable) |
| `--description`, `-d` | One-line description |
| `--type`, `-t` | Plugin type: `analysis`, `experiment-design`, `workflow`, `static`, or `full` (`writes` of the generated `Metadata`) |
| `--mode` | Plugin mode: `generated` (SDK-managed UI + `@job`) or `standard` (FastAPI-style `@endpoint` + Vue workspace) |
| `--no-install` | Skip `uv sync` and the frontend package install (`vp install`) |
| `--no-git` | Skip `git init` |
| `--force` | Allow non-empty target directory |
| `--ai-assistant` | Comma-separated AI-assistant config files to scaffold (`claude,codex,cursor,windsurf,none`) |
| `--yes`, `-y` | Non-interactive — accept all defaults (safe for CI/scripts) |
| `--author` | Override `git config user.name` |
| `--email` | Override `git config user.email` |

Without `--yes`, missing fields are prompted interactively. With `--yes`, the AI-assistant file defaults to `claude`, which creates `CLAUDE.md`. If `mint doctor` says that file is missing current SDK guidance, run `mint doctor --fix` once to refresh it. `--ai-assistant none` skips assistant files, but the current `mint doctor` check still expects one of those files; run `mint doctor --fix` if you later want a passing doctor report.

The standard scaffold includes a read-only `@tool` example (`double_value`) and an `experiment.analysis` panel "Summary" (a `kv` section and a link to the plugin page), each with a test; see [MCP tools](/sdk/recipes/mcp-tools). The scaffold declares a `Metadata` subclass with `@plugin` and sets `title` from the plugin name. It sets `requires-python = ">=3.14"`, and `[tool.ruff]` keeps only `target-version = "py314"` and `line-length = 100`: `mint lint` applies the SDK ruff preset. Ruff is in the dev group. There is no `[tool.mint.lint]` table, because every default applies. A new plugin passes `mint lint` with no finding and no baseline.

SDK pin: `mint init` pins the newer of the latest stable SDK and the SDK of the running CLI. The `mint-sdk` floor of the dependencies and of the dev group is that release, with the ceiling `<2.0`; a @MINT_VERSION@ CLI writes `mint-sdk>=@MINT_VERSION@,<2.0`. The frontend pin of `@morscherlab/mint-sdk` is the same release, exact.

Standard frontend: the frontend uses pnpm and Vite+. `frontend/package.json` has `"packageManager": "pnpm@12.21.0"`, the `vite-plus` dependency, and the scripts `dev` (`vp dev`), `build` (`vue-tsc --noEmit && vp build`), `type-check`, `test` (`vp test run`), `fmt` (`vp fmt`), `fmt:check` and `lint` (`uv run mint -C .. lint`). `frontend/pnpm-workspace.yaml` exempts `@morscherlab/*` from the pnpm `minimumReleaseAge`, so pnpm locks a new frontend SDK on the day that uv locks the new `mint-sdk`. `vite.config.ts` imports `defineConfig` from `vite-plus`, holds the `test`, `fmt` and `lint` blocks, and proxies `/api` to `MINT_DEV_BACKEND_URL`. Tailwind runs through `@tailwindcss/vite`. The scaffold has no `postcss.config.js`, `vitest.config.ts` or `tsconfig.node.json`, and its `index.html` loads the Geist fonts. `.gitignore` ignores neither `uv.lock` nor the frontend lockfile: commit both.

The standard frontend is a sidebar workspace. `App.vue` renders `PluginWorkspaceView` with the inputs in `sidebar.controls` and the result in the main area (`main: 'plain'`). The state and the run action are in the Pinia store `src/stores/analysis.ts`, and `src/views/WorkspaceView.vue` shows the result. A plugin type that writes experiments (`experiment-design`, `full`, `workflow`) gets `experiment: true` in the workspace spec, which shows the experiment chip in the top bar. `main.ts` installs Pinia and Vue Router and imports each SDK component by name; it does not call `app.use(MINTSdk)`. See [Adding a frontend](/sdk/tutorials/adding-a-frontend).

CI: the generated CI and release workflows use Python 3.14. They set up Vite+ with `voidzero-dev/setup-vp@v1.22.0` (`working-directory: frontend`, `run-install: false`, `cache: true`), which also sets up Node.js and pnpm. The frontend step runs `vp install --frozen-lockfile`, then `vp run` type-check, fmt:check, test and build. Then the workflows run `uv sync`, `mint doctor --strict`, `mint sdk generate --check`, `mint lint` (step `Lint`) and the tests. CI also builds the `.mint` bundle (`uv run mint build --output-dir dist/`) on every push and pull request to `main`.

`mint init --force` stops with exit 1 and writes nothing when the directory has a frontend with a bun or npm lockfile, or a frontend made before 1.6. Run [`mint migrate`](#mint-migrate) there.

`--mode generated` accepts only `--type analysis`. To choose a mode, see [Plugin types](/sdk/concepts/plugin-types#_1-choose-a-development-mode).

### `mint dev`

Run the plugin in dev mode with hot reload.

```bash
mint dev [flags]
mint dev <subcommand>     # see logs, below
```

| Flag | Effect |
|------|--------|
| `--port`, `-p` | Backend server port (default `8003`) |
| `--host` | Backend host (default `127.0.0.1`) |
| `--no-frontend` | Skip the Vite dev server |
| `--platform` | Also start a local platform process and configure dev proxy |
| `--platform-dir` | Path to platform directory (otherwise auto-detected) |
| `--prefix` | Override the routes prefix for the dev proxy |

`mint dev` runs the frontend dev server with `vp run dev` and gives it `MINT_DEV_BACKEND_URL`, the backend URL in use. The scaffold proxies `/api` to that URL; a plugin made before 1.6 proxies to `:8003` until you change its `vite.config.ts`. The printed frontend URL includes the Vite `base` path.

`mint dev` passes the plugin `title` to the platform dev proxy, and refreshes it in an existing `config.dev.toml` entry. On startup `mint dev` lists the plugin's MCP tools under their published names and prints a `mint mcp call` command to try one.

Stop with **Ctrl+C**.

#### `mint dev logs`

View dev server logs.

```bash
mint dev logs [PROCESS] [flags]
```

| Flag | Effect |
|------|--------|
| `PROCESS` (positional) | Filter by process name, such as `backend`, `frontend`, or `platform` |
| `--follow`, `-f` | Stream new lines as they appear |
| `--lines`, `-n` | Show the last N lines (default 50) |
| `--list` | List the available log streams |
| `--clear` | Remove the log files |

### `mint build`

Package the plugin into a `.mint` bundle.

```bash
mint build [flags]
```

| Flag | Effect |
|------|--------|
| `--no-frontend` | Skip the frontend build step |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in) |
| `--output-dir` | Output directory (default `dist`) |
| `--include-wheel PATH` | Vendor an existing extra `.whl`; repeat for multiple wheels |

Output: `dist/<name>-<version>.mint`.

`mint build` installs the frontend with `vp install --frozen-lockfile` when the frontend, or the workspace root that contains it, has a lockfile of the selected manager, else with `vp install`. Then it runs `vp run build`.

From SDK 1.6, `mint build` stops when the wheel leaves out a file under the `skills/` directory next to a `mint.plugins` module. See [MCP skills](/sdk/recipes/mcp-skills).

### `mint doctor`

Validate the plugin's project structure.

```bash
mint doctor [GROUP...] [flags]
mint -C DIR doctor
```

| Flag | Effect |
|------|--------|
| `--only GROUP...` | Run only the named check groups: `deps` (platform-core dependency alignment), `db` (development database against the declared models) and `r` (R bridge environment). Example: `mint doctor --only deps db` |
| `--database-url URL` | Explicit development database URL for the `db` group |
| `--fix` | Apply safe automatic fixes, including the SDK 1.4 rewrites (see below) |
| `--explain` | Show why each failed check matters |
| `--strict` | Exit non-zero when doctor reports warnings |
| `--json` | Output machine-readable check results |

There is no `--deps`, `--r` or `mint db check`. Use `--only deps`, `--only r` and `mint doctor --only db --database-url URL`.

The default run checks the project structure: `pyproject.toml`, the `mint.plugins` entry point, the source module, the `Plugin` class, the routes prefix, tests, AI instruction files, the generated contract and the project layout. It boots the plugin once (lifespan and safe GET probes). It also does these checks:

- checks the SDK dependency range `>=<floor>,<ceiling>`. A `<1.5` ceiling of a 1.4 plugin still passes. `mint doctor --fix` writes `<2.0`. See [Declare compatibility deliberately](/sdk/operations/versioning#declare-compatibility-deliberately);
- checks the SDK version alignment: the Python and frontend SDK pins and their lockfiles must name the same release (`mint sdk update` aligns them);
- checks `@tool` / `@prompt` / `@resource` names, docstrings, signatures and schemas (the platform publishes none of a plugin's declarations while any is invalid);
- from SDK 1.6, checks each skill in `Metadata.skills` ("MCP skills") with the rules of the platform, and warns about files that Claude does not load and tool names that nobody publishes. See [MCP skills](/sdk/recipes/mcp-skills#checks-before-you-ship);
- fails a plugin that still defines `get_migrations_package()`. See [Migrations](/sdk/api/migrations#migrationspec-and-legacybaseline);
- checks the page metadata (icons, stable page IDs and coverage of the frontend routes) and the platform-owned dependency constraints;
- reports an error when a plugin on `mint-sdk>=1.3` has a `requires-python` that admits Python older than 3.14 or excludes 3.14 (a `mint-sdk` dependency limited by a `python_version >= '3.14'` marker is exempt);
- reports a 1.3 author API as `SDK 1.4 manual changes` (an error breaks the plugin on SDK 1.4; a warning matches a removed method by name only) and the mechanical rewrites as `SDK 1.4 rewrites`. `--fix` applies the rewrites: `@mint_plugin` to `Metadata` and `@plugin`, the persistence helpers to `self.design` and `self.artifacts`, `@mcp_tool` to `@tool`, the old job, event, health and test names, and the renamed modules. The [migration guide](/sdk/operations/migrate-1.3-to-1.4) has the full table;
- checks the frontend toolchain ("Frontend toolchain") against the `mint init` template and warns about these points: a `vite.config.js` or `vite.config.d.ts` next to `vite.config.ts` (Vite loads the `.js` file first, so edits to the `.ts` file have no effect), a `*.tsbuildinfo` file, a PostCSS config, the `postcss`, `@tailwindcss/postcss` or `autoprefixer` package, a `tsconfig.node.json` (it makes `vue-tsc -b` emit `vite.config.js`), and a `vite`, `vitest`, `vue-tsc`, `typescript` or `@vitejs/plugin-vue` major version below the template. `--fix` deletes the build outputs. It deletes the PostCSS config only when `vite.config.ts` imports and calls `@tailwindcss/vite` and the config names no plugin other than Tailwind and `autoprefixer`. Delete `tsconfig.node.json` yourself and build with `vue-tsc --noEmit && vite build`;
- reports removed and deprecated frontend APIs with their replacements, including removed subpath imports, merged components and unified props. `mint docs deprecated-apis` lists them all;
- "Deprecated SDK APIs": a warning for each import of a deprecated frontend SDK export (such as `useApi`), with the replacement. A plugin's own name or a property access is not matched;
- "Frontend chart dependency": a warning when the plugin renders `PlotlyChart`, `GeneratedPlotlyResult`, `GeneratedResultRenderer`, `GeneratedPluginView`, `InstrumentStatusPanels` or `PanelSections` and does not declare `plotly.js-dist-min`. See [Charts need Plotly](/sdk/frontend/#charts-need-plotly);
- "Frontend SDK registration": a warning for `app.use(MINTSdk)`, and an error for an SDK component that a template uses without an import when no global install exists;
- "Released revisions": an error for each file of the `Metadata.database` migration package that the latest git tag has and the working tree changed or removed. New files pass. Without a tag, the check is skipped. See [Database revisions are append-only](/sdk/operations/versioning#database-revisions-are-append-only);
- "Panels": a warning for a panel id of the latest git tag that is gone, panel `experiment_types` outside `Metadata.experiment_types`, and an `experiment.design` panel of a plugin without `"design"` in `writes`. The hint "Analysis launch offer" suggests `analysis_offer = False` for an analysis plugin with no page, no frontend and no `@job`;
- "Global vp": an error when `vp` is not on `PATH`, prints no version or is older than 1.5.1; a warning when the global `vp` and the locked `vite-plus` of the frontend differ (names `vp upgrade <version>`);
- "Package manager": shows the manager that `vp` runs and the evidence (field, workspace file or lockfile). A plugin that is not on pnpm and Vite+ gets the warning "not migrated: run `mint migrate`". A conflict is a warning: the declared `packageManager` or `devEngines.packageManager` disagrees with the lockfile, the frontend has two lockfiles, or the field names a manager other than bun, pnpm or npm;
- "Lockfile tracking": a warning when `.gitignore` ignores `uv.lock` while `pnpm-lock.yaml` is tracked;
- "SDK version alignment": names the lockfile in use (`bun.lock`, `pnpm-lock.yaml` or `package-lock.json`). A missing lockfile that `.gitignore` ignores is a warning, a missing tracked lockfile an error;
- "Design rules": runs the design rules of [`mint lint`](#mint-lint) and warns with the count of new findings. It also names a missing `mint lint` setup (ruff not a dev dependency, no frontend `lint` script that runs `mint lint`, no workflow that runs it) and points to `mint migrate`;
- "MCP skills" (see above) and a `Design(live=True)` whose schema root is not `"type": "object"` with `properties` (error);
- fails a `[project.entry-points."mld.plugins"]` table: the platform discovers only `mint.plugins`;
- does not report names removed before 1.2. Upgrade such a plugin to 1.2 first.

`--strict` counts every warning except these: "not migrated" of "Package manager", the version warning of "Global vp", "Lockfile tracking", a missing lockfile that `.gitignore` ignores, a missing `mint lint` setup without findings, and the "Analysis launch offer" hint. Such a warning has `"strict": false` in `mint doctor --json`.

`mint sdk update` and `mint doctor --fix` also remove the packages that `mint-sdk` supplies: a `typer`, `uvicorn` or `httpx2` in a dev group becomes `mint-sdk[cli,server]`. Run `mint doctor --strict` in CI.

The deprecated-API check flags deprecated Python and frontend APIs in plugin sources and in agent docs such as `CLAUDE.md` and `AGENTS.md`.

### `mint lint`

The lint command of a plugin. It runs design rules, ruff and oxlint, and exits 1 when one of them has a new finding or fails.

```bash
mint lint [PATHS...] [flags]
```

| Flag | Effect |
|------|--------|
| `PATHS` (positional) | Files or directories to lint (default: the project) |
| `--only design\|python\|js` | Run only this part (repeatable): design rules, python (ruff), js (oxlint) |
| `--format text\|json\|github` | Report format (default `text`) |
| `--write-baseline` | Write the current findings of the selected parts to `mint-lint-baseline.json` |
| `--no-baseline` | Report every finding, also those that the baseline accepts. Cannot be combined with `--write-baseline` (exit 2) |
| `--explain RULE` | Print why a design rule exists and exit |

What each part checks:

- **Design rules** over `.css` files, the `<style>`, `<template>` and `<script>` blocks of `.vue` files, UI text in `.ts` files and pytest names.
- **ruff** with the SDK preset, under the project's own `[tool.ruff]`. A project `select` and `per-file-ignores` add to the preset. `mint lint` runs the ruff of the project `.venv` first, then the one next to the running `mint`, then the one on `PATH`.
- **oxlint** through the project's `vp lint`, with only the SDK preset rules (`no-explicit-any`, `ban-ts-comment`, `no-debugger`, `no-console`, `no-warning-comments`, and `vitest/valid-title` with titles that start with "should").

A missing tool, a tool that crashes and output that cannot be read are errors, never a pass.

Design rules, all on by default except `raw-control`:

| Group | Rules |
|---|---|
| Tokens and style | `literal-colour`, `colour-fallback`, `undefined-var`, `hover-motion`, `gradient`, `blur`, `uppercase`, `font-family`, `transition-duration`, `transition-all`, `radius-token`, `min-font-size`, `font-size-token`, `z-index-token`, `shadow-token`, `important`, `static-style`, `retired-token` |
| Layout | `workspace-sidebar` (a plugin workspace with `sidebar: false`), `experiment-field` (an experiment picked with a select instead of the top-bar chip), `nested-card` (a card inside a card), `one-primary-action` (two primary buttons in one action area), `wizard-in-modal` (a `StepWizard` in a `BaseModal` that has its own footer) |
| Design system | `button-order`, `destructive-variant`, `confirm-label`, `toggle-in-form`, `status-pill-marker`, `icon-button-label`, `glyph-icon`, `icon-library`, `sentence-case`, `ellipsis` |
| Controls and code | `tabindex-native`, `raw-control` (off), `script-setup-ts`, `no-match-text`, `test-name` |

A file that cannot be parsed, and a `<style>` or `<template>` block in a language other than CSS or HTML, is a `parse-error` finding. Run `mint lint --explain <rule>` for the reason of a rule.

**Exceptions.** Put a comment with the rule and a reason above the line: `/* mint-lint-ignore <rule>: <reason> */` in CSS and script, `<!-- mint-lint-ignore <rule>: <reason> -->` in a template. A CSS ignore directly above a declaration covers all lines of that declaration. An ignore without a reason, with an unknown rule or that suppresses nothing is a finding.

**Baseline.** `--write-baseline` writes the current findings to `mint-lint-baseline.json`. Later runs fail only on new findings and report entries that no longer match as stale. Commit the baseline. After you fix accepted findings, run `mint lint --write-baseline` again. A run on paths judges and writes only the entries of those paths.

**Configuration** in `pyproject.toml`:

```toml
[tool.mint.lint]
tokens = ["frontend/src/styles/tokens.css"]   # token files besides the SDK variables.css
include = ["frontend/src/**"]                  # default: the whole project
exclude = ["frontend/src/legacy/**"]           # added to the default excludes
js-root = "frontend"                           # where oxlint runs (default: the plugin frontend)

[tool.mint.lint.rules]
raw-control = true
font-size-token = { exclude = ["frontend/src/legacy/**"] }

[tool.mint.lint.oxlint]
plugins = ["vue"]
rules = { "no-alert" = "error" }
ignore = ["src/legacy/**"]
```

Without a token file (none in `[tool.mint.lint]` and no installed `@morscherlab/mint-sdk`), `undefined-var` reports one finding on `pyproject.toml` when a stylesheet uses a `var()`. Install the frontend dependencies first.

The frontend `lint` script of the scaffold runs `uv run mint -C .. lint`, and the `Lint` step of the generated workflows runs `uv run mint lint`. Both need mint-sdk 1.6 or later in `uv.lock`.

### `mint migrate`

Move a standard plugin frontend from bun or npm to pnpm and Vite+, and add the `mint lint` setup and baseline.

```bash
mint migrate [--dry-run] [--force]
```

| Flag | Effect |
|------|--------|
| `--dry-run` | Show the changes without writing files. Does not need `vp` |
| `--force` | Migrate even when the git tree has uncommitted or untracked changes |

The command writes the `packageManager` field, changes the `vite` and `vitest` commands of the scripts to `vp`, adds the `lint`, `fmt` and `fmt:check` scripts and the Vite+ dependencies, writes `frontend/pnpm-workspace.yaml`, imports `defineConfig` from `vite-plus`, removes `bun.lock` or `package-lock.json` and rewrites the CI steps that `mint init` generated. It adds the `mint lint` setup where it is absent: ruff in the dev group, the frontend `lint` script, `uv run mint lint` in place of each `uv run ruff check .` line of the workflows, and a `## Lint` section in the agent instructions. After `vp install`, it locks the frontend SDK release that `uv.lock` holds and runs the "SDK version alignment" check. Then it formats the sources with `vp fmt`, runs type-check, test, lint, fmt:check and build with `vp run`, and runs `mint lint`. When `mint lint` reports findings, it writes `mint-lint-baseline.json`.

A failed step other than lint restores every file and the old `node_modules`, which wait in `.frontend-before-mint-migrate/` until every step passes. A second run changes nothing. A plugin that already uses pnpm and Vite+ gets only the lint setup and the baseline. The command reports, and does not edit, Dockerfiles, shell scripts, hand-written workflows and other files that still name bun, and a `.gitignore` line that ignores `uv.lock`. When `uv.lock` locks a `mint-sdk` older than 1.6, it does not run the frontend `lint` script and names `mint sdk update --version 1.6.0`. Commit `frontend/pnpm-lock.yaml` and `mint-lint-baseline.json`. The steps for a whole plugin are in [Migrate from 1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6#run-mint-migrate).

### `mint info`

Print the plugin's name, version, entry point, routes prefix, plugin type, SDK requirement and jobs.

```bash
mint info [--json]
```

### `mint docs`

Browse SDK reference documentation.

```bash
mint docs [path...] [--json] [--no-cache] [--clear-cache]
```

`path...` is a series of positional segments. The first segment is a section: `cli`, `python`, `frontend`, `contract`, `frontend-api`, `frontend-sidebar`, `deprecated-apis` or `r-bridge`. The next segments are a category and an item, such as `frontend components`. With no path, prints the docs index. `mint docs contract` prints local endpoint methods/paths, generated client call shapes, inferred path/query params, request/response types, and the frontend helper imports for the current plugin.

### `mint add`

Add common plugin pieces to an existing project.

| Subcommand | Purpose |
|------------|---------|
| `mint add setting <name> [--type string\|number\|integer\|boolean] [--default VALUE] [--description TEXT] [--required] [--generate]` | Add a typed plugin setting |
| `mint add endpoint <name> [--route PATH] [--method get\|post\|put\|patch\|delete] [--router NAME] [--create-router] [--request-model NAME] [--response-model NAME] [--generate]` | Add a FastAPI endpoint |
| `mint add router <name> [--prefix PATH] [--tag TAG]` | Add and register a router |
| `mint add migration <name> [--autogenerate] [--database-url URL] ` | Add a plugin schema migration. A plugin without `Metadata.database` gets the declaration `database = MigrationSpec(package="<package>.db_revisions")`, an empty `db_revisions` package and a first revision ([details](#developer-database-commands)) |
| `mint add schema <name> [--file requests\|responses] [--field name:type] [--generate]` | Add a Pydantic schema |
| `mint add service <name> [--method NAME]` | Add a service module |
| `mint add artifact` | Add a local artifact helper and `/artifacts` router |
| `mint add hook <before-save\|after-save\|status-change>` | Add a lifecycle hook |
| `mint add frontend-page <name>` | Add and register a Vue view |
| `mint add frontend-composable <name> [--endpoint PATH]` | Add a Vue composable wrapper around the generated plugin client |
| `mint add r-analysis <name> [--script PATH] [--generate] [--page]` | Add an R-backed analysis endpoint scaffold |

`mint add migration` checks for SQLAlchemy and Alembic before it writes a file, and names `uv add "mint-sdk[local-db]..."` when they are missing.

There is no `mint add job` command. Use `mint init --mode generated` for the current job scaffold, or add `@job` methods by hand.

### `mint mcp`

Call one of the plugin's MCP tools on the running `mint dev` backend.

```bash
mint mcp call <TOOL> [--json args.json] [--url URL]
```

| Flag | Effect |
|------|--------|
| `TOOL` (positional) | The `@tool` method name, such as `double_value` (not the published `<plugin>_<name>`) |
| `--json` | JSON file with the tool arguments (default `{}`) |
| `--url` | Base URL of the running `mint dev` backend (default `http://127.0.0.1:8003`) |

Prints the tool's result as JSON, or `Error: ...` and a non-zero exit. The dev server runs standalone, so the tool sees the standalone actor, and `ctx.design` and `ctx.artifacts` raise `PluginException`. See [MCP tools](/sdk/recipes/mcp-tools).

### `mint verify`

Build a plugin and exercise the real install/restart/load path in a disposable verification environment.

```bash
mint verify [flags]
```

| Flag | Effect |
|------|--------|
| `--image` | Platform image to test instead of a release channel |
| `--channel stable\|beta` | Platform release channel to test (default `stable`) |
| `--force` | Override declared plugin compatibility conflicts |
| `--no-frontend` | Skip frontend build |
| `--vendor-deps` | Vendor dependency wheels into the bundle |
| `--include-wheel PATH` | Vendor an existing extra `.whl` (repeatable) |
| `--bundle` | Reuse an existing `.mint` bundle |
| `--timeout` | Seconds to wait for setup, restart, and plugin load (default 300) |
| `--keep` | Keep the verification environment for inspection |

### `mint deploy`

Build and deploy the plugin to a running platform, then check that it loaded and is enabled.

```bash
mint deploy [--url URL] [flags]
```

| Flag | Effect |
|------|--------|
| `--url`, `--to` | Platform to deploy to: a URL, or part of a host name from `mint platform auth hosts`. Same as `mint --url`. The command uses that host's stored credential before `MINT_TOKEN`. Default: `MINT_URL`, then the default host. `--to` is the older name |
| `--force` | Override dependency/compatibility conflicts |
| `--restart` / `--no-restart` | Restart the platform after upload (default `--restart`) |
| `--no-frontend` | Skip frontend build |
| `--vendor-deps` | Vendor dependency wheels into the bundle |
| `--include-wheel PATH` | Vendor an existing extra `.whl` (repeatable) |
| `--bundle` | Upload an existing `.mint` bundle without rebuilding |
| `--timeout` | Seconds for the restart and the plugin load together (default 180); one budget, not per phase |
| `--json` | Output machine-readable results |
| `--allow-dirty` | Build even when the git tree has uncommitted or untracked changes |

With `--restart`, deploy confirms the restart by the platform's `boot_id` from `GET /api/health`: it waits for a new `boot_id`, then for the plugin to load. Any loaded version counts; if it differs from the version in the bundle's `manifest.json`, deploy prints a warning with both versions and still succeeds. Against a platform older than 1.2.9, which reports no `boot_id`, it waits for health and then for the bundle's version to load.

After the load, deploy reads the plugin entry. It exits 1 when the platform disabled the plugin: `enabled` is false, a `migration_error` is set, or the dependency lock disabled it. The message gives the error text and the reason of the dependency lock.

Upload and restart failures print `Error: ...` (or a JSON failure with `--json`) and exit non-zero. If the platform refuses the restart, for example with 403 for an account without `platform.configure`, the message says the plugin is installed but not running.

## Develop / SDK sub-app

The `sdk` sub-app manages the plugin's SDK pin.

### `mint sdk link`

Link to a local SDK checkout for editable development.

```bash
mint sdk link [--sdk-path PATH]
```

`mint sdk link` and `mint sdk unlink` call `bun link` or `pnpm link`, not `vp`. On a pnpm plugin, `link` saves `package.json`, `pnpm-workspace.yaml` and `pnpm-lock.yaml`, and `unlink` writes back each file that did not change after the link. From a `pnpm-workspace.yaml` that changed after the link, it removes only the SDK `link:` override and names the other changed files. When an SDK override is left, `unlink` stops with exit 1 and names the file that holds the saved copies. Run `mint sdk unlink` from the platform checkout that ran `mint sdk link`.

### `mint sdk unlink`

Restore the published SDK versions.

```bash
mint sdk unlink
```

### `mint sdk update`

Refresh SDK pins.

```bash
mint sdk update [--scope patch|minor|major] [--channel stable|beta]
                [--version VERSION] [--dry-run] [--no-sync] [--verify]
```

| Flag | Effect |
|------|--------|
| `--scope patch\|minor\|major` | How far to update (default `patch`). `--scope minor` alone still fails on a lower minor cap |
| `--channel stable\|beta` | Release channel (default `stable`) |
| `--version X` | Select one exact release. The Python and frontend lockfiles resolve to the same release |
| `--dry-run` | Show the changes without writing files |
| `--no-sync` | Skip the installs and the lock check |
| `--verify` | Run Docker verification against the stable or beta channel afterwards |

Selection:

- The command takes the newest candidate, then checks it against the Python upper bounds, the exclusions and `requires_mint`. An excluded candidate fails: the command does not fall back to an older release.
- Without `--version`, the Python floor stays. When new code needs newer APIs, raise the floor yourself.

Changes to `pyproject.toml`:

- `--version X` raises every `mint-sdk` floor below `X` to `>=X`: dependencies, optional dependencies and dependency groups. The `requires_mint` of the bundle follows.
- On a newer supported minor, the command moves the ceiling to `<2.0` (`<next-minor` for a target before 1.4) and widens a `requires_mint` that excludes the target.
- For a target of 1.3 or later, the command raises `[project].requires-python` to `>=3.14`. It only raises: upper bounds, exclusions, `~=` and `==` clauses and a stricter floor stay. It adds a missing value. It refuses when the result would exclude 3.14, as with `<3.14` or `==3.12.*`.

Other behavior:

- The frontend install runs through `vp`. When pnpm refuses the target release because of `minimumReleaseAge`, the command stops with exit 1 and names the `minimumReleaseAgeExclude` entry of `frontend/pnpm-workspace.yaml`.
- The command never changes or creates an AI instructions file (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`). It prints a notice only when `mint doctor --fix` would change the file.

See [Upgrading the SDK](/sdk/operations/upgrading).

### `mint sdk generate`

Generate the frontend plugin contract and typed client from backend routes and Pydantic schemas.

```bash
mint sdk generate [--check] [--json] [--output DIR]
```

`--check` reports drift and writes no file; use it in CI. `--output` is relative to the plugin root.

Generated frontend plugins get:

- `frontend/src/generated/mint-plugin.contract.json`
- `frontend/src/generated/mint-plugin.ts`

For the exports of the TypeScript file, see [Generated plugin clients](/sdk/frontend/composables#generated-plugin-clients). `useSettings()` is present only when `Metadata.settings` is set. An `@endpoint` without `operation_id` gets the method name in lowerCamel case (`get_layout` becomes `getLayout`).

## Developer database commands

`mint db current` reads the migration state of an explicit development database. It does not apply, stamp or downgrade migrations. Other commands do the other database tasks:

| Command | Behavior |
|---|---|
| `mint db current --database-url URL` | Report migration history and status without applying changes |
| `mint doctor --only db --database-url URL` | Compare the database to the declared models; non-zero exit on differences |
| `mint add migration NAME --autogenerate --database-url URL` | Draft a revision from the model differences in editable source |
| `mint add migration NAME` | Create a blank Alembic revision |

`mint add migration NAME` without `--autogenerate` follows the plugin's declaration. A plugin with `Metadata.database` gets a blank Alembic revision. A plugin with no `database` gets `database = MigrationSpec(package="<package>.db_revisions")` in its `Metadata`, an empty `db_revisions` package and a first revision; no database is needed. Revision generation needs the database at the current migration head and a source migration package inside the project. SQLite inspection needs an existing file. Review every generated revision before release. The platform has its own commands for its revisions: `mint-platform db current|check|revision` in the platform checkout. See [migrations](/sdk/concepts/migrations).

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mint/credentials.json` | Stored tokens; see [`mint platform auth`](#mint-platform-auth) |
| `<plugin>/pyproject.toml` | Plugin dependencies, entry points, build config, `[tool.mint.lint]` |
| `<plugin>/mint-lint-baseline.json` | Accepted `mint lint` findings (written by `mint lint --write-baseline` and `mint migrate`; commit it) |
| `<plugin>/frontend/pnpm-workspace.yaml` | pnpm settings of the frontend, with the `minimumReleaseAgeExclude` entry for `@morscherlab/*` |
| `<workspace>/MINT/config.dev.toml` | Dev proxy mapping (created by `mint dev --platform`) |

## Notes

- The console entry point is `mint_sdk.cli_entry:main`. Do not import the CLI module in plugin code.
- For platform access from Python, use [`MINTClient`](/sdk/api/client). The CLI uses it too.
