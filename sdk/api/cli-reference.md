# CLI reference

Install `mint-sdk[cli]` for the `mint` CLI. This page documents the released **v@MINT_VERSION@** command surface. Run `mint <command> --help` for the complete options on your installed version. For tutorials and getting-started usage, see [`/sdk/tutorials/`](/sdk/tutorials/).

Source: [`mint_sdk/cli/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli) and the `*_command.py` modules in [`mint_sdk/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk).

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
| `mint-sdk` | Python SDK/runtime imports, such as `Plugin` and `MINTClient` |
| `mint-sdk[cli]` | The `mint` commands, including `mint init` scaffolding; adds Typer and `httpx2` |
| `mint-sdk[cli,server]` | Plugin development with the CLI and Uvicorn; generated projects include this in their `dev` dependency group |


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
uv run pytest
uv run mint build
uv run mint verify
```

`verify` requires Docker and exercises installation/restart/plugin loading in a
disposable platform. `deploy` and `mint platform plugin upload` instead change a running
platform. Use [the deployment guide](/sdk/operations/deploying) for that step.
For generated UI choose `--mode generated --type analysis`. Other types require
standard mode.

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

These talk to a running platform. Authenticate first with `mint platform auth login`. Every command in this section lives under `mint platform`. The top-level aliases `mint auth`, `mint plugin`, `mint update`, `mint status`, `mint instruments` and the other server commands are removed in 1.4: change scripts and CI steps to `mint platform ...`.

### `mint platform status`

```bash
mint platform status
```

Prints the configured host (`MINT_URL`, or the stored default) and the stored username (or "Not logged in"). It also shows whether the platform is reachable and lists the loaded plugins with their versions. Then it shows whether the token is valid and the credential in use: type (session or access token), read-only state, expiry and source (`MINT_TOKEN` or the stored credential).

### `mint platform restart`

```bash
mint platform restart [--yes|-y] [--json]
```

Asks the configured platform to restart its server process (`POST /api/admin/restart`). Prompts for confirmation unless `--yes`. Exits non-zero when the platform reports failure.

### `mint platform auth`

Tokens are stored per host in `~/.config/mint/credentials.json`, or `$XDG_CONFIG_HOME/mint/credentials.json` when `XDG_CONFIG_HOME` is set. The file is written with mode `0600`.

| Command | Purpose |
|---------|---------|
| `mint platform auth login [--url URL] [--name NAME] [--read-only]` | Sign in with a device code: prints a code to type at `<externalUrl>/device` in a signed-in browser, where you approve the request and pick the token lifetime; the CLI then stores the personal access token it is granted. `--read-only` asks for a read-only token. `--name` gives the host a short name (asked on the first login when omitted). A host without a scheme gets `https://` |
| `mint platform auth login --token [--url URL]` | Store an existing personal access token instead (prompted, or read from stdin) |
| `mint platform auth logout [--url URL]` | Revoke the stored personal access token on the platform and discard it (default: the current host). If the platform cannot be reached, the command says so and still discards the local copy; revoke the token in Profile |
| `mint platform auth hosts` | List the hosts with a stored credential and their names. `*` marks the default |
| `mint platform auth use <host>` | Make a stored host the default (offline; `status` verifies it) |
| `mint platform auth name <host> <name>` | Give a stored host a short name for `--url` and `use` (offline) |
| `mint platform auth status` | Print the host, user, role, the credential in use (type, read-only state, expiry, source) and whether the platform accepts it |
| `mint platform auth token create <name> [--days 30\|90\|365] [--read-only] [--json]` | Issue a personal access token (default lifetime 90 days) and print it once, with a `claude mcp add` command for the platform's `/mcp` endpoint |
| `mint platform auth token list [--json]` | List your personal access tokens by prefix, access, expiry and last use |
| `mint platform auth token revoke <token-id>` | Revoke one of your tokens (ID from `token list`) |

`mint platform auth token create` refuses to run under a personal access token, because a token cannot issue tokens. Run `mint platform auth login` again, or create the token in Profile. `--read-only` and `--token` do not combine. The browser opens only on a local terminal, not over SSH or without a display.

A personal access token works as `MINT_TOKEN` for the CLI and `MINTClient`, and as the Bearer token for MCP clients. `--read-only` limits the token to reads. See [AI Assistants and API Access](/guide/ai-and-api).

### `mint platform instruments`

```bash
mint platform instruments [NAME_OR_ID] [--all] [--json]
```

