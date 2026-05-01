# Frontend SDK reference

Components, composables, and types exported from `@morscherlab/mint-sdk`. Each entry has a one-line description and a source link. For full prop / type signatures, the TypeScript source is authoritative — type-aware editors give you immediate completion.

## Components

~88 Vue 3 single-file components. Source: [`packages/sdk-frontend/src/components/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend/src/components).

### Layout

| Component | Use |
|-----------|-----|
| `AppLayout` | Page shell with top bar + sidebar slots |
| `AppContainer` | Standalone container without top bar (login, setup) |
| `AppTopBar` | Platform top bar component |
| `AppSidebar` | Sectioned sidebar |
| `AppAvatarMenu` | User avatar + menu |
| `AppPageSelector` | Multi-page selector for plugins with multiple views |
| `AppPillNav` | Pill-style navigation row |
| `AppPluginSwitcher` | Inter-plugin switcher widget |

### Forms

| Component | Use |
|-----------|-----|
| `BaseButton` | Primary button — `variant`, `size`, `loading`, `disabled` |
| `BaseInput` | Text input with label / helper / error |
| `BaseSelect` | Themed `<select>` with options array |
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
| `ConfirmDialog` | Confirm-or-cancel dialog with imperative API |
| `AlertBox` | Inline banner (info / warning / error / success) |
| `ToastNotification` | Toast component used by `useToast` |
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
| `DataFrame` | Sortable / sticky table |
| `Card`, `CollapsibleCard`, `ResourceCard` | Card surfaces |
| `Breadcrumb` | Breadcrumb trail |
| `ScientificNumber` | Formatted scientific number |
| `ChartContainer` | Wrapper around chart libraries (Plotly etc.) |
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
| `WellPlate`, `WellEditPopup`, `PlateMapEditor` | Well-plate editing |
| `RackEditor`, `ReagentEditor`, `ReagentList` | Rack / reagent editing |
| `FormBuilder`, `FormField`, `FormFieldRenderer`, `FormSection`, `FormActions` | Schema-driven forms |
| `ChemicalFormula`, `FormulaInput` | Chemical formula display / input |
| `MoleculeInput` | Molecule structure input |
| `ConcentrationInput`, `UnitInput` | Concentration with units |
| `DoseCalculator` | Dilution / serial-dilution calculator |
| `ProtocolStepEditor` | Protocol step editor |
| `SequenceInput` | DNA / protein sequence input |
| `ScheduleCalendar` | Calendar / scheduling UI |
| `ExperimentTimeline` | Per-experiment timeline |

### Experiment-aware

| Component | Use |
|-----------|-----|
| `ExperimentCodeBadge` | Formatted experiment code (`EXP-001`) |
| `ExperimentDataViewer` | Pretty-print experiment design + analysis |
| `ExperimentPopover` | Hover info for an experiment |
| `ExperimentSelectorModal` | Modal picker for experiments |

### Sample / grouping

| Component | Use |
|-----------|-----|
| `SampleHierarchyTree` | Hierarchical sample tree |
| `SampleLegend` | Legend for sample groups |
| `SampleSelector` | Multi-sample selector |
| `GroupAssigner` | Manual group assignment UI |
| `GroupingModal` | Group creation modal |
| `AutoGroupModal` | Auto-grouping modal (driven by `useAutoGroup`) |
| `BatchProgressList` | Progress for batch operations |

### Theming + utilities

| Component | Use |
|-----------|-----|
| `ThemeToggle` | Theme switcher (Light / Dark / System) |
| `ColorSlider` | Color picker slider |
| `SettingsButton`, `SettingsModal` | Settings UI primitives |
| `FileUploader` | Drag-and-drop file upload |
| `DropdownButton` | Button with attached menu |
| `FitPanel` | Fit-to-container panel |

For full prop signatures, browse the source or the Histoire storybook (`bun run story:dev`, port 6006).

## Composables

29 typed composables. Source: [`packages/sdk-frontend/src/composables/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend/src/composables).

| Composable | Returns | Purpose |
|------------|---------|---------|
| `useApi` | typed fetch helper | Auth-aware API calls |
| `useAuth` | `{ user, isAuthenticated, login, logout }` | Reactive auth state |
| `usePasskey` | passkey registration / login | WebAuthn flows |
| `useTheme` | theme state + setter | Theme switcher |
| `useToast` | toast dispatcher | User feedback |
| `usePlatformContext` | `{ project, experiment }` | Active project / experiment |
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
| `usePluginApi` | plugin-scoped API client | Calls scoped to `/api/<plugin>/` |
| `useExperimentSelector` | reactive experiment picker | Experiment dropdowns |
| `useExperimentData` | reactive experiment view | Live design + analysis |
| `useExperimentSave` | save flow with conflict detection | Save back to experiment |
| `useAppExperiment` | provide / inject pattern | Plugin-tree-wide active experiment |

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
} from '@morscherlab/mint-sdk'
```

For the full list, the TypeScript source is the canonical reference: [`packages/sdk-frontend/src/composables/index.ts`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-frontend/src/composables/index.ts).

## Notes

- All components and composables target Vue 3 with the Composition API. They don't work with Options API.
- Tree-shaking is supported — importing one component pulls only that component into the bundle.
- The `tailwind.preset` and `styles/variables.css` are required for the components to render correctly. See [Frontend → Design tokens](/sdk/frontend/design-tokens).

## Related

- [Components](/sdk/frontend/components) — top-20 with usage examples
- [Composables](/sdk/frontend/composables) — deep dives on the 7 most-used
