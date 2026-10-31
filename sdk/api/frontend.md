# Frontend SDK reference

Public components, composables, stores, and types from `@morscherlab/mint-sdk` **@MINT_VERSION@**. For exact signatures, use `mint docs frontend <Name>` against the installed SDK or the linked release source. Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for setup and [Platform integration](/sdk/frontend/platform-integration) for complete state/persistence examples.

## Entry points

SDK 1.4 splits the public surface into entry points. The package root (`@morscherlab/mint-sdk`) keeps the names that most plugins use. Every other name lives in one subpath. The root still re-exports the 1.3 root names, marked `@deprecated` in the editor; they are removed in MINT 1.5. `mint doctor` reports a root import of such a name and `mint doctor --fix` rewrites the safe cases.

| Entry point | Contents |
|-------------|----------|
| `@morscherlab/mint-sdk` | The base components (`BaseButton`, `BaseInput`, `BaseSelect`, `BaseCheckbox`, `BaseRadioGroup`, `BaseSlider`, `BaseTabs`, `BaseModal`, `SegmentedControl`, `BasePill`, `Calendar`, `DataFrame`, `FormField`, `DatePicker`, `NumberInput`, `FileUploader`, `AlertBox`, `AppToastContainer`, `ActionMenu`, `ThemeToggle`, `CollapsibleCard`, `PluginWorkspaceView`, `AppContainer`, `PluginIcon`, `Skeleton`, `LoadingSpinner`, `Divider`, `ProgressBar`, `Avatar`, `EmptyState`, `Breadcrumb`, `Tooltip`, `ConfirmDialog`, `SettingsModal`, `FormBuilder`, `SectionCard`), `MINTSdk`, the composables `useTheme`, `useToast`, `usePlatform`, `useExperiment`, `useRequest`, `defineControlModel`, `providePluginIdentity`, the stores, the API error types and the types |
| `@morscherlab/mint-sdk/lab` | `WellPlate`, `PlateEditor`, `SampleSelector`, `PlotlyChart`, `ChartContainer`, `MoleculeInput`, `ConcentrationInput`, `DoseCalculator`, `SequenceProgressBar`, `InstrumentStateBadge`, `InstrumentStatusPanels`, scheduling components, the `time`, `dose` and `formula` helpers, `defineWellPlate`, `definePlateEditor` and the lab composables (`useRackEditor`, `useReagentSeries`, `useConcentrationUnits` and similar) |
| `@morscherlab/mint-sdk/shell` | `AppTopBar`, `AppSidebar`, `AppLayout`, `LayoutResizeHandle`, the keyboard and focus helpers, selection and sort primitives, `usePluginWorkspace` and the onboarding API (`defineOnboarding`, `useOnboarding`) |
| `@morscherlab/mint-sdk/data` | `ExperimentSelectorModal`, `ArtifactSelectorModal`, `ArtifactSaveDialog`, `ExperimentPopover`, `ExperimentCodeBadge`, `FilePicker`, `AuditTrail`, `BatchProgressList`, `JobsStatusTray`, `TagsInput`, `SecretInput`, `VersionConflictDialog`, `StaleFormBanner`, `useVersionedSave`, `useExperimentData`, `useArtifacts`, `experimentStatus`, `pluginSecret` |
| `@morscherlab/mint-sdk/runtime` | `GeneratedPluginView` and the generated-UI runtime, `RuntimeUpdateNotice`, the realtime API (`useRealtime`, `usePresence`, `PresenceAvatars`), the HTTP client helpers that generated clients use (`createClient`, `useApi`, `useJobsEndpoint`, `useJobCenter`), `useForm`, `useFormBuilder` and the control-schema helpers |
| `@morscherlab/mint-sdk/stores`, `/permissions`, `/types` | Pinia stores, permission helpers and types |
| `@morscherlab/mint-sdk/host` | Platform-only entry. Plugins do not import it |
| `@morscherlab/mint-sdk/styles` | The SDK style bundle |

`@morscherlab/mint-sdk/components` and `/composables` are gone. A plugin imports the names that it uses from the entry point that holds them. Source: [`packages/sdk-frontend/src/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src) (`index.ts`, `lab.ts`, `shell.ts`, `data.ts`, `runtime.ts`). The tables below list names by area; check the entry point of a name with `mint docs frontend <Name>`.

## Components

Components are documented in the [Component Library](/sdk/components/), where each page lists props and embeds a playground. Source: [`packages/sdk-frontend/src/components/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/components).

