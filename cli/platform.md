# Platform Commands

The `mint` CLI also includes commands for scripted access to a running MINT instance — useful for batch experiment creation, CI integration, and admin chores. These commands talk to the platform's REST API using the same JWT mechanics as the browser UI.

## Authenticate

```bash
mint auth login --url https://mint.morscherlab.org
```

Prompts for username and password, then stores the resulting JWT in `~/.config/mint/credentials.json` (or `$XDG_CONFIG_HOME/mint/credentials.json`). Subsequent commands use it automatically.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login` | Acquire a JWT for the given platform URL |
| `mint auth logout` | Discard the stored JWT |
| `mint auth status` | Print the active platform URL, user, expiration |

The credential file tracks one default host plus per-host tokens. To switch instances, run `mint auth login --url <other-url>`.

## Experiments

```bash
mint experiment list                              # all visible experiments
mint experiment list --project-id 12             # filter by project ID
mint experiment list --status ongoing             # filter by status
mint experiment list --search "TCA" --mine        # search my experiments
mint experiment get 42                            # show a single experiment
mint experiment create "Run 17" \
  --type lcms_sequence \
  --project-id 12 \
  --notes "TCA flux batch"                        # create
mint experiment update 42 --status completed      # status flip
mint experiment data 42 --view summary            # design-data summary
mint experiment results 42 --plugin dose-response # one plugin result
```

| Flag (across subcommands) | Effect |
|---|---|
| `--json` | Emit machine-readable JSON |
| `--limit <N>` | Cap the result count for `list` |
| `--status <status>` | Filter `list` or update a single experiment's status (`planned`, `ongoing`, `completed`, `cancelled`) |
| `--type <type>` | Filter `list` or set an experiment type |
| `--project-id <id>` | Filter `list`, create in a project, or move an experiment |
| `--search <text>` | Search experiment name/notes for `list` |
| `--mine` | Show only experiments created by the current user |
| `--since <YYYY-MM-DD>` / `--before <YYYY-MM-DD>` | Filter `list` by creation date window |

Experiment maintenance subcommands:

| Subcommand | Purpose |
|------------|---------|
| `mint experiment data <id> [--view raw\|tree\|summary] [--format json\|csv]` | Read the experiment's design-data payload |
| `mint experiment results <id> [--plugin <plugin-id>] [--json]` | Read analysis results, optionally one plugin's entry |
| `mint experiment types [--json]` | List enabled experiment types |
| `mint experiment delete <id> [--yes]` | Delete an experiment immediately |

## Projects

```bash
mint project list                                 # all visible projects
mint project create "TCA flux" \
  --description "..."                             # create
mint project update 12 --status archived          # archive
mint project experiments 12                       # list project experiments
mint project members 12                           # list project members
```

Project status values are `active`, `archived`, and `completed`.

## Plugins

Plugin commands are for administrators and other users with matching server-side plugin permissions.

```bash
mint plugin list
mint plugin upload ./dist/my-plugin-1.0.0.mint
mint plugin install my-plugin-package
mint plugin github install MorscherLab/my-plugin --tag v1.0.0
mint plugin config get my-plugin
mint plugin config update my-plugin --file settings.json
```

| Subcommand | Purpose |
|------------|---------|
| `mint plugin list` | Show loaded plugins and installed plugin packages |
| `mint plugin upload <bundle.mint>` | Upload and install a local `.mint` bundle |
| `mint plugin install <source>` | Ask the platform to install a package name, Git URL, or server-visible local path |
| `mint plugin upgrade <package>` | Upgrade through the platform plugin manager |
| `mint plugin update <package>` | Update from the package's registered GitHub source |
| `mint plugin uninstall <package>` | Uninstall a plugin package |
| `mint plugin github install <repo>` | Install the matching `.mint` release asset from GitHub |
| `mint plugin config get/set/update <plugin>` | Read or write `plugins.settings.<plugin>` |
| `mint plugin index list/set` | Manage extra Python package indexes for plugin installs |

These commands do not install plugins into your local shell environment. They call the running MINT server, and the server performs dependency checks, bundle extraction, settings writes, and restart-required reporting.

## Status

```bash
mint status
```

Prints a one-screen health overview:

- Configured host
- Stored username
- Platform reachability
- Loaded plugins returned by `/health`
- Token validity / expiry when the server can verify it

For deeper operational status, use **Admin -> Platform -> Server** in the browser UI.

## Admin

Administrative subcommands require the matching server-side permissions:

| Subcommand | Purpose |
|------------|---------|
| `mint admin user ...` | Manage platform users |
| `mint admin role ...` | Manage RBAC roles |
| `mint admin plugin-role ...` | Manage per-plugin user roles |

Use `--help` on each subcommand for the exact flags before scripting changes.

## Debug

Diagnostics are read-only helpers for support and ops checks:

| Subcommand | Purpose |
|------------|---------|
| `mint debug summary` | Run a read-only platform diagnostics summary |
| `mint debug health` | Read the public platform health endpoint |
| `mint debug system` | Read the admin system snapshot |
| `mint debug config` | Show safe admin configuration |
| `mint debug logs` | Read parsed platform logs |
| `mint debug updates` | Show update diagnostics and optionally run update checks |

## Updates

```bash
mint update check
mint update apply --yes
```

`mint update check` reports platform, SDK, and plugin update sources. `mint update apply` applies the latest platform update and requires admin permissions.

## Scripting tips

Combine commands with `--json` and `jq`:

```bash
# Find every ongoing experiment in the active project, mark completed
mint experiment list --project-id 12 --status ongoing --json \
  | jq -r '.[].id' \
  | xargs -n1 -I{} mint experiment update {} --status completed
```

Authentication tokens are short-lived (24 hours by default). For long-running scripts, catch 401s and re-run `mint auth login`; the Python `MINTClient` can attempt token refresh automatically during requests.

## Reference

| Command | Detail |
|---------|--------|
| `mint auth` | This page |
| `mint experiment` | This page |
| `mint project` | This page |
| `mint plugin` | This page |
| `mint admin` | This page |
| `mint debug` | This page |
| `mint update` | This page |
| `mint status` | This page |
| `mint --help` | Full enumerated subcommand list |

::: info
For programmatic access from inside a Python script (rather than via the CLI), use `mint-sdk` — it ships a typed client. See [REST client](/sdk/api/client).
:::

## Next

→ [Plugin development guide](/sdk/) — `mint init`, `mint dev`, `mint build`
→ [Configuration](/cli/configuration) — config file and env vars
