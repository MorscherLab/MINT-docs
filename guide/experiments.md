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
| **Type** | Required. One of the experiment types your admin created in [Admin -> Platform -> Experiment types](/admin/platform-settings#experiment-types). Sets the code prefix. If the type you need is missing, ask your admin. |
| **Start date / End date** | Optional |
| **Notes** | Protocol, conditions, anything the next person needs. Searchable. |
| **Project** | Optional; an experiment belongs to at most one project. When you select a project, its members join the **Team** list. When you change the project, the members that the previous project added leave the list again. |
| **Derived from** | Optional parent experiment |
| **Tags** | Optional |
| **Team** | Optional. Add people now or later, with the role Viewer, Editor, or Admin. You are stored as `owner`. |

Click **Create experiment**. The new experiment starts in `planned` status and has no number yet. Design data is written later by the design plugin for that type.

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

A given experiment has exactly one design-owning plugin, selected by its type, but it can be analyzed by many `ANALYSIS` or `FULL` plugins over time.

## Design and analysis on the detail page

The experiment detail page is a single record view: design, analysis outputs, and metadata live on the same page.

| Region | What to use it for |
|--------|--------------------|
| **Header** | Read the experiment code/name (or assign the number), update status, edit metadata, cancel/reactivate, or open the design plugin. When realtime updates are on, avatars show who else has the experiment open; see [Work together live](#work-together-live). |
| **Design data** | Review the design document as grouped fields and sample rows. Export JSON or CSV when design data is present. |
| **Analysis artifacts** | Review outputs grouped by producing plugin. Empty experiments show analysis plugins that can run next and why unavailable plugins are blocked. |
| **Instrument records** | With `instruments.view`: the instrument history rows that name this experiment, for example finished samples. See [Instruments -> History](/guide/instruments#history). |
| **Metadata rail** | Check type, project, timeline, creator, data lineage, collaborators, tags, and destructive actions. |

Plugins appear under their display name. Artifacts are grouped by plugin and sorted by most recent update. MINT shows the artifact display name, artifact key, result keys, status, and available actions:

| Action | Effect |
|--------|--------|
| **Open** | Launch the plugin route that produced the artifact, with the experiment and artifact preselected when the plugin supports it. |
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
| **Viewer / Editor / Admin** | Can see the experiment even if they are not a project member. The label is stored with the collaborator; edits still need `experiments.edit`. |
| **owner** | Set for the creator. Can manage collaborators and delete the experiment; MINT keeps at least one owner. |

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
| **Filters -> My experiments only** | Only experiments you created |

On a project page, the rollup chips filter that project's experiments by whether they have design data.

> [Screenshot: experiments list with multiple filters applied]

## Edit an experiment and resolve conflicts

Click **Edit** in the header. The form remembers the version that you loaded. If someone else saves the experiment first, MINT refuses your save and shows **Changed by someone else**. Choose one:

- **Reload and discard mine** loads the newer version and drops your edits.
- **Overwrite** saves your edits on top of the newer version.

The same dialog appears when you edit a project. A plugin or an API client that sends no version always overwrites.

## Work together live

When your admin turns on realtime updates (`realtimeEnabled`, off by default), MINT shows changes that other people make without a manual reload:

- The experiment page, the experiments list, and the project page refresh when a matching change arrives. While an edit form is open, the refresh waits until you close it, so your unsaved edits stay.
- If someone else saves the experiment while your edit form has unsaved edits, a banner at the top of the form tells you. Choose **Reload form**, or choose **Review** to open the experiment in a new tab. A form without edits reloads by itself.
- Avatars in the experiment header show who else is on the experiment. Click them to see each person and what they do: viewing, viewing design, viewing results, or editing. Editing is a hint, not a lock. **Edit** stays available.

## Deleting experiments

Deleting an experiment removes the experiment record and platform-owned dependent rows, including design data and analysis artifact metadata. Only the experiment owner or an admin can delete it, and the role needs `experiments.delete`. An experiment with a number can be deleted too: the confirmation names the number and says that files on the lab storage keep it. The audit log records the deleted number. Treat deletion as irreversible from the UI and make sure your platform database backups cover the recovery window your lab needs. Plugin-owned tables and external file retention can still be plugin-specific.

## Next

→ [Plugins](/admin/plugins) — the full plugin model
→ [Marketplace](/guide/marketplace) — install and request plugins
→ [Users & roles](/admin/users-roles) — system roles and project membership
