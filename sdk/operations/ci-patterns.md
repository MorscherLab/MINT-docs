# CI patterns

`mint init` writes two GitHub Actions workflows: `.github/workflows/ci.yml` runs on pull requests and pushes to `main`, and `.github/workflows/release.yml` runs on `v*` tags. Start from these files. This page shows them and some optional additions.

## Build on PR

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for frontend
        id: frontend
        run: |
          if [[ -f frontend/package.json ]]; then
            echo "HAS_FRONTEND=true" >> $GITHUB_OUTPUT
          else
            echo "HAS_FRONTEND=false" >> $GITHUB_OUTPUT
          fi

      - name: Setup Vite+
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: voidzero-dev/setup-vp@v1.22.0
        with:
          working-directory: frontend
          run-install: false
          cache: true

      - name: Frontend install and build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        working-directory: frontend
        run: |
          vp install --frozen-lockfile
          vp run type-check
          vp run fmt:check
          vp run test
          vp run build

      - name: Install uv
        uses: astral-sh/setup-uv@v5

      - name: Set up Python
        run: uv python install 3.14

      - name: Install dependencies
        run: uv sync

      - name: Validate plugin runtime
        run: uv run mint doctor --strict

      - name: Verify generated frontend contract
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: uv run mint sdk generate --check

      - name: Lint
        run: uv run mint lint

      - name: Test
        run: uv run pytest -v

      - name: Build .mint bundle
        run: uv run mint build --output-dir dist/
```

The steps do these checks:

- The frontend builds before `uv sync`. The standard plugin wheel force-includes `frontend/dist`, so the runtime tests use the real assets.
- `mint doctor --strict` fails on warnings and on errors.
- `mint sdk generate --check` fails when the generated client does not match the backend routes and schemas.
- `mint lint` runs the design rules, ruff and oxlint. It fails only on findings that `mint-lint-baseline.json` does not accept.
- The build step checks the packaging on each PR. It runs `pytest` again.

A backend-only plugin skips the Vite+ steps.

`voidzero-dev/setup-vp` installs the global `vp`, Node.js and pnpm. Each `mint` command that touches the frontend needs `vp`, and the "Global vp" check of `mint doctor` fails without it. Put this step before the first `vp`, `mint build` or `mint doctor` command.

`vp install --frozen-lockfile` needs a committed `frontend/pnpm-lock.yaml`. See [Commit lockfiles](/sdk/operations/versioning#commit-lockfiles).

The workflow of a plugin made before 1.6 has a `Setup Bun` step and `bun` commands. [`mint migrate`](/sdk/operations/migrate-1.5-to-1.6#run-mint-migrate) rewrites the steps that `mint init` generated and replaces `uv run ruff check .` with `uv run mint lint`. It lists the other setup steps (pnpm, Node.js) and the hand-written workflows for you to edit.

## Publish on tag

The scaffold's release workflow repeats the CI steps in a `test` job, then
builds and publishes in a `build` job that depends on it:

```yaml
  build:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      # checkout (fetch-depth: 0), frontend detection, Vite+, frontend
      # install/type-check/fmt:check/test/build, uv, Python 3.14, uv sync
      - name: Verify generated frontend contract
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: uv run mint sdk generate --check

      - name: Build .mint bundle
        run: uv run mint build --output-dir dist/

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/*.mint
          generate_release_notes: true
```

The workflow sets `permissions: contents: write` so the repository's
`GITHUB_TOKEN` can attach the release asset. `fetch-depth: 0` lets `hatch-vcs`
read the tag.

To add a SHA-256 checksum and to mark `-beta` and `-rc` tags as GitHub prereleases, change the end of the `build` job:

```yaml
      - name: Compute checksum
        run: cd dist && sha256sum *.mint > plugin-bundle.sha256

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.mint
            dist/plugin-bundle.sha256
          generate_release_notes: true
          prerelease: ${{ contains(github.ref_name, '-') }}
          fail_on_unmatched_files: true
```

Attach only the `.mint` file and the optional checksum. The wheel and the frontend files are in the bundle. The workflow does not run `mint verify`. Run it on the bundle before you push the tag. See [Deploying and verifying](/sdk/operations/deploying).

## Submit to a registry on release

To open a registry pull request for each stable release, add this job to the release workflow:

```yaml
  submit-to-registry:
    runs-on: ubuntu-latest
    needs: build
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

The `if:` line skips prerelease tags such as `v1.0.0-beta.1`. Remove it only for a registry that is for testing.

## SDK-compatibility check

This scheduled workflow builds and tests the plugin against the newest stable SDK patch:

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
        run: uv python install 3.14

      - name: Check for frontend
        id: frontend
        run: |
          if [[ -f frontend/package.json ]]; then
            echo "HAS_FRONTEND=true" >> "$GITHUB_OUTPUT"
          else
            echo "HAS_FRONTEND=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Setup Vite+
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: voidzero-dev/setup-vp@v1.22.0
        with:
          working-directory: frontend
          run-install: false
          cache: true

      - name: Install frontend dependencies
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        working-directory: frontend
        run: vp install --frozen-lockfile

      - name: Build initial frontend assets
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        working-directory: frontend
        run: vp run build

      - name: Update aligned SDKs on the supported minor line
        run: uv run mint sdk update --scope patch

      - name: Frontend type check
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        working-directory: frontend
        run: vp run type-check

      - name: Frontend build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        working-directory: frontend
        run: vp run build

      - name: Run tests
        run: uv run pytest -v

      - name: mint doctor
        run: uv run mint doctor --strict

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

`mint sdk update` runs `uv sync` and, for a frontend SDK update, `vp install`. Thus set up Vite+ before the command. `--scope patch` stays on one minor line. A wider scope can fail on declared bounds; see [Select one SDK release](/sdk/operations/upgrading#select-one-sdk-release). Do minor and major moves on a separate upgrade branch.

Do not test SDK beta releases in normal PR CI. To test them, use `--channel beta` in a separate workflow or branch.

## Caching

`voidzero-dev/setup-vp` with `cache: true` caches the frontend packages. Add a `uv` cache:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/uv
    key: ${{ runner.os }}-uv-${{ hashFiles('**/uv.lock') }}
    restore-keys: |
      ${{ runner.os }}-uv-
```

If your project does not [commit lockfiles](/sdk/operations/versioning#commit-lockfiles), key the cache on `pyproject.toml` instead.

## Pre-commit hooks

To run the checks before each local commit, add a pre-commit configuration. CI stays the final check.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: mint-lint
        name: mint lint
        entry: uv run mint lint
        language: system
        pass_filenames: false

      - id: mint-doctor
        name: mint doctor
        entry: uv run mint doctor
        language: system
        pass_filenames: false
        types_or: [python, toml]
```

Run `pre-commit install` once in each clone.

## Secrets in forks

To keep secrets out of forks, add `if: github.repository_owner == '<your-org>'` to each publish job.
