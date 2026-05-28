# Members & Roles

MINT uses platform role-based access control (RBAC) plus project membership. A **system role** governs route-level rights across the platform. Project membership decides who belongs to a project, who leads it, and, in restricted visibility mode, which project experiments a user can see. Eighteen permissions are grouped across five resource families; admins can also build custom roles by composing those permissions.

> [Screenshot: Admin → Roles page with the Admin / Member / Viewer presets and a custom role]

## System roles

Three roles ship out of the box:

| Role | Effective rights |
|------|------------------|
| **Admin** | All 18 permissions. Manages users, roles, plugins, the marketplace, the platform itself. |
| **Member** | Create and edit projects/experiments they belong to. Run analysis plugins. No platform admin. |
| **Viewer** | Read-only across the platform. No writes. |

Every user has exactly one system role. Set on **Admin → Users** for a single user, or via the in-app onboarding flow when invitations are accepted.

## Project membership

Each project has a creator and optional `lead_id`. The creator, lead, or an Admin can edit project metadata, delete the project, and manage project members. Members can currently be labeled `editor` or `viewer`; that label is stored with the membership and shown in the UI, but route-level write access still requires the user's system role to include the relevant permission.

| Project relationship | Current effect |
|----------------------|----------------|
| **Creator / lead** | Can update/delete the project and manage members, if their system role also has the required project permission |
| **Member: editor** | Project membership label; contributes to restricted experiment visibility |
| **Member: viewer** | Project membership label; contributes to restricted experiment visibility |

In other words: do not use project membership as a substitute for system RBAC. A user still needs `experiments.edit` to edit experiments, `projects.manage_members` to manage members, and so on.

> [Screenshot: project Members tab showing each member's project role]

## Invite a member

From a project's **Members** tab, click **Invite**.

| Field | Notes |
|-------|-------|
| Email | The user must already have a MINT account, or be invited by email if your platform allows it |
| Project role | `editor` or `viewer`; current server-side writes are still gated by system permissions |
| Welcome message | Optional, sent in the email if SMTP is configured |

Project members appear immediately on the project. In `access.experimentVisibilityMode: "restricted"`, membership contributes to which experiments appear in lists. An experiment's own [collaborators](/workflow/experiments#collaborators) can also grant visibility on a single experiment.

## The 18 permissions

Permissions are referenced by `resource.action` strings. The platform's backend routes check them via FastAPI dependencies; the admin UI surfaces grouped toggles for each.

| Group | Permissions |
|-------|-------------|
| **`projects.*`** (5) | `view`, `create`, `edit`, `delete`, `manage_members` |
| **`experiments.*`** (4) | `view`, `create`, `edit`, `delete` |
| **`plugins.*`** (4) | `view`, `use`, `configure`, `install` |
| **`users.*`** (3) | `view`, `invite`, `manage` |
| **`platform.*`** (2) | `configure`, `view_logs` |

The full mapping of role → permissions lives at [`api/permissions.py`](https://github.com/MorscherLab/MINT/blob/main/api/permissions.py) in the platform repo. The reference in this manual is at [Permissions](/reference/permissions).

## Custom roles

Admins can compose custom roles from any subset of the 18 permissions:

> [Screenshot: custom-role editor with permissions checkboxes]

Custom roles are useful for narrow scopes — e.g., a "Plugin operator" role that has `plugins.view`, `plugins.use`, and `plugins.configure` but not `plugins.install`. Once defined, they appear alongside the built-in roles when assigning a system role to a user.

The role-design rationale (why exactly these 18 permissions, why these groups) is in [`decisions/2026-04-10-rbac-roles-design.md`](https://github.com/MorscherLab/MINT/blob/main/decisions/2026-04-10-rbac-roles-design.md).

## Plugin-specific roles

Plugins can register their own user-facing roles, distinct from platform RBAC. These are stored in `UserPluginRole` and only restrict access **within** that plugin — they don't grant any platform-level permissions. A plugin's role tells the plugin who can do what inside its UI; it does not affect MINT's project / experiment guards.

## Next

→ [Authentication](/workflow/auth-passkeys) — how users prove who they are
→ [Permissions](/reference/permissions) — full RBAC reference
