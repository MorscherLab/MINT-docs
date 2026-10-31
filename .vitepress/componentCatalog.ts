export type ComponentCategory =
  | 'Layout'
  | 'Forms'
  | 'Feedback'
  | 'Data display'
  | 'Lab widgets'
  | 'Workflow'

export interface ComponentDoc {
  name: string
  category: ComponentCategory
  description: string
  example?: string
  related?: Array<{ text: string; link: string }>
}

const groups: Record<ComponentCategory, string[]> = {
  Layout: [
    'PluginWorkspaceView',
    'AppLayout',
    'AppContainer',
    'AppTopBar',
    'AppSidebar',
    'PluginIcon',
    'Breadcrumb',
    'Divider',
    'LayoutResizeHandle',
    'ResourceCard',
    'CollapsibleCard',
    'SectionCard',
  ],
  Forms: [
    'BaseButton',
    'BaseInput',
    'BaseSelect',
    'BaseCheckbox',
    'BaseRadioGroup',
    'BaseSlider',
    'BaseTabs',
    'SegmentedControl',
    'FormField',
    'DatePicker',
    'TimeRangeInput',
    'Calendar',
    'TagsInput',
    'NumberInput',
    'FileUploader',
    'FilePicker',
    'FormulaInput',
    'SequenceInput',
    'ConcentrationInput',
    'SecretInput',
  ],
  Feedback: [
    'AlertBox',
    'AppToastContainer',
    'ActionMenu',
    'ThemeToggle',
    'RuntimeUpdateNotice',
    'Skeleton',
    'LoadingSpinner',
    'ProgressBar',
    'Avatar',
    'EmptyState',
    'Tooltip',
    'BaseModal',
    'ConfirmDialog',
    'VersionConflictDialog',
    'StaleFormBanner',
    'SettingsModal',
  ],
  'Data display': [
    'DataFrame',
    'ChartContainer',
    'PlotlyChart',
    'ScientificNumber',
    'ChemicalFormula',
    'AdductText',
    'SequenceProgressBar',
    'AuditTrail',
    'BatchProgressList',
    'ExperimentCodeBadge',
    'InstrumentStateBadge',
    'InstrumentStatusPanels',
    'PresenceAvatars',
    'BasePill',
  ],
  'Lab widgets': [
    'WellPlate',
    'PlateEditor',
    'SampleSelector',
    'MoleculeInput',
    'DoseCalculator',
    'SampleHierarchyTree',
    'ProtocolStepEditor',
  ],
  Workflow: [
    'ComponentBindingRenderer',
    'StepWizard',
    'FormBuilder',
    'ScheduleCalendar',
    'ExperimentSelectorModal',
    'ExperimentPopover',
    'ArtifactSaveDialog',
    'ArtifactSelectorModal',
    'JobsStatusTray',
    'GeneratedPluginView',
    'GeneratedResultRenderer',
    'GeneratedPlotlyResult',
    'GeneratedPathInput',
  ],
}

