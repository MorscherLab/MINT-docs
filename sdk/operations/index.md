# Operations

Operating a MINT plugin — the work that happens after `mint dev` and before users start clicking. This section covers packaging, publishing, CI patterns, versioning policy, deployment considerations, and SDK upgrades.

## Lifecycle of a release

```
develop ──▶ test ──▶ build ──▶ publish ──▶ install ──▶ upgrade
                       │           │           │           │
                       │           │           │           └─▶ deploying.md
                       │           │           └─▶ marketplace registry submission
                       │           └─▶ publishing.md (PyPI / npm / registry)
                       └─▶ packaging.md (.mint bundle)
```

## Pages

| Page | Covers |
|------|--------|
| [Packaging](/sdk/operations/packaging) | `mint build`, the `.mint` bundle structure, what gets included |
| [Publishing](/sdk/operations/publishing) | PyPI publish for the wheel, marketplace registry submission |
| [CI patterns](/sdk/operations/ci-patterns) | GitHub Actions templates: build-on-PR, publish-on-tag, matrix tests |
| [Versioning](/sdk/operations/versioning) | SemVer, `hatch-vcs`, SDK compat ranges, compatibility checks |
| [Deploying](/sdk/operations/deploying) | Production install considerations, isolation tradeoffs, storage volumes |
| [Upgrading the SDK](/sdk/operations/upgrading-sdk) | `mint sdk update`, handling SDK-major breaks |

## Conventions

The platform's release flow uses `hatch-vcs` to derive versions from git tags. Plugins should follow the same pattern — a tag becomes a release, `hatch-vcs` reads it, and the wheel embeds it in `_version.py`. No manual version edits.

The marketplace registry compares the plugin's declared SDK range with the deployed platform's bundled SDK version. Keep your range honest — too lax and you'll break on user installs; too strict and the plugin won't appear in the marketplace.

## Next

→ [Packaging](/sdk/operations/packaging) — `mint build` and the `.mint` artifact
