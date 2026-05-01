# Deploying

Plugin authors don't deploy the platform — that's the lab admin's job. But what you ship affects how it runs in production. This page covers the ops considerations a plugin author should keep in mind.

## Deployment targets

| Target | Plugin author concerns |
|--------|------------------------|
| Direct Linux install (`uv tool install mint`) | Filesystem paths must be portable; native deps must match the host's libc |
| Docker image (`ghcr.io/morscherlab/mint`) | Native deps must be in the image (Python, R, system libs); plugin's heavy deps blow up image size |
| Kubernetes (multi-replica) | Plugin migrations must use advisory locks correctly; long-running tasks need idempotency |

## What gets installed where

When a plugin is installed via the marketplace:

```
/var/lib/mint/                   # plugins.dataDir (configurable)
├── plugin-data/
│   ├── my-plugin/
│   │   ├── artifacts/           # uploaded files
│   │   ├── cache/               # plugin-managed cache
│   │   └── snapshots/           # pre-upgrade snapshots
│   └── ...
└── _uploads/                    # temporary upload buffer
```

Plugin Python code lives in:

- **Shared mode**: alongside platform code in the platform's venv (`/opt/mint/.venv` or wherever)
- **Isolated mode**: in a per-plugin venv at `/var/lib/mint/venvs/my-plugin/`

Frontend assets:

- Bundled inside the wheel under `<plugin>/frontend/dist/` and read at runtime via `get_frontend_dir()`

## Native dependencies

If your plugin depends on system libraries (R, native compilers, GDAL, ImageMagick, …), the deployment image / host must have them.

| Pattern | Where it lives |
|---------|----------------|
| Python wheels with vendored binaries (`numpy`, `scipy`) | Just work; pip / uv resolves the right wheel |
| Pure Python | Just work |
| C extensions you build (rare) | Provide manylinux wheels; CI builds for the platform's target |
| External binaries (`Rscript`, `magick`) | Document in your README; advise admins to install in the host or image |

Document any non-Python deps in your plugin's README under a "Runtime requirements" section. Admins read this before installing.

## Multi-replica considerations

When the platform runs as multiple replicas (e.g., Kubernetes with `replicas: 3`):

| Concern | Behavior |
|---------|----------|
| Migrations | Advisory-locked — only one replica applies them; others wait. Postgres-only. |
| Plugin install | Coordinated through the platform; no plugin-author concern |
| In-process state | Each replica has its own — don't cache request-scoped data in module globals (see [Recipes → Logging & tracing](/sdk/recipes/logging-tracing)) |
| Scheduled jobs | Use the platform's job-runner abstraction; running cron in-process across replicas duplicates the work |
| Filesystem writes | Use `plugins.dataDir` which is shared (NFS, etc.) — never write to local disk paths assuming a single replica |

Plugins that need request-affinity (e.g., session-bound state in WebSocket connections) should declare it; the platform's reverse proxy can route to a stable replica via session affinity but not by default.

## Migrations under load

Long-running migrations block plugin start. For deployments where downtime matters:

1. Use the **online migration** pattern from [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — split schema and backfill into separate revisions
2. Ship the schema-add migration in release N
3. Backfill in release N+1 (when every replica has the schema-add)
4. Tighten constraints in release N+2

This means a backwards-incompatible schema change takes 2-3 plugin releases to land. Trade off against the cost of brief downtime.

## Resource consumption

The platform doesn't enforce per-plugin resource quotas (CPU, RAM, disk). Plugin authors should:

- **CPU**: long-running endpoints should be cancellation-aware (`asyncio.CancelledError` handling). Don't hog the event loop with CPU-bound work — spawn a subprocess or use a thread-pool for that.
- **RAM**: stream large responses rather than buffering. Read DataFrames in chunks.
- **Disk**: clean up old artifacts, cache files. The platform doesn't auto-prune `plugins.dataDir/<your-plugin>/`.

For heavy compute (multi-minute analyses), use the platform's job system rather than blocking the request:

```python
class MyPlugin(AnalysisPlugin):
    async def kick_off_analysis(self, experiment_id: int):
        job_id = await self._enqueue_job(experiment_id)
        return {"job_id": job_id, "status": "queued"}
```

The exact job-runner API is platform-version-specific; consult `mint-sdk` source for what's exposed in your installed version.

## Configuration and secrets

Three layers, in increasing precedence:

1. **Defaults** baked into the plugin (`PluginMetadata`, `settings_model`)
2. **Platform config** (`config.json` `plugins.settings.<name>` for the plugin's settings)
3. **Per-deployment env vars** (`MINT_PLUGIN_<NAME>_<KEY>`)

Secrets:

- **Don't** hardcode in the wheel
- **Don't** commit to the manifest
- **Do** use the platform's settings store (`apply_settings()`) and have admins set values from the UI
- **Do** use env vars for deployment-specific values that admins shouldn't see in the UI (e.g., a database read-replica URL)

For per-user secrets (an external-service API token tied to a user's identity), store them in `UserPluginRole` extra fields or a plugin-owned table — not in `User`.

## Observability

Plugins inherit the platform's observability automatically:

- Structured logs via `get_plugin_logger`
- OTel traces via `tracer.start_as_current_span`
- Auto-issued GitHub bug reports for unhandled exceptions (when `observability.autoIssue` is on)

For per-plugin metrics dashboards (Grafana), publish via OTel's metrics SDK — the platform's exporter forwards them. Define a few key metrics rather than instrumenting every line.

## Backups

The platform owns:

- Postgres database backups (lab-managed, e.g., `pg_dump` on a schedule)
- `plugins.dataDir` backups (if the volume isn't already on a backed-up filesystem)

Plugin authors don't need to implement backup logic. Document any plugin-specific recovery steps (e.g., "if you restore the database from before a 2.0 schema change, run `mint plugin reset --revision 1` to roll back the plugin to a compatible version").

## Notes

- Plugin Docker images are not a thing — the platform itself is the container, plugins install into it. Don't try to ship a separate Dockerfile for your plugin.
- For air-gapped deployments, the registry should be self-hosted on the same network. The platform supports `marketplace.registries[]` with multiple URLs (private + public).
- Don't rely on outbound network from a plugin — many lab deployments restrict it. Document any required outbound calls in your README.

## Related

- [Operations → Versioning](/sdk/operations/versioning) — release cadence and the deploy story
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — multi-step schema change pattern
- [Workflow → Updates](/workflow/updates) — admin-side upgrade flow
