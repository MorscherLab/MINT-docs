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

The landing page after logging in. Three regions:

| Region | What it shows |
|--------|---------------|
| **Projects tile grid** | Every project you're a member of, sorted by recent activity |
| **Recent experiments** | Your last edited / viewed experiments |
| **Plugins** | Tiles for every plugin available to your role |

> [Screenshot: home dashboard fully labeled]

## Project page

Four tabs:

| Tab | Contents |
|-----|----------|
| **Overview** | Description, member count, experiment counts by status, recent activity |
| **Experiments** | Sortable, filterable list — click a row to drill in |
| **Members** | Per-project membership, with role overrides |
| **Settings** | Rename, archive, delete (admin only) |

> [Screenshot: project page with the Experiments tab selected]

## Experiment detail page

Five tabs:

| Tab | Contents |
|-----|----------|
| **Overview** | Code, title, type, status pill, owner, collaborators, design summary |
| **Design** | Form rendered by the experiment-design plugin; editable per status |
| **Files** | Uploaded artifacts (RAW data, sequences, plates, …) |
| **Analyze** | Pick an analysis plugin, run it, watch progress |
| **Results** | Accumulated outputs from past analysis runs |

The status pill in the header drives writability — see [Experiments → Lifecycle](/workflow/experiments#lifecycle).

> [Screenshot: experiment detail page with the Analyze tab open]

## Jobs panel (slide-out)

Click the activity indicator (top-right of the action bar) to open. Lists every job you've launched in the current session.

| Element | What it does |
|---------|--------------|
| Job row | Plugin name + experiment + status pill |
| Progress bar | Live during runs |
| **Open** | Jump to the experiment's Results tab with this run highlighted |
| **Cancel** | Stop a running job (best-effort — depends on plugin) |
| **Retry** | Re-run a failed job with the same parameters |

> [Screenshot: jobs panel slide-out with several queued and running jobs]

## Admin views

Visible only to platform admins.

| View | Contains |
|------|----------|
| **Users** | Account list, role assignments, manual disable / re-enable |
| **Roles** | System role presets and custom-role editor |
| **Plugins** | Installed plugins, per-plugin upgrade / uninstall |
| **Marketplace** | Catalog browser, install requests, approval queue |
| **Updates** | Platform and plugin update statuses |
| **Status** | Live health overview (DB, plugins, queues) |
| **Settings** | SMTP, marketplace registry, observability, auth |

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

Plugins should use the `AppLayout`, `AppTopBar`, and `AppSidebar` components from `@morscherlab/mint-sdk` — see [Frontend SDK](/sdk/frontend).

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
