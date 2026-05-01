# Members & Roles

MINT uses a two-tier role-based access control (RBAC) model: a **system role** governs platform-wide rights, and a **per-project role** can refine or override those rights inside a single project. Eighteen permissions are grouped across five resource families; admins can also build custom roles by composing those permissions.

> [Screenshot: Admin → Roles page with the Admin / Member / Viewer presets and a custom role]

## System roles

Three roles ship out of the box:

| Role | Effective rights |
|------|------------------|
| **Admin** | All 18 permissions. Manages users, roles, plugins, the marketplace, the platform itself. |
| **Member** | Create and edit projects/experiments they belong to. Run analysis plugins. No platform admin. |
| **Viewer** | Read-only across the platform. No writes. |

Every user has exactly one system role. Set on **Admin → Users** for a single user, or via the in-app onboarding flow when invitations are accepted.

## Per-project roles

Inside a project, the system role is the floor. The project role can grant **more** rights for that project — but never less than the platform Viewer baseline.

| Project role | Effective rights inside the project |
|--------------|-------------------------------------|
| **Project owner** | Full edit, including project settings, archival, deletion |
| **Project editor** | Edit experiments, run plugins, invite members |
| **Project viewer** | Read-only |

A user's effective rights in a project = max(system role rights, project role rights). A platform Member who is project Owner can do everything the platform Member role allows — which already includes editing — plus the project-owner-only operations (archive, delete, change project settings).

> [Screenshot: project Members tab showing each member's project role]

## Invite a member

From a project's **Members** tab, click **Invite**.

| Field | Notes |
|-------|-------|
| Email | The user must already have a MINT account, or be invited by email if your platform allows it |
| Project role | Owner / Editor / Viewer (above) |
| Welcome message | Optional, sent in the email if SMTP is configured |

Project members appear immediately on the project. Their effective rights apply to every experiment in the project, with one exception: an experiment's own [collaborators](/workflow/experiments#collaborators) can grant additional rights on a single experiment.

## The 18 permissions

Permissions are referenced by `resource.action` strings. Every backend route is guarded by `require_permission("resource.action")`.

| Group | Permissions |
|-------|-------------|
| **Projects** | `project.read`, `project.write`, `project.delete`, `project.manage_members` |
| **Experiments** | `experiment.read`, `experiment.write`, `experiment.delete`, `experiment.manage_collaborators` |
| **Plugins** | `plugin.read`, `plugin.install`, `plugin.uninstall`, `plugin.upgrade` |
| **Marketplace** | `marketplace.read`, `marketplace.request_install`, `marketplace.approve_install` |
| **Platform** | `platform.read_settings`, `platform.write_settings`, `platform.manage_users` |

The full mapping of role → permissions lives at [`api/permissions.py`](https://github.com/MorscherLab/mld/blob/main/api/permissions.py) in the platform repo. The reference in this manual is at [Permissions](/reference/permissions).

## Custom roles

Admins can compose custom roles from any subset of the 18 permissions:

> [Screenshot: custom-role editor with permissions checkboxes]

Custom roles are useful for narrow scopes — e.g., a "Marketplace approver" role that only has `marketplace.approve_install`, without any project or experiment writes. Once defined, they appear alongside the built-in roles when assigning a system role to a user.

The role-design rationale (why exactly these 18 permissions, why these groups) is in [`decisions/2026-04-10-rbac-roles-design.md`](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-10-rbac-roles-design.md).

## Plugin-specific roles

Plugins can register their own user-facing roles, distinct from platform RBAC. These are stored in `UserPluginRole` and only restrict access **within** that plugin — they don't grant any platform-level permissions. A plugin's role tells the plugin who can do what inside its UI; it does not affect MINT's project / experiment guards.

## Next

→ [Authentication](/workflow/auth-passkeys) — how users prove who they are
→ [Permissions](/reference/permissions) — full RBAC reference
