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
mint experiment get 42                            # show a single experiment
mint experiment create "Run 17" \
  --type lcms_sequence \
  --project-id 12 \
  --notes "TCA flux batch"                        # create
mint experiment update 42 --status completed      # status flip
```

| Flag (across subcommands) | Effect |
|---|---|
| `--json` | Emit machine-readable JSON |
| `--limit <N>` | Cap the result count for `list` |
| `--status <status>` | Filter `list` or update a single experiment's status |
| `--type <type>` | Filter `list` or set an experiment type |
| `--project-id <id>` | Filter `list`, create in a project, or move an experiment |

Design data and analysis results have dedicated read commands: `mint experiment data <id>` and `mint experiment results <id>`.

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

For deeper operational status, use **Admin → Status** in the browser UI.

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
| `mint status` | This page |
| `mint --help` | Full enumerated subcommand list |

::: info
For programmatic access from inside a Python script (rather than via the CLI), use `mint-sdk` — it ships a typed client. See [REST client](/sdk/api/client).
:::

## Next

→ [Plugin development tutorial](/sdk/tutorials/first-analysis-plugin) — `mint init`, `mint dev`, `mint build`
→ [Configuration](/cli/configuration) — config file and env vars
