# Experiments

An experiment is the central unit of work in MINT. This page tells you how to create, fill in, analyze, share and delete experiments.

![Experiment detail page with the header and status stepper, the Design data card, the Analysis artifacts card with a stale artifact, and the metadata rail](/screenshots/guide/experiments-detail-page.webp)

## Anatomy

| Field | Description |
|-------|-------------|
| Code | The experiment number, for example `LCM-EXP-001`. Unique across MINT. Empty until [it is assigned](#experiment-numbers). |
| Title | Editable at any time. |
| Type | Set at creation. Sets the design schema and which plugins apply. |
| Status | `planned`, `ongoing`, `completed`, or `cancelled`. See [Lifecycle](#lifecycle). |
| Owner | The user who created it. When a plugin creates an experiment for you, you are the owner. |
| Collaborators | People who get access to this experiment in addition to project members. |
| Design data | One JSON document. The design plugin of the experiment owns it. |
| Analysis artifacts | Named outputs of analysis plugins. Each has a producing plugin, a key, a display name, a status and a result. |
| File-backed outputs | Files, such as reports or tables, that an analysis artifact points to. MINT streams them from the object store. |

## Create an experiment

1. On a project page or on the **Experiments** page, click **New experiment**.
2. Fill in the fields.
3. Click **Create experiment**.

| Field | Notes |
|-------|-------|
| Name | Required. |
| Type | Required. One of the [experiment types](/admin/platform-settings#experiment-types) that your admin created. Sets the code prefix. If the type you need is missing, ask your admin. |
| Start date / End date | Optional. |
| Notes | Protocol, conditions, and what the next person needs. Search finds text in notes. |
| Project | Optional. When you select a project, its members join the **Team** list. When you change the project, the members that the previous project added leave the list. |
| Derived from | Optional parent experiment. |
| Tags | Optional. |
| Team | Optional. Add people with the role **Collaborator** (default) or **Owner**. You are stored as `owner`. |

On a project page, the form starts with that project selected and its members in the **Team** list.

The new experiment starts in `planned` status and has no number. The design plugin of the type writes the design data later. See [Fill in the design](#fill-in-the-design).

![New experiment form with name, type, dates and notes on the left, and project, derived from, tags and team on the right](/screenshots/guide/experiments-new-form.webp)

## Experiment numbers

A new experiment has no number. This keeps unused numbers out of file names and sequence lists. MINT does not assign a number by itself at creation. The experiment gets the next free number for its type when one of these occurs:

- You click **+ Assign number** next to the title on the experiment page. You need `experiments.edit`.
- You type a **Sequence** in **Edit**. The sequence must be free for the type.
- A design plugin, such as MS Designer, generates a sequence for the experiment.
- The status changes from `planned` to `ongoing` or `completed`.

The number has the form `TYPE-EXP-SEQ`, for example `DR-EXP-001`. The prefix comes from the experiment type; see [Experiment types](/admin/platform-settings#experiment-types). Numbers do not restart per project.

Rules for an assigned number:

- It is fixed. For most users, the **Type** and **Sequence** fields in the edit form are read-only, and the form shows a lock on the code. Files on the lab storage can carry the number.
- An admin can change it in **Edit**. The admin can set a new **Sequence**, or empty it to remove the number. The admin can also change the **Type**; the sequence stays under the new prefix, so `DRP-EXP-042` becomes `AST-EXP-042`. MINT refuses a sequence that another experiment uses and offers **Use next free**. MINT audits the change.
- A **cancelled** experiment gets no number, and **+ Assign number** is hidden. Reactivate the experiment first.
- MINT can reuse a freed number. When you delete the experiment with the highest number of a type, the next experiment of that type can get that number.

## Lifecycle

```
   planned ──▶ ongoing ──▶ completed
      │          │
      └──────────┴──▶ cancelled ──▶ planned
```

| Status | Meaning | Who can write |
|--------|---------|---------------|
| planned | The design is in progress. No data is uploaded. | Users with `experiments.edit` who can see the experiment |
| ongoing | Data collection is in progress; analysis can run. MINT sets `start_date` if it is empty and assigns the number if there is none. | Same as planned |
| completed | Final state. MINT sets `end_date` if it is empty and assigns the number if there is none. | Same as planned, unless a plugin blocks writes |
| cancelled | Stops planned or ongoing work. You can reactivate it only to `planned`. | Same as planned |

MINT itself checks only the `cancelled` rules. Plugins can be stricter. Many plugins write results only on `ongoing` or `completed` experiments. Some plugins require `completed` before they publish results.

![Experiment header with the status stepper on Ongoing, and the Edit and Cancel experiment buttons](/screenshots/guide/experiments-status-header.webp)

## Plugin interaction

Each plugin declares which experiment data it can write. See [Data model -> How plugins attach data](/guide/data-model#how-plugins-attach-data).

An experiment has one design plugin. Many analysis plugins can analyze it over time. When two or more design plugins accept the type, you choose one; see [Choose a design plugin](#choose-a-design-plugin).

## Design and analysis on the detail page

The experiment detail page shows the design, the analysis outputs and the metadata on one page.

| Region | Use it to |
|--------|-----------|
| Header | Read the code and name, or assign the number. Change the status, edit metadata, cancel or reactivate. **Open in &lt;plugin&gt;** shows when the design plugin has a page and the experiment has no design data yet. With realtime updates, avatars show who else has the experiment open; see [Work together live](#work-together-live). |
| Design data | Read the design as grouped fields and sample rows, or fill in the form of a live design plugin. Export JSON or CSV when there is design data. Plugin tabs can follow the **Design** tab; see [Plugin tabs](#plugin-tabs). |
| Analysis artifacts | Read the outputs, grouped by plugin. An experiment without outputs shows the analysis plugins that can run next, and why the other plugins cannot. Plugin tabs can follow the **Artifacts** tab. |
| Instrument records | Read the instrument history rows that name this experiment, for example finished samples. You need `instruments.view`. See [Instruments -> History](/guide/instruments#history). |
| Metadata rail | Read the type, project, timeline, creator, data lineage, team and tags. Delete the experiment. |

When your role cannot see the design plugin, the **Design data** card shows **Design data not shown** and does not name the plugin.

### Fill in the design

The design plugin decides where you fill in the design:

- On the plugin's page. Click **Open in &lt;plugin&gt;** in the header, or **Edit in &lt;plugin&gt;** in the **Design data** card.
- In the **Design data** card. A live design plugin shows a form in the card.

A plugin can offer both. To use the form:

1. Type a value in a field. MINT saves the field 1 s after your last edit, or when you leave the field. There is no Save button.
2. Read the save state in the card header: **Saved**, **Unsaved**, **Saving…**, **Offline · retry in N s**, or **N changes not saved**.
3. Fill in the fields marked **Required**. The header shows **N required left** until all have a value. You can save one field before the others.
4. If MINT refuses a value, the field keeps it and shows the reason. Correct the value, or click **Discard** to show the stored value.

While another person has the cursor in a field, the field shows their avatar and is read-only for you. It unlocks when their value is stored. Other people can edit other fields at the same time. Each field keeps the last saved value.

You can edit the form when you own the experiment and your role has `experiments.edit` and `plugins.use`. Admins can also edit it. Other users see the form read-only (**View only**).

![Design data card with a live Cell seeding form, Saved in the card header, and the Cell line field locked with the avatar of another user](/screenshots/guide/experiments-live-design-lock.webp)

### Choose a design plugin

When the experiment has no design data and two or more design plugins accept its type, the **Design data** card shows **No design yet** and one row for each plugin. You see this choice when you own the experiment and have `experiments.edit`, or when you are an admin.

1. Click **Open** to go to the plugin's page, or **Start** to show its form in the card.
2. To go back to the list, click **Choose another** in the card header. This works until the first save.
3. Save the design. The first save makes the chosen plugin the design plugin of the experiment.

To choose again, click **Clear design data** in the card menu. The list comes back. Other users see the first plugin by display name.

![Design data card with No design yet and one row for each design plugin, with Start for a form on the page and Open for a plugin page](/screenshots/guide/experiments-choose-design-plugin.webp)

### Plugin tabs

A plugin can add tabs to the **Design data** card and to the **Analysis artifacts** card. The first tab (**Design** or **Artifacts**) shows the content of the card. Plugin tabs follow, sorted by plugin name. A tab in the **Analysis artifacts** card shows the plugin name after its title. Tabs that do not fit go into a **More** menu.

- Only the design plugin adds tabs to the **Design data** card, and only when there is design data.
- A tab loads when you select it. To load it again, click the refresh button at the end of the tab bar.
- A tab also loads again after a design or artifact change, and when you select it more than 30 s after its last load.
- The URL keeps the selected tabs (`design_tab` and `analysis_tab`). You can share a link to a tab.

A tab can have action buttons that start a plugin job for the experiment. The button shows that the job runs. The jobs tray in the top bar shows its progress and result. The tab loads again when the job ends. Before a job that can overwrite or remove data, MINT asks you to confirm. You see only the tabs and actions that your access level on the plugin allows.

A plugin that shows its results only in tabs is not offered as an analysis to start. When no plugin can start, the **Analysis artifacts** card says "No analysis to start here. Plugin results are in the tabs above."

![Analysis artifacts card with the Artifacts tab, the QC scores plugin tab selected, the refresh button at the end of the tab bar, and the Score plate action button](/screenshots/guide/experiments-analysis-tabs.webp)

### Artifacts

Artifacts are grouped by plugin display name and sorted by the most recent update. Each row shows the display name, the artifact key, the result keys, the status and these actions:

| Action | Effect |
|--------|--------|
| Open plugin | Opens the plugin page that produced the artifact, with the experiment and artifact selected when the plugin supports it. Shows only when the plugin has a page. |
| Download | Downloads the file in `result["file"]`, or the JSON result when there is no file. |
| Edit | Renames the artifact or changes its note. |
| Archive | Hides the artifact from lists and SDK reads. Does not delete it. |
| Restore | Shows an archived artifact in lists again. |
| Delete permanently | Removes an archived artifact and each owned file that MINT can verify. |

**Edit**, **Archive**, **Restore** and **Delete permanently** need `experiments.edit`.

MINT labels an active artifact **stale** when the design data changed after the artifact was written. If the design change makes the output wrong, run the analysis plugin again.

## Collaborators

The setting `access.experimentVisibilityMode` controls who sees experiments:

| Mode | Behavior |
|------|----------|
| `open` (default) | Users with `experiments.view` can list and read all experiments. |
| `restricted` | Non-admin users see the experiments that they created, that they collaborate on, or that belong to a project they are a member of. |

System permissions such as `experiments.edit` and `experiments.delete` still control writes. To let a person see one experiment, add them as a collaborator:

| Collaborator role | Effect |
|-------------------|--------|
| Collaborator (default) | Can see the experiment without project membership. Edits still need `experiments.edit`. |
| Owner | Set for the creator. Can manage collaborators, change the design data, and delete the experiment. MINT keeps at least one owner. |

The **Team** card marks only the owners. Collaborators stored with an older role (Viewer, Editor or Admin) act as collaborators. `POST /api/experiments/{id}/collaborators` accepts only the roles `owner` and `collaborator` (the default). Other roles get 422 `validation.request`.

MINT stores collaborators on the experiment, not on the project. A collaborator stays when you remove the user from the project. For system roles, see [Users & roles](/admin/users-roles).

## Search and filters

The **Experiments** page lists every experiment you can see. Use **Table** and **Cards** to change the layout. In the table, click **Name**, **Type**, **Status**, **Timeline** or **Updated** to sort.

| Filter | Notes |
|--------|-------|
| Search | Finds text in the name, experiment code, notes and tags. |
| Status | A chip for **All** and for each status, each with a count. |
| Type | The active experiment types. |
| Filters -> Project | One project, or all. |
| Filters -> Created | A preset or custom date range. |
| Mine | Only the experiments that you created. |

On a project page, the rollup chips filter by design data. See [Projects -> Project page](/guide/projects#project-page).

![Experiments page in Table layout with the Ongoing status chip, the Isotope tracing type and the Mine chip selected](/screenshots/guide/experiments-list-filters.webp)

## Edit an experiment and resolve conflicts

Click **Edit** in the header. The form keeps the version that you loaded. If someone else saves the experiment first, MINT refuses your save and shows **Changed by someone else**. Choose one:

- **Reload and discard mine** loads the newer version and drops your edits.
- **Overwrite** saves your edits over the newer version.

The same dialog shows when you edit a project. A plugin or an API client that sends no version always overwrites.

## Work together live

Realtime updates are on by default (`realtimeEnabled`). Your admin can turn them off. When they are on, MINT shows changes by other people without a reload:

- The experiment page, the experiments list and the project page refresh when a matching change arrives. While an edit form is open, the refresh waits until you close it.
- If someone else saves the experiment while your edit form has unsaved edits, a banner tells you. Choose **Reload form**, or **Review** to open the experiment in a new tab. A form without edits reloads by itself.
- Avatars in the experiment header show who else is on the experiment. Click them to see what each person does: viewing, viewing design, viewing results, or editing. People who edit show first. Editing is a hint, not a lock; **Edit** stays available.
- In a [design form](#fill-in-the-design), a field that another person edits shows their avatar and is locked until their value is stored. A field that another person changed flashes once. A value saved by another person replaces your field only when you have no unsaved edit in it.
- Each browser tab counts separately. When you close a tab, its label goes away. Your own tabs never lock each other.

## Deleting experiments

Only the experiment owner or an admin can delete an experiment, and the role needs `experiments.delete`. You cannot undo the deletion in the UI.

The deletion removes:

- The experiment record and its design data.
- The analysis artifact records.
- The stored files of the experiment in the object store. MINT deletes them in the background. A file that another experiment uses stays.

Child experiments stay and lose their link to the parent. You can delete an experiment that has a number. The confirmation names the number and tells you that files on the lab storage keep it. The audit log records the deleted number.

Plugin tables and external files follow the rules of each plugin. Make sure that your database backups cover the recovery time your lab needs.
