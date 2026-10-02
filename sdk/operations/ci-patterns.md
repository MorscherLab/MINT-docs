# CI patterns

`mint init` writes two GitHub Actions workflows: `.github/workflows/ci.yml`
(pull requests and pushes to `main`) and `.github/workflows/release.yml` (`v*`
tags). Start from those files. This page shows them and the additions that are
worth making: a checksum and prerelease flag on releases, a registry PR, and a
scheduled SDK-compatibility check.

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

      - name: Setup Bun
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        uses: oven-sh/setup-bun@v2

      - name: Frontend install and build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: |
          cd frontend
          bun install
          bun run type-check
          bun run test
          bun run build

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
        run: uv run ruff check .

      - name: Test
        run: uv run pytest -v
```

The frontend is built before `uv sync` because the standard plugin wheel
force-includes `frontend/dist`, and runtime tests then see real assets.
`mint doctor --strict` fails on warnings as well as errors;
`mint sdk generate --check` catches a generated client that no longer matches
the backend routes and schemas. Backend-only plugins skip the Bun steps.

The scaffold git-ignores `uv.lock` and `frontend/bun.lock`. After you
[commit lockfiles](/sdk/operations/versioning#commit-lockfiles), change the
install steps to `uv sync --locked` and `bun install --frozen-lockfile`.

Optional addition: a build step (`uv run mint build . --output-dir _ci_build`)
checks packaging on every PR. It runs `pytest` again before packaging.

## Publish on tag

The scaffold's release workflow repeats the CI steps in a `test` job, then
builds and publishes in a `build` job that depends on it:

```yaml
  build:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      # checkout (fetch-depth: 0), frontend detection, Bun, frontend
      # install/type-check/test/build, uv, Python 3.14, uv sync
      - name: Verify generated frontend contract
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: uv run mint sdk generate --check

      - name: Build .mint bundle
        run: uv run mint build . --output-dir dist/

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/*.mint
          generate_release_notes: true
```

The workflow sets `permissions: contents: write` so the repository's
`GITHUB_TOKEN` can attach the release asset. `fetch-depth: 0` lets `hatch-vcs`
read the tag.

Two optional additions to the `build` job: a SHA-256 checksum, and marking
`-beta`/`-rc` tags as GitHub prereleases:

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

Keep release assets limited to the `.mint` file and the optional checksum; the
wheel and frontend files are inside the bundle. The workflow does not run
`mint verify`. Run it on the exact bundle before tagging; see
[Deploying and verifying](/sdk/operations/deploying).

## Submit to a registry on release

Extend the release workflow to PR a registry update:

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
        run: uv python install 3.14

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

      - name: Install frontend dependencies
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun install

      - name: Build initial frontend assets
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run build

      - name: Update aligned SDKs on the supported minor line
        run: uv run mint sdk update --scope patch

      - name: Frontend type check
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run type-check

      - name: Frontend build
        if: steps.frontend.outputs.HAS_FRONTEND == 'true'
        run: cd frontend && bun run build

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

`mint sdk update` defaults to stable patch updates; `--channel beta` opts into prerelease testing. Use `--scope patch` for a fixed minor support line. The updater selects the newest candidate before checking bounds; `--scope minor` fails if that candidate is excluded. Review wider bounds on a separate upgrade branch. The command runs `uv sync` and, when a frontend SDK update is needed, the detected JS package manager's install command; set up Bun before the command in Bun-based projects. For new SDK majors, edit dependency ranges deliberately and run a separate migration branch.

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

If your project does not [commit lockfiles](/sdk/operations/versioning#commit-lockfiles), key the cache on `pyproject.toml` and `frontend/package.json` instead.

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