const descriptions: Record<string, string> = {
  AlertBox: 'Inline status, warning, error, and success messages for plugin screens.',
  AppContainer: 'Lightweight content shell for standalone plugin screens and routed views.',
  AppLayout: 'Layout primitive used inside workspace shells; compose your own topbar and sidebar.',
  AppSidebar: 'Sectioned sidebar for plugin-specific navigation and grouped tools.',
  AppTopBar: 'Platform-style top bar for shells that need custom navigation chrome.',
  BaseButton: 'Tokenized action button with variants, sizes, loading, and disabled states.',
  BaseCheckbox: 'Single checkbox control for boolean plugin settings and form fields.',
  BaseInput: 'Themed text and numeric input with error, placeholder, and v-model support.',
  BaseModal: 'Standard modal dialog with controlled visibility and footer slots.',
  BasePill: 'Compact status label for tables, metadata, and small state indicators.',
  BaseSelect: 'Themed select control with option objects, placeholder, and v-model support.',
  ChemicalFormula: 'Formula renderer with scientific typography and element-aware formatting.',
  AdductText: 'Mass-spectrometry adduct notation with compact display and semantic tones.',
  LayoutResizeHandle: 'Accessible splitter with keyboard resizing and pointer-resize events.',
  ConfirmDialog: 'Pre-built confirm-or-cancel dialog for destructive or high-friction actions.',
  DataFrame: 'Searchable, sortable, selectable, resizable table for dense experiment and analysis results.',
  EmptyState: 'Empty-list and empty-view treatment with optional action affordance.',
  PlotlyChart: 'Render native Plotly traces with MINT themes, loading states, resizing and exports.',
  FileUploader: 'Drag-and-drop file picker with accept, size, multiple, and error handling.',
  FilePicker: 'Adapter-driven local and server file navigation with selection and search.',
  FormBuilder: 'Control-model form renderer for experiment-design and plugin settings UIs.',
  FormField: 'Label, hint, error, and accessibility wrapper for form controls.',
  PluginWorkspaceView: 'Default plugin shell with navigation, sidebar, and optional experiment integration.',
  StepWizard: 'Multi-step workflow container with progress, validation, and navigation slots.',
  Tooltip: 'Hover/focus tooltip with smart positioning for compact explanations.',
  PlateEditor: 'Controlled multi-plate editor over WellPlate: plate tabs, format and slot, group assignment, and a single-well inspector.',
  WellPlate: 'Interactive 96- and 384-well plate map with heatmaps, selection, and editing hooks.',
  TimeRangeInput: 'Paired start/end time pickers that validate range order and display computed duration.',
  ResourceCard: 'Card displaying a lab resource with availability status, specs, tags, and a book action.',
  ScheduleCalendar: 'Drag-and-drop week/day calendar for scheduling lab events in configurable time slots.',
  ActionMenu: 'Compact overflow actions with an icon-only trigger and a viewport-safe teleported menu.',
  ArtifactSaveDialog: 'Save/update dialog for analysis artifacts; delegates the write to a plugin-supplied handler.',
  ArtifactSelectorModal: 'Modal for browsing and selecting an analysis artifact of an experiment, with filters and keyboard navigation.',
  SecretInput: 'Edits one plugin secret setting: shows set / not set / provided-by-environment state and submits a replacement, keep, or clear.',
  SectionCard: 'One-card page region from the MINT 1.1 card system: header strip, hairline-separated content, no card-in-card.',
  RuntimeUpdateNotice: 'Fixed-position notice offering a reload when a newer plugin or platform build is ready.',
  JobsStatusTray: 'Floating, source-driven job status tray for plugin and platform workflows.',
  GeneratedPathInput: 'File/folder path picker for backend-declared job inputs in generated plugin UIs.',
  GeneratedPlotlyResult: "Renders a generated job's Plotly result spec, with a static image fallback.",
  GeneratedPluginView: 'Standard generated workspace for a plugin that exposes an SDK job manifest.',
  GeneratedResultRenderer: 'Renders standardized text, table, image, Plotly, JSON, and artifact job results.',
  PresenceAvatars: 'Avatar stack of the other people on a presence topic, with a list of each activity.',
  InstrumentStatusPanels: 'Card with one tab for each typed panel of an instrument live status.',
  VersionConflictDialog: 'Dialog for a save refused with a 412 version conflict; reload or overwrite.',
  StaleFormBanner: 'Strip above a form that someone else changed while it held unsaved edits.',
}

