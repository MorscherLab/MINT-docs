# mint CLI

The `mint` command-line interface is installed alongside the MINT Python package. It serves three audiences:

1. **Lab admins** running the platform itself (`mint serve`, `mint plugin install`)
2. **Plugin developers** scaffolding, running, and packaging plugins (`mint init`, `mint dev`, `mint build`)
3. **Power users** scripting against the platform (`mint experiment`, `mint project`)

> [Screenshot: terminal showing `mint --help` output with categorized commands]

## Verifying the installation

After installing the MINT wheel, the `mint` executable should be on `PATH`:

```bash
mint --version
```

Expected output:

```
mint 1.0.0
```

If the command is not found, the install location is not on `PATH`. Resolutions are listed in [Install directly — Troubleshooting](/get-started/install-direct#troubleshooting).

## Command index

::: info Categories
The CLI groups commands by audience. `mint --help` lists every command; this manual covers the user-facing subset.
:::

### Run the platform

| Command | Purpose | Reference |
|---------|---------|-----------|
| `mint serve` | Start the MINT backend + bundled frontend | [Detail](/cli/serve) |
| `mint --version` | Print the installed MINT version | This page |
| `mint --help` | List every available subcommand | This page |

### Develop a plugin

| Command | Purpose | Reference |
|---------|---------|-----------|
| `mint init` | Scaffold a new plugin project | [Plugin development](/cli/plugin-dev) |
| `mint dev` | Run the plugin in dev mode with hot reload | [Plugin development](/cli/plugin-dev) |
| `mint build` | Package the plugin into a `.mint` bundle | [Plugin development](/cli/plugin-dev) |
| `mint doctor` | Validate the plugin project structure | [Plugin development](/cli/plugin-dev) |
| `mint info` | Print the plugin's metadata | [Plugin development](/cli/plugin-dev) |
| `mint logs` | Tail logs from a running plugin process | [Plugin development](/cli/plugin-dev) |
| `mint link` / `mint unlink` | Switch between editable and published SDKs | [Plugin development](/cli/plugin-dev) |
| `mint update` | Refresh SDK pins in the plugin's `pyproject.toml` and `package.json` | [Plugin development](/cli/plugin-dev) |
| `mint docs` | Open the SDK documentation in a browser | [Plugin development](/cli/plugin-dev) |

### Scripted platform access

| Command | Purpose | Reference |
|---------|---------|-----------|
| `mint auth` | Log in / log out / inspect tokens | [Platform commands](/cli/platform) |
| `mint experiment` | List, create, update experiments | [Platform commands](/cli/platform) |
| `mint project` | List, create, archive projects | [Platform commands](/cli/platform) |
| `mint status` | Show platform and plugin health | [Platform commands](/cli/platform) |

::: info
The full set of `mint` subcommands is enumerated by `mint --help`. If a subcommand isn't described in this manual, it's either unstable or developer-internal; consult the [SDK documentation](https://github.com/MorscherLab/mld/tree/main/sdk) for authoritative reference.
:::

## Configuration

Persistent settings — database mode, storage paths, marketplace registry, auth options — live in `config.json` (see [Configuration](/cli/configuration)). Environment variables prefixed `MINT_` override `config.json`.

For client-side commands like `mint experiment`, the active platform URL and JWT are stored in a per-user config file at `~/.config/mint/cli.json` (XDG path) or `%APPDATA%/mint/cli.json` (Windows). Manage it with `mint auth login` / `mint auth logout`.

## Next

→ [`mint serve`](/cli/serve) — start the platform
→ [Plugin development](/cli/plugin-dev) — scaffold and ship a plugin
→ [Platform commands](/cli/platform) — `mint experiment`, `mint project`, …
→ [Configuration](/cli/configuration) — config files and environment variables
