# Packaging

`mint build` produces a single `.mint` bundle containing your plugin's wheel, frontend assets, and a manifest. The bundle is what the marketplace serves and what `mint plugin install` consumes.

## Build

```bash
# In your plugin project root
mint build
# → dist/my-plugin-1.0.0.mint
```

What happens:

1. Read `pyproject.toml` to determine the wheel name and version
2. If `frontend/` exists, run `bun run build` (or whatever package manager you use) to produce `frontend/dist/`
3. Build the Python wheel via `python -m build` / `hatch build`
4. Resolve dependencies and download wheels for any pure-Python deps not already in the platform's lock
5. Assemble: wheel + frontend assets + dependency wheels + manifest into a zip
6. Rename the zip to `.mint`

## Flags

| Flag | Effect |
|------|--------|
| `--no-frontend` | Skip the frontend build step. Use for backend-only plugins or fast iteration on the Python side. |
| `--output <dir>` | Override the default `dist/` directory. |
| `--check` | Build into a temp directory just to verify it succeeds; don't keep the artifact. Useful in CI. |
| `--include-deps` | Include dependency wheels in the bundle (default; turn off with `--no-deps` for tiny bundles when the platform already has every dep). |

## Bundle structure

A `.mint` is a renamed ZIP:

```
my-plugin-1.0.0.mint/
├── manifest.json           # plugin name, version, SDK range, deps list
├── wheel/
│   └── my_plugin-1.0.0-py3-none-any.whl
├── frontend/               # optional, present if frontend/ existed
│   └── dist/
│       ├── index.html
│       ├── assets/...
│       └── ...
└── deps/                   # dependency wheels, present if --include-deps
    ├── some_dep-1.2.3-py3-none-any.whl
    └── ...
```

Inspect contents:

```bash
unzip -l dist/my-plugin-1.0.0.mint
```

## Manifest

`manifest.json` is what the platform reads first when installing:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Drug-response panel design",
  "author": "Lab Foo",
  "homepage": "https://github.com/example/my-plugin",
  "license": "MIT",
  "plugin_type": "experiment_design",
  "analysis_type": "oncology",
  "routes_prefix": "/my-plugin",
  "icon": "...",
  "capabilities": {
    "requires_auth": true,
    "requires_experiments": true,
    "requires_database": true,
    "requires_shared_database": true
  },
  "sdk": {
    "python": ">=1.0.0,<2.0.0",
    "frontend": "^1.0.0"
  },
  "dependencies": {
    "python": ["pydantic>=2.0", "rpy2>=3.5"],
    "frontend": ["@morscherlab/mint-sdk"]
  },
  "files": {
    "wheel": "wheel/my_plugin-1.0.0-py3-none-any.whl",
    "frontend": "frontend/dist/"
  }
}
```

The schema is owned by the platform — see `api/services/marketplace_service.py` for the canonical definition. `mint build` generates the manifest from `pyproject.toml`, `package.json` (frontend), and your `PluginMetadata`.

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
- Using `--no-deps` and relying on the platform / OS package manager for system deps (R, native binaries)
- Lazy-loading frontend chunks via Vite's dynamic imports

## Notes

- `mint build` is hermetic — it works in a clean checkout without prior installations, useful for CI.
- Bundles are versioned by their internal manifest, not by filename. Renaming a `.mint` doesn't change what's installed.
- Don't ship secrets in bundles. They're public artifacts. Use the platform's plugin settings (`apply_settings()`) for runtime credentials.

## Related

- [Publishing](/sdk/operations/publishing) — uploading the bundle to PyPI / marketplace
- [CI patterns](/sdk/operations/ci-patterns) — automating the build
- [Versioning](/sdk/operations/versioning) — choosing the next version number
