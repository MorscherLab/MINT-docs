# Experiments

An **experiment** is the central unit of work in MINT. It has a type, a status, optional dates, optional collaborators, one design-data payload, and zero or more named analysis artifacts. It gets a unique type-scoped code (the experiment number) when it starts; see [Experiment numbers](#experiment-numbers).

> [Screenshot: experiment detail page with header, design data card, analysis artifacts card, and metadata rail]

## Anatomy

| Field | Description |
|-------|-------------|
| **Code** | The experiment number. Globally unique and derived from the experiment type (`LCM-EXP-001`, `DR-EXP-001`, …). It is empty until [it is assigned](#experiment-numbers). |
| **Title** | Human-readable label. Editable any time. |
| **Type** | Selected at creation; determines the design schema and plugin allowlists. |
| **Status** | `planned`, `ongoing`, `completed`, or `cancelled`. See [Lifecycle](#lifecycle). |
| **Owner** | The user who created it. An experiment that a plugin creates for you also has you as owner. |
| **Collaborators** | Per-experiment role overrides on top of project membership. |
| **Design data** | One JSON payload owned by the experiment-design or full plugin. |
| **Analysis artifacts** | Named outputs from analysis/full plugins. Each artifact has a producing plugin, stable key, display name, status, and result payload. |
| **File-backed outputs** | Binary outputs such as reports, tables, or RAW-derived files referenced from an analysis artifact and streamed from the object store. |

## Create an experiment

From a project page or the **Experiments** page, click **New experiment**. On a project page the form starts with that project selected and the project members in the **Team** list.

> [Screenshot: new-experiment form with name, type, notes, project, and team]

| Field | Notes |
|-------|-------|
| **Name** | Required. |
| **Type** | Required. One of the experiment types your admin created in [Admin -> Lab content -> Experiment types](/admin/platform-settings#experiment-types). Sets the code prefix. If the type you need is missing, ask your admin. |
| **Start date / End date** | Optional |
| **Notes** | Protocol, conditions, anything the next person needs. Searchable. |
| **Project** | Optional; an experiment belongs to at most one project. When you select a project, its members join the **Team** list. When you change the project, the members that the previous project added leave the list again. |
| **Derived from** | Optional parent experiment |
| **Tags** | Optional |
| **Team** | Optional. Add people now or later, with the role **Collaborator** (default) or **Owner**. You are stored as `owner`. |

Click **Create experiment**. The new experiment starts in `planned` status and has no number yet. Design data is written later by the design plugin for that type: on the plugin's page, or in the form in the **Design data** card. See [Fill in the design](#fill-in-the-design).

## Experiment numbers

A new experiment has no number. This keeps unused numbers out of file names and sequence lists. The experiment gets the next free number for its type at one of these points:

- You click **+ Assign number** next to the title on the experiment page (needs `experiments.edit`).
- You type a **Sequence** in **Edit**. The sequence must be free for the type.
- A design plugin, such as MS Designer, generates a sequence for the experiment.
- The status of the experiment changes from `planned` to `ongoing` or `completed`.

Rules for an assigned number:

- It is fixed. For most users, the **Type** and **Sequence** fields in the edit form are read-only, and the form shows a lock on the code. Files on the lab storage can carry the number.
- An admin can change it in **Edit**: set a new **Sequence**, change the **Type** (the sequence stays under the new prefix, so `DRP-EXP-042` becomes `AST-EXP-042`), or empty the **Sequence** to remove the number. A sequence that another experiment uses is refused, and the form offers **Use next free**. The change is audited.
- A **cancelled** experiment gets no number. **+ Assign number** is hidden. Reactivate the experiment first.
- A new number can reuse a freed one: when you delete the experiment that has the highest number of a type, the next experiment of that type can get that number again.

## Lifecycle

```
   planned ──▶ ongoing ──▶ completed
      │          │
      └──────────┴──▶ cancelled ──▶ planned
```

| Status | Meaning | Who can write |
|--------|---------|---------------|
| **planned** | Design is being filled in. No data uploaded yet. | Users with `experiments.edit` and visibility |
| **ongoing** | Data is being collected; analysis can run. Moving here auto-fills `start_date` if empty and assigns the experiment number if it has none. | Same as planned |
| **completed** | Final state. Moving here auto-fills `end_date` if empty and assigns the experiment number if it has none. | Same as planned unless a plugin blocks writes |
| **cancelled** | Terminal off-ramp for planned/ongoing work. Can be reactivated only to `planned`. | Same as planned |

Core MINT validates only the `cancelled` rules above. Plugins can be stricter: many gate writes on `ongoing` or `completed`, and some require `completed` before publishing downstream results.

> [Screenshot: status stepper showing planned, ongoing, completed, and the cancel action]

## Plugin interaction

Each plugin declares which experiment data it may write; see [How plugins attach data](/guide/data-model#how-plugins-attach-data). Developers: [Plugin types](/sdk/concepts/plugin-types).

An experiment has exactly one design plugin: the plugin that saved its design data first. It can be analyzed by many `ANALYSIS` or `FULL` plugins over time. Before the first save, the design plugin comes from the experiment type. When two or more design plugins admit the type, you choose; see [Choose a design plugin](#choose-a-design-plugin).

## Design and analysis on the detail page

The experiment detail page is a single record view: design, analysis outputs, and metadata live on the same page.

| Region | What to use it for |
|--------|--------------------|
| **Header** | Read the experiment code/name (or assign the number), update status, edit metadata, cancel/reactivate, or open the design plugin. **Open in &lt;plugin&gt;** shows only when the design plugin has a page. When realtime updates are on, avatars show who else has the experiment open; see [Work together live](#work-together-live). |
| **Design data** | Review the design document as grouped fields and sample rows, or fill in the design form of a live design plugin. Export JSON or CSV when design data is present. Plugin tabs can follow the **Design** tab; see [Plugin tabs](#plugin-tabs). |
| **Analysis artifacts** | Review outputs grouped by producing plugin. Empty experiments show analysis plugins that can run next and why unavailable plugins are blocked. Plugin tabs can follow the **Artifacts** tab. |
| **Instrument records** | With `instruments.view`: the instrument history rows that name this experiment, for example finished samples. See [Instruments -> History](/guide/instruments#history). |
| **Metadata rail** | Check type, project, timeline, creator, data lineage, collaborators, tags, and destructive actions. |

When your role cannot see the design plugin of the experiment, the **Design data** card shows **Design data not shown** and does not name the plugin.

### Fill in the design

The design plugin decides where you fill in the design:

- **On the plugin's page.** Click **Open in &lt;plugin&gt;** in the header, or **Edit in &lt;plugin&gt;** in the **Design data** card.
- **In the Design data card.** A live design plugin shows a form in the card. A plugin can offer both.

The form works like this:

1. Type a value in a field. MINT saves the field 1 s after your last edit, or when you leave the field. There is no Save button.
2. Read the save state in the card header: **Saved**, **Unsaved**, **Saving…**, **Offline · retry in N s**, or **N changes not saved**.
3. Fill in the fields marked **Required**. The header shows **N required left** until they all have a value. You can save one field before the others.
4. If MINT refuses a value, the field keeps it and shows the reason. Correct the value, or click **Discard** to show the stored value again.

While another person edits a field, that field shows their avatar and is read-only for you until their value is stored. Other people can edit other fields at the same time. Each field keeps the last saved value.

You can edit the form when you own the experiment and your role has `experiments.edit` and `plugins.use`, or when you are an admin. Other users see the form read-only (**View only**).

> [Screenshot: Design data card with a live design form, the save state in the header, and a field locked by another user's avatar]

### Choose a design plugin

When the experiment has no design data and two or more design plugins admit its type, the **Design data** card shows **No design yet** and one row for each plugin. You see this choice when you own the experiment with `experiments.edit`, or when you are an admin.

1. Click **Open** to go to the page of that plugin, or **Start** to show its form in the card.
2. Click **Choose another** in the card header to go back to the list. This works until the first save.
3. Save the design. The first save makes the chosen plugin the design plugin of the experiment.

To choose again, click **Clear design data** in the card menu. The list comes back. Other users see the first plugin by display name.

> [Screenshot: Design data card with "No design yet" and two plugin rows with Open and Start]

### Plugin tabs

A plugin can add tabs to the **Design data** card and to the **Analysis artifacts** card. The first tab (**Design** or **Artifacts**) shows the content of the card. The plugin tabs follow, sorted by plugin name. A tab in the **Analysis artifacts** card shows the plugin name after its title. Tabs that do not fit go into a **More** menu.

- Only the design plugin of the experiment adds tabs to the **Design data** card, and only when the experiment has design data.
- A tab loads when you select it. Click the refresh button at the end of the tab bar to load it again. A tab also loads again after a design or artifact change, and when you select it more than 30 s after its last load.
- The URL keeps the selected tabs (`design_tab` and `analysis_tab`), so you can share a link to a tab.

A tab can have action buttons that start a plugin job for the experiment. The button shows that the job runs, and the jobs tray in the top bar shows its progress and result. The tab loads again when the job ends. For a job that can overwrite or remove data, MINT asks you to confirm first. You see only the actions and tabs that your access level on the plugin allows.

A plugin that shows its results only in tabs is not offered as an analysis to start. With no plugin to start, the **Analysis artifacts** card says "No analysis to start here. Plugin results are in the tabs above."

> [Screenshot: Analysis artifacts card with the Artifacts tab, two plugin tabs, a refresh button, and an action button on the selected tab]

### Artifacts

Plugins appear under their display name. Artifacts are grouped by plugin and sorted by most recent update. MINT shows the artifact display name, artifact key, result keys, status, and available actions:

| Action | Effect |
|--------|--------|
| **Open plugin** | Launch the plugin page that produced the artifact, with the experiment and artifact preselected when the plugin supports it. Shown only when the plugin has a page. |
| **Download** | Download the file referenced by `result["file"]`, or download the JSON payload for non-file artifacts. |
| **Edit** | Rename the artifact or update its note. |
| **Archive** | Hide the artifact from normal lists and SDK reads without deleting it. |
| **Restore** | Bring an archived artifact back into normal lists. |
| **Delete permanently** | Remove an archived artifact and any owned file object that MINT can verify. |

An active artifact is labeled **stale** when the experiment's design data was edited after that artifact was written. Rerun the producing analysis plugin when the design change invalidates the output.

## Collaborators

Experiment visibility depends on `access.experimentVisibilityMode`:

| Mode | Behavior |
|------|----------|
| `open` (default) | Users with `experiments.view` can list/read experiments broadly. |
| `restricted` | Non-admin users see experiments they created, collaborate on, or can access through project membership. |

Write actions are still gated by system permissions such as `experiments.edit` and `experiments.delete`. To grant visibility on a single experiment, add **collaborators**:

| Collaborator role | Effect |
|-------------------|--------|
| **Collaborator** (default) | Can see the experiment even if they are not a project member. Edits still need `experiments.edit`. |
| **Owner** | Set for the creator. Can manage collaborators, change the design data, and delete the experiment; MINT keeps at least one owner. |

The **Team** card marks only the owners. Collaborators that older versions stored as Viewer, Editor, or Admin act as collaborators. `POST /api/experiments/{id}/collaborators` accepts only the roles `owner` and `collaborator` (the default). Another `role`, such as `viewer`, `editor` or `admin`, gets 422 `validation.request`.

Collaborators are stored on the experiment itself (in `collaborators`), not on the project. They survive even if the user is later removed from the project. See [Users & roles](/admin/users-roles) for the underlying roles.

## Search and filters

The **Experiments** page (top navigation) lists every experiment you can see. Use the **Table** and **Cards** buttons to change the layout. In the table, click **Name**, **Type**, **Status**, **Timeline**, or **Updated** to sort.

| Filter | Notes |
|--------|-------|
| **Search** | Matches name, experiment code, notes, and tags |
| **Status** | A chip for **All**, planned, ongoing, completed, and cancelled, each with a count |
| **Type** | The active experiment types |
| **Filters -> Project** | One project, or all |
| **Filters -> Created** | A preset or custom date range |
| **Mine** | A chip in the filter strip: only experiments you created |

On a project page, the rollup chips filter that project's experiments by whether they have design data.

> [Screenshot: experiments list with multiple filters applied]

## Edit an experiment and resolve conflicts

Click **Edit** in the header. The form remembers the version that you loaded. If someone else saves the experiment first, MINT refuses your save and shows **Changed by someone else**. Choose one:

- **Reload and discard mine** loads the newer version and drops your edits.
- **Overwrite** saves your edits on top of the newer version.

The same dialog appears when you edit a project. A plugin or an API client that sends no version always overwrites.

## Work together live

Realtime updates are on by default (`realtimeEnabled`). Your admin can turn them off. When they are on, MINT shows changes that other people make without a manual reload:

- The experiment page, the experiments list, and the project page refresh when a matching change arrives. While an edit form is open, the refresh waits until you close it, so your unsaved edits stay.
- If someone else saves the experiment while your edit form has unsaved edits, a banner at the top of the form tells you. Choose **Reload form**, or choose **Review** to open the experiment in a new tab. A form without edits reloads by itself.
- Avatars in the experiment header show who else is on the experiment. Click them to see each person and what they do: viewing, viewing design, viewing results, or editing. People who edit show first. Editing the experiment is a hint, not a lock. **Edit** stays available.
- In a [design form](#fill-in-the-design), a field that another person edits shows their avatar and is locked until their value is stored. A field that another person changed flashes once. A value that another person saves replaces the field only when you have no unsaved edit in it.
- Each browser tab counts on its own. When you close a tab, its label ends. Your tabs never lock each other.

## Deleting experiments

Deleting an experiment removes the experiment record and platform-owned dependent rows, including design data and analysis artifact metadata. MINT also deletes the stored files of the experiment from the object store, in the background after the delete. A file that another experiment still references stays. Child experiments stay and lose their link to the deleted parent. Only the experiment owner or an admin can delete it, and the role needs `experiments.delete`. An experiment with a number can be deleted too: the confirmation names the number and says that files on the lab storage keep it. The audit log records the deleted number. Treat deletion as irreversible from the UI and make sure your platform database backups cover the recovery window your lab needs. Plugin-owned tables and external file retention can still be plugin-specific.

## Next

→ [Plugins](/admin/plugins) — the full plugin model
→ [Marketplace](/guide/marketplace) — install and request plugins
→ [Users & roles](/admin/users-roles) — system roles and project membership
