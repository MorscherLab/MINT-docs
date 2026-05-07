# Publishing

Three publishing channels coexist:

| Channel | What it serves | Who installs it |
|---------|----------------|-----------------|
| **PyPI** | The plugin's Python wheel | Direct `pip install` users; CI pipelines that vendor plugins |
| **`@morscherlab` npm** | Frontend SDK and helper packages (rare for plugin authors) | Other plugin authors |
| **Marketplace registry** | The `.mint` bundle + manifest | The platform's install flow (browser-based) |

Most plugins publish to **PyPI + Marketplace**; the npm channel is only relevant if your plugin exposes a JS library others should consume.

## PyPI

Set up once: register on PyPI, generate a project-scoped token, store it as the `PYPI_TOKEN` GitHub secret on your plugin's repository.

Publish per release (manually or via CI):

```bash
# After mint build produces dist/my-plugin-1.0.0.mint and a wheel
# Extract the wheel for PyPI:
unzip -j dist/my-plugin-1.0.0.mint "*.whl" -d dist/wheel/
twine upload dist/wheel/*.whl
```

The PyPI publish is just the wheel — without the `.mint` wrapper. If your `pyproject.toml` force-includes `frontend/dist/`, the wheel still contains the frontend assets; backend-only plugins can skip that step.

::: tip Backend-only on PyPI is fine
A common pattern: ship a backend-only PyPI release for users who don't need the UI (CI consumers, automated jobs), AND a full `.mint` to the marketplace for browser-based installs. Both can build from the same source on the same tag.
:::

## Marketplace registry

The marketplace registry is a JSON feed plus the bundle URLs it points at. Hosting options:

| Approach | When |
|----------|------|
| **Morscher Lab registry** (`MorscherLab/mint-registry`) | First-party plugins; lab plugins shared publicly |
| **Self-hosted on GitHub Pages** | Internal lab registries; private or org-only plugins |
| **Self-hosted on S3 / nginx / any HTTPS host** | Any of the above |

The platform polls the registry's `registry.json`. Each entry points to a GitHub release source (`github_repo` + `asset_pattern`), and the platform downloads the matching `.mint` asset from that release. There's no central authority — point `marketplace.registryUrl` at whichever registry you trust.

### Submission to the Morscher Lab registry

1. Open a PR against [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry) adding your plugin to `registry.json`
2. Include the plugin's GitHub release source and asset pattern (for example `*.mint`)
3. Maintainers review; on merge, the registry updates automatically

### Self-hosted registry

A registry is just a static directory:

```
my-registry/
└── registry.json              # list of plugins and release sources
```

```json
// registry.json
{
  "schema_version": 1,
  "generated_at": "2026-05-07T12:00:00Z",
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
      "latest_version": "1.1.0",
      "min_platform_version": "1.0.0",
      "tags": ["lcms"]
    }
  ]
}
```

Reference implementation: [`MorscherLab/mint-registry`](https://github.com/MorscherLab/mint-registry). Use it as a starting point for self-hosted registries.

## GitHub Releases as the bundle host

A common shortcut: build the `.mint` in CI, attach to a GitHub Release, point the registry at the release URL.

```yaml
# Snippet from CI (full template in /sdk/operations/ci-patterns)
- name: Upload bundle to release
  uses: softprops/action-gh-release@v2
  with:
    files: dist/*.mint
```

The release URL `https://github.com/<owner>/<repo>/releases/download/<tag>/my-plugin-<ver>.mint` is stable and CDN-backed — fine for medium-traffic registries.

## npm publish (frontend-only packages)

Most plugin authors don't publish to npm — your frontend is bundled inside the `.mint` and consumed by the platform, not by other npm packages. The exception is when you're shipping a reusable component library or shared composables.

```bash
# After bun run build in the package
cd packages/my-shared-frontend
npm publish --access public
```

Set `NPM_TOKEN` as a GitHub secret with `@morscherlab` scope (or your own scope) for CI publishes.

## Versioning the bundle vs the wheel

The `.mint` bundle's version comes from the manifest. The wheel inside has its own version (read from `pyproject.toml` / `hatch-vcs` from the git tag). They should match.

`mint build` enforces this — it reads the wheel version and writes the same version into `manifest.json`. If you tag `v1.2.0`, both your wheel and your bundle are `1.2.0`.

## Pre-release labels

Beta releases follow Python's PEP 440 + npm's SemVer:

| Tag (git) | Wheel version | Registry behavior |
|-----------|---------------|-------------------|
| `v1.0.0-beta.1` | `1.0.0b1` | Only advertise deliberately, usually from a test registry |
| `v1.0.0-rc.1` | `1.0.0rc1` | Only advertise deliberately, usually from a test registry |
| `v1.0.0` | `1.0.0` | Normal stable release |

For platform and GitHub-source plugin checks, prerelease inclusion is controlled by `includePrereleases`. Marketplace registries should only set `latest_version` to a prerelease when that registry is meant for testing.

## Checklist before publishing

- [ ] CI's `mint doctor` passes on the bundle
- [ ] Tests pass on the supported Python versions (matrix in CI)
- [ ] Migrations apply cleanly to a fresh DB AND to a DB on the previous version
- [ ] Frontend builds without warnings (`bun run build`)
- [ ] Changelog updated (`CHANGELOG.md`)
- [ ] Version tag matches the wheel and the manifest
- [ ] `pyproject.toml`'s `mint-sdk` range covers the platform versions you support
- [ ] Bundle size is reasonable (see [Packaging](/sdk/operations/packaging#sizes))

## Notes

- Publishing is one-way; PyPI yanks an old version, but most users have it cached. Don't rely on yanks for security fixes — release a new version.
- Some labs run a private registry that mirrors the public one with extra plugins. The current platform reads one `marketplace.registryUrl`; host an aggregate registry if you need to combine sources.

## Related

- [Packaging](/sdk/operations/packaging) — building the bundle
- [CI patterns](/sdk/operations/ci-patterns) — automating publish on tag
- [Versioning](/sdk/operations/versioning) — choosing the next version number
