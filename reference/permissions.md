# Permissions Reference

MINT's RBAC has three pieces:

1. **18 permissions** in 5 resource families
2. **3 system roles** (Admin / Member / Viewer) plus admin-defined custom roles
3. **3 per-project role overrides** (Owner / Editor / Viewer)

Effective rights for any action = max(system role rights, project role rights, experiment-collaborator rights).

The authoritative list lives at [`api/permissions.py`](https://github.com/MorscherLab/mld/blob/main/api/permissions.py); this page mirrors it.

## Permission catalog

### Projects

| Permission | What it grants |
|------------|----------------|
| `project.read` | Read project metadata and member list |
| `project.write` | Create and edit projects, change settings |
| `project.delete` | Delete a project (with the typed-confirmation dialog) |
| `project.manage_members` | Add / remove members and change project roles |

### Experiments

| Permission | What it grants |
|------------|----------------|
| `experiment.read` | Read experiments inside accessible projects |
| `experiment.write` | Create and edit experiments, change status |
| `experiment.delete` | Soft-delete an experiment (and restore within the grace window) |
| `experiment.manage_collaborators` | Add / remove per-experiment collaborators |

### Plugins

| Permission | What it grants |
|------------|----------------|
| `plugin.read` | See installed plugins and their metadata |
| `plugin.install` | Install a plugin from the marketplace or a local file |
| `plugin.uninstall` | Uninstall a plugin (any of keep / archive / purge) |
| `plugin.upgrade` | Upgrade a plugin to a newer version |

### Marketplace

| Permission | What it grants |
|------------|----------------|
| `marketplace.read` | Browse the marketplace |
| `marketplace.request_install` | Submit an install request for admin approval |
| `marketplace.approve_install` | Approve or reject pending install requests |

### Platform

| Permission | What it grants |
|------------|----------------|
| `platform.read_settings` | View admin settings (SMTP, marketplace registry, …) |
| `platform.write_settings` | Modify admin settings |
| `platform.manage_users` | Create, disable, re-enable, and assign roles to users |

## System roles → permissions

| | Admin | Member | Viewer |
|---|---|---|---|
| `project.read` | ✓ | ✓ | ✓ |
| `project.write` | ✓ | ✓ | |
| `project.delete` | ✓ | | |
| `project.manage_members` | ✓ | ✓ ¹ | |
| `experiment.read` | ✓ | ✓ | ✓ |
| `experiment.write` | ✓ | ✓ | |
| `experiment.delete` | ✓ | ✓ ² | |
| `experiment.manage_collaborators` | ✓ | ✓ ² | |
| `plugin.read` | ✓ | ✓ | ✓ |
| `plugin.install` | ✓ | | |
| `plugin.uninstall` | ✓ | | |
| `plugin.upgrade` | ✓ | | |
| `marketplace.read` | ✓ | ✓ | ✓ |
| `marketplace.request_install` | ✓ | ✓ | |
| `marketplace.approve_install` | ✓ | | |
| `platform.read_settings` | ✓ | | |
| `platform.write_settings` | ✓ | | |
| `platform.manage_users` | ✓ | | |

¹ Members can manage members of projects they're a Project Owner of.
² Members can edit / delete experiments they own or collaborate on.

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
| Manage collaborators | ✓ | ✓ | |

Effective rights merge with the system role: a system Viewer who is Project Editor can edit experiments inside that project, but still cannot install plugins or change platform settings.

## Experiment collaborator overrides

Collaborators stored on an experiment grant a third tier of access for that experiment only.

| Collaborator role | Effect |
|-------------------|--------|
| **Viewer** | Can read this experiment even if not a project member |
| **Editor** | Can edit design data and run analyses on this experiment |
| **Owner** | Same as the original owner, including delete |

Collaborator entries survive even if the user is later removed from the project — useful for cross-team work where a colleague needs to see one experiment without joining the whole project.

## Custom roles

Admins can build custom roles by composing any subset of the 18 permissions above. Custom roles appear alongside the built-in three when assigning a user's system role.

Common custom-role recipes:

| Role | Permissions |
|------|-------------|
| **Marketplace approver** | `marketplace.read`, `marketplace.approve_install` |
| **Read-only auditor** | All `*.read` permissions only |
| **Plugin author** | `plugin.read`, `plugin.install`, `plugin.uninstall`, `plugin.upgrade`, `marketplace.read` |

The role-design rationale (why exactly these 18 permissions) is in [`decisions/2026-04-10-rbac-roles-design.md`](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-10-rbac-roles-design.md).

## Plugin-internal roles

Plugins can register their own role enum via `UserPluginRole`. These are scoped to the plugin: they don't grant any platform permissions and don't appear in this matrix. A plugin's role affects only what that plugin's own UI lets the user do. Set them under **Admin → Plugins → \<plugin> → Users**.

## Next

→ [Members & roles](/workflow/members-roles) — how to assign roles in the UI
→ [Authentication](/workflow/auth-passkeys) — how users prove who they are
