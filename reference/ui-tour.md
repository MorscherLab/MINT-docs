# UI Tour

Every major MINT screen, mapped to the controls users see in the current platform UI. Use this when you cannot find a setting or are not sure where a workflow starts.

> [Screenshot: full MINT window with regions labeled - top action bar, home dashboard, plugin launcher, main content, and account menu]

## Top action bar

The top action bar appears on platform pages and SDK plugin shells. The exact controls depend on the page and on your permissions.

| Element | What it does |
|---------|--------------|
| **MINT logo / platform name** | Returns to the home dashboard |
| **Navigation / breadcrumb** | Moves between Home, Projects, Experiments, Admin, and record detail pages |
| **Plugins control** | Opens installed plugin entry points that your account can access |
| **Theme toggle** | Switches the active light/dark/system theme for the shell |
| **Admin** | Opens the Admin workspace when your role exposes at least one admin section |
| **Account menu** | Shows the signed-in identity, opens **Your account**, or signs out |

## Home dashboard

The landing page after logging in. The dashboard is built for quick triage:

| Region | What it shows |
|--------|---------------|
| **Status strip** | Today's date, open items that need attention, and the lab notice board |
| **Notice board** | The pinned or newest active notice, with an earlier-notices modal when history exists |
| **Recent experiments** | Recently updated experiments with status and code |
| **Recent projects** | Recently updated projects with experiment counts and project status |
| **Plugins launcher** | Searchable grid/list of enabled plugins, with per-user pinning and entry-point links |

Admins who can manage notices see a shortcut from the notice board to **Admin -> Platform -> Notices**.

> [Screenshot: home dashboard with status strip, notice board, recent records, and plugin launcher labeled]

## Project page

Single project record view:

| Region | Contents |
|--------|----------|
| **Header** | Project name, status, description, edit action, and **New Experiment** |
| **Rollup chips** | Counts for all experiments, experiments with design data, and experiments without design data; click to filter the table |
| **Experiments table** | Code, name, type, status, design completeness, and created date |
| **Metadata rail** | Project dates, members, tags, and admin-only destructive actions |

> [Screenshot: project page with rollup chips and experiments table]

## Experiment detail page

Single experiment record view:

| Region | Contents |
|--------|----------|
| **Header** | Experiment code, title, status stepper, edit/cancel/reactivate actions, and an **Open in plugin** action when a design plugin owns the experiment |
| **Design data** | Grouped design fields, sample rows, JSON/CSV export, and fallback full-document viewer |
| **Analysis artifacts** | Outputs grouped by producing plugin, with status, artifact key, result keys, open/download/edit/archive actions, and a show-archived toggle |
| **Metadata rail** | Type, project, timeline, creator, parent link, data lineage, collaborators, tags, and delete action |

The status control in the header drives writability. See [Experiments -> Lifecycle](/workflow/experiments#lifecycle).

> [Screenshot: experiment detail page with the Analysis artifacts card open]

## Your account

Open this from the account menu in the top action bar.

| Section | Contains |
|---------|----------|
| **Profile** | First name, last name, display shortname, email, and read-only username |
| **Password** | Current password, new password, confirmation, and the password-change action |
| **Security** | Passkeys and SWITCH edu-ID linking, when those auth features are enabled |

The account modal is for identity and sign-in settings. Shell appearance is controlled by the theme toggle in the top action bar.

> [Screenshot: Your account modal with Profile, Password, and Security sections]

## Admin workspace

Open **Admin** from the top action bar or go to `/admin`. Users only see sections allowed by their platform permissions.

| Group | Section | Contains |
|-------|---------|----------|
| **People** | **Users** | Account list, role assignment, disable / re-enable, and password reset |
| **People** | **Roles** | Built-in role presets and custom-role editor |
| **Plugins** | **Installed** | Installed plugins, runtime state, access control, update, and uninstall actions |
| **Plugins** | **Registry** | Marketplace catalog, install/request install, refresh, compatibility, and update badges |
| **Platform** | **Experiment Types** | Experiment type registration and platform-owned design metadata |
| **Platform** | **Notices** | Publish, pin, archive, restore, and delete home-dashboard notices |
| **Platform** | **Configuration** | Platform, auth, database, storage, access, marketplace, and observability settings |
| **Platform** | **Server** | Runtime health, platform version, update status, and plugin process information |
| **Platform** | **Terminal** | Optional container/process shell and persisted startup script; hidden unless enabled and permitted |
| **Platform** | **Logs** | Structured platform logs and health diagnostics |

The admin navigation rail shows the running version and API health in its footer.

> [Screenshot: Admin workspace showing People, Plugins, and Platform groups in the navigation rail]

## Plugin views

Each installed plugin renders inside the platform shell at its plugin route. The shell keeps the platform identity, navigation, theme, and account controls; the plugin owns the main content.

| Region | Convention |
|--------|------------|
| Top of plugin content | Plugin-owned title, breadcrumb, tabs, or step indicator |
| Main panel | Plugin UI, generated form, workspace, chart, table, or custom Vue view |
| Right sidebar (optional) | Per-plugin parameters, details, or compact controls |
| Bottom or inline actions (optional) | Run, save, export, upload, or open artifact actions |

Generated analysis plugin pages can include a job status tray inside the plugin view. That tray is local to the plugin workspace; current MINT does not expose a platform-wide global jobs slide-out.

Plugins should use the `AppLayout`, `PluginWorkspaceView`, `AppTopBar`, and related components from `@morscherlab/mint-sdk`. See [Frontend SDK](/sdk/frontend/).

## Notes on shortcuts and notifications

Current MINT releases rely on standard browser and component keyboard behavior for focus, menus, tables, and modal dismissal. Do not assume global shortcut overlays are available unless your deployment or plugin adds them.

Notification delivery is configured in **Admin -> Platform -> Configuration** and plugin features can publish notification events through the platform, but the current platform shell does not show a global notification bell by default.

## Next

-> [Permissions](/reference/permissions) - what each role can see and do
-> [Troubleshooting](/reference/troubleshooting) - when things do not work
-> [FAQ](/reference/faq) - quick answers
-> [Glossary](/reference/glossary) - terms used across MINT
