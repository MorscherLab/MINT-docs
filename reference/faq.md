# Frequently Asked Questions

## What does MINT do?

MINT is a modular laboratory platform. It manages **projects**, **experiments**, and **users**, and hosts a marketplace of **plugins** that add domain-specific capabilities — LC-MS sequence design, drug-response prediction, chemical drawing, plate-map editing, and so on. The platform itself is intentionally small; the lab-specific value lives in plugins.

## Who is MINT for?

- **Researchers and lab scientists** running and reviewing experiments
- **Lab admins** managing users, plugins, and platform settings
- **Plugin developers** extending the platform with new domain-specific tools

It's especially well-suited to wet-lab teams that want a single browser-based home for project tracking, experiment metadata, and analysis workflows — without each tool living on a different server with a different login.

## What was MLD?

MLD was the original name (Morscher Laboratory Database). It was rebranded to **MINT** — Mass-spec INtegrated Toolkit — alongside the `v1.0.0` release. The legacy `mld-sdk` and `@morscherlab/mld-sdk` packages are frozen on their respective registries; new releases ship as `mint-sdk` and `@morscherlab/mint-sdk`. The CLI binary is `mint`, env vars use the `MINT_` prefix. See the [rebrand decision](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).

## How does MINT relate to LEAF?

[LEAF](https://leaf-docs.morscherlab.org) is one of the analysis tools that runs as a plugin under MINT (in addition to running as a standalone desktop app). MINT provides the project / experiment / user / marketplace layer; LEAF provides LC-MS metabolomics extraction, peak picking, and visualization. Many other plugins exist alongside LEAF.

## Where does my data go?

**Self-managed install (direct or Docker, on a Linux server):** Data lives on your server — relational data in Postgres (recommended) or SQLite, files under `plugins.dataDir`. MINT itself makes outbound network requests only to the marketplace registry and (optionally) the GitHub release feed for updates.

**Hosted (`mint.morscherlab.org`):** Data resides on the lab server. Access is governed by the same RBAC controls as any other deployment.

There is intentionally no desktop / single-user install path: MINT is a multi-user platform and assumes a server context.

## Do plugins isolate from each other?

Yes — when needed. The plugin loader checks each plugin's dependencies against everything already installed; if there's a clash, the plugin runs in its own `uv`-managed venv, in a separate subprocess that the platform proxies HTTP to. Otherwise plugins share the platform's environment for efficiency. Either way, plugin crashes don't take down the platform: middleware wraps every plugin call with error isolation.

## Can I migrate from MLD to MINT?

Yes — the rebrand is name-only at the data level. Existing MLD installations upgrade in place: the database schema is identical, plugins built against `mld-sdk` continue to work during a grace period, and `MLD_*` environment variables remain honored alongside the new `MINT_*` ones. Plugin authors are encouraged to re-publish against `mint-sdk` at their next release. The migration plan is at [`decisions/2026-04-30-mld-to-mint-rebrand.md`](https://github.com/MorscherLab/mld/blob/main/decisions/2026-04-30-mld-to-mint-rebrand.md).

## What database backends are supported?

| Mode | When |
|------|------|
| `none` (file-based) | Single-user, no concurrency, evaluation only |
| `sqlite` | Single-server, modest team |
| `postgresql` | Recommended for shared deployments. Required for HA / multi-replica because plugin migrations rely on Postgres advisory locks. |

## How big a deployment can MINT handle?

Single-process MINT comfortably serves dozens of concurrent users with a handful of plugins. For larger labs, run multiple MINT replicas behind a load balancer with a shared Postgres — the advisory-lock-aware migration runner is built for that.

## How do I back up MINT?

Two layers:

1. **Database** — standard `pg_dump` / `pg_dumpall` (Postgres) or file copy (SQLite, when MINT is stopped).
2. **Filesystem** — `plugins.dataDir` for plugin artifacts. The platform doesn't store anything outside the database and that directory.

`snapshot.py` keeps short-lived rollback snapshots for plugin upgrades, but those aren't a backup substitute — they're a local rollback aid.

## Can I write a plugin in something other than Python?

The plugin contract is a FastAPI app + entry point in the `mld.plugins` group, so the plugin process itself must be Python. The plugin can shell out to native binaries, call other languages over IPC, or do anything else inside that process — but the platform-facing surface is Python + FastAPI.

The frontend half is Vue 3, but it's optional: a backend-only plugin (e.g., a webhook receiver) doesn't need a frontend.

## How do I update MINT?

```bash
# uv
uv tool upgrade mint

# pip
pip install --user --upgrade mint

# pipx
pipx upgrade mint
```

For self-hosted deployments, use `Admin → Updates` to run the upgrade in-place with rollback support. See [Updates](/workflow/updates).

## Is MINT open source?

Yes. The source lives at [github.com/MorscherLab/mld](https://github.com/MorscherLab/mld) (the repo retains the historical name; the package and CLI are now `mint`). Issues, pull requests, and questions are welcome.

## How do I cite MINT in a paper?

A citable preprint / DOI is forthcoming. For now, please cite the GitHub repository and the MINT version you used.

## Where can I report bugs or request features?

[GitHub issues](https://github.com/MorscherLab/mld/issues) — include your MINT version, OS, the affected plugin (if any), and steps to reproduce. The structured-log request ID from the failing response, if available, is especially helpful.
