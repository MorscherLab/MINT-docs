# Users & Roles

MINT controls access with a **system role** per user plus project membership. The system role decides which actions a user may take anywhere in the platform. Project membership records who works on a project and, in restricted visibility mode, which experiments a user can see. Roles combine 23 permissions in 10 groups; admins can build custom roles from them.

> [Screenshot: Admin -> People -> Roles page with the Admin / Member / Viewer presets and a custom role]

## Accounts

People get an account by self-registration (on by default, controlled by `auth.allowRegistration`) or from an admin with `mint admin user create`. See [Authentication → Accounts and registration](/admin/authentication#accounts-and-registration).

**Admin -> People -> Users** (needs `users.view`) lists accounts. With `users.manage` you can edit a user, change the role, reset the password, deactivate, reactivate, or delete.

## System roles

Three roles ship out of the box:

| Role | Permissions |
|------|-------------|
| **Admin** | All 23. Also the only role that can manage the Admin role, disable authentication, or enable dev mode. |
| **Member** (default for new accounts) | All `projects.*` and `experiments.*`; `plugins.view`, `plugins.use`, `plugins.configure`; `users.view`; `platform.view_logs`; `filesystem.browse` |
| **Viewer** | `projects.view`, `experiments.view`, `plugins.view`, `plugins.use`, `users.view` |

Every user has exactly one system role. Change it on **Admin -> People -> Users**.

## Custom roles

**Admin -> People -> Roles** (needs `users.manage`) edits roles. Besides the permission toggles, each role has:

| Setting | Options | Effect |
|---------|---------|--------|
| **Project scope** | All projects / Assigned only | Whether the role sees every project or only projects the user is assigned to |
| **Plugin access** | All plugins / Selected only | Which plugins users with this role can see and open |

> [Screenshot: role editor with permission toggles, project scope, and plugin access]

A custom role suits narrow jobs, for example a "Plugin operator" with `plugins.view`, `plugins.use`, and `plugins.configure` but not `plugins.install`.

### Who can manage whom

A non-admin with `users.manage` can only act within their own rights:

- They cannot assign the Admin role or edit it.
- They cannot create, edit, or assign a role that has permissions or plugin access they lack.
- They cannot create a user in a role that outranks theirs, or edit, activate, deactivate, delete, or reset the password of such a user.

## Project membership

Each project has a creator and an optional lead. The creator, the lead, or an Admin can edit the project, delete it, and manage its members; they also need the matching permission (`projects.edit`, `projects.delete`, `projects.manage_members`).

Add members from the project's **Edit** form: pick an existing user under **Members**. Members are labelled `editor` or `viewer`. The label is shown in the UI, but write access still comes from the system role.

| Project relationship | Effect |
|----------------------|--------|
| **Creator / lead** | Can edit or delete the project and manage members, given the matching permission |
| **Member: editor** | Label only; counts toward restricted experiment visibility |
| **Member: viewer** | Label only; counts toward restricted experiment visibility |

Do not use project membership instead of system roles. A user still needs `experiments.edit` to edit experiments, and so on. An experiment's own [collaborators](/guide/experiments#collaborators) can also grant visibility on a single experiment.

> [Screenshot: project Team card listing members and their project roles]

## The 23 permissions

Permissions are `resource.action` strings. The backend checks them on every route; the role editor shows them as grouped toggles.

| Group | Permissions |
|-------|-------------|
| **`projects.*`** (5) | `view`, `create`, `edit`, `delete`, `manage_members` |
| **`experiments.*`** (4) | `view`, `create`, `edit`, `delete` |
| **`plugins.*`** (4) | `view`, `use`, `configure`, `install` |
| **`jobs.*`** (2) | `read_all`, `manage_all` |
| **`filesystem.*`** (1) | `browse` |
| **`notifications.*`** (1) | `receive_important` |
| **`calendar.*`** (1) | `read_all` |
| **`notices.*`** (1) | `publish` |
| **`users.*`** (2) | `view`, `manage` |
| **`platform.*`** (2) | `configure`, `view_logs` |

The authoritative list is [`api/permissions.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/permissions.py). See also [Permissions](/reference/permissions).

## Plugin-specific roles

Plugins can define their own roles, separate from system roles. They only restrict what a user can do **inside** that plugin and grant no platform permissions. Set them from **Admin -> Plugins -> Installed -> plugin actions -> Access control**.

Whether a user sees a plugin at all is decided by the system role's **Plugin access** and `plugins.use`, not by the plugin role.

## Next

→ [Authentication](/admin/authentication) — how users sign in
→ [Permissions](/reference/permissions) — full RBAC reference
