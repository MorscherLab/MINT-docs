# Deploying

Plugin authors don't deploy the platform — that's the lab admin's job. But what you ship affects how it runs in production. This page covers the ops considerations a plugin author should keep in mind.

## Deployment targets

| Target | Plugin author concerns |
|--------|------------------------|
| Direct Linux wheel install | Filesystem paths must be portable; native deps must match the host's libc |
| Docker image (`ghcr.io/morscherlab/mint`) | Native deps must be in the image (Python, R, system libs); plugin's heavy deps blow up image size |
| Kubernetes (multi-replica) | Plugin migrations must use advisory locks correctly; long-running tasks need idempotency |

## What gets installed where

When a plugin is installed via the marketplace:

```
/var/lib/mint/                   # server.dataPath (configurable)
├── mint.db                      # when database.mode = sqlite
├── plugin_registry.json
├── marketplace/                 # registry cache
└── plugins/
    ├── manifest.json            # dynamically installed plugin restore manifest
    ├── uploads/                 # uploaded .mint bundles and temporary extraction dirs
    ├── snapshots/               # Python environment snapshots
    └── my-plugin/
        ├── venv/                # isolated mode only
        └── ...
```

Plugin Python code lives in:

- **Shared mode**: alongside platform code in the platform's venv (`/opt/mint/.venv` or wherever)
- **Isolated mode**: in a per-plugin venv under `<server.dataPath>/plugins/<plugin>/venv/`

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
| Scheduled jobs | The SDK `JobRegistry` helper is in-memory and process-local; use your own durable queue for production jobs that must survive restarts or multiple replicas |
| Filesystem writes | Use platform/plugin storage under `server.dataPath` on shared storage (NFS, etc.) — never write to local disk paths assuming a single replica |

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
- **Disk**: clean up old artifacts and cache files. The platform doesn't auto-prune plugin-owned files under `server.dataPath`.

For heavy compute (multi-minute analyses), avoid blocking the request. `mint add job` gives you an in-memory `/jobs` router for standalone mode, tests, and small development workflows; production plugins should connect that public job payload shape to a durable queue or worker backend:

```python
class MyPlugin(AnalysisPlugin):
    async def kick_off_analysis(self, experiment_id: int):
        job_id = await self._queue.submit(experiment_id)
        return {"job_id": job_id, "status": "queued"}
```

Use `mint add job` when you want the generated router and SDK `JobState` / `JobProgress` serialization contract. Replace the generated in-memory service before relying on it for long production jobs.

## Configuration and secrets

Two layers matter for plugin-authored settings:

1. **Defaults** baked into the plugin (`@mint_plugin(config=SettingsModel)`, plus any defaults your code supplies)
2. **Platform config** (`config.json` → `plugins.settings.<name>`, edited through Admin UI or `mint plugin config`)

Secrets:

- **Don't** hardcode in the wheel
- **Don't** commit to the manifest
- **Do** use the platform's settings store (`@mint_plugin(config=...)`, `@on_config_change`, `save_settings_transactionally()`, `patch_settings_transactionally()`) and have admins set values from the UI or CLI
- **Do** document any deployment-specific environment variables your plugin reads directly

For per-user secrets (an external-service API token tied to a user's identity), use a plugin-owned table with appropriate access checks — not the platform `User` record.

## Observability

Plugins inherit the platform's observability automatically:

- Structured logs via `get_plugin_logger`
- OTel traces via `tracer.start_as_current_span`
- Auto-issued GitHub bug reports for unhandled exceptions (when `errorReporting.enabled` is on)

For per-plugin metrics dashboards (Grafana), publish via OTel's metrics SDK — the platform's exporter forwards them. Define a few key metrics rather than instrumenting every line.

## Backups

The platform owns:

- Postgres database backups (lab-managed, e.g., `pg_dump` on a schedule)
- `server.dataPath` backups (if the volume isn't already on a backed-up filesystem)

Plugin authors don't need to implement backup logic. Document any plugin-specific recovery steps, such as which plugin bundle version is compatible with a restored database snapshot and whether any plugin-owned artifact directories must be restored together.

## Notes

- Plugin Docker images are not a thing — the platform itself is the container, plugins install into it. Don't try to ship a separate Dockerfile for your plugin.
- For air-gapped deployments, the registry should be self-hosted on the same network. The platform reads one `marketplace.registryUrl`; use an aggregate registry file when you need to combine private and public entries.
- Don't rely on outbound network from a plugin — many lab deployments restrict it. Document any required outbound calls in your README.

## Related

- [Operations → Versioning](/sdk/operations/versioning) — release cadence and the deploy story
- [Recipes → Backfill migrations](/sdk/recipes/backfill-migration) — multi-step schema change pattern
- [Workflow → Updates](/workflow/updates) — admin-side upgrade flow
