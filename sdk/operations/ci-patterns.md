# CI patterns

Three GitHub Actions workflows cover the common plugin lifecycle: PR validation, release publishing, and a periodic SDK-compatibility check.

## Build on PR

Validate every PR against a Python matrix and the latest SDK.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  python:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python: ['3.12', '3.13']
    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v3

      - name: Set up Python
        run: uv python install ${{ matrix.python }}

      - name: Install dependencies
        run: uv sync --all-extras

      - name: Run tests
        run: uv run pytest -v --tb=short

      - name: Validate plugin
        run: uv run mint doctor

  frontend:
    runs-on: ubuntu-latest
    if: hashFiles('frontend/package.json') != ''
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install
        run: cd frontend && bun install --frozen-lockfile

      - name: Type check
        run: cd frontend && bun run typecheck

      - name: Build
        run: cd frontend && bun run build

  build-bundle:
    runs-on: ubuntu-latest
    needs: [python, frontend]
    steps:
      - uses: actions/checkout@v4

      - uses: astral-sh/setup-uv@v3
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: |
          uv sync
          [ -f frontend/package.json ] && cd frontend && bun install --frozen-lockfile

      - name: Build bundle to a temp dir
        run: uv run mint build --output-dir _ci_build
```

Key choices:

- **`--frozen-lockfile`** for both `uv sync` and `bun install` — fails the build if the lockfile drifted
- **Matrix on Python 3.12 and 3.13** — match the platform's supported range
- **`mint doctor` runs in CI** — catches structural mistakes (missing entry point, malformed migrations) before merge
- **Build into `_ci_build/`** — exercises the full pipeline; the artifact is discarded after the run

## Publish on tag

Tag a release, the workflow builds the bundle and pushes to PyPI + GitHub Releases.

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

permissions:
  contents: write       # for creating releases
  id-token: write       # for PyPI trusted publishing

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0     # for hatch-vcs

      - uses: astral-sh/setup-uv@v3
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install
        run: |
          uv sync
          [ -f frontend/package.json ] && cd frontend && bun install --frozen-lockfile

      - name: Build wheel
        run: uv run python -m build --wheel

      - name: Build bundle
        run: uv run mint build

      - name: Publish wheel to PyPI
        uses: pypa/gh-action-pypi-publish@release/v1
        # No password — uses Trusted Publishing via OIDC
        with:
          packages-dir: dist/

      - name: Compute checksum
        run: |
          cd dist
          sha256sum *.mint > my-plugin.sha256

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.mint
            dist/my-plugin.sha256
          generate_release_notes: true
```

Setup:

- Configure [PyPI Trusted Publishing](https://docs.pypi.org/trusted-publishers/) for your repo so no `PYPI_TOKEN` is required
- For older PyPI accounts without trusted publishing: store `PYPI_TOKEN` as a repo secret and reference it in the publish step's `password` input via the standard GitHub Actions `secrets` expression syntax

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
          repository: MorscherLab/mld-registry
          token: ${{ secrets.REGISTRY_PR_TOKEN }}

      - name: Update index.json
        run: |
          # Add a new version entry; details depend on the registry's update tooling

      - name: Open PR
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "Add my-plugin ${{ github.ref_name }}"
          branch: update-my-plugin-${{ github.ref_name }}
          title: "Add my-plugin ${{ github.ref_name }}"
```

Skip the registry update for pre-release tags (`v1.0.0-beta.1`) — pre-releases stay on the GitHub Release URL only.

## SDK-compatibility check

Daily (or weekly) verify that your plugin still builds against the latest stable `mint-sdk`:

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
      - uses: astral-sh/setup-uv@v3

      - name: Force latest mint-sdk
        run: |
          uv add 'mint-sdk@latest'
          uv sync

      - name: Run tests
        run: uv run pytest -v

      - name: mint doctor
        run: uv run mint doctor

      - name: Open issue on failure
        if: failure()
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: 'SDK compatibility broken (week of ${{ github.run_id }})'
          content-filepath: ${{ github.event.repository.html_url }}/actions/runs/${{ github.run_id }}
```

This catches breaking SDK changes early, before users hit them.

## Caching

Both `uv` and `bun` caches significantly speed up CI:

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/uv
      ~/.bun/install/cache
    key: ${{ runner.os }}-uv-${{ hashFiles('**/uv.lock', '**/bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-uv-
```

Aim for sub-minute CI on PRs. Slow CI is the most common reason teams stop running it.

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

- Don't gate CI on the SDK's beta channel by default — beta builds may break and shouldn't fail your PRs. The compatibility-check workflow above is the right place to test against beta.
- For plugins that ship to a private registry, the registry's webhook can re-trigger your release workflow when the SDK ships a new patch — opt-in to that for tight coupling.
- Keep secrets out of forks: gate publish jobs on `if: github.repository_owner == '<your-org>'`.

## Related

- [Packaging](/sdk/operations/packaging) — what `mint build` produces
- [Publishing](/sdk/operations/publishing) — where to push the artifact
- [Versioning](/sdk/operations/versioning) — what `--pre` means and when to bump majors