Without an argument, lists instruments with their live status: state, sample, progress, ETA, unacknowledged alerts and time since the last report. An instrument without a report shows `(no report)`. With `NAME_OR_ID`, shows one instrument with its details and status. The name is matched first (case-insensitive, deactivated instruments included), then the ID. A name that matches more than one instrument is an error. `--all` includes deactivated instruments in the list. `--json` prints JSON. The command needs the `instruments.view` permission. Programmatic access: `MINTClient.instruments` ([REST client](/sdk/api/client#instruments)).

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

Published plugins are `.mint` bundles. Install them with `mint platform plugin upload` or `mint platform plugin github install`. These commands call the running platform, which performs dependency checks, bundle extraction, settings writes, and restart reporting; they require the matching server-side plugin permissions. `--force` skips dependency conflict checks.

| Command | Purpose |
|---------|---------|
| `mint platform plugin list [--json]` | List loaded plugins and installed plugin packages |
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

`config get` returns the opaque revision required by `config set`. Copy it unchanged; a stale revision fails with a conflict. Preserve managed secret references returned by the platform instead of substituting masked values. See [platform settings](/sdk/concepts/platform-context). Runtime paths and URLs must be reachable from the platform host; see [isolation](/sdk/concepts/isolation).

### `mint platform admin`

Requires the matching server-side permissions. Plugin roles are removed in 1.4, so there is no `plugin-role` group; give a user the `plugins.configure` permission through a role.

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
| `mint platform update apply [--yes\|-y] [--json]` | Apply the latest platform update (admin) |

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

It needs `mint-sdk[server]`. A hand-written command, Dockerfile or process unit that names `mint_sdk.runtime:create_plugin_app` or a plugin-written factory must change to `mint_sdk.app:create_app --factory`.

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
| `--no-install` | Skip `uv sync` and `bun install` |
| `--no-git` | Skip `git init` |
| `--force` | Allow non-empty target directory |
| `--ai-assistant` | Comma-separated AI-assistant config files to scaffold (`claude,codex,cursor,windsurf,none`) |
| `--yes`, `-y` | Non-interactive — accept all defaults (safe for CI/scripts) |
| `--author` | Override `git config user.name` |
| `--email` | Override `git config user.email` |

Without `--yes`, missing fields are prompted interactively. With `--yes`, the AI-assistant file defaults to `claude`, which creates `CLAUDE.md`. If `mint doctor` says that file is missing current SDK guidance, run `mint doctor --fix` once to refresh it. `--ai-assistant none` skips assistant files, but the current `mint doctor` check still expects one of those files; run `mint doctor --fix` if you later want a passing doctor report.

The standard scaffold includes a read-only `@tool` example (`double_value`) with a test; see [MCP tools](/sdk/recipes/mcp-tools). The scaffolded CI workflow builds the `.mint` bundle (`uv run mint build --output-dir dist/`) on every push and pull request to `main`, after `mint doctor --strict` and the tests. The scaffold declares a `Metadata` subclass with `@plugin` and sets `title` from the plugin name. It sets `requires-python = ">=3.14"` and ruff `target-version = "py314"` (with `UP037` ignored). The generated CI and release workflows use Python 3.14. Frontend templates pin vue `^3.5.43`, pinia `^4.0.3`, vue-router `^5.3.1`, vite `^8.3.1`, tailwindcss `^4.3.3`, vitest `^5`, vue-tsc `^3` and jsdom `^30`. The `mint-sdk` range follows the running SDK's minor: a @MINT_VERSION@ CLI writes `>=1.4.0b1,<2.0`. From 1.4 the ceiling is the next major, because the plugin SDK contract has no breaking change within 1.x. A floor before 1.4 keeps the next-minor ceiling.

The parser accepts `workflow`, although `init --help` omits it from its type description. Generated mode accepts only `analysis`; use standard mode for the other types.

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

Output: `dist/<name>-<version>.mint`. Note the `.mint` extension.

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

`mint doctor --deps` and `--r` no longer exist. `mint doctor --only db --database-url URL` replaces `mint db check`.

The default run checks the project structure: `pyproject.toml`, the `mint.plugins` entry point, the source module, the `Plugin` class, the routes prefix, tests, AI instruction files, the generated contract and the project layout. It boots the plugin once (lifespan and safe GET probes). It also does these checks:

- checks the SDK dependency. The Python range must be `>=<floor>,<ceiling>` with the ceiling at the next major (from 1.4) or the next minor (before 1.4). A ceiling at the next minor still passes for 1.4 plugins, so `<1.5` releases of the 1.4 plugins keep passing. `mint doctor --fix` writes `<2.0`;
- checks the SDK version alignment: the Python and frontend SDK pins and their lockfiles must name the same release (`mint sdk update` aligns them);
- checks `@tool` / `@prompt` / `@resource` names, docstrings, signatures and schemas (the platform publishes none of a plugin's declarations while any is invalid);
- fails a plugin that still defines `get_migrations_package()`, because the platform loader keeps such a plugin disabled and standalone database setup raises `ConfigurationException`. Declare `Metadata.database` and adopt the history with `LegacyBaseline.from_plugin_history()`;
- checks the page metadata (icons, stable page IDs and coverage of the frontend routes) and the platform-owned dependency constraints;
- reports an error when a plugin on `mint-sdk>=1.3` has a `requires-python` that admits Python older than 3.14 or excludes 3.14 (a `mint-sdk` dependency limited by a `python_version >= '3.14'` marker is exempt);
- reports a 1.3 author API as `SDK 1.4 manual changes` (an error breaks the plugin on SDK 1.4; a warning matches a removed method by name only) and the mechanical rewrites as `SDK 1.4 rewrites`. `--fix` applies the rewrites: `@mint_plugin` to `Metadata` and `@plugin`, the persistence helpers to `self.design` and `self.artifacts`, `@mcp_tool` to `@tool`, the old job, event, health and test names, and the renamed modules. The [migration guide](/sdk/operations/migrate-1.3-to-1.4) has the full table;
- reports removed and deprecated frontend APIs with their replacements, including removed subpath imports, merged components and unified props. `mint docs deprecated-apis` lists them all;
- does not report names removed before 1.2. Upgrade such a plugin to 1.2 first.

`mint sdk update` and `mint doctor --fix` also remove the packages that `mint-sdk` supplies: a `typer`, `uvicorn` or `httpx2` in a dev group becomes `mint-sdk[cli,server]`. Run `mint doctor --strict` in CI.

The deprecated-API check flags deprecated Python and frontend APIs in plugin sources and in agent docs such as `CLAUDE.md` and `AGENTS.md`.

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

Build and deploy the plugin to a running platform.

```bash
mint deploy [--to URL] [flags]
```

| Flag | Effect |
|------|--------|
| `--to` | Target platform URL (default: the host stored by `mint platform auth login`) |
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
mint sdk update [--scope patch|minor|major] [--channel stable|beta]
                [--version VERSION] [--dry-run] [--no-sync] [--verify]
```

The default is the stable patch channel. `--version @MINT_VERSION@` selects one exact
release; Python and frontend lockfiles resolve to the same release. The command selects the newest candidate first. Then it checks the candidate against Python upper
bounds, exclusions and `requires_mint`. An excluded candidate fails; the command does not fall back to an older allowed release. A valid Python
compatibility floor is preserved, so raise it explicitly for newly required
APIs. An explicit `--version` on a newer supported minor is the exception. It
moves every `mint-sdk` requirement, dependency groups included, to
`>=VERSION,<2.0` (the next major; `<next-minor` for a target before 1.4). It also widens a `requires_mint` that excludes the target.
`--scope minor` alone still fails on a lower minor cap.
`--dry-run` previews changes, `--no-sync` skips installs/lock validation,
and `--verify` chains Docker verification against the stable/beta channel.
When the target is a 1.3 or later release, the command raises `[project].requires-python` to `>=3.14`. It only raises: upper bounds, exclusions, `~=` and `==` clauses, and a stricter floor stay. A missing value is added. The command refuses when the result would exclude 3.14, as with `<3.14` or `==3.12.*`. The command never rewrites an AI instructions file (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`). It leaves the file unchanged and points to `mint doctor` and `mint doctor --fix`. It creates no missing file.
See [upgrading the SDK](/sdk/operations/upgrading).

### `mint sdk generate`

Generate the frontend plugin contract and typed client from backend routes and Pydantic schemas.

```bash
mint sdk generate [--check] [--json] [--output DIR]
```

`--check` reports drift without writing files, useful in CI. `--output` is relative to the plugin root.

Generated frontend plugins get:

- `frontend/src/generated/mint-plugin.contract.json`
- `frontend/src/generated/mint-plugin.ts`

The TypeScript file exports `useClient()`, `useSettings()` (when `Metadata.settings` is set), `useJobs(name, options)`, `upload`, `download(name, payload, { filename })`, `endpointUrl`, `useStream`, `contract`, `contractHash` and `apiPrefix`. The job methods are `wait`, `result`, `get`, `cancel`, `delete`, `clear` and `refresh`. An `@endpoint` without `operation_id` gets the method name in lowerCamel case (`get_layout` becomes `getLayout`). After you upgrade from 1.3, run `mint sdk generate` and update the callers.

## Developer database commands

`mint db current` reads the migration state of an explicit development database. It does not apply, stamp or downgrade migrations. The other database tasks moved:

| Command | Behavior |
|---|---|
| `mint db current --database-url URL` | Report migration history and status without applying changes |
| `mint doctor --only db --database-url URL` | Compare the database to the declared models; non-zero exit on differences (was `mint db check`) |
| `mint add migration NAME --autogenerate --database-url URL` | Draft a revision from model differences in editable source (was `mint db revision`) |
| `mint add migration NAME` | Create a blank Alembic revision |

`mint add migration NAME` without `--autogenerate` follows the plugin's declaration. A plugin with `Metadata.database` gets a blank Alembic revision. A plugin with no `database` gets `database = MigrationSpec(package="<package>.db_revisions")` in its `Metadata`, an empty `db_revisions` package and a first revision; no database is needed. Revision generation needs the database at the current migration head and a source migration package inside the project. SQLite inspection needs an existing file. Review every generated revision before release. The platform has its own commands for its revisions: `mint-platform db current|check|revision` in the platform checkout. See [migrations](/sdk/concepts/migrations).

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mint/credentials.json` | Per-user token storage (written by `mint platform auth login`; honors `XDG_CONFIG_HOME`) |
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
