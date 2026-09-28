# Frontend SDK reference

Public components, composables, stores, and types from `@morscherlab/mint-sdk` **@MINT_VERSION@**. For exact signatures, use `mint docs frontend <Name>` against the installed SDK or the linked release source. Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for setup and [Platform integration](/sdk/frontend/platform-integration) for complete state/persistence examples.

## Components

Components are documented in the [Component Library](/sdk/components/), where each page lists props and embeds a playground. Source: [`packages/sdk-frontend/src/components/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/components).

Deprecated components and props, scheduled for removal in MINT 1.4:

| Component or prop | Replacement |
|-------------------|-------------|
| `InstrumentStateBadge`, `SequenceProgressBar` | None in the SDK; instrument UI moves to the mld-ms plugins |
| `AutoGroupModal` | `SmartGroupModal` |
| `WellPlate` `showSampleTypeIndicator` (no-op) | None; the sample-type marker encodes the type |
| `JobsStatusTray` `adapter`, `jobs`, `eventStream` | Pass a `source` |
| `AppSidebar` `dense` | Compact is the default; `density="comfortable"` for the roomier layout |
| `sidebarVariant` on workspace views (no-op) | None |

`mint doctor` reports components removed in 1.3 with their replacements.

## Composables

Typed composables and helper factories. Source: [`packages/sdk-frontend/src/composables/`](https://github.com/MorscherLab/MINT/tree/v@MINT_VERSION@/packages/sdk-frontend/src/composables).

| Composable | Returns | Purpose |
|------------|---------|---------|
| `useApi` | typed fetch helper | Auth-aware API calls |
| `useAuth` | auth actions and token helpers | Login/logout/register flows |
| `usePasskey` | passkey registration / login | WebAuthn flows |
| `useTheme` | theme state + setter | Theme switcher |
| `useToast` | toast dispatcher | User feedback |
| `usePlatformContext` | integration, plugin, user, theme, features | Platform shell context |
| `useForm` | reactive form state | Manual form management |
| `useFormBuilder` | schema-driven form runtime | `FormBuilder` component |
| `useWellPlateEditor` | plate state + helpers | Plate-design UIs |
| `useRackEditor` | rack state, undo/redo, `plateEditorListeners` | Hold the plates of a `PlateEditor` |
| `useConcentrationUnits` | concentration math | µM / mg/mL / % conversions |
| `useDoseCalculator` | dilution math | Dose-response calculators |
| `useReagentSeries` | dilution series | Dose-response panel building |
| `useChemicalFormula` | formula parsing + MW | Chemical formula display |
| `useSequenceUtils` | DNA / protein helpers, `findSequenceProblems` | Sequence stats and input validation |
| `useTimeUtils` | time math + slots | Schedule UIs |
| `useScheduleDrag` | drag-to-reschedule | Calendar / timeline |
| `useProtocolTemplates` | protocol step engine | Protocol UIs |
| `useAutoGroup` | sample auto-grouping | Group by name prefix |
| `createPluginClient`, `usePluginClient` | contract-aware plugin API runtime | Generated plugin clients |
| `buildPluginEndpointUrl`, `resolvePluginBaseUrl` | URL helpers | Link previews and diagnostics that match generated client calls |
| `uploadPluginEndpoint`, `downloadPluginEndpoint`, `downloadBlob` | multipart / Blob helpers | Generated upload and download endpoint wrappers |
| `usePluginEventStream` | auth-aware SSE helper | Generated event-stream endpoint wrappers |
| `usePluginSettings` | plugin settings helpers | Load/save plugin configuration |
| `usePluginJobs` | SDK job lifecycle client | Connect a custom frontend to the plugin's `@job` endpoints |
| `usePluginJobCenter` | job-center view state | Render a `PluginJobCenterSource` from `usePluginJobs()` |
| `useAnalysisArtifacts` | artifact list and actions | List and manage analysis artifacts through the platform API |
| `useGeneratedAnalysis`, `createGeneratedAnalysisTransport` | generated-workspace runtime | Experimental runtime behind the SDK-managed generated analysis UI |
| `usePluginWorkspace` | shell, sidebar, and control state | Build a custom shell with the same behavior as `PluginWorkspaceView` |
| `createPluginResourceClient` | list/create/update/remove adapter | Wrap a generated client as a CRUD resource |
| `useExperimentSamples` | design data and derived samples | Feed `SampleSelector`-style UIs from an experiment |
| `useSampleGroups`, `useGroupAssignment` | group hierarchy and two-zone assignment | Sample selectors and control/treatment assignment |
| `useTemplateCollection` | template collection state | Load and save a biology template collection in design data |
| `useBioTemplateControls`, `useBioTemplateComponents` | template schemas and component mappings | Lower-level parts of `useBioTemplateWorkspace` |
| `defineControlComponentBindings`, `defineWellPlateControlProps`, `defineDoseCalculatorControlProps`, `defineWellPlateDoseControlProps`, `defineWellPlateDoseComponentBindings` | control-to-component mappings | Bind generated controls to `WellPlate` / `DoseCalculator` |
| `useRuntimeAlignment` | frontend/backend revision state | Keep a loaded frontend aligned with the backend revision |
| `usePresenceHeartbeat` | presence reporting | Report a visible integrated tab to the platform presence tracker |
| `useMobileSupportGate` | viewport support state | Drive `MobileSupportGate` |
| `useFocusTrap`, `useRovingFocus`, `useMenuKeyboard`, `useListReorder`, `useReorderAnnouncer` | keyboard and screen-reader helpers | Accessible dialogs, tabs, menus, and reorderable lists |
| `useEventListener`, `useDebouncedWatch` | lifecycle-bound listener and debounced watcher | Small utilities used by SDK components |
| `useCurrentExperiment` | injection/URL experiment helper | Resolve an experiment ID and fetch its record; separate from picker selection |
| `useExperimentSelector` | reactive experiment picker | Experiment dropdowns |
| `useExperimentData` | reactive experiment view | Live design + analysis |
| `useExperimentSave` | save/load design data and compatibility analysis results | Save back to experiment |
| `useAppExperiment` | provide / inject pattern | Plugin-tree-wide active experiment |
| `defineControls`, `defineControlModel` | compact control schemas | Generate forms/settings/sidebar/workspaces from one model |
| `useControlSchema`, `useControlWorkspace` | derived control bindings | Lower-level control-driven layouts |
| `defineDoseDesignControlModel` | dose-design preset model | Standard `WellPlate` + `DoseCalculator` workspaces |
| `useBioTemplateWorkspace`, `useBioTemplatePresetWorkspace`, `useBioTemplatePackWorkspace` | biology template bindings | Template-driven design pages |
| `useFileImport` | delimited file parser state | CSV/TSV import flows |
| `useListSelection`, `useSelectionLimit` | selection state | Tables, sample lists, well plates |
| `useTextSearch`, `useSortedItems` | client-side search/sort | Filterable lists and tables |
| `useExpansionSet` | expand/collapse state | Trees and grouped panels |
| `useFileBrowser` | mount/listing/path selection state | Custom server-file UIs against the platform filesystem API |
| `usePlatformFilePickerAdapter` | Authenticated `PickerAdapter` | Connects `FilePicker` to platform mounts, optionally scoped by `rootLocation` |
| `createFilePickerAdapter` | Transport-backed `PickerAdapter` | Shared navigation/search for plugin-owned mount APIs |
| `encodePlatformPickerPath`, `decodePlatformPickerPath` | Opaque picker identity conversion | Convert between picker paths and mount-relative backend references |
| `useRequestSyncState` | loading, errors, timestamps, cancellation | Tracks request feedback while protecting shared state from stale completions |
| `useManualLayoutResize` | Pointer resize state, start/stop, and cleanup | Connect a `LayoutResizeHandle` to application-owned dimensions |
| `resizedLeadingPanelWidth`, `resizedTrailingPanelWidth`, `resizedVerticalSplitPercent` | Bounded dimension helpers | Convert pointer deltas into pane widths or vertical percentages |

### Deprecated composables

Scheduled for removal in MINT 1.4:

| Composable | Replacement |
|------------|-------------|
| `usePluginClient` | `useGeneratedPluginClient()` |
| `useJobsStatusTray` (and its `adapter`, `jobs`, `eventStream` options) | `usePluginJobCenter()` with a `PluginJobCenterSource` |
| `useAutoGroup` | `SmartGroupModal` |

## Stores and access policies

| Export | State and methods |
|--------|-------------------|
| `useAuthStore()` | `userInfo`, `isAuthenticated`, `needsAuth`, `isAdmin`, `isLoading`, `error`, `hasPermission(...)` |
| `useExperimentStore()` | `current`, `currentId`, `isResolving`, `error`, `select(record)`, `selectById(id)`, `clear()` |
| `useSettingsStore()`, `tryUseSettingsStore()` | Shared SDK theme, color palette, table density, and API settings; `tryUseSettingsStore()` returns `null` without an active Pinia |
| `colorPalettes`, `paletteCssVariables()`, `PALETTE_CSS_VARIABLES`, `tableDensityToSize()` | Palette definitions, the `<html>` overrides a palette writes, and the table size for a density |
| `AccessPolicy`, `AccessControlled` | Nested `access: { permissions, anyPermissions, requiresAuth, requiresAdmin, ... }` policies for access-aware UI |

Destructure Pinia state with `storeToRefs()` or read it through the store object. In 1.2, experiment selection is stored once per plugin Pinia instance; `ExperimentSelectorModal` emits only open-state updates. Use `useAppExperiment()` or `PluginWorkspaceView experiment-shell` for top-bar presentation and saving. Backend permissions remain authoritative.

## Utility exports

| Area | Exports |
|------|---------|
| Permissions | `ADMIN_ROLE`, `ADMIN_PANEL_PERMISSIONS`, `getRoleInfo`, `isAdminRole`, `isAdminUser`, `getAccessAudience`, `getUserPermissions`, `hasAllPermissions`, `hasAnyPermission`, `canAccessAdmin`, `canAccessPlugin`, `canAccessByPolicy(user, policy)` (takes an `AccessPolicy`) |
| Plugin secrets | `PLUGIN_SECRET_FORMAT_KEY`, `PLUGIN_SECRET_FORMAT_REF`, `PLUGIN_SECRET_REF_KEY`, `setPluginSecret`, `keepPluginSecret`, `clearPluginSecret`, `isPluginSecretRef`, `isPluginSecretLocked`, `pluginSecretId`, `pluginSecretLabel`, `pluginSecretState`, `usesPluginSecretReferences` |
| Jobs | `resolveJobCapabilities`, `normalizeJobPercent`, `normalizeJobState`, `isActiveJobStatus`, `isTerminalJobStatus`, `jobStatusLabel` |
| Instrument sequences | `sequenceProgressPercent`, `sequenceSamplesRemaining`, `estimateSequenceRemainingSeconds`, `estimateSequenceFinishDate`, `formatSequenceRemaining`, `formatSequenceEta` |
| LC-MS | `DEFAULT_LCMS_SEQUENCE_COLUMNS`, `extractLcmsCommonPrefix`, `extractLcmsSampleName`, `lcmsWellIdFromPosition`, `inferLcmsPlateTypeFromWellIds`, `reconstructLcmsPlateCellsFromSequenceItems`, `basenameFromWindowsPath` |
| Racks and LC-MS plates | `LCMS_DEFAULT_CONTROL_POSITIONS`, `createLcmsControlWellEditData`, `getLcmsDefaultControlWellId`, `lcmsPlateCellsToRack`, `lcmsPlateCellsToRacks`, `lcmsPlateTypeToRackFormat`, `lcmsWellId`, `parseLcmsWellId`, `rackFormatToLcmsPlateType`, `rackToLcmsPlateCells`, `racksToLcmsPlateCells` |
| Generated job forms (experimental) | `generatedJobFormSchema`, `generatedJobDefaults`, `normalizeGeneratedJobInput` |
| Color | `hexToHsl`, `hslToHex`, `deriveShade` |
| Biology templates | Everything from `@morscherlab/mint-sdk/templates` is also re-exported from the package root |
| Plotly | `mintPlotlyTemplate(element?)`: a Plotly `Template` resolved from the MINT tokens |

The instrument-sequence, LC-MS, and rack/LC-MS-plate helpers and the biology `templates/` exports are deprecated and scheduled for removal from the core SDK in MINT 1.4 (the LC-MS helpers move to the mld-ms plugins).

## Generated plugin client helpers

The generated file `frontend/src/generated/mint-plugin.ts` wraps the lower-level helpers above with your plugin's contract:

| Generated export | Purpose |
|------------------|---------|
| `useGeneratedPluginClient()` | Typed endpoint calls |
| `useGeneratedPluginContract()` | Contract metadata, endpoint lookup, URL builders, upload/download adapters |
| `useGeneratedPluginSettings()` | Typed settings values, save/load, and `settingsConfig` for top bars |
| `generatedPluginEndpoints` | Literal endpoint-name array |
| `generatedPluginEndpointDefinitions` | Endpoint method/path/param metadata |
| `buildGeneratedPluginEndpointUrl(name, payload)` | Concrete URL for an endpoint payload |
| `uploadGeneratedPluginEndpoint(name, payload)` | Multipart upload through the generated contract |
| `downloadGeneratedPluginEndpoint(name, payload, filename?)` | Blob download through the generated contract |
| `useGeneratedPluginEventStream(name, payload?, options?)` | SSE stream with auth headers and reconnect |

Generated call signatures follow the backend declaration. The standard scaffold's `/analyze` endpoint has only a JSON body:

```ts
await pluginClient.analyze({ value: 2.5 })
```

For an endpoint combining path/query parameters and a body, the generated signature uses a structured payload. The following shape is illustrative; use the exact generated names and schemas from your own contract:

```ts
await pluginClient.analyze({
  pathParams: { experimentId: 42 },
  query: { dryRun: true },
  body: { parameters: { threshold: 0.05 } },
})
```

Flat parameter fields are also accepted for compatibility on mixed endpoints. A body-only method takes the body directly, without a `body` wrapper. A no-input method takes no payload. Check `mint docs contract .` after `mint sdk generate` and commit both generated files; `mint sdk generate --check` detects drift.

## HTTP error types

```ts
import {
  MintApiError,
  AuthenticationRequiredError,
  mintApiErrorFromResponse,
  type MintApiErrorEnvelope,
} from '@morscherlab/mint-sdk'
```

| Member of `MintApiError` | Meaning |
|-------------------------|---------|
| `message`, `code`, `status` | Public failure message, machine-readable code, HTTP status |
| `requestId` | Correlation ID or `null` |
| `details` | Structured error details |
| `detail`, `body`, `cause` | Legacy detail, original response, underlying error |

Generated plugin clients enable typed HTTP errors. Raw `useApi({ typedErrors: true })` opts in; the default raw client preserves legacy Axios behavior. `AuthenticationRequiredError` extends `MintApiError` for an invalid authenticated session (401). Keep a fallback for network errors that have no HTTP response. See [error handling example](/sdk/frontend/composables#typed-http-errors-in-1-2).

## Exported types

The package re-exports most public types alongside the values:

```ts
import {
  type ApiClientOptions,        // useApi
  type ValidationRule,          // useForm
  type FieldRules,
  type FieldState,
  type UseFormReturn,
  type ConcentrationValue,      // useConcentrationUnits
  type ConcentrationUnit,
  type MolarityUnit,
  type MassVolumeUnit,
  type PercentageUnit,
  type UnitCategory,
  type DilutionParams,          // useDoseCalculator
  type DilutionResult,
  type SerialDilutionParams,
  type SerialDilutionStep,
  type WellConcentration,
  type ParameterDefinition,     // useProtocolTemplates
  type StepTemplate,
  type ParsedElement,           // useChemicalFormula
  type FormulaParseResult,
  type FormulaPart,
  type FormulaPartType,
  type SequenceType,            // useSequenceUtils
  type SequenceStats,
  type LevelEntry,              // useReagentSeries
  type DilutionPreset,
  type RegistryEntry,           // formBuilderRegistry
  type AppExperimentState,      // useAppExperiment
  type PluginContract,          // generated plugin clients
  type PluginEndpointDefinition,
  type PluginEventStreamOptions,
  type UsePluginSettingsReturn,
  type UseCurrentExperimentReturn,
  type ControlSchema,           // compact controls
  type ControlModel,
  type UseControlWorkspaceReturn,
} from '@morscherlab/mint-sdk'
```

Additional public types include `FileSelection`, `FileEntry`, `ServerMount`, `FileDirectoryListing`, `UseFileBrowserOptions`, `UseFileBrowserReturn`, and `UseRequestSyncStateReturn`. For the full list, use the release [composable exports](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/composables/index.ts) and [type exports](https://github.com/MorscherLab/MINT/blob/v@MINT_VERSION@/packages/sdk-frontend/src/types/index.ts).

## Notes

- Examples use Vue 3 Composition API and `<script setup lang="ts">`; call lifecycle-aware composables inside component setup.
- Prefer named imports. Installing `MINTSdk` globally registers the SDK components; do not assume that a global install includes only one component. `PlotlyChart` loads its Plotly runtime on mount.
- Current plugin scaffolds import Tailwind v4 and the SDK style bundle from `frontend/src/style.css`: `@import "tailwindcss";` then `@import "@morscherlab/mint-sdk/styles";`. Keep the SDK import unlayered so Tailwind preflight cannot outrank SDK component styles. See [Frontend → Design tokens](/sdk/frontend/design-tokens).
- For plugin-scoped API calls, prefer `useGeneratedPluginClient()` from `frontend/src/generated/mint-plugin.ts`; use raw `useApi()` for platform APIs outside the plugin contract.
- Dropdown, menu, and picker panels share the `.mint-popover` class hooks (menu rows use `.mint-menu-item`). Style those instead of `.mint-action-menu__panel` or `.mint-searchable-select__panel`; the old classes remain as aliases until MINT 1.4.
- `mint doctor` flags legacy `usePluginApi()`, private SDK subpath imports, direct frontend composable file subpaths, raw plugin API `fetch('/api/...')` calls, and the removed `AppSidebar` `variant` prop (in `.vue` files and in agent docs such as `CLAUDE.md` / `AGENTS.md`).

## Related

- [Component Library](/sdk/components/) — one page per component with usage notes and source links
- [Composables](/sdk/frontend/composables) — deep dives on generated clients, settings, current experiment, controls, and forms
