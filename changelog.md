---
title: Changelog
---

# Changelog

MINT follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The platform and both SDK packages share one `v*` tag stream. Legacy `sdk-v*` tags remain in repository history but are no longer extended.

## Latest releases

→ [GitHub Releases](https://github.com/MorscherLab/MINT/releases) — every released version, with binaries and full notes.

→ [Full CHANGELOG](https://github.com/MorscherLab/MINT/blob/main/CHANGELOG.md) — every change, every version.

## How MINT versions work

| Stream | Tag pattern | Source of truth |
|--------|-------------|-----------------|
| Platform (backend + bundled frontend) | `v1.2.0`, `v1.2.0-beta.1` | `api/_version.py` |
| Python SDK (`mint-sdk`) | Same `v*` tag | `mint_sdk/_version.py` |
| Frontend SDK (`@morscherlab/mint-sdk`) | Same `v*` tag | `packages/sdk-frontend/package.json` |

- **Major** (`1.x.x`) — breaking changes to the API, plugin contract, or database schema
- **Minor** (`1.5.x`) — new features that don't break existing plugins or data
- **Patch** (`1.5.0` → `1.5.1`) — bug fixes only

Plugin migrations are versioned independently per plugin via `mint_sdk.migrations`. Plugins declare a `get_migrations_package()` and the platform runs pending migrations on startup, advisory-locked.

## Release flow

The default patch flow tags a stable release directly from `main`. Minor, major, and other high-risk releases use an optional beta train on a development branch: each fix gets a new immutable `beta.N` tag, and graduation places the stable tag on the same passing commit as the final beta. The unified tag publishes the platform and both SDK artifacts together. See [`scripts/release.sh`](https://github.com/MorscherLab/MINT/blob/main/scripts/release.sh) for the canonical script.

## Need help upgrading?

If a release breaks something you depend on, please [open an issue](https://github.com/MorscherLab/MINT/issues) — we treat regressions as bugs, including for plugin authors who consume `mint-sdk`.
