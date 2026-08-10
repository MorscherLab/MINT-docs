# Frequently Asked Questions

## What does MINT do?

MINT is a modular laboratory platform. It manages **projects**, **experiments**, and **users**, and hosts a marketplace of **plugins** that add domain-specific capabilities — LC-MS sequence design, drug-response prediction, chemical drawing, plate-map editing, and so on. The platform itself is intentionally small; the lab-specific value lives in plugins.

## Who is MINT for?

- **Researchers and lab scientists** running and reviewing experiments
- **Lab admins** managing users, plugins, and platform settings
- **Plugin developers** extending the platform with new domain-specific tools

It's especially well-suited to wet-lab teams that want a single browser-based home for project tracking, experiment metadata, and analysis workflows — without each tool living on a different server with a different login.

## What was MLD?

MLD was the original name (Morscher Laboratory Database). It was rebranded to **MINT** — Mass-spec INtegrated Toolkit — alongside the `v1.0.0` release. The legacy `mld-sdk` and `@morscherlab/mld-sdk` packages are frozen on their respective registries; new releases ship as `mint-sdk` and `@morscherlab/mint-sdk`. The CLI binary is `mint`, env vars use the `MINT_` prefix. See the [rebrand decision](https://github.com/MorscherLab/MINT/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).

## How does MINT relate to LEAF?

[LEAF](https://leaf-docs.morscherlab.org) is one of the analysis tools that runs as a plugin under MINT (in addition to running as a standalone desktop app). MINT provides the project / experiment / user / marketplace layer; LEAF provides LC-MS metabolomics extraction, peak picking, and visualization. Many other plugins exist alongside LEAF.

## Where does my data go?

**Self-managed install (direct or Docker, on a Linux server):** Data lives on your server — relational data in Postgres (recommended) or SQLite, files under the configured `server.dataPath`. MINT itself makes outbound network requests only to the marketplace registry and (optionally) the GitHub release feed for updates.

**Hosted (`mint.morscherlab.org`):** Data resides on the lab server. Access is governed by the same RBAC controls as any other deployment.

There is intentionally no desktop / single-user install path: MINT is a multi-user platform and assumes a server context.

## Do plugins isolate from each other?

Yes — when needed. The plugin loader checks each plugin's dependencies against everything already installed; if there's a clash, the plugin runs in its own `uv`-managed venv, in a separate subprocess that the platform proxies HTTP to. Otherwise plugins share the platform's environment for efficiency. Either way, plugin crashes don't take down the platform: middleware wraps every plugin call with error isolation.

## Can I migrate from MLD to MINT?

Yes — the rebrand is name-only at the data level. Existing MLD installations upgrade in place: the database schema is identical, plugins built against `mld-sdk` continue to work during a grace period, and `MLD_*` environment variables remain honored alongside the new `MINT_*` ones. Plugin authors are encouraged to re-publish against `mint-sdk` at their next release. The migration plan is at [`decisions/2026-04-30-mld-to-mint-rebrand.md`](https://github.com/MorscherLab/MINT/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).

## What database backends are supported?

| Mode | When |
|------|------|
| `none` | Auth/passkeys and setup only; experiments/projects/plugins that need SQL storage are disabled |
| `sqlite` | Single-server evaluation installs; no horizontal scaling |
| `postgresql` | Recommended for shared deployments. Required for HA / multi-replica because plugin migrations rely on Postgres advisory locks. |

## How big a deployment can MINT handle?

Single-process MINT comfortably serves dozens of concurrent users with a handful of plugins. For larger labs, run multiple MINT replicas behind a load balancer with a shared Postgres — the advisory-lock-aware migration runner is built for that.

## How do I back up MINT?

Two layers:

1. **Database** — standard `pg_dump` / `pg_dumpall` (Postgres) or file copy (SQLite, when MINT is stopped).
2. **Filesystem** — `server.dataPath` for SQLite/passkey files, plugin registry state, uploaded `.mint` bundles, plugin environment snapshots, and plugin-owned files.

`snapshot.py` keeps short-lived rollback snapshots for plugin upgrades, but those aren't a backup substitute — they're a local rollback aid.

## Does MINT support SSO?

Yes. Current MINT releases include built-in SWITCH edu-ID sign-in through OpenID Connect. Enable it under `sso.eduid`, set `server.externalUrl` to the public HTTPS URL, and keep SQLite or PostgreSQL enabled because SSO users need database-backed accounts.

Other identity providers can still sit in front of MINT through an organization-managed reverse proxy or access gateway, but SWITCH edu-ID is the supported in-platform SSO path today. See [Authentication](/workflow/auth-passkeys).

## Can I write a plugin in something other than Python?

The plugin contract is a FastAPI app + entry point in the `mint.plugins` group, so the plugin process itself must be Python. The plugin can shell out to native binaries, call other languages over IPC, or do anything else inside that process — but the platform-facing surface is Python + FastAPI.

For UI, choose the plugin mode that matches the job:

- `generated` uses Python decorators and schemas to produce a MINT-native UI without a custom frontend build.
- `standard` gives you a Vue 3 workspace when the plugin needs a custom interactive view.
- Backend-only plugins can skip frontend code entirely.

## How do I update MINT?

For a direct Linux platform install, upgrade the platform package inside the service venv and restart the service:

```bash
sudo -u mint /opt/mint/venv/bin/pip install --upgrade mint
sudo systemctl restart mint
```

For Docker, bump the image tag or use the runtime-bundle update path described in [Updates](/workflow/updates). The `uv tool upgrade mint-sdk` / `pipx upgrade mint-sdk` style commands only update an admin shell's `mint` CLI; they do not upgrade the running platform service.

For self-hosted deployments, use **Admin -> Platform -> Server** and **Admin -> Plugins** to check available platform and plugin releases. Take a normal deployment/database backup before upgrading.

## Is MINT open source?

Yes. The source lives at [github.com/MorscherLab/MINT](https://github.com/MorscherLab/MINT). Issues, pull requests, and questions are welcome.

## How do I cite MINT in a paper?

A citable preprint / DOI is forthcoming. For now, please cite the GitHub repository and the MINT version you used.

## Where can I report bugs or request features?

[GitHub issues](https://github.com/MorscherLab/MINT/issues) — include your MINT version, OS, the affected plugin (if any), and steps to reproduce. The structured-log request ID from the failing response, if available, is especially helpful.
