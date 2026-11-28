# Operations

These pages take a working plugin to a release that administrators can install.

1. [Package](/sdk/operations/packaging) the plugin into a `.mint` bundle with `mint build`.
2. [Deploy and verify](/sdk/operations/deploying) the bundle on a disposable platform.
3. [Publish](/sdk/operations/publishing) the bundle as a GitHub Release asset. Optionally, add it to a marketplace registry.
4. [Automate](/sdk/operations/ci-patterns) the checks, the build and the release in GitHub Actions.

[Versioning](/sdk/operations/versioning) tells you how to choose the plugin version and the compatibility ranges. The plugin version comes from the git tag through `hatch-vcs`. Do not edit it by hand.

## Move to a new SDK release

Follow [Upgrading the SDK](/sdk/operations/upgrading) for each SDK update. For a new minor release, also follow its migration guide:

- [1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6): Vite+ and pnpm, `mint migrate`, `mint lint`, new `mint doctor` checks, runtime library changes, frontend deprecations
- [1.4 to 1.5](/sdk/operations/migrate-1.4-to-1.5): frontend root exports, named SDK imports, observer events through the event bus, frontend toolchain, new 1.5 APIs
- [1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4): the SDK 1.4 author API, access levels, migrations, CLI and frontend changes
- [1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3): removed Python and frontend APIs, settings `access`, SDK range, deprecated legacy migrations
- [1.1 to 1.2](/sdk/operations/migrate-1.1-to-1.2): PostgreSQL, repository, frontend and plugin-discovery changes
