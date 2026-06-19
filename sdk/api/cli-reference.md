# CLI reference

The `mint` CLI ships with `mint-sdk`. This page summarizes the subcommands and primary flags from `mint_sdk/cli.py`. For tutorials and getting-started usage, see [`/sdk/tutorials/`](/sdk/tutorials/).

Source: [`mint_sdk/cli.py`](https://github.com/MorscherLab/MINT/blob/main/packages/sdk-python/src/mint_sdk/cli.py) and [`mint_sdk/cli_commands/`](https://github.com/MorscherLab/MINT/tree/main/packages/sdk-python/src/mint_sdk/cli_commands).

## Top-level

```
mint [--version] [--help] <command>
```

| Flag | Effect |
|------|--------|
| `--version` | Print the SDK version and exit |
| `--install-completion` | Install shell completion for the current shell |
| `--show-completion` | Print the shell completion script |
| `--help` | Show top-level help |

## Platform commands

These talk to a running platform. Authenticate first with `mint auth login`.

### `mint status`

Show platform health, version, and the current auth profile's user info.

```bash
mint status
```

### `mint auth`

Manage authentication tokens. Tokens are stored at `~/.config/mint/credentials.json` unless `XDG_CONFIG_HOME` is set, in which case the file is `$XDG_CONFIG_HOME/mint/credentials.json`.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login [--url URL] [--username USER]` | Interactive login; stores JWT |
| `mint auth logout` | Discard the stored JWT |
| `mint auth status` | Print current host + user |

(Read `mint_sdk/cli_commands/auth_cmd.py` for the exact flag list.)

### `mint experiment`

CRUD on experiments via the REST API.

| Subcommand | Purpose |
|------------|---------|
| `mint experiment list [--status S] [--type T] [--project-id ID] [--search Q] [--mine] [--since YYYY-MM-DD] [--before YYYY-MM-DD] [--limit N] [--json]` | List experiments |
| `mint experiment get <id> [--json]` | Show one experiment |
| `mint experiment create <name> [--type T] [--project-id ID] [--notes TEXT] [--json]` | Create an experiment |
| `mint experiment update <id> [--name N] [--status S] [--type T] [--project-id ID] [--notes TEXT] [--json]` | Update an experiment |
| `mint experiment data <id> [--format json\|csv] [--view raw\|tree\|summary]` | Print experiment design data |
| `mint experiment results <id> [--plugin ID] [--json]` | Print analysis results |
| `mint experiment delete <id> [--yes]` | Delete an experiment |
| `mint experiment types [--json]` | List experiment types |

(Read `experiment_cmd.py` for the exact flag list — flags evolve.)

### `mint project`

CRUD on projects.

| Subcommand | Purpose |
|------------|---------|
| `mint project list [--search Q] [--status active\|archived\|completed] [--mine] [--limit N] [--json]` | List projects |
| `mint project get <id> [--json]` | Show one project |
| `mint project create <name> [--description D] [--json]` | Create a project |
| `mint project update <id> [--name N] [--description D] [--status active\|archived\|completed] [--json]` | Update project metadata |
| `mint project delete <id> [--yes]` | Delete a project |
| `mint project experiments <id> [--limit N] [--json]` | List experiments in a project |
| `mint project members <id> [--json]` | List project members |

(Read `project_cmd.py` for the exact flag list.)

### `mint plugin`

Administer plugins on a running platform. These commands call platform APIs and require the matching server-side plugin permissions.

| Subcommand | Purpose |
|------------|---------|
| `mint plugin list [--json]` | List loaded plugins and installed plugin packages |
| `mint plugin install <source> [--force] [--json]` | Install a package name, Git URL, or server-visible local path |
| `mint plugin upload <bundle.mint> [--force] [--json]` | Upload and install a `.mint` bundle from the local machine |
| `mint plugin upgrade <package-name> [--force] [--json]` | Upgrade through the platform plugin manager |
| `mint plugin update <package-name> [--force] [--json]` | Update from the package's registered GitHub source |
| `mint plugin uninstall <package-name> [--yes] [--json]` | Uninstall a plugin package |
| `mint plugin github install <repo-or-url> [--tag TAG] [--asset-pattern GLOB] [--force] [--json]` | Install a GitHub release asset |
| `mint plugin github releases <repo-or-url> [--asset-pattern GLOB] [--json]` | List releases and matching plugin assets |
| `mint plugin config get <plugin-name>` | Print plugin settings |
| `mint plugin config set <plugin-name> --json-config JSON` | Replace plugin settings |
| `mint plugin config set <plugin-name> --file settings.json` | Replace plugin settings from a file |
| `mint plugin config update <plugin-name> --json-config JSON` | Patch plugin settings |
| `mint plugin index list [--json]` | List extra package index URLs |
| `mint plugin index set <url> [<url> ...] [--json]` | Replace extra package index URLs |

(Read `plugin_cmd.py` for the exact flag list.)

### `mint admin`

Administrative platform commands. They are also available as `mint platform admin ...`.

| Subcommand | Purpose |
|------------|---------|
| `mint admin user ...` | Manage platform users; requires `users.*` permissions |
| `mint admin role ...` | Manage RBAC roles; requires `users.manage` |
| `mint admin plugin-role ...` | Manage per-plugin user roles; requires `plugins.configure` |

### `mint debug`

Read-only diagnostics. They are also available as `mint platform debug ...`.

| Subcommand | Purpose |
|------------|---------|
| `mint debug summary` | Run a read-only platform diagnostics summary |
| `mint debug health` | Read the public platform health endpoint |
| `mint debug system` | Read the admin system snapshot |
| `mint debug config` | Show safe admin configuration |
| `mint debug logs` | Read parsed platform logs |
| `mint debug updates` | Show update diagnostics and optionally run update checks |

### `mint update`

Platform update checks and application. Also available as `mint platform update ...`.

| Subcommand | Purpose |
|------------|---------|
| `mint update check [--json]` | Check platform, SDK, and plugin update sources |
| `mint update apply [--yes] [--json]` | Apply the latest platform update |

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
| `--type`, `-t` | Plugin type: `analysis`, `experiment-design`, `static`, or `full` |
| `--template` | Plugin starter template (see `--list-templates`) |
| `--list-templates` | List starter templates and exit |
| `--json` | Output starter-template catalog as JSON when listing |
| `--no-frontend` | Skip frontend scaffolding |
| `--no-install` | Skip `uv sync` and `bun install` |
| `--no-git` | Skip `git init` |
| `--force` | Allow non-empty target directory |
| `--ai-assistant` | Comma-separated AI-assistant config files to scaffold (`claude,codex,cursor,windsurf,none`) |
| `--yes`, `-y` | Non-interactive — accept all defaults (safe for CI/scripts) |
| `--author` | Override `git config user.name` |
| `--email` | Override `git config user.email` |

Without `--yes`, missing fields are prompted interactively. With `--yes`, the AI-assistant file defaults to `claude`, which creates `CLAUDE.md`. If `mint doctor` says that file is missing current SDK guidance, run `mint doctor --fix` once to refresh it. `--ai-assistant none` skips assistant files, but the current `mint doctor` check still expects one of those files; run `mint doctor --fix` if you later want a passing doctor report.

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

Stop with **Ctrl+C**.

#### `mint dev logs`

Tail logs from a running plugin process.

| Flag | Effect |
|------|--------|
| `--follow` | Stream new lines as they appear |
| `--lines N` | Show the last N lines |
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
| `--json` | Output machine-readable check results |

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
| `mint add migration <name> [--path PATH]` | Add a plugin schema migration |
| `mint add schema <name> [--file requests\|responses] [--field name:type] [--generate] [--path PATH]` | Add a Pydantic schema |
| `mint add service <name> [--method NAME] [--path PATH]` | Add a service module |
| `mint add job [name] [--path PATH]` | Add a job service and `/jobs` router |
| `mint add artifact [--path PATH]` | Add a local artifact helper and `/artifacts` router |
| `mint add hook <before-save\|after-save\|status-change> [--path PATH]` | Add a lifecycle hook |
| `mint add frontend-page <name> [--path PATH]` | Add and register a Vue view |
| `mint add frontend-composable <name> [--endpoint PATH] [--path PATH]` | Add a Vue composable wrapper around the generated plugin client |
| `mint add r-analysis <name> [--script PATH] [--generate] [--page] [--path PATH]` | Add an R-backed analysis endpoint scaffold |
| `mint add data-template [template] [--list] [--json] [--generate] [--page] [--path PATH]` | Add biology data-template helpers |
| `mint add data-template-pack [pack] [--list] [--json] [--generate] [--page] [--path PATH]` | Add a curated data-template pack |
| `mint add data-template-preset [preset] [--list] [--json] [--page] [--path PATH]` | Add a ready-to-save data-template preset |

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
mint sdk update [--scope patch|minor|major] [--dry-run] [--no-sync]
```

`--scope` controls the maximum version-bump kind allowed; `--dry-run` previews; `--no-sync` skips the post-update lockfile sync.

### `mint sdk generate`

Generate the frontend plugin contract and typed client from backend routes and Pydantic schemas.

```bash
mint sdk generate [PATH] [--check] [--json] [--output DIR]
```

`--check` reports drift without writing files, useful in CI. `--output` is relative to the plugin root.

Generated frontend plugins get:

- `frontend/src/generated/mint-plugin.contract.json`
- `frontend/src/generated/mint-plugin.ts`

The TypeScript file exports `useGeneratedPluginClient()`, `useGeneratedPluginContract()`, typed endpoint metadata, page selector items, settings helpers when a backend `settings_model` exists, and upload/download/SSE helpers for matching endpoints.

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mint/credentials.json` | Per-user JWT storage (written by `mint auth login`; honors `XDG_CONFIG_HOME`) |
| `<plugin>/pyproject.toml` | Plugin dependencies, entry points, build config |
| `<workspace>/MINT/config.dev.toml` | Dev proxy mapping (created by `mint dev --platform`) |

## Notes

- The `mint` CLI is the user-facing binary; `mint_sdk.cli:main` is the entry point. Don't import the CLI module from your plugin code.
- For programmatic platform access, use `MINTClient` — the CLI itself uses it under the hood.
- Plugin discovery uses the `mint.plugins` entry-point group.

## Related

- [User Manual → CLI overview](/cli/overview) — high-level CLI tour for non-developers
- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build` in context
- [Operations → CI patterns](/sdk/operations/ci-patterns) — using the CLI in GitHub Actions
