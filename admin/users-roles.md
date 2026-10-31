# Users & Roles

MINT controls access with a **system role** per user plus project membership. The system role decides which actions a user may take anywhere in the platform. Project membership records who works on a project and, in restricted visibility mode, which experiments a user can see. Roles combine 25 permissions in 11 groups; admins can build custom roles from them.

> [Screenshot: Admin -> People -> Roles page with the Admin / Member / Viewer presets and a custom role]

## Accounts

People get an account by self-registration (on by default, controlled by `auth.allowRegistration`) or from an admin with `mint platform admin user create`. A self-registered account is **inactive** until an administrator activates it; the person sees "Waiting for approval" at sign-in. Activate it from the Users list (see [Waiting for approval](/reference/troubleshooting#waiting-for-approval)). See [Authentication → Accounts and registration](/admin/authentication#accounts-and-registration).

**Admin -> People -> Users** (needs `users.view`) lists accounts. With `users.manage` you can edit a user, change the role, reset the password, reset the passkeys (see [Recovery](/admin/authentication#recovery)), deactivate, reactivate, or delete. MINT refuses an action on your own account (delete, deactivate, password reset, passkey reset, role change) with 400. It refuses to delete, deactivate or demote the last active administrator with 409.

## System roles

Three roles ship out of the box:

| Role | Permissions |
|------|-------------|
| **Admin** | All 25. Also the only role that can manage the Admin role, disable authentication, or enable dev mode. |
| **Member** (default for new accounts) | All `projects.*` and `experiments.*`; `instruments.view`; `plugins.view`, `plugins.use`; `users.view`; `platform.view_logs`; `filesystem.browse` |
| **Viewer** | `projects.view`, `experiments.view`, `instruments.view`, `plugins.view`, `plugins.use`, `users.view` |

Member does not have `plugins.configure`, because that permission gives the plugin `configure` access level (see [Plugin access levels](#plugin-access-levels)). The 1.4 upgrade removed it from the Member role; other roles keep their grants. Members open the admin panel through `users.view` and `platform.view_logs`. They do not see **Admin -> Plugins**, which needs `plugins.configure` or `plugins.install`.

Every user has exactly one system role. Change it on **Admin -> People -> Users**.

The 1.3 upgrade gave every existing role, custom roles included, `instruments.view`, and gave the Admin role `instruments.edit`. Roles created later get neither automatically. Grant `instruments.edit` to the roles that maintain the [instrument directory](/guide/instruments).

## Custom roles

**Admin -> People -> Roles** (needs `users.manage`) edits roles. Besides the permission toggles, each role has:

| Setting | Options | Effect |
|---------|---------|--------|
| **Project scope** | All projects / Assigned only | Whether the role sees every project or only projects the user is assigned to |
| **Plugin access** | All plugins / Selected only | Which plugins users with this role can see and open. A plugin matches by its registry name or its route prefix |

> [Screenshot: role editor with permission toggles, project scope, and plugin access]

The **slug** of a role must be lowercase and URL-safe: it matches `^[a-z0-9][a-z0-9_-]*$` and has at most 100 characters. MINT refuses other slugs with 422, so a look-alike of `admin` (for example `Admin`) cannot exist. Only the exact slug `admin` is a platform administrator, for the platform and for every plugin. The upgrade gave a role with an empty slug the slug `role-<id>`; rename it if necessary.

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

## The 25 permissions

Permissions are `resource.action` strings. The backend checks them on every route; the role editor shows them as grouped toggles.

| Group | Permissions |
|-------|-------------|
| **`projects.*`** (5) | `view`, `create`, `edit`, `delete`, `manage_members` |
| **`experiments.*`** (4) | `view`, `create`, `edit`, `delete` |
| **`instruments.*`** (2) | `view`, `edit` |
| **`plugins.*`** (4) | `view`, `use`, `configure`, `install` |
| **`jobs.*`** (2) | `read_all`, `manage_all` |
| **`filesystem.*`** (1) | `browse` |
| **`notifications.*`** (1) | `receive_important` |
| **`calendar.*`** (1) | `read_all` |
| **`notices.*`** (1) | `publish` |
| **`users.*`** (2) | `view`, `manage` |
| **`platform.*`** (2) | `configure`, `view_logs` |

The authoritative list is [`api/permissions.py`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/api/permissions.py). See also [Permissions](/reference/permissions).

## Plugin access levels

A plugin tags each endpoint, job, MCP tool and page with an access level. The platform maps the level to the caller's system role. There are no per-plugin roles:

| Level | Who passes |
|-------|-----------|
| `use` | A role with `plugins.use` that may see the plugin (**Plugin access**) |
| `configure` | The `use` rule plus `plugins.configure` |
| `admin` | A platform administrator (the `admin` role). An administrator passes every level |

An unknown level from a plugin is treated as `admin`. A plugin page with `configure` access is hidden from a role without `plugins.configure`. Only a platform administrator can change the settings of a plugin, unless the plugin sets `settings_access = "configure"` in its `Metadata`. Then a role with `plugins.configure` can change them too.

To let a person configure plugins, give their role `plugins.configure`. Create a custom role such as "Plugin operator" for this. For the upgrade from MINT 1.3, see [Upgrading from MINT 1.3](/admin/updates#upgrading-from-mint-1-3).

Which plugins a role can see is decided by **Plugin access** and `plugins.use`. It applies to the plugin proxy, in-process plugin routes, `GET /api/plugins`, and the plugin data on the REST and MCP APIs. For a role without access to a plugin, the experiment data and artifacts of that plugin are left out of lists and answer 404 on a single read, and a named plugin answers 403 `plugin.not_visible`. A write into a plugin's design data or objects also needs `plugins.use`. A `plugin_access` value that is not `"all"`, a list of plugin names or null grants no plugin.

## Next

→ [Authentication](/admin/authentication) — how users sign in
→ [Permissions](/reference/permissions) — full RBAC reference
