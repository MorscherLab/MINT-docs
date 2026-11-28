# Writing results

Save small structured results as named JSON artifacts and large files as file-backed artifacts. Keep queryable run history in plugin-owned tables. The examples use `self.artifacts` and `self.design`, the shortcuts for `context.artifacts` and `context.design`.

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

In standalone mode, this route returns 503 from [`CurrentExperiment`](/sdk/concepts/platform-context#request-scoped-access). Without the platform, `artifacts.save` raises `UnavailableException`; it does not save locally.

- A JSON save replaces by default (`replace=True`). It is an upsert by `(experiment_id, plugin_id, key)`.
- Saving `summary` again replaces that output. Saving an archived key restores it with the new payload.
- Without a key, the key is `"default"`.
- When a call needs your plugin ID, use `self.name`. Never take an owner ID from a request body.

## Save several outputs atomically

```python
from mint_sdk import ArtifactInput

saved = await self.artifacts.save_all(experiment.id, [
    ArtifactInput(key="summary", data={"sample_count": 24}, name="Summary"),
    ArtifactInput(key="qc", data={"passed": True, "warnings": []}, name="QC checks"),
])
```

- The batch commits every member or none, and raises the failure of the member.
- The results keep the input order.
- Duplicate keys in a batch raise `ValidationException`. An empty batch returns `[]`.
- The transaction covers only this artifact batch. Earlier uploads, design saves, external computation and writes to other experiments are separate. A loop across experiments makes separate commits.

## Split results so readers can skip large tables

An artifact is read whole. Save small summaries and large tables under separate keys, so a reader loads only the key that it needs:

```python
await self.artifacts.save(experiment.id, {"n": 1200}, "summary")
await self.artifacts.save(experiment.id, {"peaks": rows}, "peaks")      # large table
summary = await self.artifacts.get(experiment.id, "summary")            # reads only "summary"
```

## Preserve history and handle retries

To keep each run visible, use a stored job or run UUID as the key prefix, for example `run-{run_id}-summary`. Store the algorithm version, parameters, input references and run ID in the payload, so that a result can be reproduced.

A stable key prevents duplicate rows on a retry, but the default save replaces the previous payload. For create-only output, pass `replace=False`:

```python
artifact = await self.artifacts.save(
    experiment.id, result, f"run-{run_id}-summary",
    name="Run summary", replace=False,
)
```

An existing key, active or archived, raises `ConflictException` (409). A read-then-save check does not protect against concurrent writers. On a retry conflict, reload the output and confirm that it belongs to the intended run before you treat it as a success.

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

- A file artifact takes a `pathlib.Path` and an explicit key. Bytes, `str` paths, file objects and object references are refused. For those, upload through `context.objects(experiment.id)` first, then save the file.
- The file goes to the object store of the experiment and plugin. The artifact stores a typed reference.
- `filename` defaults to the name of the path.

Download with the SDK helper. Do not build object URLs yourself:

```python
await self.artifacts.download(experiment.id, f"run-{run_id}-report", Path("/tmp/downloaded-report.csv"))
```

`download` returns the destination `Path` and raises `NotFoundException` when the artifact does not exist.

Job result storage is temporary. For a file that a job makes, return `FileResult`, and save it in an async `@finalize(Spec)` method with the adopted `ManagedFile`. See [First analysis plugin](/sdk/tutorials/first-analysis-plugin).

## Replace an existing file safely

Save again to the same key. The replacement is a compare-and-swap on the object key:

```python
artifact = await self.artifacts.save(
    experiment.id,
    Path("/tmp/recomputed-report.csv"),
    "report",
    expect=previous_object_key,
    metadata={"rows": 1300},
)
```

- Concurrent replacements conflict with 409 (`ConflictException`).
- When the edit follows a revision that the user read, pass `expect` with that object key. A stale key is refused.
- A replaced file artifact keeps its kind, filename and name. `note=None` keeps its note.
- The platform removes the old object after the replacement commits.

`artifacts.save` writes only the artifacts of the calling plugin. No plugin can replace a file artifact of another plugin. To read one, name the producer in `reads_from` and pass `plugin=` to `artifacts.get` and `artifacts.download`. For `writes_to` (create-only object access), see [Cross-plugin readers](/sdk/concepts/platform-context#cross-plugin-readers).

## Use a file artifact as a job input

A generated-UI `@job` with a `Path` input can take an existing file-backed artifact:

1. The input picker lists the artifacts.
2. On submit, the UI posts the experiment ID and artifact ID to `POST {prefix}/jobs/artifacts`.
3. The SDK copies the file into the temporary staging of the job.
4. The handler gets an ordinary `pathlib.Path`.

In the frontend SDK, the selection is a `PluginJobArtifactPathInput` (`kind: 'artifact-path'`).

`GET {prefix}/jobs/artifacts?experiment_id=N` lists the artifacts that staging accepts. An artifact is readable when all of these are true:

- The caller has `experiments.view` and can see the experiment.
- The artifact is active (not archived).
- The artifact belongs to this plugin, or to a plugin in this plugin's `reads_from`.
- The artifact is a file artifact (`mint.analysis_file.v1`).

The SDK checks the same rules again on each job submission. If access changed in between (permission, visibility, archive, deletion or readers), the submission gets 404 and the SDK releases the staged copy. When nothing is readable, the picker shows "No file artifacts this plugin can read".

## Design data belongs to its design plugin

```python
saved_design = await self.design.save(
    experiment.id,
    {"samples": [{"name": "QC-1"}]},
    version="2.0",
)
```

The plugin needs `"design"` in `Metadata.writes`. The first design save makes the plugin the design owner; for the ownership rules, see [`DesignData`](/sdk/concepts/data-model#designdata). Another plugin's save gets 409 `DESIGN_DATA_OWNERSHIP_CONFLICT`.

- Declare `Metadata.design = Design(version="2.0", schema=Model)`. The platform validates every `design.save` against the schema.
- The schema and version describe the payload. They do not migrate old JSON.
- To refuse a write over a newer one, pass `expected_version=experiment.version`. A stale value raises `VersionConflictException` (412).

## Read, archive, and share

```python
items = await self.artifacts.list(experiment.id)
archived = await self.artifacts.archive(experiment.id, "summary")
restored = await self.artifacts.restore(experiment.id, "summary")
```

- Lists return metadata. Call `artifacts.get` to read a selected result.
- `archive` and `restore` return `True` when the artifact exists. Archiving hides the artifact. It is not a deletion or a version history.
- A list shows only the outputs of the calling plugin. Another plugin reads them only when it names this plugin in its `reads_from`.
- The experiment page shows the artifacts with open, download and archive actions; see [Artifacts](/guide/experiments#artifacts).

## Source

Verified against [v@MINT_VERSION@ persistence helpers](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/plugin_persistence.py) and [repository contract](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/repositories.py). For REST downloads, see [REST client](/sdk/api/client).
