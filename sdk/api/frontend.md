# Frontend SDK reference

Public components, composables, stores and types of `@morscherlab/mint-sdk` @MINT_VERSION@. For exact signatures, run `mint docs frontend <Name>` or read the linked source. For setup, see [Adding a frontend](/sdk/tutorials/adding-a-frontend). For state and save examples, see [Platform integration](/sdk/frontend/platform-integration).

## Entry points

The package root (`@morscherlab/mint-sdk`) holds the names that most plugins use. Every other name is in one subpath. `mint doctor` reports a root import of a subpath name, and `mint doctor --fix` rewrites the safe cases.

| Entry point | Contents |
|-------------|----------|
| `@morscherlab/mint-sdk` | The base components (`BaseButton`, `BaseInput`, `BaseSelect`, `BaseCheckbox`, `BaseRadioGroup`, `BaseSlider`, `BaseTabs`, `BaseModal`, `SegmentedControl`, `BasePill`, `Calendar`, `DataFrame`, `FormField`, `DatePicker`, `NumberInput`, `FileUploader`, `AlertBox`, `AppToastContainer`, `ActionMenu`, `ThemeToggle`, `CollapsibleCard`, `PluginWorkspaceView`, `AppContainer`, `PluginIcon`, `Skeleton`, `LoadingSpinner`, `Divider`, `ProgressBar`, `Avatar`, `EmptyState`, `Breadcrumb`, `Tooltip`, `ConfirmDialog`, `SettingsModal`, `FormBuilder`, `SectionCard`, `SplitButton`), `MINTSdk`, the composables `useTheme`, `useToast`, `usePlatform`, `useExperiment`, `useRequest`, `defineControlModel`, `providePluginIdentity`, the stores, the API error types and the types |
| `@morscherlab/mint-sdk/lab` | `WellPlate`, `PlateEditor`, `SampleSelector`, `PlotlyChart`, `ChartContainer`, `MoleculeInput`, `ConcentrationInput`, `DoseCalculator`, `SequenceProgressBar`, `InstrumentStateBadge`, `InstrumentStatusPanels`, `PanelSections`, `MoleculeView`, scheduling components, the `time`, `dose` and `formula` helpers, `defineWellPlate`, `definePlateEditor` and the lab composables (`useRackEditor`, `useReagentSeries`, `useConcentrationUnits` and similar) |
| `@morscherlab/mint-sdk/shell` | `AppTopBar`, `AppSidebar`, `AppLayout`, `LayoutResizeHandle`, the keyboard and focus helpers, selection and sort primitives, `usePluginWorkspace` and the onboarding API (`defineOnboarding`, `useOnboarding`) |
| `@morscherlab/mint-sdk/data` | `ExperimentSelectorModal`, `ArtifactSelectorModal`, `ArtifactSaveDialog`, `ExperimentPopover`, `ExperimentCodeBadge`, `FilePicker`, `AuditTrail`, `BatchProgressList`, `JobsStatusTray`, `TagsInput`, `SecretInput`, `VersionConflictDialog`, `StaleFormBanner`, `LiveDesignForm`, `useVersionedSave`, `useExperimentData`, `useArtifacts`, `useExperimentNumber`, `useLiveDesign`, `experimentStatus`, `pluginSecret` |
| `@morscherlab/mint-sdk/runtime` | `GeneratedPluginView` and the generated-UI runtime, `RuntimeUpdateNotice`, the realtime API (`useRealtime`, `usePresence`, `PresenceAvatars`), the HTTP client helpers that generated clients use (`createClient`, `useJobsEndpoint`, `useJobCenter`; the deprecated `useApi`), `useForm`, `useFormBuilder`, `preloadFormFieldTypes` and the control-schema helpers |
| `@morscherlab/mint-sdk/stores`, `/permissions`, `/types` | Pinia stores, permission helpers and types |
| `@morscherlab/mint-sdk/host` | Platform-only entry. Plugins do not import it |
| `@morscherlab/mint-sdk/styles` | The SDK style bundle |

