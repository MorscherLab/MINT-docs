# Frontend SDK reference

Public components, composables, stores, and types from `@morscherlab/mint-sdk` **1.2.0**. For exact signatures, use `mint docs frontend <Name>` against the installed SDK or the linked release source. Follow [Adding a frontend](/sdk/tutorials/adding-a-frontend) for setup and [Platform integration](/sdk/frontend/platform-integration) for complete state/persistence examples.

## Components

Vue 3 component exports. Source: [`packages/sdk-frontend/src/components/`](https://github.com/MorscherLab/MINT/tree/v1.2.0/packages/sdk-frontend/src/components).

### Layout

| Component | Use |
|-----------|-----|
| `AppLayout` | Page shell with optional topbar/sidebar slots |
| `PluginWorkspaceView` | Plugin page shell used by the current `mint init` frontend scaffold |
| `ControlWorkspaceView` | Generate sidebar, top bar, and forms from one control model |
| `BioTemplatePresetWorkspaceView`, `BioTemplatePackWorkspaceView` | Biology preset/pack workspaces with control and persistence bindings |
| `AppContainer` | Standalone container without top bar (login, setup) |
| `AppTopBar` | Platform top bar component |
| `AppSidebar` | Sectioned sidebar |
| `AppAvatarMenu` | User avatar + menu |
| `AppPluginSwitcher` | Inter-plugin switcher widget |

### Forms

| Component | Use |
|-----------|-----|
| `BaseButton` | Primary button — `variant`, `size`, `loading`, `disabled` |
| `BaseInput` | Text / number input; pair with `FormField` for label / hint / error text |
| `BaseSelect` | Themed `<select>` with options array; pair with `FormField` for label |
| `BaseCheckbox` | Single checkbox |
| `BaseRadioGroup` | Grouped radio buttons |
| `BaseSlider` | Range slider |
| `BaseTextarea` | Multi-line input |
| `BaseToggle` | Boolean switch |
| `NumberInput` | Numeric input with stepper |
| `MultiSelect` | Multiple-choice select |
| `DatePicker`, `DateTimePicker`, `TimePicker`, `TimeRangeInput` | Date/time inputs |
| `Calendar` | Calendar widget |
| `TagsInput` | Free-text tag input |
| `SegmentedControl` | Compact tab-like option selector |

### Modals and feedback

| Component | Use |
|-----------|-----|
| `BaseModal` | Standard modal dialog |
| `BaseTabs` | Tab strip + panels |
| `ConfirmDialog` | Confirm-or-cancel dialog controlled with `v-model` |
| `AlertBox` | Inline banner (info / warning / error / success) |
| `AppToastContainer` | Toast host component registered by the SDK install plugin |
| `Tooltip` | Hover-triggered tooltip |
| `EmptyState` | Empty-list placeholder |
| `LoadingSpinner` | Spinner |
| `ProgressBar` | Linear progress |
| `Skeleton` | Loading skeleton |
| `BasePill` | Compact label / status pill |
| `StatusIndicator` | Colored dot for status |

### Data display

| Component | Use |
|-----------|-----|
| `DataFrame` | Searchable, sortable, sticky table with optional row selection, deletion, and column resizing |
| `AppContainer`, `CollapsibleCard`, `ResourceCard` | Card and panel surfaces |
| `Breadcrumb` | Breadcrumb trail |
| `ScientificNumber` | Formatted scientific number |
| `ChartContainer` | Wrapper around chart libraries (Plotly etc.) |
| [`PlotlyChart`](/sdk/components/plotly-chart) | Native Plotly traces with lazy loading, theme, sizing, and lifecycle management |
| `Divider` | Horizontal rule |
| `IconButton` | Icon-only button |
| `Avatar` | User avatar |

### Multi-step

| Component | Use |
|-----------|-----|
| `StepWizard` | Multi-step form with progress indicator |

### Domain widgets

| Component | Use |
|-----------|-----|
| `WellPlate`, `PlateMapEditor` | Well-plate editing |
| `RackEditor`, `ReagentEditor`, `ReagentList` | Rack / reagent editing |
| `FormBuilder`, `FormField`, `FormActions` | Schema-driven forms and form chrome |
| `ChemicalFormula`, `FormulaInput` | Chemical formula display / input |
| `MoleculeInput` | Molecule structure input |
| `ConcentrationInput`, `UnitInput` | Concentration with units |
| `DoseCalculator` | Dilution / serial-dilution calculator |
| `ProtocolStepEditor` | Protocol step editor |
| `SequenceInput` | DNA / protein sequence input |
| `ScheduleCalendar` | Calendar / scheduling UI |
| `ExperimentTimeline` | Per-experiment timeline |
| `SequenceProgressBar` | Instrument sequence progress and time estimates |

### Experiment-aware

| Component | Use |
|-----------|-----|
| `ExperimentCodeBadge` | Formatted experiment code (`LCM-EXP-001`, `DR-EXP-001`, ...) |
| `ExperimentDataViewer` | Pretty-print experiment design + analysis |
| `ExperimentPopover` | Hover info for an experiment |
| `ExperimentSelectorModal` | Modal picker that commits resolved records to `useExperimentStore()` |

### Sample / grouping

| Component | Use |
|-----------|-----|
| `SampleHierarchyTree` | Hierarchical sample tree |
| `SampleLegend` | Legend for sample groups |
| `SampleSelector` | Multi-sample selector |
| `GroupAssigner` | Manual group assignment UI |
| `AutoGroupModal` | Auto-grouping modal (driven by `useAutoGroup`) |
| `SmartGroupModal` | Two-mode smart grouping shell for auto and manual sample grouping |
| `SmartGroupFieldRecipe` | Auto grouping view based on parsed sample fields and QC routing |
| `SmartGroupManual` | Manual cohort builder for irregular sample names |
| `BatchProgressList` | Progress for batch operations |

### Theming + utilities

| Component | Use |
|-----------|-----|
| `ThemeToggle` | Theme switcher (Light / Dark / System) |
| `ColorSlider` | Color picker slider |
| `SettingsModal` | Settings UI primitive |
| `FileUploader` | Drag-and-drop file picker that emits selected `File[]` |
| [`FileBrowserModal`](/sdk/components/file-browser-modal) | Controlled read-only server mount picker returning path references |
| `DropdownButton` | Button with attached menu |
| `FitPanel` | Fit-to-container panel |

For full prop signatures, browse the source or run the local Histoire storybook. For curated live examples, open a page in the [Component Library](/sdk/components/); each component page embeds its own playground.

## Composables

Typed composables and helper factories. Source: [`packages/sdk-frontend/src/composables/`](https://github.com/MorscherLab/MINT/tree/v1.2.0/packages/sdk-frontend/src/composables).

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
| `useAsync`, `useAsyncBatch` | async state helpers | Wrap async operations |
| `useWellPlateEditor` | plate state + helpers | Plate-design UIs |
| `useRackEditor` | rack state | Sample rack UIs |
| `useConcentrationUnits` | concentration math | µM / mg/mL / % conversions |
| `useDoseCalculator` | dilution math | Dose-response calculators |
| `useReagentSeries` | dilution series | Dose-response panel building |
| `useChemicalFormula` | formula parsing + MW | Chemical formula display |
| `useSequenceUtils` | DNA / protein helpers | Sequence stats |
| `useTimeUtils` | time math + slots | Schedule UIs |
| `useScheduleDrag` | drag-to-reschedule | Calendar / timeline |
| `useProtocolTemplates` | protocol step engine | Protocol UIs |
| `useAutoGroup` | sample auto-grouping | Group by name prefix |
| `usePluginConfig` | plugin settings | Read plugin config |
| `createPluginClient`, `usePluginClient` | contract-aware plugin API runtime | Generated plugin clients |
| `buildPluginEndpointUrl`, `resolvePluginBaseUrl` | URL helpers | Link previews and diagnostics that match generated client calls |
| `uploadPluginEndpoint`, `downloadPluginEndpoint`, `downloadBlob` | multipart / Blob helpers | Generated upload and download endpoint wrappers |
| `usePluginEventStream` | auth-aware SSE helper | Generated event-stream endpoint wrappers |
| `usePluginSettings` | plugin settings helpers | Load/save plugin configuration |
| `usePluginJobCenter` | job-center view state | Render a `PluginJobCenterSource` from `usePluginJobs()` |
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
| `useFileBrowser` | mount/listing/path selection state | Drives `FileBrowserModal` against the platform filesystem API |
| `useRequestSyncState` | loading, errors, timestamps, cancellation | Tracks request feedback while protecting shared state from stale completions |

## Stores and access policies

| Export | State and methods |
|--------|-------------------|
| `useAuthStore()` | `userInfo`, `isAuthenticated`, `needsAuth`, `isAdmin`, `isLoading`, `error`, `hasPermission(...)` |
| `useExperimentStore()` | `current`, `currentId`, `isResolving`, `error`, `select(record)`, `selectById(id)`, `clear()` |
| `useSettingsStore()` | Shared SDK theme, API, and display settings |
| `AccessPolicy`, `AccessControlled` | Nested `access: { permissions, anyPermissions, requiresAuth, requiresAdmin, ... }` policies for access-aware UI |

Destructure Pinia state with `storeToRefs()` or read it through the store object. In 1.2, experiment selection is stored once per plugin Pinia instance; `ExperimentSelectorModal` emits only open-state updates. Use `useAppExperiment()` or `PluginWorkspaceView experiment-shell` for top-bar presentation and saving. Backend permissions remain authoritative.

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
  type AsyncError,              // useAsync
  type AsyncState,
  type UseAsyncReturn,
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

Additional public types include `FileSelection`, `FileEntry`, `ServerMount`, `FileDirectoryListing`, `UseFileBrowserOptions`, `UseFileBrowserReturn`, and `UseRequestSyncStateReturn`. For the full list, use the release [composable exports](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/composables/index.ts) and [type exports](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/index.ts).

## Notes

- Examples use Vue 3 Composition API and `<script setup lang="ts">`; call lifecycle-aware composables inside component setup.
- Prefer named imports. Installing `MINTSdk` globally registers the SDK components; do not assume that a global install includes only one component. `PlotlyChart` loads its Plotly runtime on mount.
- Current plugin scaffolds import Tailwind v4 and the SDK style bundle from `frontend/src/style.css`: `@import "tailwindcss";` then `@import "@morscherlab/mint-sdk/styles";`. Keep the SDK import unlayered so Tailwind preflight cannot outrank SDK component styles. See [Frontend → Design tokens](/sdk/frontend/design-tokens).
- For plugin-scoped API calls, prefer `useGeneratedPluginClient()` from `frontend/src/generated/mint-plugin.ts`; use raw `useApi()` for platform APIs outside the plugin contract.
- `mint doctor` flags legacy `usePluginApi()`, private SDK subpath imports, direct frontend composable file subpaths, and raw plugin API `fetch('/api/...')` calls.

## Related

- [Component Library](/sdk/components/) — one page per component with usage notes and source links
- [Composables](/sdk/frontend/composables) — deep dives on generated clients, settings, current experiment, controls, and forms
