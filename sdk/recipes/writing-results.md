# Writing results

Publish small structured results as named JSON artifacts, large files as file-backed artifacts, and queryable run history in plugin-owned tables. All platform persistence below uses the plugin's `context.artifacts` and `context.design` namespaces (the `self.artifacts` and `self.design` shortcuts).

## Save a named JSON result

```python
from mint_sdk import CurrentActor, CurrentExperiment, Metadata, Plugin, endpoint, plugin

class PeakQcMeta(Metadata):
    domain = "qc"
    prefix = "/peak-qc"

@plugin(PeakQcMeta)
class PeakQcPlugin(Plugin):
    @endpoint.post("/experiments/{experiment_id}/summarize")
    async def summarize(
        self, experiment: CurrentExperiment, actor: CurrentActor,
    ) -> dict[str, object]:
        design = await self.design.get(experiment.id)
        result = {
            "method": "sample-count-v1",
            "sample_count": len(design.data.get("samples", [])) if design else 0,
            "requested_by": actor.user_id,
        }
        artifact = await self.artifacts.save(
            experiment.id, result, "summary", name="Sample summary",
        )
        return {"artifact_id": artifact.id, "result": result}
```

`CurrentExperiment` requires a visible compatible platform experiment, so this route returns 503 in standalone mode. Without the platform, `artifacts.save` raises `UnavailableException`; it does not save locally.

JSON saves replace by default (`replace=True`): they are upserts by `(experiment_id, plugin_id, key)`. Saving `summary` again replaces that output; saving an archived key restores it with the new payload. The key is `"default"` when you omit it. Use `self.name` when a call needs your plugin ID, rather than taking an owner ID from a request body.

## Save several outputs atomically

```python
from mint_sdk import ArtifactInput

saved = await self.artifacts.save_all(experiment.id, [
    ArtifactInput(key="summary", data={"sample_count": 24}, name="Summary"),
    ArtifactInput(key="qc", data={"passed": True, "warnings": []}, name="QC checks"),
])
```

The batch commits every member or none, and raises the member failure. Results preserve input order. Duplicate keys in a batch raise `ValidationException`. An empty batch returns `[]`.

This transaction covers this artifact batch, not preceding uploads, design saves, external computation, or writes to a different experiment. A loop across experiments consists of separate commits.

## Split results so readers can skip large tables

An artifact is read whole. Save small summaries and large tables under separate keys, so a reader loads only the key that it needs:

```python
await self.artifacts.save(experiment.id, {"n": 1200}, "summary")
await self.artifacts.save(experiment.id, {"peaks": rows}, "peaks")      # large table
summary = await self.artifacts.get(experiment.id, "summary")            # reads only "summary"
```

## Preserve history and handle retries

Use a persisted job/run UUID as the key prefix when each run must remain independently visible, for example `run-{run_id}-summary`. Store algorithm version, parameters, input references, and run ID in the payload so a result can be reproduced.

A stable key prevents duplicate rows during retries, but the default save replaces a previous payload. For strict create-only output, pass `replace=False`:

```python
artifact = await self.artifacts.save(
    experiment.id, result, f"run-{run_id}-summary",
    name="Run summary", replace=False,
)
```

An existing active **or archived** key raises `ConflictException` (409). A read-then-save check alone is not safe against concurrent writers. On a retry conflict, reload and confirm the existing output matches the intended run before treating it as success.

## Create a file-backed artifact

```python
from pathlib import Path

artifact = await self.artifacts.save(
    experiment.id,
    Path("/tmp/report.csv"),
    f"run-{run_id}-report",
    kind="csv",
    name="CSV report",
    filename="report.csv",
    metadata={"rows": 1240, "run_id": run_id},
    content_type="text/csv",
    replace=False,
)
```

A file artifact takes a `pathlib.Path` and needs an explicit key. (Bytes, `str` paths, file objects and object references are not accepted: upload through `context.objects(experiment.id)` first, then save the file.) The file goes to the experiment/plugin object store; the artifact stores a compact typed reference. `filename` defaults to the name of the path.

Download using the SDK helper so consumers do not reconstruct object URLs:

```python
await self.artifacts.download(experiment.id, f"run-{run_id}-report", Path("/tmp/downloaded-report.csv"))
```