There is no `@morscherlab/mint-sdk/components` or `/composables` entry. Import each name from the entry point that holds it. Source: [`packages/sdk-frontend/src/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src) (`index.ts`, `lab.ts`, `shell.ts`, `data.ts`, `runtime.ts`). The tables below list names by area; check the entry point of a name with `mint docs frontend <Name>`.

## Components

Components are documented in the [Component Library](/sdk/components/), where each page lists props and embeds a playground. Source: [`packages/sdk-frontend/src/components/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/components).

`mint doctor` reports each removed or renamed component and prop with its replacement, and `mint docs deprecated-apis` lists them all. For the 1.4 renames, see [Migrate 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4).

Give the complex components one `:spec`, built in `<script setup>`: `PluginWorkspaceView` (`definePluginWorkspaceView`), `FormBuilder` and `SettingsModal` (`defineControlModel`), `DataFrame` (`defineDataFrame`, `v-model:selected`, `v-model:page`), `WellPlate` (`defineWellPlate`) and `PlateEditor` (`definePlateEditor`). `PluginWorkspaceView` renders `AppToastContainer`: remove your own or set `toasts: false`.

## Composables

Typed composables and helper factories. Source: [`packages/sdk-frontend/src/composables/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/composables).

The entry column names the import path (`root` is `@morscherlab/mint-sdk`; the others are subpaths). Import every other name from its subpath.

| Composable | Entry | Returns | Purpose |
|------------|-------|---------|---------|
| `useTheme` | root | theme state + setter | Theme switcher |
| `useToast` | root | `success`, `error`, `warning`, `info` | User feedback. Each takes a message and an options object, for example `toast.success('Saved', { duration: 8000 })`; there is no `show()` |
| `usePlatform` | root | `integrated`, `isAdmin`, `can('use' \| 'configure' \| 'admin')`, plugin, user, theme, features | Read-only platform context. See [usePlatform](/sdk/frontend/composables#useplatform) |
| `useExperiment` | root | read-only `id`, `current`, `status`, `error`, `refresh()` | The selected experiment. See [experiment selection](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment) |
| `useRequest` | root | `isLoading`, errors, timestamps, cancellation | Track request state and ignore stale completions |
| `defineControlModel` | root | compact control model | Generate forms, settings, sidebars and workspaces from one model |
| `downloadBlob` | root | Blob download helper | Save a `Blob` as a file |
| `useApi` | `/runtime` | request client | Deprecated. See [useApi](/sdk/frontend/composables#useapi) |
| `createClient` | `/runtime` | contract-aware plugin API runtime | Generated plugin clients |
| `buildEndpointUrl`, `resolvePluginBaseUrl` | `/runtime` | URL helpers | Link previews and diagnostics that match generated client calls |
| `uploadEndpoint`, `downloadEndpoint` | `/runtime` | multipart / Blob helpers | Generated upload and download endpoint wrappers |
| `useEventStream` | `/runtime` | auth-aware SSE helper | Generated event-stream endpoint wrappers |
| `useSettingsEndpoint` | `/runtime` | plugin settings helpers | Load and save plugin configuration |
| `useJobsEndpoint` | `/runtime` | SDK job lifecycle client | Connect a custom frontend to the plugin's `@job` endpoints |
| `useJobCenter` | `/runtime` | job-center view state | Render a `PluginJobCenterSource` from the jobs client |
| `useRealtime`, `usePresence` | `/runtime` | realtime subscription; viewers of a topic | Platform events and presence. See [useRealtime and usePresence](/sdk/frontend/composables#userealtime-and-usepresence) |
| `createGeneratedAnalysisTransport` | `/runtime` | generated-workspace transport | Experimental runtime behind the SDK-managed generated analysis UI |
| `useForm`, `useFormBuilder` | `/runtime` | reactive form state; schema-driven form runtime | Manual forms and the `FormBuilder` component |
| `preloadFormFieldTypes` | `/runtime` | `Promise<void>` | Load the [field types that load on first use](/sdk/frontend/form-builder#field-types-that-load-on-first-use) before a test looks for them |
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
| `useExperimentData` | `/data` | reactive experiment view | Design and analysis data of an experiment |
| `useExperimentNumber` | `/data` | `code`, `next`, `check(seq)`, `assign()` | Read, check and assign the experiment number (for example `LCM-EXP-011`) |
| `useLiveDesign` | `/data` | `status`, `fields`, `setValue`, `focus`, `blur`, `discard`, `flush`, `retry` | Edit a live design field by field; feeds `LiveDesignForm` |
| `useAppExperiment` | `/data` | provide / inject pattern | Plugin-tree-wide active experiment |
| `useFileImport` | `/data` | delimited file parser state | CSV/TSV import flows |
| `useTextSearch` | `/data` | client-side search | Filterable lists and tables |
| `useFileBrowser` | `/data` | mount/listing/path selection state | Custom server-file UIs against the platform filesystem API |
| `usePlatformFilePickerAdapter` | `/data` | authenticated `PickerAdapter` | Connects `FilePicker` to platform mounts, optionally scoped by `rootLocation` |
| `createFilePickerAdapter` | `/data` | transport-backed `PickerAdapter` | Shared navigation and search for plugin-owned mount APIs |
| `encodePlatformPickerPath`, `decodePlatformPickerPath` | `/data` | opaque picker identity conversion | Convert between picker paths and mount-relative backend references |

### Deprecated in 1.6 {#deprecated-in-1-6}

These exports work in 1.x. MINT 2.0 removes them. `mint doctor` shows each import as a "Deprecated SDK APIs" warning with its replacement, and `mint doctor --strict` counts it. Upgrade steps: [Migrate from 1.5 to 1.6](/sdk/operations/migrate-1.5-to-1.6#frontend-changes).

| Export | Entry | Replacement |
|--------|-------|-------------|
| `useApi` | `/runtime` | See [useApi](/sdk/frontend/composables#useapi) |
| `ApiClientOptions`, `UseApiReturn` | `/runtime` | None; they go with `useApi` |
| `MintApiErrorEnvelope` | root | None. SDK requests throw a `MintApiError`: read `error.code`, `error.requestId` and `error.details` |
| `SettingsAudience`, `SettingsAudienceInput` | root | `AccessAudience`, `AccessAudienceInput` |
| `AvatarSize`, `CollapsibleState`, `ContainerDirection`, `DividerSpacing`, `EmptyStateSize`, `FileUploaderMode`, `FormFieldProps`, `ProgressSize`, `SpinnerSize`, `TooltipPosition` | root | None (component prop unions and helpers) |
| `ScheduleEventCreateContext`, `ScheduleEventUpdateContext`, `ScheduleSlotContext` | root | None (schedule callbacks) |
| `ArtifactSaveMode`, `JobStreamData`, `WellExtendedData` | root | None (data shapes) |

### Removed and renamed composables {#deprecated-composables}

`mint doctor` reports each removed or renamed composable with its replacement. See [Migrate 1.3 to 1.4](/sdk/operations/migrate-1.3-to-1.4) and the earlier migration pages.

## Stores and access policies

| Export | State and methods |
|--------|-------------------|
| `useAuthStore()` | Read-only session: `token`, `tokenExpires`, `userInfo`, `authRequired`, `isInitialized`, `isAuthenticated`, `initialize()`, `clearToken()`. See [useAuthStore](/sdk/frontend/composables#useauthstore) |
| `useExperimentStore()` | `current`, `currentId`, `isResolving`, `error`, `select(record)`, `selectById(id)`, `refresh()`, `clear()` |
| `useSettingsStore()`, `tryUseSettingsStore()` | Shared SDK theme, color palette, table density, and API settings; `tryUseSettingsStore()` returns `null` without an active Pinia |
| `colorPalettes`, `tableDensityToSize()` | Palette definitions (`ColorPalette` is `'default' \| 'colorblind' \| 'purple' \| 'ocean' \| 'forest'`; the settings store writes `html[data-palette]`) and the table size for a density. `paletteCssVariables()`, `PALETTE_CSS_VARIABLES`, `colorPalettes[*].hues` and `settings.getPaletteHues()` are removed: read a palette colour from its CSS token |
| `AccessPolicy`, `AccessControlled` | Nested `access: { permissions, anyPermissions, requiresAuth, requiresAdmin, ... }` policies for access-aware UI |

Destructure Pinia state with `storeToRefs()`, or read it through the store object. Read the selected experiment with `useExperiment()`; see [experiment selection](/sdk/frontend/platform-integration#select-load-edit-and-save-an-experiment). The backend permission checks decide access.

## Utility exports

| Area | Exports |
|------|---------|
| Permissions (`/permissions`) | `ADMIN_ROLE`, `getRoleInfo`, `isAdminRole`, `isAdminUser`, `getAccessAudience`, `getUserPermissions`, `hasAllPermissions`, `hasAnyPermission`, `canAccessByPolicy(user, policy)` (takes an `AccessPolicy`). `ADMIN_PANEL_PERMISSIONS`, `canAccessAdmin()` and `canAccessPlugin()` are removed: the platform owns the admin panel and plugin visibility rules |
| Plugin secrets (`/data`) | The `pluginSecret` namespace: `REF_KEY`, `FORMAT_KEY`, `FORMAT_REF`, `set`, `keep`, `clear`, `isRef`, `isLocked`, `id`, `label`, `state`, `usesReferences`; the types `PluginSecretRef` and `PluginSecretState` |
| Jobs (`/runtime`) | `resolveJobCapabilities`, `normalizeJobPercent`, `normalizeJobState`, `isActiveJobStatus`, `isTerminalJobStatus`, `jobStatusLabel` |
| Generated job forms (experimental, `/runtime`) | `generatedJobFormSchema`, `generatedJobDefaults`, `normalizeGeneratedJobInput` |
| Color (`/lab`) | `hexToHsl`, `hslToHex`, `deriveShade` |
| Plotly (`/lab`) | `mintPlotlyTemplate(element?)`: a Plotly `Template` resolved from the MINT tokens |

The core SDK has no LC-MS helpers, rack or LC-MS-plate helpers, or biology `templates` exports. The LC-MS helpers are in the mld-ms plugins. `SequenceProgressBar` and `InstrumentStateBadge` in `/lab` show sequence progress; the sequence calculation helpers are not exported.

## Generated plugin client helpers

`mint sdk generate` writes `frontend/src/generated/mint-plugin.ts`. It wraps the `/runtime` helpers above with the contract of your plugin. For its exports and call shapes, see [Generated plugin clients](/sdk/frontend/composables#generated-plugin-clients).

## HTTP error types

```ts
import { MintApiError, mintApiErrorFromResponse } from '@morscherlab/mint-sdk'
import { AuthenticationRequiredError } from '@morscherlab/mint-sdk/runtime'
```

| Member of `MintApiError` | Meaning |
|-------------------------|---------|
| `message`, `code`, `status` | Public failure message, machine-readable code, HTTP status |
| `requestId` | Correlation ID or `null` |
| `details` | Structured error details |
| `detail`, `body`, `cause` | Legacy detail, original response, underlying error |

Generated plugin clients (`createClient`) reject a failed response with a `MintApiError`. `AuthenticationRequiredError` extends `MintApiError` for an invalid session (401). A network error has no HTTP response: keep a fallback for it. Example: [Typed HTTP errors](/sdk/frontend/composables#typed-http-errors-in-1-2).

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

## Rules

- Call lifecycle-aware composables inside component setup (`<script setup lang="ts">`).
- Import each component by name from its entry. Do not call `app.use(MINTSdk)`; see [Package entry points](/sdk/frontend/#package-entry-points).
- A plugin that renders a chart declares `plotly.js-dist-min`. See [Charts need Plotly](/sdk/frontend/#charts-need-plotly).
- The SDK sends requests with `fetch` and does not install `axios`. See [useApi](/sdk/frontend/composables#useapi).
- Import the SDK styles as the [setup checklist](/sdk/frontend/#setup-checklist) shows.
- Call plugin routes with the generated client, `download()` or `downloadEndpoint()`. A plain link or a `fetch` without a Bearer credential gets 401; see [Platform authentication gate](/sdk/recipes/route-permissions#platform-authentication-gate).
- To style dropdown, menu and picker panels, use the `.mint-popover` class (menu rows: `.mint-menu-item`). The old classes `.mint-action-menu__panel` and `.mint-searchable-select__panel` do not exist.
- `mint doctor` reports `usePluginApi()`, private SDK subpath imports, direct composable file imports, raw `fetch('/api/...')` plugin calls, the removed `AppSidebar` `variant` prop, and each removed or renamed name. It checks `.vue` files and agent docs such as `CLAUDE.md` and `AGENTS.md`.
