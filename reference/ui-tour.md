# UI Tour

Every panel and button in MINT, mapped. Use this when you can't find a setting or aren't sure what something does.

> [Screenshot: full MINT window with regions labeled — top bar, sidebar, main content, jobs panel]

## Top action bar

Always visible. Spans the full width.

| Element | What it does |
|---------|--------------|
| **MINT logo** (left) | Returns to the home dashboard |
| **Project breadcrumb** | Drill back up from experiments → projects → home |
| **Plugins menu** | Jump to any installed plugin you have access to |
| **Notification bell** | Recent alerts (job done, install request, update available) |
| **User avatar** | Settings, profile, sign out |

## Home dashboard

The landing page after logging in. The current dashboard is built for quick triage:

| Region | What it shows |
|--------|---------------|
| **Status strip** | Today's date, open items that need attention, and the lab notice board |
| **Notice board** | The pinned or newest active notice, with an earlier-notices modal when history exists |
| **Recent experiments** | Recently updated experiments with status and code |
| **Recent projects** | Recently updated projects with experiment counts and project status |
| **Plugins launcher** | Searchable grid/list of enabled plugins, with per-user pinning and entry-point links |

> [Screenshot: home dashboard fully labeled]

## Project page

Single record view:

| Region | Contents |
|--------|----------|
| **Header** | Project name, status, description, edit action, and **New Experiment** |
| **Rollup chips** | Counts for all experiments, with design data, and no design data; click to filter the table |
| **Experiments table** | Code, name, type, status, design completeness, and created date |
| **Metadata rail** | Project dates, members, tags, and admin-only destructive actions |

> [Screenshot: project page with rollup chips and experiments table]

## Experiment detail page

Single record view:

| Region | Contents |
|--------|----------|
| **Header** | Experiment code, title, status stepper, edit/cancel/reactivate actions, and an **Open in plugin** action when a design plugin owns the experiment |
| **Design data** | Grouped design fields, sample rows, JSON/CSV export, and fallback full-document viewer |
| **Analysis artifacts** | Outputs grouped by producing plugin, with status, artifact key, result keys, open/download/edit/archive actions, and a show-archived toggle |
| **Metadata rail** | Type, project, timeline, creator, parent link, data lineage, collaborators, tags, and delete action |

The status control in the header drives writability — see [Experiments → Lifecycle](/workflow/experiments#lifecycle).

> [Screenshot: experiment detail page with the Analysis artifacts card open]

## Jobs panel (slide-out)

Click the activity indicator (top-right of the action bar) to open. Lists every job you've launched in the current session.

| Element | What it does |
|---------|--------------|
| Job row | Plugin name + experiment + status pill |
| Progress bar | Live during runs |
| **Open** | Jump to the experiment or source plugin view for this job/artifact |
| **Cancel** | Stop a running job (best-effort — depends on plugin) |
| **Retry** | Re-run a failed job with the same parameters |

> [Screenshot: jobs panel slide-out with several queued and running jobs]

## Admin views

Visible only to platform admins.

| View | Contains |
|------|----------|
| **Users** | Account list, role assignments, manual disable / re-enable |
| **Roles** | System role presets and custom-role editor |
| **Experiment Types** | Experiment type registration and platform-owned design metadata |
| **Plugins** | Installed plugins, per-plugin upgrade / uninstall |
| **Notices** | Publish, pin, archive, restore, and delete home-dashboard notices |
| **Logs** | Structured platform logs and health diagnostics |
| **Configuration** | Platform, auth, database, storage, access, marketplace, observability |
| **Server** | Runtime status and platform update controls |
| **Terminal** | Optional container/process shell and persisted startup script; hidden unless `adminTerminalEnabled` is on |

> [Screenshot: Admin → Users page with a custom role highlighted]

## Settings (avatar menu)

Per-user preferences:

| Tab | Contains |
|-----|----------|
| **Profile** | Display name, email, avatar |
| **Security** | Passkeys, password, active sessions, sign-out-everywhere |
| **Display** | Theme (light / dark / system), color palette, density |
| **Notifications** | Per-channel toggles (email, in-app) |

> [Screenshot: Settings → Security panel with two passkeys registered]

## Plugin views

Each installed plugin renders inside the platform shell. The action bar and project breadcrumb stay; the plugin owns the main content. Most plugins follow a similar layout:

| Region | Convention |
|--------|------------|
| Top of plugin content | Plugin's own breadcrumb / step indicator |
| Main panel | Plugin UI |
| Right sidebar (optional) | Per-plugin parameters or details |
| Bottom action bar (optional) | Run / Save / Export |

Plugins should use the `AppLayout`, `AppTopBar`, and `AppSidebar` components from `@morscherlab/mint-sdk` — see [Frontend SDK](/sdk/frontend/).

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open the global command palette |
| `Cmd/Ctrl + F` | Focus search in tables |
| `Esc` | Close modals and dropdowns |
| `↑` / `↓` (in lists) | Move selection |
| `?` | Show shortcut cheat sheet |

## Next

→ [Permissions](/reference/permissions) — what each role can see and do
→ [Troubleshooting](/reference/troubleshooting) — when things don't work
→ [FAQ](/reference/faq) — quick answers
→ [Glossary](/reference/glossary) — terms used across MINT
