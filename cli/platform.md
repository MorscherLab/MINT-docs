# Platform Commands

The `mint` CLI also includes commands for scripted access to a running MINT instance — useful for batch experiment creation, CI integration, and admin chores. These commands talk to the platform's REST API using the same JWT mechanics as the browser UI.

## Authenticate

```bash
mint auth login --url https://mint.morscherlab.org
```

Prompts for credentials (or initiates a passkey flow, if configured) and stores the resulting JWT in `~/.config/mint/cli.json`. Subsequent commands use it automatically.

| Subcommand | Purpose |
|------------|---------|
| `mint auth login` | Acquire a JWT for the given platform URL |
| `mint auth logout` | Discard the stored JWT |
| `mint auth status` | Print the active platform URL, user, expiration |
| `mint auth refresh` | Refresh the JWT before it expires |

If you have multiple instances, pass `--profile <name>` to keep them separate; without `--profile` the CLI uses a `default` profile.

## Experiments

```bash
mint experiment list                              # all visible experiments
mint experiment list --project EXP-PROJ-Q1       # filter by project
mint experiment list --status ongoing             # filter by status
mint experiment get EXP-042                       # show a single experiment
mint experiment create --type lcms_sequence \
                        --project "TCA flux" \
                        --title "Run 17"          # create
mint experiment update EXP-042 --status completed  # status flip
```

| Flag (across subcommands) | Effect |
|---|---|
| `--json` | Emit machine-readable JSON |
| `--csv` | Emit CSV (for `list`) |
| `--profile <name>` | Use a non-default auth profile |
| `--limit <N>` | Cap the result count for `list` |

Experiment design data (the `design_data` JSON) can be passed via `--design-file design.json` for `create` or `update`.

## Projects

```bash
mint project list                                 # all visible projects
mint project create --name "TCA flux" \
                    --description "..."           # create
mint project archive <project-id>                 # archive
```

Same `--json` / `--csv` / `--profile` flags as experiments.

## Status

```bash
mint status
```

Prints a one-screen health overview:

- Platform version + uptime
- Database mode + migration state
- Installed plugins with version and migration state
- Last marketplace check
- Outstanding install requests
- Update channel + pending updates

For machine-readable output add `--json`. The endpoint is the same one used by **Admin → Status** in the UI.

## Scripting tips

Combine commands with `--json` and `jq`:

```bash
# Find every ongoing experiment in the active project, mark completed
mint experiment list --project "TCA flux" --status ongoing --json \
  | jq -r '.[].code' \
  | xargs -n1 mint experiment update --status completed
```

Authentication tokens are short-lived (24 hours by default); long-running scripts should run `mint auth refresh` before lengthy loops or catch the 401 and refresh on demand.

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

→ [Plugin development](/cli/plugin-dev) — `mint init`, `mint dev`, `mint build`
→ [Configuration](/cli/configuration) — config file and env vars
