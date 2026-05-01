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
unzip -j dist/my-plugin-1.0.0.mint "wheel/*.whl" -d dist/wheel/
twine upload dist/wheel/*.whl
```

The PyPI publish is just a wheel — without the `.mint` wrapper. Users who install directly from PyPI miss the frontend assets unless your plugin is backend-only or you bundle frontend assets inside the wheel via `MANIFEST.in`.

::: tip Backend-only on PyPI is fine
A common pattern: ship a backend-only PyPI release for users who don't need the UI (CI consumers, automated jobs), AND a full `.mint` to the marketplace for browser-based installs. Both can build from the same source on the same tag.
:::

## Marketplace registry

The marketplace registry is a JSON feed plus the bundle URLs it points at. Hosting options:

| Approach | When |
|----------|------|
| **Morscher Lab registry** (`marketplace.morscherlab.org`) | First-party plugins; lab plugins shared publicly |
| **Self-hosted on GitHub Pages** | Internal lab registries; private or org-only plugins |
| **Self-hosted on S3 / nginx / any HTTPS host** | Any of the above |

The platform polls the registry's `index.json` and fetches per-plugin metadata + bundle URLs. There's no central authority — point `marketplace.registryUrl` at whichever registry you trust.

### Submission to the Morscher Lab registry

1. Open a PR against [`MorscherLab/mld-registry`](https://github.com/MorscherLab/mld-registry) adding your plugin to `index.json`
2. Include a stable bundle URL (GitHub Releases is fine) and a checksum
3. Maintainers review; on merge, the registry updates automatically

### Self-hosted registry

A registry is just a static directory:

```
my-registry/
├── index.json              # list of plugins
├── my-plugin/
│   ├── 1.0.0/
│   │   ├── manifest.json
│   │   └── my-plugin-1.0.0.mint
│   └── 1.1.0/
│       ├── manifest.json
│       └── my-plugin-1.1.0.mint
└── another-plugin/
    └── ...
```

```json
// index.json
{
  "version": "1",
  "plugins": [
    {
      "name": "my-plugin",
      "latest": "1.1.0",
      "versions": [
        {
          "version": "1.0.0",
          "manifest_url": "/my-plugin/1.0.0/manifest.json",
          "bundle_url": "/my-plugin/1.0.0/my-plugin-1.0.0.mint",
          "sha256": "..."
        },
        {
          "version": "1.1.0",
          "manifest_url": "/my-plugin/1.1.0/manifest.json",
          "bundle_url": "/my-plugin/1.1.0/my-plugin-1.1.0.mint",
          "sha256": "..."
        }
      ]
    }
  ]
}
```

Reference implementation: [`MorscherLab/mld-registry`](https://github.com/MorscherLab/mld-registry). Use it as a starting point for self-hosted registries.

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

| Tag (git) | Wheel version | Marketplace channel |
|-----------|---------------|---------------------|
| `v1.0.0-beta.1` | `1.0.0b1` | `beta` |
| `v1.0.0-rc.1` | `1.0.0rc1` | `beta` (or `rc` if your registry distinguishes) |
| `v1.0.0` | `1.0.0` | `stable` |

The platform's update channel (`updates.channel: beta` or `stable`) decides which versions appear in the upgrade UI. Plugins with no recent stable release stay invisible to `stable`-channel installations.

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
- The marketplace registry uses checksums (`sha256`) to verify bundles. Publish the checksum alongside the bundle.
- Some labs run a private registry that mirrors the public one with extra plugins. The platform supports multiple registries via `marketplace.registries[]` (a list of URLs).

## Related

- [Packaging](/sdk/operations/packaging) — building the bundle
- [CI patterns](/sdk/operations/ci-patterns) — automating publish on tag
- [Versioning](/sdk/operations/versioning) — choosing the next version number