`download` returns the destination `Path` and raises `NotFoundException` when the artifact does not exist.

For job-produced files, return `FileResult` and persist it in an async `@finalize(Spec)` method with the adopted `ManagedFile`; job result storage is temporary. See [Jobs and generated UI](/sdk/tutorials/first-analysis-plugin).

## Replace an existing file safely

Save again to the same key. Replacing a file artifact is a compare-and-swap on its object key:

```python
artifact = await self.artifacts.save(
    experiment.id,
    Path("/tmp/recomputed-report.csv"),
    "report",
    expect=previous_object_key,
    metadata={"rows": 1300},
)
```

Concurrent replacements conflict with 409 (`ConflictException`). Pass `expect` (the object key that the user's edit is based on) when the edit follows a previously read revision; a stale key is rejected. A replaced file artifact keeps its kind, filename and name, and `note=None` keeps its note. The platform removes the old object after the replacement commits.

`artifacts.save` writes only the artifacts of the calling plugin. To read a file artifact of another plugin, name it in `reads_from` and pass `plugin=` to `artifacts.get` and `artifacts.download`. There is no cross-plugin file replacement in 1.4. A plugin in `writes_to` only opens that plugin's object store with `context.objects(experiment_id, plugin=...)`, create-only.

## Use a file artifact as a job input

A generated-UI `@job` with a `Path` input can take an existing file-backed analysis artifact. The input picker lists artifacts. On submit, the UI posts the experiment ID and artifact ID to `POST {prefix}/jobs/artifacts`. The SDK copies the file into the job's temporary staging. The handler still receives an ordinary `pathlib.Path`. In the frontend SDK, the selection is a `PluginJobArtifactPathInput` (`kind: 'artifact-path'`).

`GET {prefix}/jobs/artifacts?experiment_id=N` lists the artifacts that staging accepts. An artifact is readable when all of these are true:

- The caller has `experiments.view` and can see the experiment.
- The artifact is active (not archived).
- The artifact belongs to this plugin, or to a plugin in this plugin's `reads_from`.
- The artifact is a file artifact (`mint.analysis_file.v1`).

The SDK checks the same rules again on each job submission. If access changes in between (permission, visibility, archive, deletion or readers), the submission gets 404 and the staged copy is released. When nothing is readable, the picker shows "No file artifacts this plugin can read".

## Design data belongs to its design plugin

```python
saved_design = await self.design.save(
    experiment.id,
    {"samples": [{"name": "QC-1"}]},
    version="2.0",
)
```

The plugin must write design data (`"design"` in `Metadata.writes`). One experiment has one design payload and one owner. The first design save establishes ownership; another plugin cannot replace or delete it, including a plugin with all three writes. Conflicts return `DESIGN_DATA_OWNERSHIP_CONFLICT` (409).

Declare `Metadata.design = Design(version="2.0", schema=Model)` for platform validation and for the owner's schema version. The platform validates every `design.save` against the schema. These fields describe the payload contract; they do not migrate old JSON automatically. To refuse a write over a newer one, pass `expected_version=experiment.version`; a stale value raises `VersionConflictException` (412). See [Data model](/sdk/concepts/data-model).

## Read, archive, and share

```python
items = await self.artifacts.list(experiment.id)
archived = await self.artifacts.archive(experiment.id, "summary")
restored = await self.artifacts.restore(experiment.id, "summary")
```

Lists return metadata; call `artifacts.get` to read a selected result. `archive` and `restore` return `True` when the artifact exists. The experiment UI presents artifacts with open/download/archive actions. Other plugins must be named in their `reads_from` for this plugin ID; ordinary lists expose only the calling plugin's outputs. Archiving is a visibility/lifecycle action, not permanent deletion or a version history.

The 1.3 compatibility result (`save_analysis`, `PluginAnalysisResult`) and the `/api/internal` analysis result routes are removed. Save a single result as the `default` artifact.

## Source and related guides

Verified against [v@MINT_VERSION@ persistence helpers](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_persistence.py) and [repository contract](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py).

- [Data model and ownership](/sdk/concepts/data-model)
- [Plugin-owned tables](/sdk/recipes/querying-plugin-data)
- [REST artifact downloads](/sdk/api/client)
