# MINT data model

This page shows what MINT stores and who owns each part. The experiment is the central object. Projects group experiments, roles control access, and plugins attach data to experiments.

## Core entities

| Entity | What it represents | Owned by |
|--------|--------------------|----------|
| Project | A lab project, study, collaboration, or dataset group | Platform |
| Experiment | One unit of scientific work, with a code, type, status, design data and analysis artifacts | Platform and plugins |
| Experiment type | A slug and display data that you select when you create an experiment | Platform; usually paired with a design or full plugin |
| Design data | The JSON document from a plugin that describes what was planned or measured | Design or full plugin |
| Analysis artifact | A named analysis output for one experiment, plugin and artifact key | Analysis or full plugin |
| User | A person or a service account | Platform |
| Role | Platform permissions, such as viewing projects, managing users or installing plugins, and the projects and plugins that the role can reach | Platform |
| Project member | The role of a user in one project | Platform |
| Plugin access level | The level that a plugin endpoint, job or page needs: `use`, `configure` or `admin`. The platform maps your role to a level | Plugin and platform |
| Plugin table | Tables that a plugin owns for its own data | Plugin |

## Experiment shape

An experiment has platform fields and plugin fields:

| Field group | Examples | Notes |
|-------------|----------|-------|
| Identity | `id`, `experiment_code`, `name`, `version` | `experiment_code` is empty until MINT assigns a number; see [Experiment numbers](/guide/experiments#experiment-numbers). `version` goes up with each write. MINT uses it to find two saves at the same time |
| Classification | `experiment_type`, `status`, project link | Status is `planned`, `ongoing`, `completed`, or `cancelled` |
| Ownership | creator, collaborators, project members | Platform roles and project membership control access |
| Design data | sample layout, plate map, run sequence, treatment plan | One JSON document. A plugin writes it when its policy allows `design_data_write`. A live design plugin saves it one field at a time, so required fields can be missing for a while |
| Analysis artifacts | result summaries, reports, exported tables, file outputs | Named records. A plugin writes them when its policy allows `analysis_result_write` |
| File objects | RAW files, generated reports, binary outputs | Stored in the data path or object store. Artifacts point to them |

The experiment record holds the fields that all plugins share. A plugin keeps large or structured data in its own tables. It writes a design summary and named analysis artifacts back to the platform, so that the MINT UI can show status and downloads.

## Analysis artifacts

An analysis artifact is a result that users see on the experiment page.

- Each artifact has a key, such as `default`, `qc-report` or `peak-table`. A result saved without a key gets the key `default`.
- The combination of experiment, plugin and key is unique. A new save with the same key replaces that output.
- One plugin can save several keys, for example a QC report, a peak table and a file.
- A file artifact keeps the object reference in `result["file"]`. MINT streams the bytes from the object store.
- Users can edit the display name and note of an artifact. An archived artifact is hidden unless a request asks for it.

For what users do with artifacts, see [Experiments -> Artifacts](/guide/experiments#artifacts). For how a plugin writes them, see [Writing results](/sdk/recipes/writing-results).

## How plugins attach data

Each plugin declares in `Metadata.writes` which platform data it can write: experiment records, its own design data, its own analysis artifacts, or none. The declaration sets the plugin type, and the platform enforces it. See [Plugin types](/sdk/concepts/plugin-types).

Read access still depends on what the current user can see and on the experiment types that your admin allowed for the plugin. A plugin changes only its own design data. It replaces the results of another plugin only when it names that plugin in `Metadata.writes_to`. When a plugin creates an experiment for you, you are the owner; see [Platform context](/sdk/concepts/platform-context).

## Storage layers

| Layer | Contents |
|-------|----------|
| Platform database | Users, roles, projects, experiments, experiment types, design data, analysis artifacts, notices, audit events, instrument status history, personal access tokens, push devices, plugin migration records |
| `server.dataPath` | Local object storage, marketplace cache, uploaded `.mint` bundles, plugin registry state, and plugin install snapshots |
| Plugin schema or tables | Plugin data that plugin migrations create |

The platform database is PostgreSQL; see [Install directly -> Requirements](/admin/install-direct#requirements).

## Lifecycle

1. A user creates a project.
2. An admin creates an experiment type and installs the plugins that act on it.
3. A user creates an experiment of that type.
4. The design plugin writes the design data, on its own page or in the design form of the experiment page. See [Fill in the design](/guide/experiments#fill-in-the-design).
5. Analysis or full plugins read the experiment and save named analysis artifacts.
6. Users review artifacts and plugin tabs, export files, archive old outputs, or start more plugin work.
7. A user deletes the experiment. See [Deleting experiments](/guide/experiments#deleting-experiments).
