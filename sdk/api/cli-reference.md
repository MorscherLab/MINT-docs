# CLI reference

The `mint` CLI ships as part of `mint-sdk`. This page enumerates every subcommand and flag. For tutorials and getting-started usage, see [`/sdk/tutorials/`](/sdk/tutorials/) and the User Manual's [`/cli/overview`](/cli/overview).

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

Show platform health.

```bash
mint status
mint status --json     # machine-readable
```

Output covers: platform version + uptime, database mode, installed plugins (with migration state), marketplace last-poll, outstanding install requests, update channel, pending updates.

### `mint auth`

Manage authentication tokens.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login [--url URL] [--profile NAME]` | Authenticate; store JWT in `~/.config/mint/cli.json` |
| `mint auth logout [--profile NAME]` | Discard the stored JWT |
| `mint auth status [--profile NAME]` | Show active platform URL, user, expiration |
| `mint auth refresh [--profile NAME]` | Refresh the JWT before it expires |

Multiple profiles support multiple platforms (`--profile staging` etc.). No `--profile` means `default`.

### `mint experiment`

CRUD on experiments via the REST API.

| Subcommand | Purpose |
|------------|---------|
| `mint experiment list [--status S] [--project P] [--type T] [--owner O] [--limit N] [--json] [--csv]` | List experiments |
| `mint experiment get <id-or-code> [--json]` | Show a single experiment |
| `mint experiment create --type T [--name N] [--project P] [--design-file F]` | Create an experiment |
| `mint experiment update <id-or-code> [--status S] [--name N] [--design-file F]` | Update an experiment |
| `mint experiment delete <id-or-code>` | Soft-delete an experiment |

`--design-file` accepts a JSON file containing the design data payload.

### `mint project`

CRUD on projects.

| Subcommand | Purpose |
|------------|---------|
| `mint project list [--archived] [--limit N] [--json] [--csv]` | List projects |
| `mint project get <id> [--json]` | Show a single project |
| `mint project create --name N [--description D]` | Create a project |
| `mint project update <id> [--name N] [--description D]` | Update a project |
| `mint project archive <id>` | Archive (reversible) |
| `mint project delete <id>` | Delete (irreversible — typed confirmation) |

## Develop commands

These act on a plugin project (run from the plugin's directory).

### `mint init`

Scaffold a new plugin project.

```bash
mint init <plugin-name> [flags]
mint init . --add-frontend              # add a frontend to an existing project
```

Flags / interactive prompts:

| Flag | Effect |
|------|--------|
| `--type analysis|experiment-design` | Plugin type |
| `--routes-prefix /my-plugin` | URL prefix |
| `--with-migrations` | Scaffold a migrations package |
| `--add-frontend` | Add a Vue 3 frontend dir |
| `--ai-assistant claude|codex|cursor|windsurf|none` | Generate AI assistant config |

When run interactively (no flags), `mint init` walks through the prompts.

### `mint dev`

Run the plugin in dev mode with hot reload.

```bash
mint dev [--port N] [--platform] [--no-frontend]
```

| Flag | Effect |
|------|--------|
| `--port N` | Pin the backend port (default: auto-pick from a free range) |
| `--platform` | Also start a local platform that proxies to the plugin |
| `--no-frontend` | Skip the Vite dev server |

`--platform` writes `mld/config.dev.toml` to wire the dev proxy. Stop both servers with **Ctrl+C**.

### `mint build`

Package the plugin into a `.mint` bundle.

```bash
mint build [--output DIR] [--no-frontend] [--no-deps] [--check]
```

| Flag | Effect |
|------|--------|
| `--output DIR` | Override `dist/` |
| `--no-frontend` | Skip frontend build (backend-only) |
| `--no-deps` | Don't include dependency wheels |
| `--check` | Build into a temp dir, then discard (CI validation) |

Output: `dist/<name>-<version>.mint`.

### `mint doctor`

Validate the plugin's project structure.

```bash
mint doctor [<bundle.mint>]
```

Without an argument, validates the current directory's project. With a bundle path, validates a built `.mint` file.

Checks:

- `pyproject.toml` is well-formed
- The `mld.plugins` entry point resolves
- The `AnalysisPlugin` subclass implements every abstract method
- `PluginMetadata` is well-formed
- Declared migrations have unique revisions
- Frontend builds (if present)

### `mint info`

Print the plugin's `PluginMetadata`.

```bash
mint info [<bundle.mint>] [--json]
```

Without an argument, reads the current project. With a bundle, reads the manifest.

### `mint logs`

Tail logs from a running plugin process.

```bash
mint logs [--follow] [--plugin SLUG]
```

Pairs with `mint dev`. `--follow` streams; without it, dumps the recent buffer.

### `mint docs`

Open the SDK documentation in the default browser.

```bash
mint docs              # latest docs
mint docs --offline    # built-in offline copy (if available)
```

## Develop / SDK sub-app

The `sdk` sub-app manages the plugin's SDK pin.

### `mint sdk link`

Link to a local SDK checkout for editable development.

```bash
mint sdk link [--sdk-path PATH]
```

Runs `uv pip install -e <path>/packages/sdk-python` and `bun link @morscherlab/mint-sdk`. Defaults to a sibling `mld/` directory.

### `mint sdk unlink`

Restore the published SDK versions.

```bash
mint sdk unlink
```

Reverses the link by running `uv sync` and `bun install`.

### `mint sdk update`

Refresh SDK pins to the latest published version satisfying the declared range.

```bash
mint sdk update [--pre]
```

`--pre` allows pre-release versions (alpha, beta, rc).

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Generic failure |
| 2 | Usage error (bad flags, missing required arg) |
| 3 | Network / authentication failure |
| 4 | Validation failure (`mint doctor` finds an issue, `mint experiment create` rejects bad input) |

CI scripts can rely on these for fine-grained failure handling.

## Configuration files

| Path | Purpose |
|------|---------|
| `~/.config/mint/cli.json` | Per-user JWT storage (multiple profiles) |
| `<plugin>/pyproject.toml` | Plugin dependencies, entry points, build config |
| `<plugin>/.mint-cli.toml` | Optional per-plugin CLI defaults (port pinning, etc.) |
| `<workspace>/mld/config.dev.toml` | Dev proxy mapping (created by `mint dev --platform`) |

## Notes

- The `mint` CLI is the user-facing binary; internally `mint_sdk.cli:main` is the entry point. Don't import the CLI module from your plugin code.
- For programmatic platform access (rather than from a shell), use `MINTClient` — the CLI itself uses it under the hood.
- The CLI displays `MLD plugin development CLI` as its tagline in some help screens during the rebrand transition window. The binary name is `mint`; the tagline will catch up in a forthcoming release.

## Related

- [User Manual → CLI overview](/cli/overview) — high-level CLI tour for non-developers
- [Tutorials → First analysis plugin](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build` in context
- [Operations → CI patterns](/sdk/operations/ci-patterns) — using the CLI in GitHub Actions
