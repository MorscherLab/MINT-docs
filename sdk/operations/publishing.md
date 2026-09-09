# Publishing

MINT plugins are published as **`.mint` bundles**. Publish the file produced by
`mint build`: it contains the manifest, the plugin's Python wheel, bundled
frontend assets and any vendored dependencies. The wheel is an internal part
of the bundle, not a separate plugin release artifact.

The standard release flow is:

```text
version tag → build .mint → verify bundle → GitHub Release asset
                                                ↓
                                   optional Marketplace registry entry
```

Generated and standard plugins use the same release format. A plugin does not
need to be listed in a marketplace before an administrator can install its
`.mint` file directly.

## Build and verify the release

Use the plugin's own version tag and build from a clean checkout. The
`mint init` scaffold uses `hatch-vcs` to derive the package version from Git;
see [versioning](/sdk/operations/versioning).

For a standard plugin, build the frontend before running backend runtime tests
that serve its assets:

```bash
cd frontend
bun install
bun run type-check
bun run test
bun run build
cd ..
```

Generated plugins with no `frontend/` directory skip that step. Then, from the
plugin root:

```bash
uv sync
uv run mint doctor --strict
uv run mint build . --output-dir dist
```

If the project has a generated frontend client, also run
`uv run mint sdk generate --check` before building. Review warnings and test
failures before proceeding.

Verify the exact bundle that will be published:

```bash
uv run mint verify . --bundle dist/my-plugin-0.2.0.mint
```

Use the actual filename emitted by `mint build`; its prefix comes from
`[project].name`. `verify` needs Docker. For plugins with tables, also test an
upgrade from the previous release on a disposable platform with representative
data. See [deploying and verifying](/sdk/operations/deploying).

## Publish the `.mint` asset

The scaffold's release workflow runs when a `v*` tag is pushed and attaches
`dist/*.mint` to the corresponding GitHub Release. Use the
[CI example](/sdk/operations/ci-patterns#publish-on-tag) to configure that flow.

For a manual release, open **Releases → Draft a new release** in the plugin's
GitHub repository, select the version tag, attach the verified `.mint` file,
write the release notes and publish it. A SHA-256 checksum may accompany the
bundle to let administrators verify their download.

Include these details in the release notes:

- Supported MINT versions and runtime requirements.
- New features, fixes and changed analysis behavior.
- Database migrations, upgrade steps and recovery requirements.

Keep the artifact for a published version immutable. If a release needs a fix,
build and publish a new version rather than replacing an existing asset under
the same tag.

## Install the published bundle

Administrators can download the `.mint` asset and upload it through the
platform's plugin administration UI or CLI:

```bash
mint auth login --url https://mint.example.org
mint plugin upload ./my-plugin-0.2.0.mint
```

For a GitHub-hosted release, the platform can fetch the matching asset:

```bash
mint plugin github install your-org/my-plugin --tag v0.2.0 --asset-pattern '*.mint'
```

Installation requires the matching platform permissions and may require a
restart before the plugin loads. GitHub-hosted downloads must be reachable by
the platform; use a local `.mint` upload when that is not possible.

## Marketplace registry

A marketplace registry is a catalog of plugins and their GitHub release sources.
The **catalog** can be hosted on GitHub Pages or another HTTPS host. The
**plugin artifact** remains the `.mint` asset attached to its GitHub Release.

The platform reads `marketplace.registryUrl`. A plugin entry supplies
`source.github_repo` and `source.asset_pattern`, allowing the platform to locate
the release bundle. Listing a plugin in the catalog adds discovery and update
information; it does not create another package format.

Two compatibility declarations matter:

| Declaration | Lives in | Checked when |
|---|---|---|
| `min_platform_version` | Registry entry | Catalog compatibility and marketplace installation |
| `[tool.mint].requires_mint` | Plugin `pyproject.toml`, copied into the bundle manifest | Bundle upload or marketplace bundle installation |

Keep them consistent. `min_platform_version` is a version floor;
`requires_mint` is a PEP 440 specifier. For example:

```toml
[tool.mint]
requires_mint = ">=1.2.1,<1.3"
```

### Register a release

1. Publish the verified `.mint` asset on GitHub.
2. Add or update the plugin entry in your marketplace's registry.
3. Check that its repository, asset pattern, version and compatibility floor
   match the published release.
4. Test discovery and installation from that registry on a disposable platform.

For the Morscher Lab catalog, submit the entry to
[`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry).

### Registry example

A `registry.json` file can contain:

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
      "min_platform_version": "1.2.1",
      "tags": ["lcms"]
    }
  ]
}
```

The platform reads one registry URL. Host an aggregate catalog if a deployment
needs entries from several catalogs.

## Versions and prereleases

`mint build` uses the plugin's package version for the bundle manifest. With
the scaffold's Git-based versioning, the tag determines that version. A file
rename does not change the manifest or installed version.

| Git tag | Version recorded by the Python package | Release usage |
|---|---|---|
| `v0.2.0-beta.1` | `0.2.0b1` | Prerelease for testing |
| `v0.2.0-rc.1` | `0.2.0rc1` | Release candidate |
| `v0.2.0` | `0.2.0` | Stable release |

Mark beta/RC GitHub Releases as prereleases. GitHub-source update checks use
`includePrereleases`; only advertise a prerelease as a catalog's latest version
when that catalog is intended for testing.

## Before publishing

- [ ] Tests, `mint doctor` and generated-client checks pass.
- [ ] The exact `.mint` bundle installs and loads on a supported MINT platform.
- [ ] Schema changes work on both fresh and previously installed databases.
- [ ] The package version, manifest and release tag correspond.
- [ ] Compatibility declarations and runtime requirements are accurate.
- [ ] Release notes explain changes and any migration/recovery steps.
- [ ] The GitHub Release contains the `.mint` file and any optional checksum.

Source: [bundle builder](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/cli_build_cmd.py),
[scaffolded release workflow](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-python/src/mint_sdk/init_workflow_templates.py).

## Related

- [Packaging](/sdk/operations/packaging) — build and inspect the bundle
- [CI patterns](/sdk/operations/ci-patterns) — publish `.mint` assets on tags
- [Versioning](/sdk/operations/versioning) — versions, compatibility and schema changes
