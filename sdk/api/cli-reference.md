# CLI reference

Install `mint-sdk[cli]` for the `mint` CLI. This page documents the released **v@MINT_VERSION@** command surface. Run `mint <command> --help` for the complete options on your installed version. For tutorials and getting-started usage, see [`/sdk/tutorials/`](/sdk/tutorials/).

Source: [`mint_sdk/cli.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli.py) and [`mint_sdk/cli_commands/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli_commands).

## Install and choose the environment

```bash
uv tool install 'mint-sdk[cli]==@MINT_VERSION@'
mint --version
mint --help
```

Python 3.14 or later is required. The `[cli]` extra supplies Typer; the bare runtime
package does not guarantee a usable CLI. `mint init` creates a project dev
group with `[cli,server]`; after `uv sync`, prefer `uv run mint ...` inside the
project to use its selected SDK. The scaffold's runtime dependency stays plain
`mint-sdk`; CLI/server extras belong to its development environment. Database
plugins also need `[local-db]`.

| Requirement | Use it for |
|---|---|
| `mint-sdk` | Python SDK/runtime imports, such as `AnalysisPlugin` and `MINTClient` |
| `mint-sdk[cli]` | The `mint` commands, including `mint init` scaffolding; adds Typer and `httpx2` |
| `mint-sdk[cli,server]` | Plugin development with the CLI and Uvicorn; generated projects include this in their `dev` dependency group |


## A complete development loop

```bash
mint init lab-qc --mode standard --type analysis --ai-assistant codex --yes
cd lab-qc
uv run mint dev
# Stop the dev server with Ctrl+C before continuing.
uv run mint docs contract .
uv run mint sdk generate
uv run mint sdk generate --check
uv run mint doctor --strict
uv run pytest
uv run mint build .
uv run mint verify .
```

`verify` requires Docker and exercises installation/restart/plugin loading in a
disposable platform. `deploy` and `plugin upload` instead change a running
platform. Use [the deployment guide](/sdk/operations/deploying) for that step.
For generated UI choose `--mode generated --type analysis`. Other types require
standard mode.

## Top-level

```
mint [--version] [--help] <command>
```

| Flag | Effect |
|------|--------|
| `--version`, `-V` | Print the SDK version and exit |
| `--install-completion` | Install shell completion for the current shell |
| `--show-completion` | Print the shell completion script |
| `--help` | Show top-level help |

## Platform commands

These talk to a running platform. Authenticate first with `mint auth login`. Every group below is registered twice: at the top level (`mint auth ...`) and under `mint platform` (`mint platform auth ...`). `mint platform restart` exists only under `mint platform`.

### `mint status`

```bash
mint status            # same as: mint platform status
```

Prints the configured host (`MINT_URL`, or the stored default), the stored username (or "Not logged in"), whether the platform is reachable, the loaded plugins with their versions, whether the token is valid, and the credential in use: its type (session or access token), read-only state, expiry and source (`MINT_TOKEN` or the stored credential).

### `mint platform restart`

```bash
mint platform restart [--yes|-y] [--json]
```

Asks the configured platform to restart its server process (`POST /api/admin/restart`). Prompts for confirmation unless `--yes`. Exits non-zero when the platform reports failure.

### `mint auth`

Tokens are stored per host in `~/.config/mint/credentials.json`, or `$XDG_CONFIG_HOME/mint/credentials.json` when `XDG_CONFIG_HOME` is set. The file is written with mode `0600`.

| Command | Purpose |
|---------|---------|
| `mint auth login [--url URL] [--read-only]` | Sign in with a device code: prints a code to type at `<externalUrl>/device` in a signed-in browser, where you approve the request and pick the token lifetime; the CLI then stores the personal access token it is granted. `--read-only` asks for a read-only token. A host without a scheme gets `https://` |
| `mint auth login --token [--url URL]` | Store an existing personal access token instead (prompted, or read from stdin) |
| `mint auth logout [--url URL]` | Revoke the stored personal access token on the platform and discard it (default: the current host). If the platform cannot be reached, the command says so and still discards the local copy; revoke the token in Profile |
| `mint auth status` | Print the host, user, role, the credential in use (type, read-only state, expiry, source) and whether the platform accepts it |
| `mint auth token create <name> [--days 30\|90\|365] [--read-only] [--json]` | Issue a personal access token (default lifetime 90 days) and print it once, with a `claude mcp add` command for the platform's `/mcp` endpoint |
| `mint auth token list [--json]` | List your personal access tokens by prefix, access, expiry and last use |
| `mint auth token revoke <token-id>` | Revoke one of your tokens (ID from `token list`) |

