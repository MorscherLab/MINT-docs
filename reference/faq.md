# Frequently Asked Questions

## What does MINT do?

MINT is a lab platform for projects, experiments and users. Plugins add the domain tools, such as LC-MS sequence design, drug-response prediction, chemical drawing and plate maps. The platform is small; the lab-specific functions are in plugins.

## Who is MINT for?

- Lab scientists who run and review experiments.
- Lab admins who manage users, plugins and platform settings.
- Plugin developers who add tools to the platform.

MINT gives a lab one browser-based place, with one sign-in, for projects, experiment metadata and analysis.

## Coming from MLD?

MLD (Morscher Laboratory Database) was the original name of the platform. It became MINT (Mass-spec Infrastructure for Next-generation Toolkits) with `v1.0.0`. The rename is complete:

- The packages are `mint-sdk` (PyPI) and `@morscherlab/mint-sdk` (npm). The `mld-sdk` packages get no more releases.
- MINT finds plugins only through the `mint.plugins` entry-point group. A plugin that still declares `mld.plugins` does not load, and MINT shows no error.
- Settings use the `MINT_` environment prefix. MINT ignores general `MLD_*` variables. Only the `MLD_*` JWT-secret aliases remain, because removing them would sign out all users. `MLD_CONFIG_PATH`, the `MLD_*` GitHub-token names, and the Docker Compose names `MLD_PORT` and `MLD_VERSION` do not work. Use `MINT_CONFIG_PATH`, `MINT_UPDATES__GITHUB_TOKEN`, `MINT_PORT` and `MINT_VERSION`.
- The CLI is `mint`.

Rebuild old plugins against `mint-sdk`, and rename the `MLD_*` variables of your deployment. Background: [rebrand decision](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/decisions/2026-04-30-mld-to-mint-rebrand.md).

## How does MINT relate to LEAF?

[LEAF](https://leaf-docs.morscherlab.org) is an LC-MS metabolomics tool for extraction, peak picking and visualization. It runs as a MINT plugin and as a standalone desktop app. MINT gives the project, experiment, user and marketplace layer.

## Where does my data go?

- Self-managed server (direct or Docker, on Linux): the data stays on your server. Records are in PostgreSQL. Files are under `server.dataPath`. MINT connects out only to the marketplace registry and, optionally, to GitHub for updates.
- Lab server (`mint.morscherlab.org`): the data stays on the lab server, with the same access controls.

MINT is a multi-user server platform. There is no desktop or single-user installation.

## Do plugins isolate from each other?

Partly. In-process plugins share the platform environment under a [dependency lock](/admin/plugins#plugin-dependency-lock) that blocks conflicting installs. Other runtimes run in their own process. A plugin crash does not stop the platform. See [Isolation](/sdk/concepts/isolation).

## What database backends are supported?

PostgreSQL only. See [Install directly -> Requirements](/admin/install-direct#requirements).

## How big a deployment can MINT handle?

MINT runs as one server process and refuses to start with more than one worker. To scale, give the host more CPU and memory. Heavy analyses run in separate job worker processes. See [Install directly](/admin/install-direct).

## How do I back up MINT?

Back up the PostgreSQL database (`pg_dump`), the `server.dataPath` directory, and `config.json`. The plugin lock history is not a backup. See [Install with Docker -> Backups](/admin/install-docker#backups).

## Which plugin permissions exist?

MINT has no plugin roles. A plugin tags its endpoints, jobs, tools and pages with the access level `use`, `configure` or `admin`. See [Plugin access levels](/admin/users-roles#plugin-access-levels).

## Does MINT support push notifications?

Yes, to the MINT iOS app through Apple Push. An admin sets it up in **Admin -> System -> Configuration**. See [Push notifications](/admin/platform-settings#push-notifications).

## Does MINT support SSO?

Yes. MINT has built-in SWITCH edu-ID sign-in through OpenID Connect. Turn it on under `sso.eduid`, and set `server.externalUrl` to the public HTTPS URL. For other identity providers, put a reverse proxy or access gateway of your organization in front of MINT. See [Authentication](/admin/authentication#switch-edu-id-sso).

## Can I write a plugin in something other than Python?

The plugin process must be Python: a FastAPI app with an entry point in the `mint.plugins` group. Inside that process, the plugin can call native binaries or other languages.

For the UI, a plugin can generate it from Python, use a Vue 3 frontend, or have no frontend. See [Plugin types](/sdk/concepts/plugin-types).

## How do I update MINT?

1. Take a backup of the database and the data directory.
2. Open **Admin -> System -> Updates**.
3. Click **Update platform** in the platform row of **Available updates**. Or run `mint platform update check` and `mint platform update apply --yes`.
4. Restart MINT.

This works for the [direct install](/admin/install-direct) and for [Docker](/admin/install-docker). A minor update can need new plugin releases; see [Updates](/admin/updates). Before you update from MINT 1.5 to 1.6, read [Upgrading from MINT 1.5](/admin/updates#upgrading-from-mint-1-5). Without a backup, you cannot go back to 1.5.

`uv tool upgrade mint-sdk` and `pipx upgrade mint-sdk` update only the `mint` CLI. They do not update the running platform.

## Which browsers does MINT support?

Chrome 116, Edge 116, Firefox 124 and Safari 17.4, or newer, on a desktop computer. See [Supported browsers](/guide/access#supported-browsers).

## Is MINT open source?

Yes. The source is at [github.com/MorscherLab/MINT](https://github.com/MorscherLab/MINT).

## How do I cite MINT in a paper?

There is no preprint or DOI yet. Cite the GitHub repository and the MINT version that you used.

## Where can I report bugs or request features?

Open a [GitHub issue](https://github.com/MorscherLab/MINT/issues). Include your MINT version, operating system, the plugin (if any), and the steps to reproduce. If the failing response has a request ID, include it.