const examples: Record<string, string> = {
  AlertBox: `<AlertBox tone="warning" title="Review required">
  Three samples need QC approval before publishing.
</AlertBox>`,
  BaseButton: `<BaseButton variant="primary" :loading="saving" @click="save">
  Save
</BaseButton>`,
  BaseInput: `<FormField label="Panel name" :error="errors.name" field-id="panel-name">
  <template #default="{ describedBy }">
    <BaseInput v-model="name" :aria-describedby="describedBy" />
  </template>
</FormField>`,
  BaseModal: `<BaseModal v-model:open="showModal" title="Edit panel">
  <p>Modal body content.</p>
  <template #footer>
    <BaseButton variant="ghost" @click="showModal = false">Cancel</BaseButton>
    <BaseButton variant="primary" @click="save">Save</BaseButton>
  </template>
</BaseModal>`,
  ChemicalFormula: `<ChemicalFormula formula="C6H12O6" />`,
  ConfirmDialog: `<ConfirmDialog
  v-model:open="confirmingDelete"
  title="Delete panel?"
  message="This cannot be undone."
  tone="error"
  confirm-label="Delete"
  @confirm="confirmDelete"
/>`,
  DataFrame: `<DataFrame :spec="table" :data="rows" v-model:selected="selectedIds" />`,
  FileUploader: `<FileUploader
  accept=".csv,.xlsx"
  :max-size="100 * 1024 * 1024"
  multiple
  @upload="uploadFiles"
/>`,
  FormBuilder: `<FormBuilder :spec="designModel" v-model="designData" />`,
  PluginWorkspaceView: `<PluginWorkspaceView :spec="workspace" v-model:pill="tab">
  <AppContainer scrollable>
    <router-view />
  </AppContainer>
</PluginWorkspaceView>`,
  StepWizard: `<StepWizard v-model="currentStep" :steps="steps">
  <template #step-basics>
    <!-- basic fields -->
  </template>
  <template #step-review>
    <!-- summary -->
  </template>
</StepWizard>`,
  WellPlate: `<WellPlate
  v-model="selectedWells"
  :format="384"
  :wells="wells"
  selection-mode="multiple"
  size="fill"
/>`,
}

const related: Record<string, ComponentDoc['related']> = {
  FormBuilder: [{ text: 'FormBuilder deep dive', link: '/sdk/frontend/form-builder' }],
  WellPlate: [{ text: 'WellPlate playground', link: '/sdk/components/well-plate' }],
  DataFrame: [{ text: 'Design plugin with tables', link: '/sdk/tutorials/design-plugin-with-tables' }],
  PluginWorkspaceView: [
    { text: 'Adding a frontend', link: '/sdk/tutorials/adding-a-frontend' },
    { text: 'AppLayout', link: '/sdk/components/app-layout' },
    { text: 'AppTopBar', link: '/sdk/components/app-top-bar' },
    { text: 'AppSidebar', link: '/sdk/components/app-sidebar' },
  ],
  AppLayout: [
    { text: 'AppTopBar', link: '/sdk/components/app-top-bar' },
    { text: 'AppSidebar', link: '/sdk/components/app-sidebar' },
    { text: 'AppContainer', link: '/sdk/components/app-container' },
    { text: 'PluginWorkspaceView', link: '/sdk/components/plugin-workspace-view' },
  ],
  AppTopBar: [
    { text: 'AppLayout', link: '/sdk/components/app-layout' },
    { text: 'AppSidebar', link: '/sdk/components/app-sidebar' },
    { text: 'AppToastContainer', link: '/sdk/components/app-toast-container' },
  ],
  AppSidebar: [
    { text: 'AppLayout', link: '/sdk/components/app-layout' },
    { text: 'AppTopBar', link: '/sdk/components/app-top-bar' },
  ],
  AppContainer: [{ text: 'AppLayout', link: '/sdk/components/app-layout' }],
}

export function componentSlug(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function defaultDescription(name: string, category: ComponentCategory): string {
  return `${name} is a ${category.toLowerCase()} component exported by @morscherlab/mint-sdk for plugin frontends.`
}

export const componentDocs: ComponentDoc[] = Object.entries(groups).flatMap(([category, names]) =>
  names.map((name) => ({
    name,
    category: category as ComponentCategory,
    description: descriptions[name] ?? defaultDescription(name, category as ComponentCategory),
    example: examples[name],
    related: related[name],
  })),
)

export const componentCategories = Object.keys(groups) as ComponentCategory[]

export const componentSidebarGroups = componentCategories.map((category) => ({
  text: category,
  collapsed: true,
  items: groups[category].map((name) => ({
    text: name,
    link: `/sdk/components/${componentSlug(name)}`,
  })),
}))

export function getComponentDoc(name: string): ComponentDoc | undefined {
  return componentDocs.find((component) => component.name === name)
}
