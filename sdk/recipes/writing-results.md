# Writing results

Publish small structured results as named JSON artifacts, large files as file-backed artifacts, and queryable run history in plugin-owned tables. All platform persistence below uses the plugin's scoped `ExperimentRepository` in MINT 1.2.

## Save a named JSON result

```python
from mint_sdk import (
    AnalysisPlugin, CurrentExperiment, CurrentPluginActor,
    PluginCapabilities, endpoint, mint_plugin,
)

@mint_plugin(
    analysis_type="qc", routes_prefix="/peak-qc",
    capabilities=PluginCapabilities(requires_auth=True, requires_experiments=True),
)
class PeakQcPlugin(AnalysisPlugin):
    @endpoint.post("/experiments/{experiment_id}/summarize")
    async def summarize(
        self, experiment: CurrentExperiment, actor: CurrentPluginActor,
    ) -> dict[str, object]:
        design = await self.load_design(experiment.id)
        result = {
            "method": "sample-count-v1",
            "sample_count": len(design.data.get("samples", [])) if design else 0,
            "requested_by": actor.user_id,
        }
        artifact = await self.save_analysis_artifact(
            experiment.id, result,
            artifact_key="summary", display_name="Sample summary",
        )
        return {"artifact_id": artifact.id, "result": result}
```

`CurrentExperiment` requires a visible compatible platform experiment, so this route returns 503 in standalone mode. Without this boundary, the single-save helper returns `None` when no repository exists; it does not save locally.

JSON saves are upserts by `(experiment_id, plugin_id, artifact_key)`. Saving `summary` again replaces that output; saving an archived key restores it with the new payload. Use `self.metadata.name` for a repository call that explicitly needs your plugin ID rather than taking an owner ID from a request body.

## Save several outputs atomically

```python
from mint_sdk import AnalysisArtifactInput

saved = await self.save_analysis_artifacts(experiment.id, [
    AnalysisArtifactInput(
        artifact_key="summary", display_name="Summary",
        result={"sample_count": 24},
    ),
    AnalysisArtifactInput(
        artifact_key="qc", display_name="QC checks",
        result={"passed": True, "warnings": []},
    ),
])
```

In **v1.2.0**, the batch commits every member or restores the repository to its pre-call state and raises the member failure. Results preserve input order. Duplicate keys in a batch are rejected. Empty batches return `[]`; nonempty batches require a context and an atomic-capable platform repository.

This transaction covers this artifact batch, not preceding uploads, design saves, external computation, or writes to a different experiment. A loop across experiments consists of separate commits.

## Preserve history and handle retries

Use a persisted job/run UUID as the key prefix when each run must remain independently visible, for example `run-{run_id}-summary`. Store algorithm version, parameters, input references, and run ID in the payload so a result can be reproduced.

A stable key prevents duplicate rows during retries but JSON upserts can still replace a previous payload. For strict create-only JSON output, call:

```python
artifact = await repo.create_analysis_artifact(
    experiment.id, self.metadata.name, result,
    artifact_key=f"run-{run_id}-summary",
    display_name="Run summary",
)
```

An existing active **or archived** key raises `ConflictException` (409). A read-then-save check alone is not safe against concurrent writers. On a retry conflict, reload and confirm the existing output matches the intended run before treating it as success.

## Create a file-backed artifact

```python
from pathlib import Path

artifact = await self.save_analysis_file_artifact(
    experiment.id,
    Path("/tmp/report.csv"),
    filename="report.csv",
    artifact_key=f"run-{run_id}-report",
    kind="csv",
    display_name="CSV report",
    metadata={"rows": 1240, "run_id": run_id},
    content_type="text/csv",
)
```

The input can be bytes, a local `Path`, a binary file object, or an existing `DataObjectRef`. Files are uploaded to the experiment/plugin object store; the artifact stores a compact typed reference. New uploads get versioned object keys. `object_key` chooses a base path, not an overwrite target.

Unlike the JSON upsert helper, `save_analysis_file_artifact()` is **create-only**. Reusing its artifact key conflicts even when the existing artifact is archived. Omit the key for a generated unique key, or choose a new run key.

Download using the SDK helper so consumers do not reconstruct object URLs:

```python
await self.load_analysis_file_artifact(
    experiment.id, "/tmp/downloaded-report.csv",
    artifact_key=f"run-{run_id}-report",
)
```

For job-produced files, use `ManagedFileResult` and `@job_finalizer` with `save_managed_job_artifact()`; job result storage is temporary. See [Jobs and generated UI](/sdk/tutorials/first-analysis-plugin).

## Replace an existing file safely

Use the separate replacement operation:

```python
outcome = await self.update_analysis_file_artifact(
    experiment.id,
    artifact_key="report",
    data=Path("/tmp/recomputed-report.csv"),
    filename="report.csv",
    kind="csv",
    metadata={"rows": 1300},
)
```

The SDK reads the current object key and uses compare-and-swap when committing the replacement. Concurrent replacements conflict with 409. Pass `expected_object_key` when the user's edit is based on a previously read revision; a stale key is rejected before upload.

`filename` and `kind` are immutable. Omitted `note` preserves it, a string replaces it, and `None` clears it. `metadata` replaces the prior mapping. Old-object cleanup is recorded with the metadata transaction; `outcome.cleanup_pending=True` means the new artifact committed but cleanup remains pending, so do not retry the successful replacement as if it failed.

## Design data belongs to its design plugin

```python
saved_design = await self.save_design(
    experiment.id,
    {"samples": [{"name": "QC-1"}], "schema_version": "2.0"},
    schema_version="2.0",
)
```

The effective `design_data_write` capability must allow this write. One experiment has one design payload and one owner. The first design save establishes ownership; another plugin cannot replace or delete it, including a `FULL` plugin. Conflicts return `DESIGN_DATA_OWNERSHIP_CONFLICT` (409).

Declare `design_schema` (JSON Schema, or `design_schema_from_model(Model)`) for platform validation, and `design_schema_version` for the owner's schema version. These fields describe the payload contract; they do not migrate old JSON automatically. See [Data model](/sdk/concepts/data-model).

`save(design=..., analysis=...)` is the older convenience path for sequential design plus compatibility result writes. It is not a transaction across both operations. `save_analysis()` still maintains the legacy default result; named artifacts are the primary API for new visible outputs.

## Read, archive, and share

```python
items = await self.load_analysis_artifacts(experiment.id)
archived = await self.archive_analysis_artifact(experiment.id, artifact_key="summary")
restored = await self.restore_analysis_artifact(experiment.id, artifact_key="summary")
```

Lists return metadata; load a selected artifact to read its result. The experiment UI presents artifacts with open/download/archive actions. Other plugins must declare this plugin ID in `analysis_result_readers`; ordinary lists expose only the calling plugin's outputs. Archiving is a visibility/lifecycle action, not permanent deletion or a version history.

## Source and related guides

Verified against [v1.2.0 persistence helpers](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/plugin_persistence.py) and [repository contract](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-python/src/mint_sdk/repositories.py).

- [Data model and ownership](/sdk/concepts/data-model)
- [Plugin-owned tables](/sdk/recipes/querying-plugin-data)
- [REST artifact downloads](/sdk/api/client)
