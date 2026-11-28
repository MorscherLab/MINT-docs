# Packaging

`mint build` makes the release artifact of a plugin: one `.mint` bundle with a manifest, the Python wheel and the frontend assets. Administrators install this bundle, and the marketplace serves it.

## Build

Run the command in the plugin root, or use `mint -C DIR build`:

```bash
mint build
# → dist/my-plugin-1.0.0.mint
```

`mint build` needs `uv`, Python and, for a frontend, the global Vite+ CLI `vp` 1.5.1 or later. It needs network access unless the dependencies are in the cache. When `uv.lock` locks a newer `mint-sdk` minor than the running `mint`, use `uv run mint build`. See [`mint build`](/sdk/api/cli-reference#mint-build) for the flags.

The command does these steps:

1. Read `[project]` and `[tool.mint]` from `pyproject.toml`. Without `requires_mint`, derive a floor from the `mint-sdk` dependency. Without that dependency, the manifest uses `>=` the SDK version of the build.
2. Run `uv run pytest`. Stop when a test fails.
3. Build the frontend when `frontend/` (or `[tool.mint].frontend_dir`) exists and `--no-frontend` is not set. Run `vp install` (with `--frozen-lockfile` when a lockfile exists) and `vp run build`.
4. Make sure that the Python and frontend SDKs resolve to the same release. Validate the build output and record its content revision.
5. Warn when `pyproject.toml` does not force-include `frontend/dist` in the wheel.
6. Build the wheel with `uv build --wheel`. The version comes from `[project].version` or the wheel filename.
7. Stop when the wheel leaves out a file of the `skills/` directory. See [MCP skills](/sdk/recipes/mcp-skills).
8. With `--vendor-deps`, export the runtime requirements (`uv export --no-dev`) and download binary wheels.
9. Add each `--include-wheel` file.
10. Write the manifest and the wheels into `dist/<name>-<version>.mint`.

To align the two SDKs, run `mint sdk update --version @MINT_VERSION@`. Then [commit both lockfiles](/sdk/operations/versioning#commit-lockfiles). `--no-frontend` marks the bundle as a bundle without a frontend. Do not use it for a plugin that ships a UI.

## Bundle contents

A `.mint` file is a ZIP file:

```
my-plugin-1.0.0.mint
├── manifest.json                     # name, version, has_frontend, wheels
├── my_plugin-1.0.0-py3-none-any.whl  # the main wheel, with the frontend assets inside
└── <dependency wheels>               # only with --vendor-deps
```

The frontend is not a separate directory in the bundle. The scaffold's `pyproject.toml` maps `frontend/dist` into the wheel with `tool.hatch.build.targets.wheel.force-include`. In the wheel, the assets are at `<plugin_module>/frontend`.

The wheel contains what the wheel configuration selects. The `mint init` scaffold packages `src/<plugin>/`, which includes a migrations package below the module. Tests, `.git/`, virtual environments and frontend caches stay out. To add other files:

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

Bundles are public artifacts. Do not put secrets in them. Declare credentials as secret fields in `Metadata.settings` and read them through `@on("settings")`.

## Manifest

The platform reads `manifest.json` first when it installs a bundle:

```json
{
  "format_version": 1,
  "plugin": {
    "name": "my-plugin",
    "version": "1.0.0",
    "description": "Drug-response panel design",
    "requires_mint": ">=@MINT_VERSION@,<2.0",
    "has_frontend": true,
    "frontend_revision": "sha256:…",
    "git_commit": "3f2a…",
    "git_dirty": false
  },
  "wheels": {
    "main": "my_plugin-1.0.0-py3-none-any.whl",
    "dependencies": []
  }
}
```

`mint build` writes the manifest from `pyproject.toml`, the wheel filename, the vendored wheels and the frontend build. `frontend_revision` is present only when a frontend was built. `git_commit` and `git_dirty` are present only when the project is in a git repository.

The manifest sets the installed version. A new filename does not change it. Before installation, the platform checks `plugin.requires_mint`, then the `mint-sdk` requirement of the wheel. [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately) tells you how to choose these ranges.

## Inspect a bundle

```bash
unzip -l dist/my-plugin-1.0.0.mint
unzip -p dist/my-plugin-1.0.0.mint manifest.json
```

`mint info` and `mint doctor` inspect a project directory, not a bundle. Run them before you package:

```bash
uv run mint info
uv run mint doctor
```

To test the installation of the bundle, use `mint verify --bundle`. See [Deploying and verifying](/sdk/operations/deploying).

## Offline installs

`--vendor-deps` puts the dependency wheels into the bundle. Without it, the platform resolves the dependencies from its package indexes. When the export or the download fails, the build prints a warning and continues with no vendored wheels. Read the build output before you call a bundle ready for offline use.

Vendored wheels must match the Linux architecture and the Python ABI of the target. Vendoring on macOS or Windows does not give an installable Linux bundle.

## Bundle size

| Plugin | Typical size |
|--------|-------------|
| Backend only | 50–500 KB |
| Backend with migrations and a few dependencies | 1–5 MB |
| Backend and frontend | 3–15 MB |
| Backend, frontend and large dependencies (numpy, scipy) | 30–100+ MB |

To make a large bundle smaller, leave out `--vendor-deps`, load frontend chunks with dynamic imports, or split the plugin into smaller plugins.

For a reproducible build, build from a clean tagged checkout with [committed lockfiles](/sdk/operations/versioning#commit-lockfiles). Also pin the build-backend versions that your release CI uses.
