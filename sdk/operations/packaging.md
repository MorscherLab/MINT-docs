# Packaging

`mint build` produces the plugin's release artifact: a single `.mint` bundle containing its Python wheel, frontend assets, and a manifest. The bundle is what the marketplace serves and what the platform's admin/API install flow consumes.

## Build

```bash
# In your plugin project root
mint build
# → dist/my-plugin-1.0.0.mint
```

What happens:

1. Read `[project]` and `[tool.mint]` from `pyproject.toml`. If `requires_mint` is omitted, derive a floor from the `mint-sdk` dependency; without one, the manifest uses `>=` the build SDK version
2. Run `uv run pytest`; packaging stops if the test suite fails
3. If the frontend directory exists (`frontend/`, or `[tool.mint].frontend_dir`) and `--no-frontend` isn't set: run the detected JS package manager's `install` and `run build`, require Python and frontend SDKs to resolve to the same release, validate the build output and record its content revision
4. When a frontend was built, warn if `pyproject.toml` does not force-include `frontend/dist` in the wheel
5. Build the Python wheel via `uv build --wheel`; the version comes from `[project].version` or the wheel filename
6. (If `--vendor-deps`) Export runtime requirements with `uv export --no-dev` and download binary-only wheels
7. Add any `--include-wheel` files
8. Write `manifest.json`, the main wheel and dependency wheels directly into `dist/<name>-<version>.mint`

## Flags

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--no-frontend` | Skip the frontend build step. Use for backend-only plugins or fast iteration on the Python side. |
| `--include-wheel PATH` | Vendor an existing extra wheel; repeat for multiple files. This does not export the main wheel separately. |
| `--output-dir` | Override the default `dist/` directory. |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in). Without it, the platform resolves dependencies from its configured package indexes. A failed export or download prints a warning and continues with **no** vendored wheels; check the build output before calling a bundle offline-ready. |

The frontend build verifies that Python `mint-sdk` and frontend
`@morscherlab/mint-sdk` resolve to the same release. Use `mint sdk update
--version @MINT_VERSION@` and [commit both lockfiles](/sdk/operations/versioning#commit-lockfiles) before packaging. `--no-frontend`
skips building and marks the bundle without a frontend; do not use it as a
substitute for building the UI you intend to ship.

For an offline target, build/download wheels compatible with that target's
Linux architecture and Python ABI. Host-native vendoring from another OS does
not guarantee an installable Linux bundle.

## Bundle structure

A `.mint` is a renamed ZIP:

```
my-plugin-1.0.0.mint
├── manifest.json                            # name, version, has_frontend, wheels
├── my_plugin-1.0.0-py3-none-any.whl         # the main wheel (frontend assets are inside it via force-include)
└── <dep-wheels>...                          # only present if --vendor-deps
```

Inspect contents:

```bash
unzip -l dist/my-plugin-1.0.0.mint
```

The frontend's `dist/` is *not* a separate top-level directory in the bundle — instead, `pyproject.toml` declares `tool.hatch.build.targets.wheel.force-include` for `frontend/dist/` so the assets travel inside the wheel. `mint build` warns if that force-include is missing.

## Manifest

`manifest.json` is what the platform reads first when installing:

```json
{
  "format_version": 1,
  "plugin": {
    "name": "my-plugin",
    "version": "1.0.0",
    "description": "Drug-response panel design",
    "requires_mint": ">=@MINT_VERSION@,<1.3",
    "has_frontend": true,
    "frontend_revision": "sha256:…"
  },
  "wheels": {
    "main": "my_plugin-1.0.0-py3-none-any.whl",
    "dependencies": []
  }
}
```

The schema is owned by the SDK builder and consumed by the platform bundle installer. `mint build` generates it from `pyproject.toml`, the built wheel filename, optional vendored wheels, and the frontend build. `frontend_revision` is present only when a frontend was built.

The platform checks `plugin.requires_mint` before installing the bundle, then
checks the wheel's `mint-sdk` requirement against its own SDK. How to choose
that range is covered in [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately).

## What gets included

By default:

- Whatever your wheel build includes from `pyproject.toml`
- The frontend's `dist/` directory, if `tool.hatch.build.targets.wheel.force-include` maps it into the wheel
- Your migrations package, if it lives under the packaged Python module such as `src/<plugin>/migrations/`

The generated `mint init` project packages `src/<plugin>/` as the wheel. Tests, `.git/`, local virtualenvs, and frontend build caches are not part of that package unless you explicitly add them to the wheel config.

To include extra files:

```toml
# pyproject.toml
[tool.hatch.build]
include = [
    "src/my_plugin/**/*.py",
    "src/my_plugin/scripts/*.R",
    "src/my_plugin/templates/*.html",
]

[tool.hatch.build.targets.wheel]
packages = ["src/my_plugin"]
```

## Reproducible builds

Build from a clean tagged checkout with committed lockfiles; see
[Commit lockfiles](/sdk/operations/versioning#commit-lockfiles). For exact
reproducibility, also pin the build-backend versions your release CI has
verified.

## Inspect a built bundle

```bash
unzip -l dist/my-plugin-1.0.0.mint
unzip -p dist/my-plugin-1.0.0.mint manifest.json
```

`mint info` and `mint doctor` inspect a plugin project directory, not a `.mint` bundle. Run them before packaging:

```bash
uv run mint info .
uv run mint doctor .
```

To validate an install end-to-end, use `mint verify --bundle`; see [Deploying and verifying](/sdk/operations/deploying).

## Sizes

| Plugin | Typical size |
|--------|-------------|
| Backend-only, minimal | 50–500 KB |
| Backend with migrations and a few deps | 1–5 MB |
| Backend + frontend | 3–15 MB |
| Backend + frontend + heavy deps (numpy, scipy) | 30–100+ MB |

For very large plugins, consider:

- Splitting into multiple smaller plugins
- Skipping `--vendor-deps` (the default) so the platform resolves dependencies from its configured package indexes
- Lazy-loading frontend chunks via Vite's dynamic imports

## Notes

- `mint build` is self-contained enough for CI, but it still needs the local toolchain (`uv`, Python, and bun/npm for frontends) and network access unless dependencies are already cached.
- Bundles are versioned by their internal manifest, not by filename. Renaming a `.mint` doesn't change what's installed.
- Don't ship secrets in bundles. They're public artifacts. Use platform plugin settings declared with `@mint_plugin(config=...)` and applied through `@on_config_change()` for runtime credentials.

## Related

- [Publishing](/sdk/operations/publishing) — publishing the `.mint` asset and registering it in a marketplace
- [CI patterns](/sdk/operations/ci-patterns) — automating the build
- [Versioning](/sdk/operations/versioning) — choosing the next version number
