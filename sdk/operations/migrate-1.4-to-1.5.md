# Migrate from MINT 1.4 to 1.5

This guide moves a plugin from MINT 1.4 to 1.5. The Python SDK has no removal in 1.5. A plugin built for SDK 1.4 with the range `mint-sdk>=1.4.0,<2.0` stays enabled on a 1.5 platform. The frontend SDK removes the deprecated root exports, and the `experiment.*` observer events change their delivery. Administrators must also read [Upgrading from MINT 1.4](/admin/updates#upgrading-from-mint-1-4) before they upgrade the platform.

## Before upgrading

1. Run `mint doctor` in each plugin project on the 1.4 SDK. Fix each root import that it reports before you change the npm version. See [Frontend root exports are removed](#frontend-root-exports-are-removed).
2. Make each `experiment.*` observer handler idempotent. See [Observer events go through the event bus](#observer-events-go-through-the-event-bus).
3. Check that the reverse proxy passes `GET /api/events` without buffering. See [Realtime is on by default](#realtime-is-on-by-default).
4. Stop writes and take a verified PostgreSQL backup. Six Alembic revisions run at the first 1.5 start.
5. Update the Python and frontend SDK packages together to the same 1.5 release.

## What changes for plugin code

| Surface | Action for 1.5 | Section |
|---|---|---|
| SDK packages | Update `mint-sdk` and `@morscherlab/mint-sdk` to @MINT_VERSION@, with both lockfiles | [Update both SDK packages](#update-both-sdk-packages) |
| Frontend imports | Import the 160 moved names from their subpaths | [Frontend root exports are removed](#frontend-root-exports-are-removed) |
| Frontend setup | Delete `app.use(MINTSdk)` and import each component by name | [Named imports instead of `app.use(MINTSdk)`](#named-imports-instead-of-app-use-mintsdk) |
| Fonts and styles | Load Geist with a `<link>` in `index.html` | [Fonts and the frontend toolchain](#fonts-and-the-frontend-toolchain) |
| Frontend toolchain | Move to the `mint init` toolchain and run `mint doctor --fix` | [Fonts and the frontend toolchain](#fonts-and-the-frontend-toolchain) |
| `experiment.*` handlers | Make them idempotent and independent of order | [Observer events go through the event bus](#observer-events-go-through-the-event-bus) |
| Open pages | Expect refetches after the writes of other users | [Realtime is on by default](#realtime-is-on-by-default) |
| Cross-plugin work | Use events, exports and calls | [New plugin APIs](#new-plugin-apis) |
| Instruments, notifications, libraries | Adopt the new arguments where they apply | [New plugin APIs](#new-plugin-apis) |

## Update both SDK packages

```bash
uv tool install --force 'mint-sdk[cli]==@MINT_VERSION@'
mint sdk update --version @MINT_VERSION@ --dry-run
mint sdk update --version @MINT_VERSION@
```

`mint sdk update` writes the range `>=@MINT_VERSION@,<2.0` and the exact npm pin in `frontend/package.json`. It also refreshes `uv.lock` and `frontend/bun.lock`, so both lockfiles resolve the same release. Commit the two lockfiles together. `mint doctor` reports a difference as `SDK version alignment`. Details: [Upgrading the SDK](/sdk/operations/upgrading).

You do not have to raise the range of a released 1.4 plugin. A plugin with `mint-sdk>=1.4.0,<2.0` runs the platform's `mint-sdk` 1.5. Raise the range when the plugin uses a 1.5 API.

## Frontend root exports are removed

SDK 1.4 moved 160 names of the 1.3 package root to subpaths, and the root re-exported them with a `@deprecated` tag. MINT 1.5.0 removes these re-exports. An import such as `import { WellPlate } from '@morscherlab/mint-sdk'` fails the build on 1.5.

```bash
mint doctor          # "Frontend SDK API catalog" names each import and its subpath
mint doctor --fix    # rewrites the safe cases
```

Move each reported import to the entry that doctor names, for example `@morscherlab/mint-sdk/lab`. The entries are listed in [Package entry points](/sdk/frontend/#package-entry-points).

## Named imports instead of `app.use(MINTSdk)`

`app.use(MINTSdk)` registers every SDK component globally, so the whole SDK stays in the first-load bundle. Delete it and import each component by name from its entry:

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { providePluginIdentity } from '@morscherlab/mint-sdk'
import App from './App.vue'
import { contract } from './generated/mint-plugin'
import './style.css'

const app = createApp(App)
app.use(createPinia())
providePluginIdentity(contract)
app.mount('#app')
```

```vue
<script setup lang="ts">
import { BaseButton, SectionCard } from '@morscherlab/mint-sdk'
import { WellPlate } from '@morscherlab/mint-sdk/lab'
</script>
```

A template that uses a component without an import fails at run time with an unresolved component warning. Add the import for each one.

Since 1.5.5, an import from the package root no longer pulls in every component. A plugin that replaced `app.use(MINTSdk)` with named imports loaded 37 percent less on first load (Large File Downloader and MS Planner). `MINTSdk` still exists for compatibility. The 1.5.5 `mint init` scaffold still writes `app.use(MINTSdk)`: delete that line in a new project too.

## Fonts and the frontend toolchain

The `@morscherlab/mint-sdk/styles` export no longer loads the Geist fonts. Add the font link to the `<head>` of `frontend/index.html`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" />
```

Inside the platform, the platform loads the fonts. The `styles` export now has types: remove a `declare module` for the styles import.

`mint init` scaffolds a smaller toolchain in 1.5:

- Tailwind runs through `@tailwindcss/vite`. There is no `postcss.config.js`.
- Vitest reads the `test` block of `vite.config.ts`. There is no `vitest.config.ts`.
- The build is `vue-tsc --noEmit && vite build`. There is no `tsconfig.node.json`.
- TypeScript is `^6.0.3`.

Move an existing plugin to this toolchain. The doctor check "Frontend toolchain" reports the differences:

```bash
mint doctor          # "Frontend toolchain"
mint doctor --fix    # deletes vite.config.js, vite.config.d.ts and *.tsbuildinfo
```

Delete `tsconfig.node.json` yourself. Details: [`mint init`](/sdk/api/cli-reference#mint-init) and [`mint doctor`](/sdk/api/cli-reference#mint-doctor).

## Observer events go through the event bus

The observer events `experiment.created`, `experiment.updated`, `experiment.status_changed`, `experiment.deleted` and `experiment.after_save` no longer run while the request waits. The platform writes them to the durable event bus in the transaction of the write and delivers them after the commit:

- A handler can receive one event more than once. Make each handler idempotent.
- The events have no fixed order. Do not rely on the order of two events.
- `experiment.after_save` carries the design that is stored at delivery time and its `version`, not the payload of that one save.
- With SDK 1.5, a handler that raises fails the delivery, and the platform retries it. After five attempts the delivery is dead. With SDK 1.4, the failure is logged and the delivery counts as done. Raise only when a retry can succeed.

`experiment.before_save` is unchanged: it runs while the request waits and can refuse the save. Administrators see failed deliveries in [Event deliveries](/admin/plugins#event-deliveries). Details: [Experiment events](/sdk/concepts/plugin-communication#experiment-events) and [Delivery rules](/sdk/concepts/plugin-communication#delivery-rules).

## Realtime is on by default

The realtime event stream (`realtimeEnabled`) is on by default in 1.5. Open platform pages refetch after the writes of other users. A plugin page that uses `useRealtime` or `usePresence` now receives events on a default installation. The platform must run as one worker. The reverse proxy must pass `GET /api/events` without buffering. An administrator can set `realtimeEnabled: false` to turn the stream off. See [`realtimeEnabled`](/admin/configuration#realtimeenabled).

## New plugin APIs

These APIs are new in 1.5. A plugin that uses one needs `mint-sdk>=@MINT_VERSION@`.

| Area | Change | Page |
|---|---|---|
| Plugin events | `Metadata.emits` declares the events that leave the plugin. `@on("<plugin>.<event>")` with the source in `reads_from` receives a `PluginEvent[Model]` | [Event bus](/sdk/concepts/plugin-communication#event-bus) |
| Plugin exports | `@export`, `ExportQuery`, `Page` and `page_of` (`mint_sdk.exports`) publish read-only data. `context.plugins.read` reads it. `mint doctor` fails an incompatible change within one export version | [Exports](/sdk/concepts/plugin-communication#exports) |
| Plugin calls | `context.plugins.call` and `context.plugins.start_job` call the tools and jobs of a plugin in `reads_from`. The target admits callers with `Tool.callers` or `Job.callers`: a read tool defaults to `"readers"`, a write tool and a job to no callers | [Calls to tools and jobs](/sdk/concepts/plugin-communication#calls-to-tools-and-jobs) |
| `reads_from = {"*"}` | Grants nothing until an administrator sets `reads_from_any_plugin` | [Read every plugin](/sdk/concepts/plugin-communication#read-every-plugin-reads-from) |
| Testing | `RecordingContext` records `emitted`, `reads`, `calls`, `started_jobs` and `subscriptions`. `stub_export`, `stub_call`, `stub_job` and `Harness.deliver` fake the other side | [Events, exports and calls](/sdk/recipes/testing-plugins#events-exports-and-calls) |
| Libraries | `Metadata.libraries` and `context.libraries.get` give a read-only path to a reference library | [Use a reference library](/sdk/recipes/libraries) |
| Instruments | `context.instruments.report` takes `latest_critical_at`. Without it, a report keeps its critical flag | [Instrument status](/sdk/recipes/instrument-status#send-the-time-of-the-newest-critical-alert) |
| Notifications | `enqueue_notifications` takes `channel_names` and `on_behalf_of`. `context.notification_channels()` lists the Teams and Slack channel names | [For plugin authors](/guide/notifications#for-plugin-authors) |
| Frontend | `MetadataSheet` (1.5.1). Use `runs` instead of `runsEditable`, which 2.0 removes | [MetadataSheet](/sdk/components/metadata-sheet#who-owns-the-runs) |
| Frontend | `SectionCard` takes `collapsible` and `v-model:collapsed`. `SampleSelector` takes `groupSeparator` | [SectionCard](/sdk/components/section-card#collapsible-card), [SampleSelector](/sdk/components/sample-selector#group-separator) |
| Frontend | A selected row in the selectors, `ArtifactSaveDialog` and `DataFrame` has no coloured left bar. Remove plugin CSS that depends on it | [ExperimentSelectorModal](/sdk/components/experiment-selector-modal#selected-row) |

## Check the result

```bash
mint doctor
uv run pytest
cd frontend && bun run build && bunx vitest run
```

Open the plugin in the platform and in `mint dev`. Check that each page renders its components and the Geist fonts. Then release the plugin. See [Publishing](/sdk/operations/publishing).
