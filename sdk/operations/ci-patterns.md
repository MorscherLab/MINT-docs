# CI patterns

Three GitHub Actions workflows cover the common plugin lifecycle: PR validation, release publishing, and a periodic SDK-compatibility check. The current `mint init` scaffold creates lighter `ci.yml` and `release.yml` files; use these examples when you want stricter gates around `mint doctor`, generated frontend contracts, frontend builds, and `.mint` bundle creation.

## Build on PR

Validate every PR against the plugin project exactly as a contributor would run it locally.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install uv
        uses: astral-sh/setup-uv@v5

      - name: Set up Python
        run: uv python install 3.12

      - name: Install dependencies
        run: uv sync

      - name: Lint
        run: uv run ruff check .

      - name: Test
        run: uv run pytest -v

      - name: Check for frontend
        id: frontend
        run: |
          if [[ -f frontend/package.json ]]; then
            echo "HAS_FRONTEND=true" >> "$GITHUB_OUTPUT"
          else
            echo "HAS_FRONTEND=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Verify generated frontend contract
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: uv run mint sdk generate --check

      - name: Setup Bun
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: oven-sh/setup-bun@v2

      - name: Frontend install
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun install

      - name: Frontend type check
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run type-check

      - name: Frontend build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run build

      - name: Validate plugin structure
        run: uv run mint doctor

      - name: Build .mint bundle
        run: uv run mint build . --output-dir _ci_build
```

Key choices:

- **One job with conditional frontend steps** keeps backend-only plugins simple and avoids skipped-job dependency surprises.
- **`mint sdk generate --check`** catches frontend client drift after backend route or schema changes.
- **`mint doctor`** catches structural mistakes such as missing entry points, stale generated contracts, frontend SDK misuse, and missing navigation metadata.
- **`mint build` runs `uv run pytest` again** before packaging. The duplicate test run is intentional: it verifies the release command itself.

If your team commits `uv.lock` and `frontend/bun.lock`, change install steps to `uv sync --locked` and `bun install --frozen-lockfile`. The generated scaffold does not require committed lockfiles by default. For backend-only plugins, keep the frontend detection step but the Bun steps will skip.

## Publish on tag

Tag a release, then build the PyPI wheel and `.mint` bundle as separate artifacts.

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

permissions:
  contents: write       # GitHub Release
  id-token: write       # PyPI Trusted Publishing

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install uv
        uses: astral-sh/setup-uv@v5

      - name: Set up Python
        run: uv python install 3.12

      - name: Install dependencies
        run: uv sync

      - name: Check for frontend
        id: frontend
        run: |
          if [[ -f frontend/package.json ]]; then
            echo "HAS_FRONTEND=true" >> "$GITHUB_OUTPUT"
          else
            echo "HAS_FRONTEND=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Setup Bun
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: oven-sh/setup-bun@v2

      - name: Frontend install
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun install

      - name: Frontend type check
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run type-check

      - name: Frontend build for PyPI wheel assets
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run build

      - name: Build PyPI wheel
        run: uv build --wheel --out-dir dist/wheel

      - name: Build .mint bundle
        run: uv run mint build . --output-dir dist

      - name: Publish wheel to PyPI
        uses: pypa/gh-action-pypi-publish@release/v1
        with:
          packages-dir: dist/wheel/

      - name: Compute checksum
        run: |
          cd dist
          sha256sum *.mint > plugin-bundle.sha256

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.mint
            dist/plugin-bundle.sha256
          generate_release_notes: true
```

Setup:

- Configure [PyPI Trusted Publishing](https://docs.pypi.org/trusted-publishers/) for your repo so no `PYPI_TOKEN` is required.
- If you use a PyPI token instead, store it as `PYPI_TOKEN` and pass it to the PyPI publish action's `password` input.
- Keep the PyPI wheel in `dist/wheel/`; do not point PyPI upload tools at the directory containing `.mint` files.

## Submit to a registry on release

Extend the release workflow to PR a registry update:

```yaml
  submit-to-registry:
    runs-on: ubuntu-latest
    needs: build-and-publish
    if: ${{ !contains(github.ref_name, '-') }}    # stable releases only
    steps:
      - uses: actions/checkout@v4
        with:
          repository: MorscherLab/mint-registry
          token: ${{ secrets.REGISTRY_PR_TOKEN }}

      - name: Update registry.json
        run: |
          # Add/update the plugin entry with github_repo, asset_pattern,
          # latest_version, min_platform_version, and capabilities.

      - name: Open PR
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "Add my-plugin ${{ github.ref_name }}"
          branch: update-my-plugin-${{ github.ref_name }}
          title: "Add my-plugin ${{ github.ref_name }}"
```

Skip registry updates for pre-release tags such as `v1.0.0-beta.1` unless the registry is explicitly for testing.

## SDK-compatibility check

Daily or weekly, verify that your plugin still builds against the newest stable SDK version you are willing to adopt:

```yaml
# .github/workflows/sdk-compat.yml
name: SDK compatibility

on:
  schedule:
    - cron: '0 6 * * 1'    # Mondays 06:00 UTC
  workflow_dispatch:

jobs:
  test-against-latest-sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5

      - name: Set up Python
        run: uv python install 3.12

      - name: Check for frontend
        id: frontend
        run: |
          if [[ -f frontend/package.json ]]; then
            echo "HAS_FRONTEND=true" >> "$GITHUB_OUTPUT"
          else
            echo "HAS_FRONTEND=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Setup Bun
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: oven-sh/setup-bun@v2

      - name: Upgrade mint-sdk within the declared range
        run: uv run mint sdk update --scope minor

      - name: Run tests
        run: uv run pytest -v

      - name: mint doctor
        run: uv run mint doctor

      - name: Frontend type check
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run type-check

      - name: Frontend build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run build

      - name: Write failure report
        if: failure()
        run: |
          {
            echo "SDK compatibility failed."
            echo
            echo "Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          } > sdk-compat-failure.md

      - name: Open issue on failure
        if: failure()
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: 'SDK compatibility broken'
          content-filepath: sdk-compat-failure.md
```

`mint sdk update` ignores prereleases and defaults to patch updates. Use `--scope minor` for routine forward-compatibility checks. The command runs `uv sync` and, when a frontend SDK update is needed, the detected JS package manager's install command; set up Bun before the command in Bun-based projects. For new SDK majors, edit dependency ranges deliberately and run a separate migration branch.

## Caching

Both `uv` and `bun` caches speed up CI:

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/uv
      ~/.bun/install/cache
    key: ${{ runner.os }}-mint-${{ hashFiles('**/uv.lock', '**/bun.lock', '**/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-mint-
```

If your project does not commit lockfiles, key the cache on `pyproject.toml` and `frontend/package.json` instead.

## Pre-commit hooks

For local pre-commit checks (run locally; CI is the authority):

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.0
    hooks:
      - id: ruff
      - id: ruff-format

  - repo: local
    hooks:
      - id: mint-doctor
        name: mint doctor
        entry: uv run mint doctor
        language: system
        pass_filenames: false
        types_or: [python, toml]
```

`pre-commit install` once per clone. Teams can opt in or out per developer; CI is the source of truth.

## Notes

- Do not gate normal PR CI on SDK beta releases. Beta checks belong in an opt-in workflow or branch.
- For plugins that ship to a private registry, a registry webhook can trigger your release workflow when the SDK ships a patch.
- Keep secrets out of forks: gate publish jobs on `if: github.repository_owner == '<your-org>'`.

## Related

- [Packaging](/sdk/operations/packaging) — what `mint build` produces
- [Publishing](/sdk/operations/publishing) — where to push the artifact
- [Versioning](/sdk/operations/versioning) — release and compatibility policy
