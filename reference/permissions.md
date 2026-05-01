# Permissions Reference

MINT's RBAC has three pieces:

1. **18 permissions** in 5 resource families
2. **3 system roles** (Admin / Member / Viewer) plus admin-defined custom roles
3. **Per-project role overrides** layered on top

The authoritative list lives at [`api/permissions.py`](https://github.com/MorscherLab/mld/blob/main/api/permissions.py); this page mirrors it.

## Permission catalog

### `projects.*` (5)

| Permission | What it grants |
|------------|----------------|
| `projects.view` | Read project metadata and member list |
| `projects.create` | Create new projects |
| `projects.edit` | Edit project metadata, change settings |
| `projects.delete` | Delete a project |
| `projects.manage_members` | Add / remove members and change project roles |

### `experiments.*` (4)

| Permission | What it grants |
|------------|----------------|
| `experiments.view` | Read experiments inside accessible projects |
| `experiments.create` | Create new experiments |
| `experiments.edit` | Edit experiment metadata, design data, status |
| `experiments.delete` | Delete an experiment |

### `plugins.*` (4)

| Permission | What it grants |
|------------|----------------|
| `plugins.view` | See installed plugins and their metadata |
| `plugins.use` | Invoke plugin routes (run analyses, fill design forms, etc.) |
| `plugins.configure` | Change plugin settings, manage per-plugin user roles |
| `plugins.install` | Install / uninstall / upgrade plugins (gates the marketplace approval action) |

### `users.*` (3)

| Permission | What it grants |
|------------|----------------|
| `users.view` | List users |
| `users.invite` | Send invitations to new users |
| `users.manage` | Disable / re-enable users; assign system roles |

### `platform.*` (2)

| Permission | What it grants |
|------------|----------------|
| `platform.configure` | Modify admin settings (SMTP, marketplace registry, observability, auth) |
| `platform.view_logs` | View structured logs and the admin status dashboard |

## System roles → permissions

The platform ships three system roles. Their permission sets come directly from `api/permissions.py`:

- **Admin** — every permission (all 18)
- **Member** — every permission EXCEPT `users.manage`, `platform.configure`, `plugins.install`
- **Viewer** — only the four `*.view` permissions: `projects.view`, `experiments.view`, `plugins.view`, `users.view`

Tabular form:

| | Admin | Member | Viewer |
|---|---|---|---|
| `projects.view` | ✓ | ✓ | ✓ |
| `projects.create` | ✓ | ✓ | |
| `projects.edit` | ✓ | ✓ | |
| `projects.delete` | ✓ | ✓ | |
| `projects.manage_members` | ✓ | ✓ | |
| `experiments.view` | ✓ | ✓ | ✓ |
| `experiments.create` | ✓ | ✓ | |
| `experiments.edit` | ✓ | ✓ | |
| `experiments.delete` | ✓ | ✓ | |
| `plugins.view` | ✓ | ✓ | ✓ |
| `plugins.use` | ✓ | ✓ | |
| `plugins.configure` | ✓ | ✓ | |
| `plugins.install` | ✓ | | |
| `users.view` | ✓ | ✓ | ✓ |
| `users.invite` | ✓ | ✓ | |
| `users.manage` | ✓ | | |
| `platform.configure` | ✓ | | |
| `platform.view_logs` | ✓ | ✓ | |

## Custom roles

Admins can build custom roles by composing any subset of the 18 permissions above. Custom roles appear alongside the built-in three when assigning a user's system role.

Common custom-role recipes:

| Role | Permissions |
|------|-------------|
| **Read-only auditor** | All `*.view` permissions only |
| **Plugin operator** | `plugins.view`, `plugins.use`, `plugins.configure` (no install) |
| **Plugin admin** | The Plugin operator set plus `plugins.install` |
| **Project lead** | All `projects.*` plus all `experiments.*` |

The role-design rationale (why exactly these 18 permissions) is in [`decisions/2026-04-10-rbac-roles-design.md`](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-10-rbac-roles-design.md).

## Project role overrides

A user's project role applies inside that project; outside it, only their system role matters.

| | Project Owner | Project Editor | Project Viewer |
|---|---|---|---|
| Read project | ✓ | ✓ | ✓ |
| Edit project metadata | ✓ | | |
| Archive / delete project | ✓ | | |
| Add / remove members | ✓ | | |
| Read experiments | ✓ | ✓ | ✓ |
| Create / edit experiments | ✓ | ✓ | |
| Delete experiments | ✓ | (own only) | |

Effective rights merge with the system role: a system Viewer who is Project Editor can edit experiments inside that project, but still cannot install plugins or change platform settings.

## Experiment collaborator overrides

Collaborators stored on an experiment grant a third tier of access for that experiment only. The `collaborators` field on `Experiment` records (user_id, role) pairs:

| Collaborator role | Effect |
|-------------------|--------|
| **Viewer** | Can read this experiment even if not a project member |
| **Editor** | Can edit design data and run analyses on this experiment |
| **Owner** | Same as the original owner, including delete |

Collaborator entries survive even if the user is later removed from the project — useful for cross-team work where a colleague needs to see one experiment without joining the whole project.

## Plugin-internal roles

Plugins can register their own role enum via `UserPluginRole`. These are scoped to the plugin: they don't grant any platform permissions and don't appear in this matrix. A plugin's role affects only what that plugin's own UI lets the user do. Set them under **Admin → Plugins → \<plugin> → Users**. See [Plugin Development → Tutorials → Plugin roles](/sdk/tutorials/plugin-roles) for how plugins use them.

## Next

→ [Members & roles](/workflow/members-roles) — how to assign roles in the UI
→ [Authentication](/workflow/auth-passkeys) — how users prove who they are