Components and props that changed in 1.4. `mint doctor` reports each one with its replacement (`mint docs deprecated-apis` lists them all); component names that move to a subpath do not change.

| 1.3 | 1.4 |
|-----|-----|
| `IconButton` | `BaseButton :icon label` (add `variant="ghost"`) |
| `BaseTextarea` | `BaseInput type="textarea"` |
| `UnitInput` | `NumberInput :units v-model:unit` |
| `SearchableSelect`, `MultiSelect` (`maxSelections`) | `BaseSelect searchable`, `BaseSelect multiple` (`max`) |
| `BaseToggle` | `BaseCheckbox type="switch"` |
| `StatusIndicator` | `BasePill tone dot` |
| `TimePicker`, `DateTimePicker` | `DatePicker type="time"`, `type="datetime"` |
| `ControlWorkspaceView`, `DoseDesignWorkspaceView` | `PluginWorkspaceView` with `spec.sidebar.controls` |
| `FormActions` | `defineControlModel({ actions })` |
| `AlertBox type`, `EmptyState color`, `ProgressBar color`, `ConfirmDialog variant`, `LoadingSpinner variant`, `BasePill variant="success"` | `tone` (`muted` becomes `neutral`, `danger` becomes `error`); `LoadingSpinner tone="inherit"` replaces `:style="{ color: 'inherit' }"` |
| `error` (boolean) on inputs | `invalid` |
| `v-model` on `BaseModal`, `ConfirmDialog`, `SettingsModal` and the selector modals | `v-model:open` |
| `BaseTabs tabs`, `BaseCheckbox variant`, `emptyMessage` | `options`, `layout`, `emptyText` |
| `AlertType`, `PillColor`, `SpinnerVariant`, `ConfirmVariant` | `Tone` |
| `RadioOption`, `SegmentedOption`, `MultiSelectOption`, `TabItem` | `SelectOption`, `SelectOptionInput` |
| `PluginWorkspaceView` `currentPillId` + `@pill-select`, save props, `pageSelector` | `v-model:pill`, `spec.save`, none (the page selector comes from the platform) |
| `SmartGroupModal`, `SmartGroupFieldRecipe`, `SmartGroupManual`, `GroupAssigner`, `AutoGroupModal`, `BioTemplate*` views and renderer, `ReagentList`, `ReagentEditor`, `ExperimentTimeline`, `SampleLegend`, `FitPanel` | None in the SDK; `SampleSelector` opens the auto-group modal and emits the `AutoGroupResult` as its `smartGroup` event |

Give the complex components one `:spec`, built in `<script setup>`: `PluginWorkspaceView` (`definePluginWorkspaceView`), `FormBuilder` and `SettingsModal` (`defineControlModel`), `DataFrame` (`defineDataFrame`, `v-model:selected`, `v-model:page`), `WellPlate` (`defineWellPlate`) and `PlateEditor` (`definePlateEditor`). `PluginWorkspaceView` renders `AppToastContainer`: delete your own or set `toasts: false`.

## Composables

