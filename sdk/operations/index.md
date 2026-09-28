# Operations

Operating a MINT plugin — the work that happens after `mint dev` and before users start clicking. This section covers packaging, publishing, CI patterns, versioning policy, deployment considerations, and SDK upgrades.

## Lifecycle of a release

```
develop ──▶ test ──▶ build ──▶ publish ──▶ install ──▶ upgrade
                       │           │           │           │
                       │           │           │           └─▶ deploying.md
                       │           │           └─▶ marketplace registry submission
                       │           └─▶ publishing.md (.mint release asset)
                       └─▶ packaging.md (.mint bundle)
```

## Pages

| Page | Covers |
|------|--------|
| [Packaging](/sdk/operations/packaging) | `mint build`, the `.mint` bundle structure, what gets included |
| [Publishing](/sdk/operations/publishing) | Publish `.mint` release assets and optionally register them in a marketplace |
| [CI patterns](/sdk/operations/ci-patterns) | Scaffold GitHub Actions workflows plus checksum, registry PR and SDK-compatibility additions |
| [Versioning](/sdk/operations/versioning) | SemVer, `hatch-vcs`, SDK ranges, `requires_mint`/`min_platform_version`, committed lockfiles |
| [Deploying](/sdk/operations/deploying) | `mint verify`, `mint deploy` and what it confirms, storage and recovery |
| [Migrate from 1.1 to 1.2](/sdk/operations/migrate-1.1-to-1.2) | PostgreSQL, repository, frontend, and plugin-discovery changes from 1.1 |
| [Upgrading the SDK](/sdk/operations/upgrading) | `mint sdk update`, lockfiles, regenerate and verify |

## Conventions

The platform's release flow uses `hatch-vcs` to derive versions from git tags. Plugins should follow the same pattern — a tag becomes a release, `hatch-vcs` reads it, and the wheel embeds it in `_version.py`. No manual version edits.

The marketplace registry uses each entry's `min_platform_version` to decide whether the running platform can install or update the plugin. Keep that platform floor honest. Keep the `mint-sdk` dependency range honest too, because it still controls plugin builds and Python dependency resolution.

## Next

→ [Packaging](/sdk/operations/packaging) — `mint build` and the `.mint` artifact
