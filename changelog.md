---
title: Changelog
---

# Changelog

MINT follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Platform and SDK ship on independent tag streams (`v*` for the platform, `sdk-v*` for the SDK), generated from git tags by `hatch-vcs`.

## Latest releases

→ [GitHub Releases](https://github.com/MorscherLab/mld/releases) — every released version, with binaries and full notes.

→ [Full CHANGELOG](https://github.com/MorscherLab/mld/blob/main/CHANGELOG.md) — every change, every version.

## How MINT versions work

| Stream | Tag pattern | Source of truth |
|--------|-------------|-----------------|
| Platform (backend + bundled frontend) | `v1.0.0`, `v1.1.0-beta.1` | `api/_version.py` |
| Python SDK (`mint-sdk`) | `sdk-v1.0.0`, `sdk-v1.1.0-beta.1` | `mint_sdk/_version.py` |
| Frontend SDK (`@morscherlab/mint-sdk`) | Patched from the SDK tag | `packages/sdk-frontend/package.json` |

- **Major** (`1.x.x`) — breaking changes to the API, plugin contract, or database schema
- **Minor** (`1.5.x`) — new features that don't break existing plugins or data
- **Patch** (`1.5.0` → `1.5.1`) — bug fixes only

Plugin migrations are versioned independently per plugin via `mint_sdk.migrations`. Plugins declare a `get_migrations_package()` and the platform runs pending migrations on startup, advisory-locked.

## Release flow

The platform and SDK both follow a beta-then-graduate flow on a `*-dev` branch, with stable tags landing on the same commit as the last passing beta. See [`scripts/release.sh`](https://github.com/MorscherLab/mld/blob/main/scripts/release.sh) for the canonical script.

## Need help upgrading?

If a release breaks something you depend on, please [open an issue](https://github.com/MorscherLab/mld/issues) — we treat regressions as bugs, including for plugin authors who consume `mint-sdk`.
