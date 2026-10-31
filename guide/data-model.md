# MINT data model

MINT is organized around one central object: the **experiment**. Projects group experiments, users and roles decide who can see or edit them, and plugins attach design data, analysis artifacts, and plugin-owned tables around them.

This page is the conceptual database map before you install or write plugins.

## Core entities

| Entity | What it represents | Owned by |
|--------|--------------------|----------|
| **Project** | A lab project, study, collaboration, or dataset container | Platform |
| **Experiment** | One unit of scientific work with a type-scoped code, type, status, design data, and analysis artifacts | Platform + plugins |
| **Experiment type** | A slug plus display metadata selected when creating an experiment | Platform; usually paired with a design or full plugin |
| **Design data** | The plugin-authored JSON document that describes what was planned or measured | Experiment-design or full plugin |
| **Analysis artifact** | A named analysis output for one experiment, plugin, and artifact key | Analysis or full plugin |
| **User** | A person or service account | Platform |
| **Role** | Platform permissions such as viewing projects, managing users, or installing plugins, plus which projects and plugins the role can reach | Platform |
| **Project member** | A user's role inside one project | Platform |
| **Plugin access level** | The level a plugin endpoint, job, or page needs: `use`, `configure`, or `admin`. The platform maps your role to the level | Plugin + platform |
| **Plugin table** | Plugin-owned relational tables for domain-specific data | Plugin |

## Experiment shape

An experiment combines platform fields with plugin-defined fields:

| Field group | Examples | Notes |
|-------------|----------|-------|
| Identity | `id`, `experiment_code`, `name`, `version` | `experiment_code` is generated from type + sequence, e.g. `DR-EXP-001` for type `dose_response`. It is empty until the experiment starts or a user assigns it; see [Experiment numbers](/guide/experiments#experiment-numbers). `version` goes up with every write and lets MINT detect two people saving at the same time |
| Classification | `experiment_type`, `status`, project link | Status is `planned`, `ongoing`, `completed`, or `cancelled` |
| Ownership | creator, collaborators, project members | Access is resolved from platform RBAC and project membership |
| Design data | sample layout, plate map, run sequence, treatment plan | One JSON payload written when the plugin's resolved policy allows `design_data_write` |
| Analysis artifacts | result summaries, reports, exported tables, file-backed outputs | Named records written when the plugin's resolved policy allows `analysis_result_write` |
| File objects | RAW files, generated reports, binary analysis outputs | Stored under the configured data path or object store, referenced from artifacts |

Think of the platform experiment row as the stable spine. Plugins should store highly structured or query-heavy data in their own tables, then write compact design summaries and named analysis artifacts back to the platform so the MINT UI can show status, downloads, and follow-up workflows. The user-facing result list is driven by first-class analysis artifacts. A result that a plugin saves without a key is stored as the artifact `default`.

## Analysis artifacts

An analysis artifact is the managed result object users see on an experiment detail page. The platform stores each artifact with:

| Field | Meaning |
|-------|---------|
| `experiment_id` | The experiment the output belongs to |
| `plugin_id` | The plugin that produced the output |
| `artifact_key` | A stable key such as `default`, `qc-report`, or `peak-table` |
| `display_name` / `note` | Shared metadata users can edit from the experiment page |
| `status` | `active` by default; archived artifacts are hidden unless requested |
| `result_keys` / `result` | A lightweight index of top-level result keys plus the JSON payload |

`(experiment_id, plugin_id, artifact_key)` is unique. Saving again with the same key updates that named output; saving multiple keys lets one plugin expose separately managed results such as a QC report, a peak table, and a downloadable file. File-backed artifacts keep object references in `result["file"]` and stream the bytes from the platform object store.

The experiment page groups artifacts by producing plugin. It marks active artifacts as **stale** when the experiment design data has been edited after the artifact was written, because that is the lifecycle transition MINT can prove without inventing a separate run entity. Users with `experiments.edit` can edit artifact metadata, archive/restore artifacts, and permanently delete archived artifacts.

## How plugins attach data

A plugin declares which platform data it writes. The platform enforces the declaration:

| Declared write | Allows | Typical use |
|----------------|--------|-------------|
| none | Read only. The plugin type is `STATIC` | Reference viewers and calculators |
| `artifacts` (default) | Save its own analysis artifacts. The plugin type is `ANALYSIS` | Peak picking, model fitting, report generation |
| `design` | Save and delete its own design data. With `artifacts` too, the plugin type is `FULL`, otherwise `EXPERIMENT_DESIGN` | Plate maps, acquisition sequences, treatment layouts |
| `experiments` | Create, update, and delete experiment records. Without `design` and `artifacts`, the plugin type is `WORKFLOW` | Schedulers and lifecycle orchestration |

The plugin declares these with `Metadata.writes`. Read access still depends on the current user's visibility and the experiment-type allowlist that your admin set. A plugin changes only its own design data. It replaces the results of another plugin only when it names that plugin in `Metadata.writes_to`. A plugin that creates an experiment for a user makes that user the owner. Developer detail: [Plugin types](/sdk/concepts/plugin-types).

## Storage layers

| Layer | What lives there |
|-------|------------------|
| Platform database | Users, roles, projects, experiments, experiment types, design data, analysis artifacts, notices, audit events, instrument status history, personal access tokens, push devices, plugin migration records |
| `server.dataPath` | Local object storage, marketplace cache, uploaded `.mint` bundles, plugin registry state, and plugin install snapshots |
| Plugin schema or tables | Domain-specific relational data created by plugin migrations |

MINT uses PostgreSQL for every platform deployment. A plugin running standalone can still use the SDK's local SQLite database; that storage is separate from platform users, projects, experiments, and plugin schemas.

## Lifecycle

1. A user creates a project.
2. An admin creates or enables an experiment type and installs the plugin(s) that act on it.
3. A user creates an experiment and chooses that type.
4. The design plugin writes structured design data.
5. One or more analysis/full plugins read the experiment and save named analysis artifacts.
6. Users review artifact groups, export files or JSON payloads, archive stale outputs, or launch follow-up plugin workflows.

## Read next

→ [Experiments](/guide/experiments) - user workflow around the model
→ [Plugins](/admin/plugins) - how plugins attach to experiments
→ [Plugin Development Guide](/sdk/) - build a plugin that reads an experiment and writes artifacts
