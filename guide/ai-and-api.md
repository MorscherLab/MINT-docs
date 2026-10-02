# AI Assistants and API Access

A **personal access token** lets a program act as you in MINT: an AI assistant such as Claude Code, a script calling the REST API, or the `mint` CLI. MINT also runs an **MCP server** (Model Context Protocol) so AI assistants can search experiments, read designs and results, and start plugin jobs on your behalf.

A token can do exactly what your account can do, and no more. Treat it like a password.

## Open AI & API

1. Open the account menu in the top action bar and choose **Your account**.
2. Select **AI & API** in the side rail.

The section shows the MCP URL for this MINT server (for example `https://mint.example.org/mcp`) with a **Copy** button, and a table of your **Access tokens**.

> [Screenshot: Your account modal with the AI & API section: MCP URL and the Access tokens table]

## Create a token

1. In **AI & API**, click **New token**.
2. Enter a **Name** that says where the token will be used, for example "Claude Code on my laptop".
3. Choose **Expires in**: 30, 90, or 365 days. The default is 90 days. Your admin may cap the lifetime; longer options are then disabled.
4. Optional: switch on **Read-only**. A read-only token can read data but cannot create, change, or delete anything.
5. Click **Create token**.
6. Copy the token (it starts with `mint_pat_`) or the prefilled **Add to Claude Code** command, then click **Done**.

The secret is shown only once. MINT stores only a fingerprint of it, so neither you nor an admin can view it again. If you lose it, revoke the token and create a new one.

> [Screenshot: New token dialog, step 2 Copy, with the secret and the Add to Claude Code command]

## Connect Claude Code

Run the command from the dialog in a terminal. It has this form:

```bash
claude mcp add --transport http mint https://mint.example.org/mcp \
  --header "Authorization: Bearer mint_pat_..."
```

Other MCP clients need the same two things: the MCP URL from **AI & API**, and the header `Authorization: Bearer <your token>`. The MCP server accepts personal access tokens only, not your browser sign-in.

## Manage your tokens

The **Access tokens** table lists each token's name and prefix, access (**full**, **read-only**, or **expired**), expiry date, and when it was last used.

To revoke a token, click **Revoke**, then **Confirm** within a few seconds. The token stops working at once. Expired tokens show **Remove** instead.

A token cannot create or revoke tokens. Sign in to the web UI to manage them. Changing your password does not revoke your tokens. If a token may have leaked, revoke it. Admins can also see and revoke every user's tokens; see [Authentication](/admin/authentication).

## Use a token with the API or CLI

- **REST API**: send the token as `Authorization: Bearer mint_pat_...`. It works on every platform route and on plugin routes. A read-only token is refused (403) on anything other than `GET`, `HEAD`, and `OPTIONS`.
- **`mint` CLI and Python client**: run `mint auth login` and approve the code in your browser, or set the `MINT_TOKEN` environment variable. Add `--read-only` to `mint auth login` for a read-only token. See [mint CLI](/admin/cli) and the [CLI reference](/sdk/api/cli-reference) for token commands.

## What an AI assistant can do over MCP

Every tool runs as you and respects your role, project access, and plugin visibility. Tools you lack the permission for are not offered.

| Group | Tools | Available to read-only tokens |
|-------|-------|:---:|
| **Read** | `mint_whoami`, `mint_search_experiments`, `mint_get_experiment`, `mint_list_plugins`, `mint_get_design`, `mint_list_artifacts`, `mint_get_artifact`, `mint_list_instruments` (needs `instruments.view`) | Yes |
| **Write** | `mint_create_experiment`, `mint_save_design`, `mint_save_artifact`, `mint_archive_artifact`, `mint_restore_artifact` | No |
| **Jobs** | `mint_start_job`, `mint_get_job`, `mint_get_job_result`, `mint_cancel_job` | Status and results only |
| **Plugin tools** | Tools, prompts, and resources that installed plugins publish, named `<plugin>_<name>` | Read tools only |

The assistant can also read `mint://` resources: an experiment with its design data, a single analysis artifact, or a stored file of up to 5 MiB. Larger files must be downloaded from MINT directly.

Things to know:

- **No delete tools.** An assistant cannot delete experiments, designs, or artifacts. It can archive an artifact, and you can restore it.
- **Writes are audited.** Every write call appears in the audit log as `mcp.tool_call`, and artifacts saved over MCP record that they came from MCP and which token saved them.
- **Saving results is create-only.** An assistant cannot overwrite an artifact a plugin created.
- **Jobs.** `mint_list_plugins` lists each plugin's jobs and their inputs. A job input can be an experiment file, a file on a server mount, or an inline file of at most 4 MiB. One token can hold at most 64 unfinished job handles; finished, cancelled, and saved jobs do not count.
- **Restarts.** Job handles do not survive a platform restart; they then report `lost`. Start the job again.

Plugin authors who want to publish their own tools: see [MCP tools for plugins](/sdk/recipes/mcp-tools).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Longer lifetimes are greyed out | Your admin caps token lifetime; pick a shorter one or ask your admin |
| Assistant gets 401 | The token expired, was revoked, or your account was disabled; create a new token |
| Assistant cannot find a write tool | The token is read-only, or your role lacks the permission |
| A tool says "This access token is read-only" | Create a full-access token for that task |
