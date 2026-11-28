# Glossary

This page defines the terms used across MINT. Each entry links to the page with the details.

## A

**Access level**
The label `use`, `configure` or `admin` that a plugin puts on an endpoint, job, MCP tool or page. See [Plugin access levels](/admin/users-roles#plugin-access-levels).

**Admin**
The role that has all permissions. Only the exact role slug `admin` is a platform administrator, for the platform and for plugins. A project creator or lead has rights in one project only.

**Analysis plugin**
A plugin that reads experiment data and saves analysis artifacts. It can also have its own page to run analyses.

**Analysis artifact**
A named result of one plugin for one experiment. It shows in the **Analysis artifacts** card of the experiment page. See [Experiments -> Artifacts](/guide/experiments#artifacts).

**Analysis result**
The analysis artifact with the key `default`. A plugin writes it with `artifacts.save(experiment, data)` and reads it with `artifacts.get(...)`.

**Archive (project)**
Hides a project from default dashboards. Deletes no data. You can undo it.

**Archive (uninstall mode)**
An uninstall mode that renames the plugin schema so that no code reads it. A database admin can recover it. See [Uninstall modes](/admin/plugins#uninstall-modes).

**Artifact**
Short for analysis artifact. A file artifact stores an object reference to the object store.

**Authenticator**
The device or method that proves your identity at a passkey sign-in, such as a security key, Touch ID or Windows Hello. An authenticator app is the second-factor method that shows 6-digit codes.

## C

**Capability**
A `PluginCapabilities` flag that declares which platform services a plugin needs, such as auth, experiments, database access, shared plugin tables, notifications or calendar events.

**Collaborator**
A person added to one experiment with the role `owner` or `collaborator`. See [Experiments -> Collaborators](/guide/experiments#collaborators).

**Custom role**
A role that an admin builds from the permission catalog, next to the system roles Admin, Member and Viewer. See [Permissions -> Custom roles](/reference/permissions#custom-roles).

## D

**Dependency lock**
The hashed lock file `plugins.lock` under `<server.dataPath>/plugins/locks/` that pins the Python packages of in-process plugins. See [Plugin dependency lock](/admin/plugins#plugin-dependency-lock).

**Design data**
The JSON document that describes what an experiment is and what it contains. The design plugin of the experiment writes it.

**Design plugin**
The plugin that writes the design data of an experiment. It gives the design form. See [Choose a design plugin](/guide/experiments#choose-a-design-plugin).

**Device code**
The short code that `mint platform auth login` shows. You approve it on the `/device` page. See [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli).

**Dev mode**
`devMode: true` in `config.json`. Turns off authentication for local development. See [Configuration -> `devMode`](/admin/configuration#devmode).

## E

**Error code**
The machine-readable `code` field of an API error, such as `user.not_found`. Scripts compare the code, not the message. See [Error codes](/reference/error-codes).

**Experiment**
The unit of work in MINT. It has a code, a type, a status, an owner, collaborators, one design document and analysis artifacts. See [Experiments](/guide/experiments).

**Experiment code**
The experiment number, unique across MINT, in `TYPE-EXP-SEQ` format, such as `LCM-EXP-001`. A new experiment has none. MINT assigns it when the experiment starts or when a user or plugin asks for it. See [Experiment numbers](/guide/experiments#experiment-numbers).

**Experiment type**
A slug that an admin creates in **Admin -> Lab content -> Experiment types**. Plugins do not create types. A plugin can limit the types that it works with, and an admin can narrow that list. See [Experiment types](/admin/platform-settings#experiment-types).

## I

**Isolation**
How a plugin runs apart from the platform process. See [Isolation](/sdk/concepts/isolation).

## J

**JWT (JSON Web Token)**
The session token that MINT issues after sign-in. It is stored in the HttpOnly `mint_access_token` cookie, marked `Secure` on HTTPS sites. The default lifetime is 7 days (`auth.tokenExpireMinutes`).

## L

**Live design**
A design plugin that declares `Design(live=True)`. The experiment page shows its design form, and each field saves by itself. See [Fill in the design](/guide/experiments#fill-in-the-design).

## M

**Marketplace**
The catalog of plugins that admins can install. See [Marketplace](/guide/marketplace).

**Marketplace registry**
The JSON catalog at `marketplace.registryUrl` that points to `.mint` release assets. See [Publishing -> Registry format](/sdk/operations/publishing#registry-format).

**Member (system role)**
The default role for new users. Members create and edit projects and experiments and use plugins, but have no admin rights. See [Permissions -> System roles](/reference/permissions#system-roles).

**Migration (platform)**
An Alembic revision under `api/db_revisions/` that the platform applies at startup. See [Updates](/admin/updates).

**Migration (plugin)**
A schema change of the tables of a plugin. See [Migrations API](/sdk/api/migrations).

**MINT**
Mass-spec Infrastructure for Next-generation Toolkits. The platform was called MLD before `v1.0.0`. See [FAQ](/reference/faq).

**MLD**
The former name of the platform (Morscher Laboratory Database).

## P

**Passkey**
A WebAuthn credential: a key pair stored on a device. It replaces or adds to the password sign-in.

**Permission**
A `resource.action` string, such as `experiments.edit`, that the server checks. MINT has 27 permissions in 11 groups. See [Permissions](/reference/permissions).

**Personal access token**
A `mint_pat_` credential for scripts, the `mint` CLI and AI assistants. See [AI Assistants and API Access](/guide/ai-and-api).

**Plugin**
An extension of the platform. A plugin declares a `Metadata` subclass, registers it with `@plugin(Meta)` from `mint-sdk`, and is found through the `mint.plugins` entry-point group.

**Plugin panel**
A tab that a plugin adds to the **Design data** or **Analysis artifacts** card of the experiment page. See [Plugin tabs](/guide/experiments#plugin-tabs).

**`PlatformContext`**
The object that the platform gives a plugin at startup. It gives the current user and the services for experiments, projects, artifacts, plugin data, settings, notifications, calendar events and jobs that the plugin declared. See [Platform context](/sdk/concepts/platform-context).

**Prerelease updates**
With `updates.includePrereleases` set to true, the update check includes GitHub prereleases. See [Updates -> Prereleases](/admin/updates#prereleases).

**Project**
The top-level group in MINT. It has experiments and a member list. See [Projects](/guide/projects).

**Project role**
The membership label `editor` or `viewer` in a project. See [Users & roles -> Project membership](/admin/users-roles#project-membership).

**Purge (uninstall mode)**
An uninstall mode that drops the plugin schema. You cannot undo it. See [Uninstall modes](/admin/plugins#uninstall-modes).

## R

**Repository pattern**
The data-access layer of the platform. Each resource, such as project, experiment or user, has a repository for its PostgreSQL access and permission checks.

**Routes prefix**
The URL path of a plugin, declared with `Metadata.prefix`. See [Isolation](/sdk/concepts/isolation).

## S

**Second factor**
The step after a password or edu-ID sign-in: a passkey or a code from an authenticator app (TOTP). See [Access -> Second factor](/guide/access#second-factor) and [Authentication -> Second factor](/admin/authentication#second-factor).

**Service token**
A `mint_svc_` credential for an instrument daemon. It belongs to one plugin and reaches only the routes of that plugin. See [Service tokens](/admin/authentication#service-tokens).

**Snapshot**
A saved earlier plugin lock, used to roll back plugin packages. It is not a backup. See [Rollback](/admin/plugins#rollback).

**SDK**
`mint-sdk` (Python) for plugin backends, and `@morscherlab/mint-sdk` (npm) for plugin frontends.

**SSO (Single Sign-On)**
Sign-in through an external identity provider. MINT has built-in SWITCH edu-ID sign-in through OpenID Connect. See [SWITCH edu-ID SSO](/admin/authentication#switch-edu-id-sso).

**Status (experiment)**
One of `planned`, `ongoing`, `completed`, or `cancelled`. See [Lifecycle](/guide/experiments#lifecycle).

## V

**Viewer (system role)**
A role that can view projects, experiments, instruments, plugins and users, and can use plugins. It cannot create or edit platform records.

## W

**WebAuthn**
The browser standard for passkey sign-in.
