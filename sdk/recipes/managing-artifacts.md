# Managing artifacts

## Goal

Persist user-uploaded files (RAW data, plate sheets, images) tied to an experiment, and read them back from the plugin.

## Where artifacts live

The platform stores artifact files under `plugins.dataDir`, namespaced per plugin. The file metadata (filename, content type, size, owner, experiment association) lives in a relational table the platform manages.

Plugins access artifacts in two complementary ways:

| Method | Use when |
|--------|----------|
| Direct filesystem path via `get_shared_db_session()` + `plugins.dataDir` resolution | You're the plugin that produced the file and just want to read it back |
| HTTP via the platform REST API (`/api/experiments/{id}/artifacts`) | The artifact was uploaded by another plugin or directly by the user |

The current `mint-sdk` doesn't expose a dedicated `ArtifactRepository` accessor on `PlatformContext` — artifacts are managed by the platform itself, and plugins integrate via the REST API. If your plugin needs read-only access to artifacts produced elsewhere, use the typed REST client.

## Upload from a plugin frontend

The most common path: the user picks a file in the plugin frontend, the platform handles the upload and notifies the plugin via a callback.

```vue
<!-- Plugin frontend -->
<script setup lang="ts">
import { useApi } from '@morscherlab/mint-sdk'

const api = useApi()
const experimentId = 1

async function upload(file: File) {
  const form = new FormData()
  form.append('file', file)
  form.append('experiment_id', String(experimentId))

  const result = await api.post('/api/experiments/' + experimentId + '/artifacts', form)
  // result: { artifact_id, filename, content_type, size, ... }
  return result
}
</script>
```

The `useApi` composable handles auth and tracing. The platform stores the file, records metadata, and returns the artifact ID.

## Reading artifacts you own

If your plugin produced the artifact (e.g., as part of an analysis result), you'll know the artifact ID and can resolve the file path:

```python
from pathlib import Path

class MyPlugin(AnalysisPlugin):
    async def read_artifact(self, artifact_id: int) -> bytes:
        # The artifact's filesystem path is recorded in the platform's
        # artifact table. Query via the REST client when you don't already
        # have it cached.
        path = await self._resolve_artifact_path(artifact_id)
        return Path(path).read_bytes()

    async def _resolve_artifact_path(self, artifact_id: int) -> str:
        # Use the typed client for a self-call. In integrated mode this is
        # a localhost loopback; in shared mode it's an in-process function call.
        config = self._context.get_config()
        from mint_sdk import MINTClient
        async with MINTClient(url=config["internalUrl"],
                              token=config["internalToken"]) as client:
            artifact = await client.artifacts.get(artifact_id)
            return artifact.file_path
```

::: warning Don't hardcode `plugins.dataDir`
The exact filesystem layout under `plugins.dataDir` is platform-managed and may change between versions. Always resolve via the platform's API rather than reading the directory directly.
:::

## Streaming downloads

For large artifacts, stream the response rather than buffering:

```python
import httpx

class MyPlugin(AnalysisPlugin):
    async def stream_artifact(self, artifact_id: int):
        config = self._context.get_config()
        url = f"{config['internalUrl']}/api/artifacts/{artifact_id}/download"
        headers = {"Authorization": f"Bearer {config['internalToken']}"}
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", url, headers=headers) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk
```

## Producing artifacts from analysis

When an analysis plugin produces a downloadable file, the typical pattern is:

1. Compute the file in memory or on disk
2. Upload it via the platform's artifact API as the analysis runs
3. Reference the artifact ID in `PluginAnalysisResult.result`

```python
class MyPlugin(AnalysisPlugin):
    async def run(self, experiment_id: int):
        csv_bytes = self._compute_report(experiment_id)

        # Upload as part of the analysis output
        artifact_id = await self._upload_artifact(
            experiment_id=experiment_id,
            filename="peaks.csv",
            content_type="text/csv",
            data=csv_bytes,
        )

        await self.save_analysis(experiment_id, {
            "report_artifact_id": artifact_id,
        })
```

The frontend reads `report_artifact_id` from `PluginAnalysisResult.result` and renders a download link.

## Size limits

Artifact size limits are platform-configured (`plugins.maxArtifactSizeMB`, default ~1 GB). Plugin uploads larger than the limit return a 413. Document any plugin-specific guidance in your README.

## Notes

- Artifact IDs are stable across plugin upgrades — safe to reference from analysis results.
- Deleting an experiment removes its artifacts (within the soft-delete grace window). Don't store standalone artifacts that need to outlive the experiment.
- For binary results that don't need to be downloadable (e.g., intermediate caches), prefer plugin-owned tables or the plugin's filesystem cache directory.

## Related

- [Recipes → Writing results](/sdk/recipes/writing-results) — referencing artifact IDs from analysis output
- [API Reference → REST client](/sdk/api/client) — `MINTClient.artifacts`
- [Concepts → Data model](/sdk/concepts/data-model) — what's tracked vs. what lives on disk
