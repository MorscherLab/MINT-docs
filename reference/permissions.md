# Permissions Reference

This page lists the 27 MINT permissions in 11 groups, the system roles, and the rules for custom roles. The source is [`api/permissions.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/permissions.py).

## Permission catalog

### `projects.*` (5)

| Permission | What it grants |
|------------|----------------|
| `projects.view` | Read project metadata and member list |
| `projects.create` | Create new projects |
| `projects.edit` | Edit project metadata, change settings |
| `projects.delete` | Delete a project |
| `projects.manage_members` | Add and remove members. To change the project role of a member, remove the member and add them again with the new role |

### `experiments.*` (5)

| Permission | What it grants |
|------------|----------------|
| `experiments.view` | Read experiments inside accessible projects |
| `experiments.create` | Create new experiments |
| `experiments.edit` | Edit experiment metadata, design data, status |
| `experiments.delete` | Delete an experiment |
| `experiments.manage_codes` | Change or clear an assigned experiment number. Without it, only the administrator can. Only the Admin role has it at first |

### `instruments.*` (2)

| Permission | What it grants |
|------------|----------------|
| `instruments.view` | List and read the shared [instrument directory](/guide/instruments) (`GET /api/instruments`, `GET /api/instruments/{id}`), including live status. Opens the `/instruments` and `/instruments/:id` pages and the `mint_list_instruments` MCP tool |
| `instruments.edit` | Create, edit and deactivate instruments. Also needed to set a plugin's instrument status grant and, together with `users.manage`, to manage [service tokens](/admin/authentication#service-tokens) (`/api/admin/service-tokens`) |

### `plugins.*` (4)

| Permission | What it grants |
|------------|----------------|
| `plugins.view` | See installed plugins and their metadata |
| `plugins.use` | Invoke plugin routes (run analyses, fill design forms, etc.), open plugin panels on the experiment page, and edit a live design form |
| `plugins.configure` | Change plugin settings, call plugin endpoints, jobs and MCP tools with `access="configure"`, and read the plugin lock history |
| `plugins.install` | Install / uninstall / upgrade plugins, register external and Docker runtimes, roll back the [plugin dependency lock](/admin/plugins#plugin-dependency-lock), and change where plugin code comes from (private package indexes, update sources, the Prereleases toggle) |

### `jobs.*` (2)

| Permission | What it grants |
|------------|----------------|
| `jobs.read_all` | Read job state beyond the current user's own jobs |
| `jobs.manage_all` | Cancel or manage jobs beyond the current user's own jobs |

### `filesystem.*` (1)

| Permission | What it grants |
|------------|----------------|
| `filesystem.browse` | Browse the read-only server directories configured in `filesystem.mounts` |

### `notifications.*` (2)

| Permission | What it grants |
|------------|----------------|
| `notifications.receive_important` | Receive platform-routed important notifications |
| `notifications.broadcast` | Let a notification that the user causes reach other people or a Teams or Slack channel. Without it, a user's notification reaches only that user. Only the Admin role has it at first |

### `calendar.*` (1)

| Permission | What it grants |
|------------|----------------|
| `calendar.read_all` | Read calendar feeds beyond the current user's personal scope |

### `notices.*` (1)

| Permission | What it grants |
|------------|----------------|
| `notices.publish` | Publish, pin, archive, and expire platform notices |

### `users.*` (2)

| Permission | What it grants |
|------------|----------------|
| `users.view` | List users |
| `users.manage` | Create, update, activate, deactivate and delete users, reset passwords, assign roles, manage roles, reset a user's passkeys (`DELETE /api/admin/users/{id}/passkeys`, refused on your own account), and list and revoke every user's [personal access tokens](/admin/authentication#personal-access-tokens). With `instruments.edit` it also manages [service tokens](/admin/authentication#service-tokens) |

### `platform.*` (2)

| Permission | What it grants |
|------------|----------------|
| `platform.configure` | Modify admin settings (SMTP, push, marketplace registry, observability, auth, audit and instrument history retention), edit update settings and scheduled updates, apply platform updates, and use **Admin -> System -> Terminal** when enabled. Turning authentication off or dev mode on additionally requires the `admin` role |
| `platform.view_logs` | View structured logs and read the `GET /api/health/ready` readiness report |

### Admin panel

The **Admin** entry and the admin panel open only for a role that holds one of `users.manage`, `platform.configure`, `plugins.configure`, `plugins.install` or `notices.publish`. `GET /api/auth/config` serves this list. `users.view` and `platform.view_logs` alone do not open the panel, so the built-in Member and Viewer roles do not see it. In the panel, each section needs its own permission.

## System roles

MINT has three system roles:

| Role | Permissions |
|------|-------------|
| Admin | All 27 |
| Member (default for new accounts) | All `projects.*` and `experiments.*` except `experiments.manage_codes`; `instruments.view`, `plugins.view`, `plugins.use`, `users.view`, `platform.view_logs`, `filesystem.browse` |
| Viewer | `projects.view`, `experiments.view`, `instruments.view`, `plugins.view`, `plugins.use`, `users.view` |

## Custom roles

An admin can build a custom role from any set of the 27 permissions. A custom role shows next to the system roles when you assign a role to a user.

- A role also has a project scope and a plugin access list: `all` or selected plugins. Any other stored value gives no plugin.
- The slug of a role matches `^[a-z0-9][a-z0-9_-]*$`.
- Only the exact slug `admin` is an administrator.

For the steps, see [Users & roles -> Custom roles](/admin/users-roles#custom-roles).

### Limits on `users.manage`

A non-admin with `users.manage` cannot:

- Assign the `admin` role.
- Create, edit or assign a role with permissions or plugin access that it does not hold itself.
- Create a user in a default role that outranks its own.
- Update, activate, deactivate, delete or reset the password of a user whose role outranks its own.

These checks apply to the user routes `PATCH /api/admin/users/{id}`, `POST /api/admin/users/{id}/activate|deactivate`, `PUT /api/admin/users/{id}/reset-password` and `DELETE /api/admin/users/{id}`. Nobody can act on their own account through these routes (400). Nobody can delete, deactivate or demote the last active administrator (409).

Examples of custom roles:

| Role | Permissions |
|------|-------------|
| Read-only auditor | All `*.view` permissions only |
| Plugin operator | `plugins.view`, `plugins.use`, `plugins.configure` (no install). A non-administrator needs `plugins.configure` for the `configure` access level |
| Plugin admin | The Plugin operator set plus `plugins.install` |
| Project lead | All `projects.*` plus all `experiments.*` |

The design decision for the roles is in [`decisions/2026-04-10-rbac-roles-design.md`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/decisions/2026-04-10-rbac-roles-design.md).

## Project membership

The system role controls write access. Project membership controls the member lists and, in restricted visibility mode, which experiments a user can see. See [Users & roles -> Project membership](/admin/users-roles#project-membership).

## Experiment collaborators

A collaborator on an experiment can see that one experiment without project membership. See [Experiments -> Collaborators](/guide/experiments#collaborators).

## Plugin access levels

A plugin tags each endpoint, job, MCP tool and page with the level `use`, `configure` or `admin`. There are no plugin roles. For how the platform maps the levels to roles, see [Users & roles -> Plugin access levels](/admin/users-roles#plugin-access-levels). For plugin authors, see [Route permissions](/sdk/recipes/route-permissions).

## Admin terminal

**Admin -> System -> Terminal** has no permission of its own. It is available only when both conditions are true:

- `adminTerminalEnabled` is on in `config.json`, or `MINT_ADMIN_TERMINAL_ENABLED=true` is set.
- The user has `platform.configure`.

The terminal opens a short-lived shell in the running MINT process or container. It can write a startup script to `server.dataPath/admin-terminal/startup.sh`. Give it only to people who may administer the server.

During a session, MINT checks the caller again every 15 seconds. The shell closes with "access revoked" when the account is deactivated, its role loses `platform.configure`, or its session is revoked, for example by a password change. A failed status lookup also closes it.
