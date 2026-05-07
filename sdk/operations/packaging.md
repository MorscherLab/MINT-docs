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
2. If `frontend/` exists (and `--no-frontend` isn't set), run `bun run build` (auto-detected: bun or npm) to produce `frontend/dist/`
3. Build the Python wheel via `uv build --wheel`
4. (If `--vendor-deps`) Resolve and download dependency wheels alongside the main wheel
5. Assemble: wheel + dependency wheels + manifest into a zip
6. Rename the zip to `.mint`

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

## What gets included

By default:

- Files matched by your `pyproject.toml`'s `[tool.hatch.build]` `include` list
- The frontend's `dist/` directory (if it exists)
- Your migrations package (must be inside `src/<plugin>/migrations/`)

Excluded:

- Tests (under `tests/`)
- Source maps (unless explicitly included)
- Files matched by `.gitignore`
- The `.git/` directory and any other dotfiles

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
mint info ./dist/my-plugin-1.0.0.mint
```

Prints the manifest, the wheel's metadata, and (if a frontend is included) a list of frontend assets.

```bash
mint doctor ./dist/my-plugin-1.0.0.mint
```

Validates the bundle: manifest schema, wheel installs cleanly into a temp venv, frontend has an `index.html`, migrations parse, entry point resolves.

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

- `mint build` is hermetic — it works in a clean checkout without prior installations, useful for CI.
- Bundles are versioned by their internal manifest, not by filename. Renaming a `.mint` doesn't change what's installed.
- Don't ship secrets in bundles. They're public artifacts. Use the platform's plugin settings (`apply_settings()`) for runtime credentials.

## Related

- [Publishing](/sdk/operations/publishing) — uploading the bundle to PyPI / marketplace
- [CI patterns](/sdk/operations/ci-patterns) — automating the build
- [Versioning](/sdk/operations/versioning) — choosing the next version number
