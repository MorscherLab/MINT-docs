# Plugin Development with the `mint` CLI

The `mint` CLI's plugin-development commands cover the full plugin lifecycle: scaffold → develop → validate → package → ship. They live alongside the platform commands in the same `mint` binary, so plugin authors don't need a separate tool.

::: info Where plugin commands run
Run plugin commands from inside a plugin directory (one with a `pyproject.toml` declaring an entry in the `mld.plugins` group). The CLI auto-detects the plugin from the working directory.
:::

## Scaffold a new plugin

```bash
mint init my-plugin
```

`init` walks you through:

| Prompt | What it sets |
|--------|--------------|
| Plugin name | `pyproject.toml` name + the directory name |
| Plugin type | `EXPERIMENT_DESIGN` / `ANALYSIS` / `TOOL` |
| Routes prefix | URL path the plugin mounts under, e.g., `/my-plugin` |
| Frontend? | If yes, scaffolds a Vue 3 + `@morscherlab/mint-sdk` frontend in `frontend/` |
| Migrations? | If yes, scaffolds a `migrations/` package and wires `get_migrations_package()` |

The output is a runnable plugin project — `mint dev` works immediately.

## Develop with hot reload

```bash
mint dev
```

`dev` runs the plugin's FastAPI app on a dedicated port (auto-picked from a free range) with auto-reload, plus the Vite frontend dev server if a `frontend/` directory exists.

| Flag | Effect |
|------|--------|
| `--port <N>` | Pin the backend port |
| `--platform` | Also start a local platform that proxies to this plugin (creates `mld/config.dev.toml` for you) |
| `--no-frontend` | Skip the Vite dev server |

The most common workflow is:

```bash
mint dev --platform   # plugin + platform together, hot reload across both
```

When `--platform` is set, the plugin's `routes_prefix` is automatically wired into the platform's dev proxy, so visiting `http://127.0.0.1:8001/my-plugin` in the browser hits your plugin while you edit it.

## Validate the project

```bash
mint doctor
```

Checks the plugin against a set of structural invariants — the entry point is present and resolves, `PluginMetadata` is well-formed, declared migrations have unique revisions, the frontend builds, etc. Run it before opening a PR.

## Inspect metadata

```bash
mint info
```

Prints the plugin's `PluginMetadata` (name, version, type, routes prefix, capabilities, declared migrations) without starting the plugin. Useful for debugging marketplace listings.

## Tail logs

```bash
mint logs
```

If the plugin is running (started by `mint dev` or by an in-process platform), tails its structured log output to stdout. Add `--follow` to keep streaming.

## Local SDK linking

When developing the SDK and a plugin together, you want changes to `mint-sdk` to flow into the plugin without re-publishing.

```bash
mint link        # editable Python install + bun-linked frontend SDK
mint unlink      # restore published versions
```

Behind the scenes:

- Python: `uv pip install -e <path-to>/packages/sdk-python`
- Frontend: `bun link @morscherlab/mint-sdk`

`mint link` looks for a sibling `mld/` directory by default; pass `--sdk-path <dir>` to point elsewhere.

## Refresh SDK pins

```bash
mint update
```

Updates the plugin's `pyproject.toml` (`mint-sdk` version) and `package.json` (`@morscherlab/mint-sdk` version) to the latest published versions, runs `uv sync` and `bun install`, and prints the diff.

## Package for distribution

```bash
mint build
```

Produces a `.mint` bundle in `dist/` — a zipped wheel + frontend assets + metadata, ready to upload to a marketplace registry or install directly via `mint plugin install ./dist/my-plugin-1.0.0.mint`.

| Flag | Effect |
|------|--------|
| `--no-frontend` | Skip the frontend build (useful for backend-only plugins) |
| `--output <path>` | Override the default `dist/` directory |
| `--check` | Build into a temp directory just to verify it succeeds; don't keep the artifact |

## Open the SDK docs

```bash
mint docs
```

Opens the SDK documentation in your default browser — pointed at the locally-installed SDK version, falling back to [the live SDK site](https://github.com/MorscherLab/mld/tree/main/sdk) if no local docs are available.

## Reference

The full plugin development guide — `AnalysisPlugin` API, `PlatformContext`, migration patterns, frontend component reference — lives at [`MorscherLab/mld/sdk`](https://github.com/MorscherLab/mld/tree/main/sdk). This page documents only the CLI commands.

## Next

→ [SDK overview](/sdk/overview) — what's in `mint-sdk`
→ [Platform commands](/cli/platform) — `mint experiment`, `mint project`