`mint auth token create` refuses to run under a personal access token, because a token cannot issue tokens. Run `mint auth login` again, or create the token in Profile. `--read-only` and `--token` do not combine. The browser opens only on a local terminal, not over SSH or without a display.

A personal access token works as `MINT_TOKEN` for the CLI and `MINTClient`, and as the Bearer token for MCP clients. `--read-only` limits the token to reads. See [AI Assistants and API Access](/guide/ai-and-api).

### `mint instruments`

```bash
mint instruments [NAME_OR_ID] [--all] [--json]     # also: mint platform instruments
```

Without an argument, lists instruments with their live status: state, sample, progress, ETA, unacknowledged alerts and time since the last report. An instrument without a report shows `(no report)`. With `NAME_OR_ID`, shows one instrument with its details and status. The name is matched first (case-insensitive, deactivated instruments included), then the ID. A name that matches more than one instrument is an error. `--all` includes deactivated instruments in the list. `--json` prints JSON. The command needs the `instruments.view` permission. Programmatic access: `MINTClient.instruments` ([REST client](/sdk/api/client#instruments)).

### `mint experiment`

| Command | Purpose |
|---------|---------|
| `mint experiment list [--status S] [--type T] [--project-id ID] [--search Q] [--mine] [--since YYYY-MM-DD] [--before YYYY-MM-DD] [--limit N] [--json]` | List experiments (default limit 20) |
| `mint experiment get <id> [--json]` | Show one experiment |
| `mint experiment create <name> [--type T] [--project-id ID] [--notes TEXT] [--json]` | Create an experiment (default type `custom`) |
| `mint experiment update <id> [--name N] [--status S] [--type T] [--project-id ID] [--notes TEXT] [--json]` | Update an experiment |
| `mint experiment data <id> [--format json\|csv] [--view raw\|tree\|summary]` | Print design data (defaults `json`, `raw`) |
| `mint experiment results <id> [--plugin ID] [--json]` | Print analysis results, optionally one plugin's |
| `mint experiment delete <id> [--yes\|-y]` | Delete an experiment immediately |
| `mint experiment types [--json]` | List experiment types |
| `mint experiment next-seq <experiment_type> [--json]` | Preview the next experiment code for a type |

### `mint project`

| Command | Purpose |
|---------|---------|
| `mint project list [--search Q] [--status active\|archived\|completed] [--mine] [--limit N] [--json]` | List projects (default limit 100) |
| `mint project get <id> [--json]` | Show one project |
| `mint project create <name> [--description\|-d D] [--json]` | Create a project |
| `mint project update <id> [--name N] [--description\|-d D] [--status active\|archived\|completed] [--json]` | Update project metadata |
| `mint project delete <id> [--yes\|-y]` | Delete a project |
| `mint project experiments <id> [--limit N] [--json]` | List experiments in a project (default limit 100) |
| `mint project members <id> [--json]` | List project members |

### `mint plugin`

Published plugins are `.mint` bundles. Install them with `mint plugin upload` or `mint plugin github install`. These commands call the running platform, which performs dependency checks, bundle extraction, settings writes, and restart reporting; they require the matching server-side plugin permissions. `--force` skips dependency conflict checks.

| Command | Purpose |
|---------|---------|
| `mint plugin list [--json]` | List loaded plugins and installed plugin packages |
| `mint plugin install <source> [--force] [--json]` | Install a package name, Git URL, or server-visible local path |
| `mint plugin upload <bundle.mint> [--force] [--json]` | Upload and install a `.mint` bundle from the local machine |
| `mint plugin upgrade <package-name> [--force] [--json]` | Upgrade through the platform plugin manager |
| `mint plugin update <package-name> [--force] [--json]` | Update from the package's registered GitHub source |
| `mint plugin uninstall <package-name> [--yes\|-y] [--json]` | Uninstall a plugin package |
| `mint plugin github install <repo-or-url> [--tag TAG] [--asset-pattern GLOB] [--force] [--json]` | Install a GitHub release asset (default pattern `*.mint`) |
| `mint plugin github releases <repo-or-url> [--asset-pattern GLOB] [--json]` | List releases and matching assets |
| `mint plugin config get <plugin-name>` | Print plugin settings and their revision |
| `mint plugin config set <plugin-name> --revision REV (--json-config JSON \| --file\|-f settings.json)` | Replace plugin settings |
| `mint plugin config update <plugin-name> (--json-config JSON \| --file\|-f settings.json)` | Shallow-patch plugin settings |
| `mint plugin index list [--json]` | List extra package index URLs |
| `mint plugin index set <url> [<url> ...] [--json]` | Replace extra package index URLs |
| `mint plugin runtime external <name> <target-url> [--prefix PATH] [--version LABEL] [--frontend-dir DIR] [--base-path PATH] [--rewrite\|--pass-through] [--json]` | Register an already running plugin server (prefix defaults to `/NAME`) |
| `mint plugin runtime docker <name> <image> [--prefix PATH] [--container-port N] [--host-port N] [--container-name NAME] [--platform-url URL] [--network NAME] [--json]` | Register a container for the platform to run (container port defaults to 8000) |

`config get` returns the opaque revision required by `config set`. Copy it unchanged; a stale revision fails with a conflict. Preserve managed secret references returned by the platform instead of substituting masked values. See [platform settings](/sdk/concepts/platform-context). Runtime paths and URLs must be reachable from the platform host; see [isolation](/sdk/concepts/isolation).

### `mint admin`

Requires the matching server-side permissions.

| Command | Purpose |
|---------|---------|
| `mint admin user list [--json]` | List users |
| `mint admin user get <user-id> [--json]` | Show one user |
| `mint admin user create <username> [--password P] [--email E] [--role SLUG] [--first-name F] [--last-name L] [--shortname S] [--json]` | Create a user (password prompted if omitted; role defaults to `member`) |
| `mint admin user update <user-id> [--email E] [--role SLUG] [--password P] [--first-name F] [--last-name L] [--shortname S] [--json]` | Update a user |
| `mint admin user delete <user-id> [--yes\|-y]` | Delete a user |
| `mint admin user activate <user-id>` / `deactivate <user-id>` | Enable or disable an account |
| `mint admin role list [--json]` | List roles |
| `mint admin role permissions [--json]` | List assignable permissions |
| `mint admin role create <name> --slug SLUG --permissions LIST [--description\|-d D] [--color HEX] [--project-scope all\|assigned] [--plugin-access SPEC] [--json]` | Create a role (`--permissions` is comma-separated or `all`; `--plugin-access` is `all`, a comma list, or a JSON list) |
| `mint admin role update <role-id> [--name N] [--description\|-d D] [--color HEX] [--project-scope all\|assigned] [--plugin-access SPEC] [--permissions LIST] [--default\|--not-default] [--json]` | Update a role |
| `mint admin role delete <role-id> [--yes\|-y]` | Delete a role |
| `mint admin plugin-role list <plugin-id> [--json]` | List user roles for one plugin |
| `mint admin plugin-role set <plugin-id> <user-id> <role> [--json]` | Assign a plugin role |
| `mint admin plugin-role remove <plugin-id> <user-id> [--yes\|-y]` | Remove a plugin role |
| `mint admin plugin-role user <user-id> [--json]` | List one user's plugin roles |

### `mint debug`

Read-only diagnostics.

| Command | Purpose |
|---------|---------|
| `mint debug summary [--check-updates] [--json]` | Diagnostics summary; `--check-updates` also queries GitHub-backed update checks |
| `mint debug health [--json]` | Public health endpoint |
| `mint debug system [--json]` | Admin system snapshot |
| `mint debug config [--json]` | Safe admin configuration |
| `mint debug logs [--limit\|-n N] [--offset N] [--level L] [--search Q] [--plugin ID] [--json]` | Parsed platform logs (default 50 entries) |
| `mint debug updates [--check] [--json]` | Update diagnostics; `--check` queries configured update sources |

### `mint update`

| Command | Purpose |
|---------|---------|
| `mint update check [--json]` | Check platform, SDK, and plugin update sources |
| `mint update apply [--yes\|-y] [--json]` | Apply the latest platform update (admin) |

### `mint daemon` and `mint platform daemon`

These run the platform on the local host from a platform directory. `--platform-dir` is optional everywhere; without it the CLI searches for the platform directory.

| Command | Purpose |
|---------|---------|
| `mint daemon [--platform-dir PATH] [--host HOST] [--port\|-p N] [--app TARGET] [--forwarded-allow-ips IPS] [--cpu-slots N] [--max-concurrent-per-user N]` | Run the platform in the foreground with Uvicorn (defaults: host `0.0.0.0`, port `8001`, app `api.main:create_app`, trusted proxies `127.0.0.1,::1`). Needs `mint-sdk[server]`. `--cpu-slots` and `--max-concurrent-per-user` set `MINT_JOB_CPU_SLOTS` and `MINT_JOB_MAX_CONCURRENT_PER_USER` |
| `mint platform daemon start [--platform-dir PATH] [--host HOST] [--port\|-p N] [--app TARGET] [--json]` | Start a background daemon (defaults: host `127.0.0.1`, port `8001`) |
| `mint platform daemon stop [--platform-dir PATH] [--json]` | Stop it |
| `mint platform daemon restart [--platform-dir PATH] [--json]` | Restart the daemon-managed server process |
| `mint platform daemon status [--platform-dir PATH] [--json]` | Show whether it is running |
| `mint platform daemon logs [--platform-dir PATH] [--lines\|-n N]` | Print recent logs (default 80 lines) |
| `mint platform daemon install-service [--platform-dir PATH] [--name NAME] [--host HOST] [--port\|-p N] [--app TARGET] [--no-enable] [--no-start] [--json]` | Install a Linux user-level systemd service (default name `mint-platform`) |
| `mint platform daemon uninstall-service [--name NAME] [--no-stop] [--json]` | Remove that service |

`start` and `install-service` run the platform with `MINT_DAEMON=1`, which marks it as supervised so the platform can restart itself after a scheduled update; see [Updates](/admin/updates). `mint dev` serves a plugin; these commands serve the platform. Production setup is covered in [Install on Linux](/admin/install-direct).

## Develop commands

These act on a plugin project (run from the plugin's directory).

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
| `--type`, `-t` | Plugin type: `analysis`, `experiment-design`, `workflow`, `static`, or `full` |
| `--mode` | Plugin mode: `generated` (SDK-managed UI + `@job`) or `standard` (FastAPI-style `@endpoint` + Vue workspace) |
| `--no-install` | Skip `uv sync` and `bun install` |
| `--no-git` | Skip `git init` |
| `--force` | Allow non-empty target directory |
| `--ai-assistant` | Comma-separated AI-assistant config files to scaffold (`claude,codex,cursor,windsurf,none`) |
| `--yes`, `-y` | Non-interactive — accept all defaults (safe for CI/scripts) |
| `--author` | Override `git config user.name` |
| `--email` | Override `git config user.email` |

Without `--yes`, missing fields are prompted interactively. With `--yes`, the AI-assistant file defaults to `claude`, which creates `CLAUDE.md`. If `mint doctor` says that file is missing current SDK guidance, run `mint doctor --fix` once to refresh it. `--ai-assistant none` skips assistant files, but the current `mint doctor` check still expects one of those files; run `mint doctor --fix` if you later want a passing doctor report.

The standard scaffold includes a read-only `@mcp_tool` example (`double_value`) with a test; see [MCP tools](/sdk/recipes/mcp-tools). The scaffolded CI workflow builds the `.mint` bundle (`uv run mint build . --output-dir dist/`) on every push and pull request to `main`, after `mint doctor --strict` and the tests. The scaffold sets `display_name` in `@mint_plugin` from the plugin name, `requires-python = ">=3.14"`, ruff `target-version = "py314"` (with `UP037` ignored), and Python 3.14 in the generated CI and release workflows. Frontend templates pin vue `^3.5.43`, pinia `^4.0.3`, vue-router `^5.3.1`, vite `^8.3.1`, tailwindcss `^4.3.3`, vitest `^5`, vue-tsc `^3` and jsdom `^30`. The `mint-sdk` range follows the running SDK's minor: a @MINT_VERSION@ CLI writes `>=1.3.0b1,<1.4`.

The parser accepts `workflow`, although `init --help` still omits it from its type description. Generated mode accepts only `analysis`; use standard mode for the other types.

Use `generated` mode for the first plugin unless you know you need a custom Vue workspace. Use `standard` mode when the UI needs custom layout, custom controls, or multiple interactive views.

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

`mint dev` passes the plugin's `display_name` to the platform dev proxy, and refreshes it in an existing `config.dev.toml` entry. On startup `mint dev` lists the plugin's MCP tools under their published names and prints a `mint mcp call` command to try one.

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
mint build [PATH] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--no-frontend` | Skip the frontend build step |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in) |
| `--output-dir` | Output directory (default `dist`) |
| `--include-wheel PATH` | Vendor an existing extra `.whl`; repeat for multiple wheels |

Output: `dist/<name>-<version>.mint`. Note the `.mint` extension.

### `mint doctor`

Validate the plugin's project structure.

```bash
mint doctor [PATH] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--deps` | Check platform-core dependency alignment |
| `--r` | Check the R bridge environment |
| `--fix` | Apply safe automatic fixes; with `--deps`, also fix platform-core dependency alignment |
| `--explain` | Show why each failed check matters |
| `--strict` | Exit non-zero when doctor reports warnings |
| `--json` | Output machine-readable check results |

`--deps` and `--r` run only their own check. The default run also:

- checks `@mcp_tool` / `@mcp_prompt` / `@mcp_resource` names, docstrings, signatures and schemas (the platform publishes none of a plugin's declarations while any is invalid);
- warns when the plugin declares legacy `get_migrations_package()` migrations, which are removed in MINT 1.4;
- reports removed frontend APIs with their replacements: `PlateMapEditor` / `RackEditor` (use `PlateEditor`), `FileBrowserModal` (use `FilePicker`), `AppPluginSwitcher` and the `pluginSwitcher` prop (use the `AppTopBar` plugin identity), `ColorSlider`, `DropdownButton`, `InstrumentAlertLog`, `InstrumentStatusCard`, `LcmsSequenceTable`, the removed composables, and `ProgressBar` `variant="segmented"` / `steps` / `current-step`;
- reports an error when a plugin on `mint-sdk>=1.3` has a `requires-python` that admits Python older than 3.14 or excludes 3.14 (a `mint-sdk` dependency limited by a `python_version >= '3.14'` marker is exempt);
- warns about a deprecated API that still ships (the `mint_sdk.lcms` and `mint_sdk.templates` imports, the `save_template` family of plugin methods, `DoseDesignWorkspaceView`, the `SmartGroup*` components and other deprecated exports), and reports a removed API as an error. `--strict` makes warnings fail the run;
- does not report names removed before 1.2 (the `mld_sdk` names, `usePluginApi`, `PluginExperimentData` and similar). Upgrade such a plugin to 1.2 first;
- accepts `mint-sdk` ranges for the 1.1, 1.2 and 1.3 lines.

The deprecated-API check flags deprecated Python and frontend APIs in plugin sources, including the removed `AppSidebar` `variant` prop in `.vue` files and in agent docs such as `CLAUDE.md` and `AGENTS.md`; the fix hint is `AppSidebar :floating="false" collapsible` (plus `width="20rem"` for the former analysis width).

### `mint info`

Print the plugin's `PluginMetadata`.

```bash
mint info [PATH] [--json]
```

### `mint docs`

Browse SDK reference documentation.

```bash
mint docs [path...] [--json] [--no-cache] [--clear-cache]
```

`path...` is a series of positional segments such as `frontend components`, `contract .`, `template plate-map`, or `search "<concept>"`. With no path, prints the docs index. `mint docs contract .` prints local endpoint methods/paths, generated client call shapes, inferred path/query params, request/response types, and the frontend helper imports for the current plugin.

### `mint add`

Add common plugin pieces to an existing project.

| Subcommand | Purpose |
|------------|---------|
| `mint add setting <name> [--type string\|number\|integer\|boolean] [--default VALUE] [--description TEXT] [--required] [--generate] [--path PATH]` | Add a typed plugin setting |
| `mint add endpoint <name> [--route PATH] [--method get\|post\|put\|patch\|delete] [--router NAME] [--create-router] [--request-model NAME] [--response-model NAME] [--generate] [--path PATH]` | Add a FastAPI endpoint |
| `mint add router <name> [--prefix PATH] [--tag TAG] [--path PATH]` | Add and register a router |
| `mint add migration <name> [--autogenerate] [--database-url URL] [--target plugin\|platform] [--path PATH]` | Add a plugin schema migration; a plugin without migrations gets `get_migration_spec()` and an Alembic `db_revisions` package ([details](#developer-database-commands)) |
| `mint add schema <name> [--file requests\|responses] [--field name:type] [--generate] [--path PATH]` | Add a Pydantic schema |
| `mint add service <name> [--method NAME] [--path PATH]` | Add a service module |
| `mint add artifact [--path PATH]` | Add a local artifact helper and `/artifacts` router |
| `mint add hook <before-save\|after-save\|status-change> [--path PATH]` | Add a lifecycle hook |
| `mint add frontend-page <name> [--path PATH]` | Add and register a Vue view |
| `mint add frontend-composable <name> [--endpoint PATH] [--path PATH]` | Add a Vue composable wrapper around the generated plugin client |
| `mint add r-analysis <name> [--script PATH] [--generate] [--page] [--path PATH]` | Add an R-backed analysis endpoint scaffold |
| `mint add data-template [template] [--list] [--json] [--generate] [--page] [--path PATH]` | Add biology data-template helpers |
| `mint add data-template-pack [pack] [--list] [--json] [--generate] [--page] [--path PATH]` | Add a curated data-template pack |
| `mint add data-template-preset [preset] [--list] [--json] [--page] [--path PATH]` | Add a ready-to-save data-template preset |

`mint add data-template`, `data-template-pack` and `data-template-preset` are deprecated and removed in 1.4. They print a deprecation warning to stderr on every run.

There is no `mint add job` command. Use `mint init --mode generated` for the current job scaffold, or add `@job` methods by hand.

### `mint mcp`

Call one of the plugin's MCP tools on the running `mint dev` backend.

```bash
mint mcp call <TOOL> [--json args.json] [--url URL] [--path PATH]
```

| Flag | Effect |
|------|--------|
| `TOOL` (positional) | The `@mcp_tool` method name, such as `double_value` (not the published `<plugin>_<name>`) |
| `--json` | JSON file with the tool arguments (default `{}`) |
| `--url` | Base URL of the running `mint dev` backend (default `http://127.0.0.1:8003`) |
| `--path` | Plugin project directory (default `.`) |

Prints the tool's result as JSON, or `Error: ...` and a non-zero exit. The dev server runs standalone, so the tool sees the standalone actor and `ctx.experiments` is `None`. See [MCP tools](/sdk/recipes/mcp-tools).

### `mint verify`

Build a plugin and exercise the real install/restart/load path in a disposable verification environment.

```bash
mint verify [PATH] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
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

Build and deploy the plugin to a running platform.

```bash
mint deploy [PATH] [--to URL] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--to` | Target platform URL (default: the host stored by `mint auth login`) |
| `--force` | Override dependency/compatibility conflicts |
| `--restart` / `--no-restart` | Restart the platform after upload (default `--restart`) |
| `--no-frontend` | Skip frontend build |
| `--vendor-deps` | Vendor dependency wheels into the bundle |
| `--include-wheel PATH` | Vendor an existing extra `.whl` (repeatable) |
| `--bundle` | Upload an existing `.mint` bundle without rebuilding |
| `--timeout` | Seconds for the restart and the plugin load together (default 180); one budget, not per phase |
| `--json` | Output machine-readable results |

With `--restart`, deploy confirms the restart by the platform's `boot_id` from `GET /api/health`: it waits for a new `boot_id`, then for the plugin to load. Any loaded version counts; if it differs from the version in the bundle's `manifest.json`, deploy prints a warning with both versions and still succeeds. Against a platform older than 1.2.9, which reports no `boot_id`, it waits for health and then for the bundle's version to load.

Upload and restart failures print `Error: ...` (or a JSON failure with `--json`) and exit non-zero. If the platform refuses the restart, for example with 403 for an account without `platform.configure`, the message says the plugin is installed but not running.

## Develop / SDK sub-app

The `sdk` sub-app manages the plugin's SDK pin.

### `mint sdk link`

Link to a local SDK checkout for editable development.

```bash
mint sdk link [--sdk-path PATH]
```

### `mint sdk unlink`

Restore the published SDK versions.

```bash
mint sdk unlink
```

### `mint sdk update`

Refresh SDK pins.

```bash
mint sdk update [PATH] [--scope patch|minor|major] [--channel stable|beta]
                [--version VERSION] [--dry-run] [--no-sync] [--verify]
```

The default is the stable patch channel. `--version @MINT_VERSION@` selects one exact
release; Python and frontend lockfiles resolve to the same release. The newest candidate is selected first, then checked against Python upper
bounds, exclusions and `requires_mint`; an excluded candidate fails rather
than falling back to an older allowed release. A valid Python
compatibility floor is preserved, so raise it explicitly for newly required
APIs. An explicit `--version` on a newer supported minor is the exception: it
moves every `mint-sdk` requirement, dependency groups included, to
`>=VERSION,<next-minor` and widens a `requires_mint` that excludes the target.
`--scope minor` alone still fails on a lower minor cap.
`--dry-run` previews changes, `--no-sync` skips installs/lock validation,
and `--verify` chains Docker verification against the stable/beta channel.
When the target is a 1.3 release, the command raises `[project].requires-python` to `>=3.14`. It only raises: upper bounds, exclusions, `~=` and `==` clauses, and a stricter floor stay. A missing value is added. The command refuses when the result would exclude 3.14, as with `<3.14` or `==3.12.*`. The command never rewrites an AI instructions file (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`). It leaves the file unchanged and points to `mint doctor` and `mint doctor --fix`. It creates no missing file.
See [upgrading the SDK](/sdk/operations/upgrading).

### `mint sdk generate`

Generate the frontend plugin contract and typed client from backend routes and Pydantic schemas.

```bash
mint sdk generate [PATH] [--check] [--json] [--output DIR]
```

`--check` reports drift without writing files, useful in CI. `--output` is relative to the plugin root.

Generated frontend plugins get:

- `frontend/src/generated/mint-plugin.contract.json`
- `frontend/src/generated/mint-plugin.ts`

The TypeScript file exports `useGeneratedPluginClient()`, `useGeneratedPluginContract()`, typed endpoint metadata, page selector items, settings helpers when a backend declares `@mint_plugin(config=SettingsModel)`, and upload/download/SSE helpers for matching endpoints.

## Developer database commands

These commands inspect explicit development databases or
write revision source files; they do not apply, stamp or downgrade migrations.
The `mint db` commands require `get_migration_spec()`.

`mint add migration <name>` without `--autogenerate` follows the plugin's
declaration. A plugin with `get_migration_spec()` gets a blank Alembic revision.
A plugin with no migration hook gets a `get_migration_spec()` method returning
`MigrationSpec(package="<package>.db_revisions", models=tuple(self.get_shared_models()))`,
an empty `db_revisions` package and a first revision; no database is needed. A
plugin that already owns tables through `get_shared_models()` but has no
migration hook is refused with instructions to generate an autogenerated
baseline and adopt deployed tables with `LegacyBaseline`. A plugin that declares
the deprecated `get_migrations_package()` keeps getting legacy integer `v*.py`
modules.

| Command | Behavior |
|---|---|
| `mint db current --database-url URL [--path PATH] [--target plugin\|platform]` | Report migration history/status without applying changes |
| `mint db check --database-url URL [--path PATH] [--target plugin\|platform]` | Compare the database to declared models; nonzero exit on differences |
| `mint db revision "description" --database-url URL [--path PATH] [--target plugin\|platform]` | Generate a draft from model differences in editable source |
| `mint add migration name --autogenerate --database-url URL --path .` | Author a plugin revision from model differences |
| `mint add migration name --path .` | Create an editable migration skeleton using the plugin's declaration |

The default target is `plugin`; `platform` requires PostgreSQL. SQLite inspection
requires an existing file. Revision generation requires the database at the
current migration head and a source migration package inside the project.
Review every generated revision before release. See [migrations](/sdk/concepts/migrations).

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mint/credentials.json` | Per-user token storage (written by `mint auth login`; honors `XDG_CONFIG_HOME`) |
| `<plugin>/pyproject.toml` | Plugin dependencies, entry points, build config |
| `<workspace>/MINT/config.dev.toml` | Dev proxy mapping (created by `mint dev --platform`) |

## Notes

- The `mint` CLI is the user-facing binary; `mint_sdk.cli_entry:main` is the console entry point. Don't import the CLI module from your plugin code.
- For programmatic platform access, use `MINTClient` — the CLI itself uses it under the hood.
- Plugin discovery uses the `mint.plugins` entry-point group.

## Related

- [User Manual → CLI overview](/admin/cli) — high-level CLI tour for non-developers
- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build` in context
- [Operations → CI patterns](/sdk/operations/ci-patterns) — using the CLI in GitHub Actions
