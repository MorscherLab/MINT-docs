# CLI reference

The `mint` CLI ships with `mint-sdk`. This page enumerates every subcommand and flag, derived from `mint_sdk/cli.py`. For tutorials and getting-started usage, see [`/sdk/tutorials/`](/sdk/tutorials/).

Source: [`mint_sdk/cli.py`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-python/src/mint_sdk/cli.py) and [`mint_sdk/cli_commands/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk/cli_commands).

## Top-level

```
mint [--version] [--help] <command>
```

| Flag | Effect |
|------|--------|
| `--version` | Print the SDK version and exit |
| `--help` | Show top-level help |

## Platform commands

These talk to a running platform. Authenticate first with `mint auth login`.

### `mint status`

Show platform health, version, and the current auth profile's user info.

```bash
mint status
```

### `mint auth`

Manage authentication tokens. Tokens are stored at `~/.config/mld/credentials.json`.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login [--url URL] [--username USER]` | Interactive login; stores JWT |
| `mint auth logout` | Discard the stored JWT |
| `mint auth status` | Print current host + user |
| `mint auth refresh` | Refresh the stored JWT |

(Read `mint_sdk/cli_commands/auth_cmd.py` for the exact flag list.)

### `mint experiment`

CRUD on experiments via the REST API.

| Subcommand | Purpose |
|------------|---------|
| `mint experiment list [--status S] [--type T] [--project P] [--limit N] [--json]` | List experiments |
| `mint experiment get <id>` | Show one experiment |
| `mint experiment create --type T --name N [--project P]` | Create an experiment |
| `mint experiment update <id> [--status S] [--name N]` | Update an experiment |

(Read `experiment_cmd.py` for the exact flag list — flags evolve.)

### `mint project`

CRUD on projects.

| Subcommand | Purpose |
|------------|---------|
| `mint project list [--limit N] [--json]` | List projects |
| `mint project get <id>` | Show one project |
| `mint project create --name N [--description D]` | Create a project |
| `mint project archive <id>` | Archive (reversible) |

(Read `project_cmd.py` for the exact flag list.)

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
| `--type`, `-t` | Plugin type: `analysis` or `experiment-design` |
| `--no-frontend` | Skip frontend scaffolding |
| `--no-install` | Skip `uv sync` and `bun install` |
| `--no-git` | Skip `git init` |
| `--force` | Allow non-empty target directory |
| `--ai-assistant` | Comma-separated AI-assistant config files to scaffold (`claude,codex,cursor,windsurf,none`) |
| `--yes`, `-y` | Non-interactive — accept all defaults (safe for CI/scripts) |
| `--author` | Override `git config user.name` |
| `--email` | Override `git config user.email` |

Without `--yes`, missing fields are prompted interactively.

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

Package the plugin into a `.mld` bundle.

```bash
mint build [PATH] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--no-frontend` | Skip the frontend build step |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in) |
| `--output-dir` | Output directory (default `dist`) |

Output: `dist/<name>-<version>.mld`. Note the `.mld` extension.

### `mint doctor`

Validate the plugin's project structure.

```bash
mint doctor [PATH] [flags]
```

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--deps` | Check platform-core dependency alignment |
| `--fix` | Fix misaligned deps (requires `--deps`) |

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

`path...` is a series of positional segments: `[python|frontend] [category] [item]`. With no path, opens the docs index.

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

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mld/credentials.json` | Per-user JWT storage (written by `mint auth login`) |
| `<plugin>/pyproject.toml` | Plugin dependencies, entry points, build config |
| `<workspace>/MINT/config.dev.toml` | Dev proxy mapping (created by `mint dev --platform`) |

## Notes

- The `mint` CLI is the user-facing binary; `mint_sdk.cli:main` is the entry point. Don't import the CLI module from your plugin code.
- For programmatic platform access, use `MINTClient` — the CLI itself uses it under the hood.
- The CLI's `name` field in Typer help may still display "mld" during the rebrand transition; the binary name and behavior are `mint`.

## Related

- [User Manual → CLI overview](/cli/overview) — high-level CLI tour for non-developers
- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build` in context
- [Operations → CI patterns](/sdk/operations/ci-patterns) — using the CLI in GitHub Actions