Typed composables and helper factories. Source: [`packages/sdk-frontend/src/composables/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/composables).

The entry column names the import path (`root` is `@morscherlab/mint-sdk`; the others are subpaths). The root also re-exports some subpath names until MINT 1.5; import them from their subpath.

| Composable | Entry | Returns | Purpose |
|------------|-------|---------|---------|
| `useTheme` | root | theme state + setter | Theme switcher |
| `useToast` | root | `success`, `error`, `warning`, `info` | User feedback. Each takes a message and an options object, for example `toast.success('Saved', { duration: 8000 })`; there is no `show()` |
| `usePlatform` | root | `integrated`, `isAdmin`, `can('use' \| 'configure' \| 'admin')`, plugin, user, theme, features | Platform shell context (was `usePlatformContext`) |
| `useExperiment` | root | read-only `id`, `current`, `status`, `error`, `refresh()` | The experiment the platform keeps in step with the URL parameter `experiment_id` (was `useCurrentExperiment`). Do not write route sync by hand |
| `useRequest` | root | `isLoading`, errors, timestamps, cancellation | Tracks request feedback and protects shared state from stale completions (was `useRequestSyncState`) |
| `defineControlModel` | root | compact control model | Generate forms, settings, sidebars and workspaces from one model |
| `downloadBlob` | root | Blob download helper | Save a `Blob` as a file |
| `useApi` | `/runtime` | typed fetch helper | Auth-aware API calls |
| `createClient` | `/runtime` | contract-aware plugin API runtime | Generated plugin clients |
| `buildEndpointUrl`, `resolvePluginBaseUrl` | `/runtime` | URL helpers | Link previews and diagnostics that match generated client calls |
| `uploadEndpoint`, `downloadEndpoint` | `/runtime` | multipart / Blob helpers | Generated upload and download endpoint wrappers |
| `useEventStream` | `/runtime` | auth-aware SSE helper | Generated event-stream endpoint wrappers |
| `useSettingsEndpoint` | `/runtime` | plugin settings helpers | Load and save plugin configuration |
| `useJobsEndpoint` | `/runtime` | SDK job lifecycle client | Connect a custom frontend to the plugin's `@job` endpoints |
| `useJobCenter` | `/runtime` | job-center view state | Render a `PluginJobCenterSource` from the jobs client |
| `useRealtime`, `usePresence` | `/runtime` | realtime subscription; viewers of a topic | Platform events and presence. They need the platform `realtime` feature flag |
| `createGeneratedAnalysisTransport` | `/runtime` | generated-workspace transport | Experimental runtime behind the SDK-managed generated analysis UI |
| `useForm`, `useFormBuilder` | `/runtime` | reactive form state; schema-driven form runtime | Manual forms and the `FormBuilder` component |
| `defineControls`, `useControlSchema`, `useControlWorkspace`, `defineControlComponentBindings` | `/runtime` | control schemas and derived bindings | Lower-level control-driven layouts |
| `useRackEditor` | `/lab` | rack state, undo/redo, `plateEditorListeners` | Hold the plates of a `PlateEditor` |
| `useConcentrationUnits` | `/lab` | concentration math | µM / mg/mL / % conversions |
| `useReagentSeries` | `/lab` | dilution series | Dose-response panel building |
| `useSequenceUtils` | `/lab` | DNA / protein helpers, `findSequenceProblems` | Sequence stats and input validation |
| `useScheduleDrag` | `/lab` | drag-to-reschedule | Calendar / timeline |
| `useProtocolTemplates` | `/lab` | protocol step engine | Protocol UIs |
| `useSampleGroups` | `/lab` | group hierarchy | Sample selectors |
| `time`, `dose`, `formula` | `/lab` | helper namespaces | Time slots, dilution math, formula parsing and mass |
| `defineWellPlateControlProps`, `defineDoseCalculatorControlProps`, `defineWellPlateDoseControlProps`, `defineWellPlateDoseComponentBindings`, `defineDoseDesignControlModel` | `/lab` | control-to-component mappings | Bind generated controls to `WellPlate` / `DoseCalculator` |
| `usePluginWorkspace` | `/shell` | shell, sidebar and control state | Build a custom shell with the same behavior as `PluginWorkspaceView` |
| `defineOnboarding`, `provideOnboarding`, `useOnboarding` | `/shell` | tour, checklist and news state | Plugin onboarding |
| `useFocusTrap`, `useRovingFocus`, `useMenuKeyboard`, `useListReorder`, `useReorderAnnouncer` | `/shell` | keyboard and screen-reader helpers | Accessible dialogs, tabs, menus and reorderable lists |
| `useEventListener`, `useDebouncedWatch` | `/shell` | lifecycle-bound listener and debounced watcher | Small utilities used by SDK components |
| `useListSelection`, `useSelectionLimit` | `/shell` | selection state | Tables, sample lists, well plates |
| `useSortedItems` | `/shell` | client-side sort | Sortable lists and tables |
| `useExpansionSet` | `/shell` | expand/collapse state | Trees and grouped panels |
| `useManualLayoutResize` | `/shell` | pointer resize state, start/stop and cleanup | Connect a `LayoutResizeHandle` to application-owned dimensions |
| `resizedLeadingPanelWidth`, `resizedTrailingPanelWidth`, `resizedVerticalSplitPercent` | `/shell` | bounded dimension helpers | Convert pointer deltas into pane widths or vertical percentages |
| `useArtifacts` | `/data` | artifact list and actions | List and manage analysis artifacts through the platform API |
| `useVersionedSave` | `/data` | save with a version check | Send `If-Match` with a save and show `VersionConflictDialog` or `StaleFormBanner` on a conflict |
| `useExperimentSamples` | `/data` | design data and derived samples | Feed `SampleSelector`-style UIs from an experiment |
| `useExperimentSelector` | `/data` | reactive experiment picker | Experiment dropdowns |
| `useExperimentData` | `/data` | reactive experiment view | Live design and analysis data |
| `useAppExperiment` | `/data` | provide / inject pattern | Plugin-tree-wide active experiment |
| `useFileImport` | `/data` | delimited file parser state | CSV/TSV import flows |
| `useTextSearch` | `/data` | client-side search | Filterable lists and tables |
| `useFileBrowser` | `/data` | mount/listing/path selection state | Custom server-file UIs against the platform filesystem API |
| `usePlatformFilePickerAdapter` | `/data` | authenticated `PickerAdapter` | Connects `FilePicker` to platform mounts, optionally scoped by `rootLocation` |
| `createFilePickerAdapter` | `/data` | transport-backed `PickerAdapter` | Shared navigation and search for plugin-owned mount APIs |
| `encodePlatformPickerPath`, `decodePlatformPickerPath` | `/data` | opaque picker identity conversion | Convert between picker paths and mount-relative backend references |

### Removed and renamed composables {#deprecated-composables}

`mint doctor` reports these with their replacements. See [Migrate 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4).

| Composable | Replacement |
|------------|-------------|
| `useGeneratedPluginClient`, `pluginClient`, `usePluginClient` | `useClient()` from the generated file |
| `useGeneratedPluginSettings`, `usePluginSettings` | `useSettings()` from the generated file |
| `usePluginJobs().forDefinition(name)` | `useJobs(name, options)` from the generated file |
| `usePlatformContext`; `canAccessByPolicy` and `isAdminUser` in plugin pages | `usePlatform()`, `usePlatform().can(access)`, `usePlatform().isAdmin`. The permission helpers stay in `@morscherlab/mint-sdk/permissions` |
| `useCurrentExperiment` | `useExperiment()` |
| `useRequestSyncState` | `useRequest()` (`isLoading`) |
| `useAutoGroup`, `extractSamplesFromDesignData` | `SampleSelector`; read sample rows with `unwrapExperimentDesignData()` |
| `useExperimentSave`, `useGroupAssignment`, `useTemplateCollection`, `useBioTemplate*` | None in the SDK |
| `useTimeUtils`, `useDoseCalculator`, `useChemicalFormula` | `time`, `dose`, `formula` from `@morscherlab/mint-sdk/lab` |
| `useJobsStatusTray` | `useJobCenter()` with a `PluginJobCenterSource` |
| `useAnalysisArtifacts` | `useArtifacts()` from `@morscherlab/mint-sdk/data` |
| `useGeneratedAnalysis` | `useJobsEndpoint()` from `@morscherlab/mint-sdk/runtime` |
| `useRuntimeAlignment`, `usePresenceHeartbeat`, `useMobileSupportGate`, `MobileSupportGate` | None. The platform integration script sends the presence heartbeat and shows the update notice on plugin pages |
| `useAsync`, `useOptimisticMutation`, `useResourceCrud`, `useWellPainting`, `useWellPlateEditor`, `useWellPlateAdapter`, `useWellPlateValidation`, `useCommandHistory`, `usePluginConfig` | Removed in 1.3; see [Migrate 1.2 to 1.3](/sdk/operations/migrate-1.2-to-1.3) |

## Stores and access policies

| Export | State and methods |
|--------|-------------------|
| `useAuthStore()` | The read-only session bridge: `token`, `tokenExpires`, `userInfo`, `authRequired`, `isInitialized`, `isAuthenticated`, `initialize()`, `clearToken()`. On an integrated page the platform writes the session through `@morscherlab/mint-sdk/host`. For permission checks, pass `userInfo` to the helpers of `@morscherlab/mint-sdk/permissions` |
| `useExperimentStore()` | `current`, `currentId`, `isResolving`, `error`, `select(record)`, `selectById(id)`, `refresh()`, `clear()` |
| `useSettingsStore()`, `tryUseSettingsStore()` | Shared SDK theme, color palette, table density, and API settings; `tryUseSettingsStore()` returns `null` without an active Pinia |
| `colorPalettes`, `tableDensityToSize()` | Palette definitions (`ColorPalette` is `'default' \| 'colorblind' \| 'purple' \| 'ocean' \| 'forest'`; the settings store writes `html[data-palette]`) and the table size for a density. `paletteCssVariables()`, `PALETTE_CSS_VARIABLES`, `colorPalettes[*].hues` and `settings.getPaletteHues()` are removed: read a palette colour from its CSS token |
| `AccessPolicy`, `AccessControlled` | Nested `access: { permissions, anyPermissions, requiresAuth, requiresAdmin, ... }` policies for access-aware UI |

Destructure Pinia state with `storeToRefs()` or read it through the store object. Experiment selection is stored once per plugin Pinia instance; on an integrated page the platform binds it to the URL parameter `experiment_id` through the plugin integration script, and `AppTopBar` without `pageSelector` hands the page selector to the platform. Read the experiment with `useExperiment()`. Backend permissions remain authoritative.

## Utility exports

| Area | Exports |
|------|---------|
| Permissions (`/permissions`) | `ADMIN_ROLE`, `getRoleInfo`, `isAdminRole`, `isAdminUser`, `getAccessAudience`, `getUserPermissions`, `hasAllPermissions`, `hasAnyPermission`, `canAccessByPolicy(user, policy)` (takes an `AccessPolicy`). `ADMIN_PANEL_PERMISSIONS`, `canAccessAdmin()` and `canAccessPlugin()` are removed: the platform owns the admin panel and plugin visibility rules |
| Plugin secrets (`/data`) | The `pluginSecret` namespace: `REF_KEY`, `FORMAT_KEY`, `FORMAT_REF`, `set`, `keep`, `clear`, `isRef`, `isLocked`, `id`, `label`, `state`, `usesReferences`; the types `PluginSecretRef` and `PluginSecretState` |
| Jobs (`/runtime`) | `resolveJobCapabilities`, `normalizeJobPercent`, `normalizeJobState`, `isActiveJobStatus`, `isTerminalJobStatus`, `jobStatusLabel` |
| Generated job forms (experimental, `/runtime`) | `generatedJobFormSchema`, `generatedJobDefaults`, `normalizeGeneratedJobInput` |
| Color (`/lab`) | `hexToHsl`, `hslToHex`, `deriveShade` |
| Plotly (`/lab`) | `mintPlotlyTemplate(element?)`: a Plotly `Template` resolved from the MINT tokens |

The LC-MS helpers, the rack/LC-MS-plate helpers and the biology `templates` exports are removed from the core SDK in 1.4 (the LC-MS helpers moved to the mld-ms plugins). `SequenceProgressBar` and `InstrumentStateBadge` in `/lab` show sequence progress; the sequence calculation helpers are not exported.

## Generated plugin client helpers

The generated file `frontend/src/generated/mint-plugin.ts` wraps the lower-level helpers above with your plugin's contract:

| Generated export | Purpose |
|------------------|---------|
| `useClient()` | Typed endpoint calls, one method per `operation_id` |
| `useSettings()` | Typed settings values, save/load, and `settingsConfig` for top bars |
| `useJobs(name, options)` | Job client of one `@job`: `wait`, `result`, `get`, `cancel`, `delete`, `clear`, `refresh`; `initialize()` and `ready()` are gone |
| `upload(name, payload)` | Multipart upload through the generated contract |
| `download(name, payload, { filename })` | Blob download through the generated contract |
| `endpointUrl(name, payload)` | Concrete URL for an endpoint payload |
| `useStream(name, payload?, options?)` | SSE stream with auth headers and reconnect |
| `contract`, `contractHash`, `apiPrefix` | Contract metadata |

Generated call signatures follow the backend declaration. The standard scaffold's `/analyze` endpoint has only a JSON body:

```ts
await client.analyze({ value: 2.5 })   // client = useClient()
```

For an endpoint combining path/query parameters and a body, the generated signature uses a structured payload. The following shape is illustrative; use the exact generated names and schemas from your own contract:

```ts
await client.analyze({
  pathParams: { experimentId: 42 },
  query: { dryRun: true },
  body: { parameters: { threshold: 0.05 } },
})
```

Flat parameter fields are also accepted for compatibility on mixed endpoints. A body-only method takes the body directly, without a `body` wrapper. A no-input method takes no payload. Check `mint docs contract` after `mint sdk generate` and commit both generated files; `mint sdk generate --check` detects drift.

## HTTP error types

```ts
import {
  MintApiError,
  mintApiErrorFromResponse,
  type MintApiErrorEnvelope,
} from '@morscherlab/mint-sdk'
import { AuthenticationRequiredError } from '@morscherlab/mint-sdk/runtime'
```

| Member of `MintApiError` | Meaning |
|-------------------------|---------|
| `message`, `code`, `status` | Public failure message, machine-readable code, HTTP status |
| `requestId` | Correlation ID or `null` |
| `details` | Structured error details |
| `detail`, `body`, `cause` | Legacy detail, original response, underlying error |

Generated plugin clients and `useApi()` reject a failed response with a `MintApiError`. `usePlatform().can(access)` answers the plugin access levels. `AuthenticationRequiredError` extends `MintApiError` for an invalid authenticated session (401). Keep a fallback for network errors that have no HTTP response. See [error handling example](/sdk/frontend/composables).

## Exported types

Each entry point exports the types of its values. Import a type from the same path as its value:

```ts
import type {
  ControlSchema,               // defineControlModel
  ControlModel,
  SelectOption,                // option lists
  SelectOptionInput,
  Tone,
  AccessPolicy,
  AccessControlled,
} from '@morscherlab/mint-sdk'
import type {
  ApiClientOptions,            // useApi
  ValidationRule,              // useForm
  FieldRules,
  FieldState,
  UseFormReturn,
  RegistryEntry,               // formBuilderRegistry
  PluginContract,              // generated plugin clients
  PluginEndpointDefinition,
  UseControlWorkspaceReturn,   // compact controls
} from '@morscherlab/mint-sdk/runtime'
import type {
  ConcentrationValue,          // useConcentrationUnits
  ConcentrationUnit,
  MolarityUnit,
  MassVolumeUnit,
  PercentageUnit,
  UnitCategory,
  ParameterDefinition,         // useProtocolTemplates
  StepTemplate,
  SequenceType,                // useSequenceUtils
  SequenceStats,
  LevelEntry,                  // useReagentSeries
  DilutionPreset,
} from '@morscherlab/mint-sdk/lab'
import type { AppExperimentState } from '@morscherlab/mint-sdk/data'   // useAppExperiment
```

Instrument types include `InstrumentBadgeState`, `InstrumentLiveStatus`, `InstrumentLiveProgress`, `InstrumentStatusReporter`, and `InstrumentAlertList`. Additional public types include `FileSelection`, `FileEntry`, `ServerMount`, `FileDirectoryListing`, `UseFileBrowserOptions` and `UseFileBrowserReturn` (`/data`). For the full list, read the release entry files ([`lab.ts`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/lab.ts), [`data.ts`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/data.ts), [`runtime.ts`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/runtime.ts), [`shell.ts`](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/shell.ts)) and the [type exports](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/types/index.ts).

## Notes

- Examples use Vue 3 Composition API and `<script setup lang="ts">`; call lifecycle-aware composables inside component setup.
- Prefer named imports. Installing `MINTSdk` globally registers the SDK components; do not assume that a global install includes only one component. `PlotlyChart` loads its Plotly runtime on mount. See [PlotlyChart](/sdk/components/plotly-chart#plotly-4-builds-and-types) for Plotly setup.
- Current plugin scaffolds import Tailwind v4 and the SDK style bundle from `frontend/src/style.css`: `@import "tailwindcss";` then `@import "@morscherlab/mint-sdk/styles";`. Keep the SDK import unlayered so Tailwind preflight cannot outrank SDK component styles. See [Frontend → Design tokens](/sdk/frontend/design-tokens).
- For plugin-scoped API calls, prefer `useClient()` from `frontend/src/generated/mint-plugin.ts`; use raw `useApi()` for platform APIs outside the plugin contract.
- With auth enabled, plugin routes need a Bearer credential; the platform does not read the session cookie there. Do not call them with a plain `<a href>` link or a `fetch` without a Bearer: the platform answers 401. Use the generated client, the generated `download()`, or `downloadEndpoint()`.
- Dropdown, menu, and picker panels share the `.mint-popover` class hooks (menu rows use `.mint-menu-item`). Style those instead of `.mint-action-menu__panel` or `.mint-searchable-select__panel`; the old class aliases are removed in 1.4.
- `mint doctor` flags legacy `usePluginApi()`, private SDK subpath imports, direct frontend composable file subpaths, raw plugin API `fetch('/api/...')` calls, and the removed `AppSidebar` `variant` prop (in `.vue` files and in agent docs such as `CLAUDE.md` / `AGENTS.md`), together with every removed or renamed component, prop and import of the 1.4 tables above.

## Related

- [Component Library](/sdk/components/) — one page per component with usage notes and source links
- [Composables](/sdk/frontend/composables) — deep dives on generated clients, settings, current experiment, controls, and forms
