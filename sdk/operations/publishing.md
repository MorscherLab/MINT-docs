# Publishing

Publish the `.mint` bundle that `mint build` makes. The bundle holds the manifest, the Python wheel, the frontend assets and the vendored dependencies. Do not publish the wheel as a separate artifact.

```text
version tag → build .mint → verify bundle → GitHub Release asset
                                                ↓
                                   optional marketplace registry entry
```

Generated and standard plugins use the same release format. An administrator can install a `.mint` file directly. A marketplace entry is not necessary.

## Build and verify the release

Build from a clean checkout of the version tag. The `mint init` scaffold gets the package version from git through `hatch-vcs`. See [Versioning](/sdk/operations/versioning).

For a standard plugin, build the frontend first, because backend tests serve its assets:

```bash
cd frontend
vp install --frozen-lockfile
vp run type-check
vp run fmt:check
vp run test
vp run build
cd ..
```

A generated plugin has no `frontend/` directory and skips this step. Then, in the plugin root:

```bash
uv sync
uv run mint doctor --strict
uv run mint sdk generate --check   # only with a generated frontend client
uv run mint lint
uv run mint build --output-dir dist
```

Fix the warnings and the test failures before you continue. Then verify the exact bundle that you publish with `mint verify --bundle` (Docker is necessary). See [Deploying and verifying](/sdk/operations/deploying). The bundle filename starts with `[project].name`.

## Publish the `.mint` asset

The scaffold's release workflow runs on a `v*` tag and attaches `dist/*.mint` to the GitHub Release. See [Publish on tag](/sdk/operations/ci-patterns#publish-on-tag).

To publish by hand:

1. In the GitHub repository of the plugin, open **Releases → Draft a new release**.
2. Select the version tag.
3. Attach the verified `.mint` file. Optionally, attach a SHA-256 checksum file.
4. Write the release notes.
5. Publish the release.

Put these items in the release notes:

- Supported MINT versions and runtime requirements
- New features, fixes and changes to analysis behavior
- Database migrations, upgrade steps and recovery requirements

Do not replace the asset of a published version. To fix a release, publish a new version.

## Install the published bundle

An administrator downloads the `.mint` asset and uploads it in the plugin administration page or with the CLI:

```bash
mint platform auth login --url https://mint.example.org
mint platform plugin upload ./my-plugin-0.2.0.mint
```

The platform can also download the asset of a GitHub release:

```bash
mint platform plugin github install your-org/my-plugin --tag v0.2.0 --asset-pattern '*.mint'
```

Installation needs the plugin permissions of the platform. A restart can be necessary before the plugin loads. The platform must be able to reach GitHub for the second command. If it cannot, upload the local `.mint` file.

## Marketplace registry

A marketplace registry is a catalog of plugins and their GitHub release sources. Host the catalog on GitHub Pages or another HTTPS host. The plugin artifact stays the `.mint` asset of the GitHub Release.

The platform reads one catalog from `marketplace.registryUrl`. To show entries from several catalogs, host one catalog that combines them. In each entry, `source.github_repo` and `source.asset_pattern` tell the platform where to find the bundle.

The `min_platform_version` of an entry must agree with the `requires_mint` of the bundle. See [Versioning](/sdk/operations/versioning#declare-compatibility-deliberately).

### Register a release

1. Publish the verified `.mint` asset on GitHub.
2. Add or update the plugin entry in the registry.
3. Make sure that the repository, asset pattern, version and compatibility floor match the release.
4. On a disposable platform, find and install the plugin from that registry.

For the Morscher Lab catalog, submit the entry to [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).

### Registry format

```json
{
  "schema_version": 1,
  "generated_at": "2026-09-09T12:00:00Z",
  "plugins": [
    {
      "name": "my-plugin",
      "display_name": "My Plugin",
      "description": "Short description",
      "plugin_type": "analysis",
      "author": { "name": "Your Lab", "github": "your-org" },
      "source": {
        "github_repo": "your-org/my-plugin",
        "asset_pattern": "*.mint"
      },
      "latest_version": "0.2.0",
      "min_platform_version": "@MINT_VERSION@",
      "tags": ["lcms"]
    }
  ]
}
```

Optional entry fields are `license`, `homepage`, `documentation_url`, `icon_url`, `auto_update`, `source.private` and `capabilities` (`requires_auth`, `requires_database`, `has_frontend`). `asset_pattern` defaults to `*.mint`.

## Prereleases

The git tag sets the package version, and the package version sets the manifest version. [Versioning](/sdk/operations/versioning#git-lockfiles-and-release-artifacts) shows how prerelease tags map to package versions.

Mark a beta or RC GitHub Release as a prerelease. GitHub update checks include prereleases only with `includePrereleases`. Show a prerelease as the latest version of a catalog only when that catalog is for testing.

## Checklist

- [ ] Tests, `mint doctor` and the generated-client check pass.
- [ ] The exact `.mint` bundle installs and loads on a supported MINT platform.
- [ ] Schema changes work on a new database and on a database of the previous release.
- [ ] The package version, the manifest and the release tag agree.
- [ ] Compatibility declarations and runtime requirements are correct.
- [ ] The release notes give the changes and the migration and recovery steps.
- [ ] The GitHub Release contains the `.mint` file and the optional checksum.

Source: [bundle builder](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/cli_build.py), [scaffolded release workflow](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-python/src/mint_sdk/init_workflow_templates.py).
