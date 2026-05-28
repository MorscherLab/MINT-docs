# mint CLI

The `mint` command-line interface ships with the **`mint-sdk`** package (PyPI). It does **not** start the platform — the platform server is launched directly via `uvicorn api.main:app` (see [Install on Linux](/get-started/install-direct)). `mint` covers two complementary roles:

| Role | What it does | Detail |
|------|--------------|--------|
| **Plugin development** | Scaffold, run, build, and manage plugin projects | [Plugin Development → CLI reference](/sdk/api/cli-reference) |
| **Platform-data CLI** | Talk to a running platform (auth, list experiments, create projects, check status) | [Platform commands](/cli/platform) |

## Verifying the install

```bash
mint --version
# → mint <version>
mint --help
```

If the command isn't found, the install location isn't on your `PATH`. With `uv tool install mint-sdk`, run `uv tool update-shell`. With `pip install --user mint-sdk`, add `~/.local/bin` to `PATH`.

## Command index

### Platform-data CLI (User Manual side)

| Command | Purpose |
|---------|---------|
| `mint auth login / logout / status` | Acquire and manage a session token |
| `mint experiment list / get / create / update` | CRUD on experiments via the platform API |
| `mint project list / get / create / update / delete` | CRUD on projects |
| `mint plugin list / upload / install / upgrade` | Admin plugin operations against a running platform |
| `mint admin user / role / plugin-role` | User, RBAC role, and per-plugin role administration |
| `mint debug summary / health / system / config / logs / updates` | Read-only platform diagnostics |
| `mint update check / apply` | Platform, SDK, and plugin update checks and platform update application |
| `mint status` | Platform health overview |

Detail: [Platform commands](/cli/platform). Configuration of how `mint` reaches the platform: [Configuration](/cli/configuration).

### Plugin-development commands

These commands act on a plugin project (cd into the plugin's directory first):

| Command | Purpose |
|---------|---------|
| `mint init` | Scaffold a new plugin project |
| `mint dev` | Run the plugin (and optionally a local platform) with hot reload |
| `mint dev logs` | Tail logs from a running plugin process |
| `mint build` | Package the plugin into a `.mint` bundle |
| `mint doctor` | Validate the plugin project structure |
| `mint info` | Print the plugin's metadata |
| `mint docs` | Browse SDK reference documentation from the CLI |
| `mint sdk link / unlink / update` | Manage the plugin's SDK pin |

Full details — subcommands and primary flags: [Plugin Development → CLI reference](/sdk/api/cli-reference).

## What `mint` is not

- **Not a platform launcher.** `mint serve` doesn't exist. Start the platform with `uvicorn api.main:app`.
- **Not a local `pip install <plugin>` replacement.** `mint plugin install` asks the running platform server to install a package or server-visible source, and `mint plugin upload` sends a `.mint` bundle to that server. For day-to-day use, admins usually use the Marketplace or Admin UI.
- **Not a daemon.** `mint dev` runs in the foreground.

## Next

→ [Platform commands](/cli/platform)
→ [Configuration](/cli/configuration)
→ [Plugin development → CLI reference](/sdk/api/cli-reference)
