# Packaging

`mint build` produces a single `.mint` bundle containing your plugin's wheel, frontend assets, and a manifest. The bundle is what the marketplace serves and what the platform's admin/API install flow consumes.

## Build

```bash
# In your plugin project root
mint build
# → dist/my-plugin-1.0.0.mint
```

What happens:

1. Read `pyproject.toml` to determine the wheel name and version
2. Run `uv run pytest`; packaging stops if the test suite fails
3. If `frontend/` exists (and `--no-frontend` isn't set), run the detected JS package manager's `install` and `run build` commands to produce `frontend/dist/`
4. Warn if `pyproject.toml` does not force-include `frontend/dist/` in the wheel
5. Read `[tool.mint].requires_mint`; if omitted, derive a floor from the current `mint-sdk` version
6. Build the Python wheel via `uv build --wheel`
7. (If `--vendor-deps`) Resolve and download dependency wheels alongside the main wheel
8. Assemble: `manifest.json` + wheel + dependency wheels into a zip
9. Rename the zip to `.mint`

## Flags

| Flag | Effect |
|------|--------|
| `PATH` (positional) | Plugin project directory (default `.`) |
| `--no-frontend` | Skip the frontend build step. Use for backend-only plugins or fast iteration on the Python side. |
| `--output-dir` | Override the default `dist/` directory. |
| `--vendor-deps` | Include dependency wheels in the bundle (opt-in). Without it, the marketplace expects the platform to install dependencies from PyPI. |

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
    "requires_mint": ">=1.0.0",
    "has_frontend": true
  },
  "wheels": {
    "main": "my_plugin-1.0.0-py3-none-any.whl",
    "dependencies": []
  }
}
```

The schema is owned by the SDK builder and consumed by the platform bundle installer. `mint build` generates it from `pyproject.toml`, the built wheel filename, optional vendored wheels, and whether `frontend/` was built.

Set the MINT compatibility floor deliberately in `pyproject.toml`:

```toml
[tool.mint]
requires_mint = ">=1.1.0"
```

The platform checks this specifier when installing a `.mint` bundle. It also
pins plugin installs to the platform's own `mint-sdk` version, so a wheel whose
`mint-sdk` dependency excludes that version fails preflight instead of changing
the platform SDK under an installed server.

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

Pin every build dependency:

```toml
[build-system]
requires = ["hatchling==1.21.0", "hatch-vcs==0.4.0"]
build-backend = "hatchling.build"
```

Use `bun.lock` (committed) for the frontend. CI builds should fail if the lockfile is out of date:

```bash
bun install --frozen-lockfile
```

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

To validate an install end-to-end, upload the bundle to a disposable platform or use the platform CLI against a test instance:

```bash
mint plugin upload dist/my-plugin-1.0.0.mint
```

## Sizes

| Plugin | Typical size |
|--------|-------------|
| Backend-only, minimal | 50–500 KB |
| Backend with migrations and a few deps | 1–5 MB |
| Backend + frontend | 3–15 MB |
| Backend + frontend + heavy deps (numpy, scipy) | 30–100+ MB |

For very large plugins, consider:

- Splitting into multiple smaller plugins
- Skipping `--vendor-deps` (the default) so the platform pulls deps from PyPI instead of bundling them
- Lazy-loading frontend chunks via Vite's dynamic imports

## Notes

- `mint build` is self-contained enough for CI, but it still needs the local toolchain (`uv`, Python, and bun/npm for frontends) and network access unless dependencies are already cached.
- Bundles are versioned by their internal manifest, not by filename. Renaming a `.mint` doesn't change what's installed.
- Don't ship secrets in bundles. They're public artifacts. Use platform plugin settings declared with `@mint_plugin(config=...)` and applied through `@on_config_change()` for runtime credentials.

## Related

- [Publishing](/sdk/operations/publishing) — uploading the bundle to PyPI / marketplace
- [CI patterns](/sdk/operations/ci-patterns) — automating the build
- [Versioning](/sdk/operations/versioning) — choosing the next version number
