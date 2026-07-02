<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import '@morscherlab/mint-sdk/styles'
import {
  AlertBox,
  AppAvatarMenu,
  AppContainer,
  AppLayout,
  AppPluginSwitcher,
  AppSidebar,
  AppToastContainer,
  AppTopBar,
  AuditTrail,
  AutoGroupModal,
  Avatar,
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseModal,
  BasePill,
  BaseRadioGroup,
  BaseSelect,
  BaseSlider,
  BaseTabs,
  BaseTextarea,
  BaseToggle,
  Breadcrumb,
  Calendar,
  ChartContainer,
  BioTemplateExperimentWorkspaceView,
  BioTemplatePackWorkspaceView,
  BioTemplatePresetWorkspaceView,
  BioTemplateRenderer,
  ChemicalFormula,
  CollapsibleCard,
  ColorSlider,
  ComponentBindingRenderer,
  ConcentrationInput,
  ControlWorkspaceView,
  ConfirmDialog,
  DataFrame,
  DatePicker,
  DateTimePicker,
  Divider,
  DropdownButton,
  EmptyState,
  BatchProgressList,
  DoseCalculator,
  DoseDesignWorkspaceView,
  ExperimentCodeBadge,
  ExperimentDataViewer,
  ExperimentPopover,
  ExperimentSelectorModal,
  ExperimentTimeline,
  FileUploader,
  FitPanel,
  FormBuilder,
  FormulaInput,
  FormActions,
  FormField,
  GroupAssigner,
  IconButton,
  InstrumentAlertLog,
  InstrumentStateBadge,
  InstrumentStatusCard,
  LcmsSequenceTable,
  LoadingSpinner,
  MoleculeInput,
  MultiSelect,
  NumberInput,
  PlateMapEditor,
  PluginIcon,
  PluginWorkspaceView,
  ProgressBar,
  ProtocolStepEditor,
  RackEditor,
  ReagentEditor,
  ReagentList,
  ResourceCard,
  SampleLegend,
  SampleHierarchyTree,
  SampleSelector,
  ScheduleCalendar,
  ScientificNumber,
  SegmentedControl,
  SequenceInput,
  SequenceProgressBar,
  SettingsModal,
  SmartGroupFieldRecipe,
  SmartGroupManual,
  SmartGroupModal,
  Skeleton,
  StatusIndicator,
  StepWizard,
  TagsInput,
  ThemeToggle,
  TimePicker,
  TimeRangeInput,
  WellPlate,
  UnitInput,
  Tooltip,
} from '@morscherlab/mint-sdk/components'
import { useApi, useToast } from '@morscherlab/mint-sdk/composables'
import {
  createLcmsBatchCollection,
  createWellPlateScreenCollection,
} from '@morscherlab/mint-sdk/templates'

const props = defineProps<{
  name: string
}>()

const toast = useToast()
const textValue = ref('Dose-response panel')
const notesValue = ref('QC reviewed, ready to publish.')
const selectValue = ref('dose')
const checkboxValue = ref(true)
const toggleValue = ref(true)
const radioValue = ref('treated')
const sliderValue = ref(72)
const activeTab = ref('results')
const multiValue = ref<(string | number)[]>(['qc', 'treated'])
const tagsValue = ref(['control', 'dose'])
const modalOpen = ref(false)
const confirmOpen = ref(false)
const selectedRows = ref<(string | number)[]>([2])
const dataFrameColumnWidths = ref<Record<string, number>>({})
const selectedWells = ref(['B2', 'H12', 'P24'])
const currentStep = ref(1)
const smartGroupMode = ref<'auto' | 'manual'>('auto')
const colorValue = ref(42)
const segmentedValue = ref('plate')
const dropdownValue = ref('export')
const activeShellView = ref('analysis')
const numberValue = ref(96)
const formulaValue = ref('C6H12O6')
const sequenceValue = ref('ATGCGTAGCTAGGCTAATCG')
const unitValue = ref(25)
const unitName = ref('uL')
const concentrationValue = ref({ value: 10, unit: 'nM' })
const dateValue = ref('2026-05-29')
const timeValue = ref('14:30')
const dateTimeValue = ref('2026-05-29T14:30')
const timeRangeValue = ref({ start: '09:00', end: '11:30' })
const calendarValue = ref(new Date(2026, 4, 29))
const cardToggleValue = ref(true)
const sampleLegendValue = ref('treated')
const settingsDemoOpen = ref(false)
const autoGroupDemoOpen = ref(false)
const isClient = ref(false)
const activeRackId = ref('rack-1')
const formBuilderValues = ref<Record<string, unknown>>({
  panelName: 'Dose-response panel',
  method: 'four-pl',
  normalize: true,
  threshold: 0.05,
  tags: ['qc', 'dose'],
})
const sampleSelection = ref(['Vehicle_A1', 'Drug_A1', 'Drug_A2'])
const sampleGroups = ref([
  { name: 'Vehicle', color: '#2563eb', samples: ['Vehicle_A1', 'Vehicle_A2'] },
  { name: 'Drug / Low', color: '#f97316', samples: ['Drug_A1', 'Drug_A2'] },
  { name: 'Drug / High', color: '#dc2626', samples: ['Drug_B1', 'Drug_B2'] },
  { name: 'QC', color: '#16a34a', samples: ['QC_01', 'QC_02'] },
])
const assignedControlGroups = ref(['Vehicle'])
const assignedTreatmentGroups = ref(['Drug / Low', 'Drug / High'])
const protocolStepValue = ref({
  id: 'step-edit',
  type: 'incubation',
  name: 'Incubate plate',
  description: 'Incubate treated and control wells before LC-MS extraction.',
  duration: 45,
  status: 'in_progress',
  order: 1,
  parameters: { temperature: 37, unit: 'C' },
})
const reagentEditorValue = ref({
  id: 'reagent-dose',
  name: 'MINT-2847',
  color: '#f97316',
  axis: 'column',
  startPosition: '2',
  levels: [
    { value: 0, replicates: 2 },
    { value: 1, replicates: 2 },
    { value: 10, replicates: 2 },
    { value: 100, replicates: 2 },
  ],
  unit: 'nM',
})
const reagentListValue = ref([
  {
    id: 'reagent-1',
    name: 'MINT-2847',
    catalogNumber: 'MT-2847',
    lotNumber: 'L2026-014',
    expiryDate: '2026-12-31',
    storageCondition: '-20C',
    location: 'Freezer 2 / Box A',
    stockLevel: 68,
    stockUnit: 'uL',
    supplier: 'Morscher Lab',
  },
  {
    id: 'reagent-2',
    name: 'Vehicle',
    lotNumber: 'DMSO-77',
    expiryDate: '2026-07-15',
    storageCondition: 'RT',
    location: 'Chemical cabinet',
    stockLevel: 18,
    stockUnit: 'mL',
    supplier: 'Sigma',
  },
])

const selectOptions = [
  { value: 'dose', label: 'Dose response' },
  { value: 'qc', label: 'QC review' },
  { value: 'export', label: 'Export' },
]

const radioOptions = [
  { value: 'control', label: 'Control' },
  { value: 'treated', label: 'Treated' },
  { value: 'blank', label: 'Blank' },
]

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'results', label: 'Results', badge: 12 },
  { id: 'settings', label: 'Settings' },
]

const resultColumns = [
  { key: 'id', label: 'Run', align: 'center', sortable: true },
  { key: 'compound', label: 'Compound', sortable: true },
  { key: 'well', label: 'Well', align: 'center' },
  { key: 'response', label: 'Response %', align: 'right', sortable: true },
  { key: 'status', label: 'Status' },
]

const resultRows = [
  { id: 1, compound: 'MINT-2847', well: 'A1', response: 98, status: 'Pass' },
  { id: 2, compound: 'MINT-3192', well: 'A2', response: 93.4, status: 'Pass' },
  { id: 3, compound: 'Vehicle', well: 'A3', response: 3.5, status: 'Pass' },
  { id: 4, compound: 'MINT-2847', well: 'B1', response: 84.2, status: 'Flagged' },
]

const plateWells = Object.fromEntries(
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => {
      const id = `${String.fromCharCode(65 + row)}${col + 1}`
      const value = Math.max(0.05, 1 - (row + col) / 19)
      return [id, { state: 'filled', sampleType: col % 3 === 0 ? 'control' : 'sample', value }]
    }),
  ).flat(),
)

const wizardSteps = [
  { id: 'setup', label: 'Setup', description: 'Configure metadata' },
  { id: 'samples', label: 'Samples', description: 'Choose wells' },
  { id: 'review', label: 'Review', description: 'Confirm' },
]

const segmentedOptions = [
  { value: 'plate', label: 'Plate', description: '96/384 well layout' },
  { value: 'table', label: 'Table', description: 'Tabular sample list' },
  { value: 'timeline', label: 'Timeline', description: 'Protocol schedule' },
]

const dropdownOptions = [
  { value: 'export', label: 'Export CSV', description: 'Download processed results' },
  { value: 'archive', label: 'Archive run', description: 'Move to project history' },
  { value: 'rerun', label: 'Re-run analysis', description: 'Start from current settings' },
]

const unitOptions = [
  { value: 'uL', label: 'uL', factor: 1, group: 'Volume' },
  { value: 'mL', label: 'mL', factor: 1000, group: 'Volume' },
  { value: 'mg', label: 'mg', factor: 1, group: 'Mass' },
  { value: 'g', label: 'g', factor: 1000, group: 'Mass' },
]

const breadcrumbItems = [
  { label: 'Project' },
  { label: 'Experiment' },
  { label: 'Dose response' },
]

const calendarMarkers = [
  { date: '2026-05-28', color: '#0ea5e9', label: 'LC-MS run', type: 'dot' },
  { date: '2026-05-29', color: '#f97316', label: 'Review due', type: 'highlight' },
  { date: '2026-05-31', color: '#22c55e', label: 'Export ready', type: 'bar' },
]

const resourceSpecs = [
  { label: 'Mode', value: 'ESI+' },
  { label: 'Queue', value: '3 runs' },
  { label: 'Runtime', value: '42 min' },
]

const pluginIconPath = 'M13 10V3L4 14h7v7l9-11h-7z'

const auditEntries = [
  {
    id: 'audit-3',
    type: 'update',
    action: 'QC thresholds updated',
    detail: 'Z-score cutoff changed from 2.5 to 3.0.',
    user: 'MINT Admin',
    timestamp: '2026-05-29T10:20:00Z',
    metadata: { plugin: 'dose-response' },
  },
  {
    id: 'audit-2',
    type: 'create',
    action: 'Plate design imported',
    detail: '96 wells, 8 controls, 3 dose levels.',
    user: 'Analysis Lead',
    timestamp: '2026-05-29T08:45:00Z',
  },
  {
    id: 'audit-1',
    type: 'system',
    action: 'Experiment initialized',
    detail: 'Project workspace and default permissions were created.',
    timestamp: '2026-05-28T15:30:00Z',
  },
]

const batchItems = [
  { id: 'batch-1', label: 'Read metadata', status: 'completed' },
  { id: 'batch-2', label: 'Normalize peak areas', status: 'completed' },
  { id: 'batch-3', label: 'Fit dose curves', status: 'processing', progress: 62 },
  { id: 'batch-4', label: 'Generate report', status: 'pending' },
  { id: 'batch-5', label: 'Upload QC attachment', status: 'error', message: 'Checksum mismatch on retry.' },
]

const sequenceProgress = {
  sequence_name: 'MINT_Dose_Response_042',
  current_sample: 18,
  total_samples: 48,
  elapsed_seconds: 3240,
  estimated_remaining_seconds: 5400,
  current_sample_name: 'Sample B07',
  current_method: 'polar_pos_12min.raw',
}

const instrumentStatus = {
  instrument_id: 'orbitrap-01',
  instrument_name: 'Orbitrap 01',
  state: 'running',
  active_method: 'polar_pos_12min.meth',
  current_sample: {
    file_name: 'MINT_042_POS_B07.raw',
    sample_id: 'B07',
    sample_name: 'Treatment B07',
    vial_position: 'B:07',
    injection_volume: 2,
  },
  sequence_progress: sequenceProgress,
  timestamp: '2026-05-29T12:25:00Z',
  last_seen: '2026-05-29T12:25:00Z',
}

const instrumentAlerts = [
  {
    id: 'alert-1',
    instrument_id: 'orbitrap-01',
    instrument_name: 'Orbitrap 01',
    level: 'warning',
    message: 'Source pressure drift',
    body: { source: 'Monitor', detail: 'Pressure drift exceeded warning threshold.', code: 204 },
    timestamp: '2026-05-29T12:10:00Z',
  },
  {
    id: 'alert-2',
    instrument_id: 'lcms-02',
    instrument_name: 'LCMS 02',
    level: 'info',
    message: 'Sequence completed',
    body: { source: 'Sequence', detail: 'Batch QC sequence completed successfully.' },
    timestamp: '2026-05-29T11:40:00Z',
    acknowledged: true,
  },
]

const lcmsSequenceItems = [
  {
    sample_type: 'Blank',
    file_name: 'MINT_042_blank_001',
    sample_id: 'blank-1',
    path: 'D:\\Data\\MINT_042_blank_001.raw',
    instrument_method: 'D:\\Methods\\polar_pos_12min.meth',
    position: 'A:01',
    injection_volume: 2,
  },
  {
    sample_type: 'QC',
    file_name: 'MINT_042_qc_002',
    sample_id: 'qc-1',
    path: 'D:\\Data\\MINT_042_qc_002.raw',
    instrument_method: 'D:\\Methods\\polar_pos_12min.meth',
    position: 'A:02',
    injection_volume: 2,
  },
  {
    sample_type: 'Unknown',
    file_name: 'MINT_042_sample_B07',
    sample_id: 'B07',
    path: 'D:\\Data\\MINT_042_sample_B07.raw',
    instrument_method: 'D:\\Methods\\polar_pos_12min.meth',
    position: 'B:07',
    injection_volume: 2,
  },
]

const sampleLegendItems = [
  { id: 'control', name: 'Control', color: '#2563eb', count: 16 },
  { id: 'treated', name: 'Treated', color: '#f97316', count: 64 },
  { id: 'qc', name: 'QC', color: '#16a34a', count: 8 },
]

const scheduleEvents = [
  {
    id: 'schedule-1',
    title: 'LC-MS run',
    start: '2026-05-29T09:00:00',
    end: '2026-05-29T11:30:00',
    status: 'confirmed',
    color: '#0ea5e9',
    draggable: false,
    resizable: false,
  },
  {
    id: 'schedule-2',
    title: 'QC review',
    start: '2026-05-29T13:00:00',
    end: '2026-05-29T14:00:00',
    status: 'pending',
    color: '#f97316',
    draggable: false,
    resizable: false,
  },
]

const scheduleBlockedSlots = [
  { start: '2026-05-29T12:00:00', end: '2026-05-29T13:00:00', label: 'Instrument maintenance' },
]

const fitResults = [
  { label: 'EC50', value: '2.4 µM', variant: 'success' },
  { label: 'Hill slope', value: '1.18' },
  { label: 'R2', value: '0.992', variant: 'success' },
  { label: 'Flagged wells', value: 2, variant: 'warning' },
]

const protocolSteps = [
  {
    id: 'step-1',
    type: 'addition',
    name: 'Add reagent',
    description: 'Dispense compound dilution series across columns 2-9.',
    duration: 15,
    status: 'completed',
    order: 1,
    parameters: { reagent: 'MINT-2847', volume: '10 uL' },
  },
  {
    id: 'step-2',
    type: 'incubation',
    name: 'Incubate plate',
    description: 'Incubate at 37 C before extraction.',
    duration: 45,
    status: 'in_progress',
    order: 2,
    parameters: { temperature: '37 C', atmosphere: '5% CO2' },
  },
  {
    id: 'step-3',
    type: 'measurement',
    name: 'LC-MS acquisition',
    duration: 120,
    status: 'pending',
    order: 3,
    parameters: { method: 'polar_pos_12min.meth' },
  },
]

const groupAssignerGroups = [
  { name: 'Vehicle', color: '#2563eb', count: 16 },
  { name: 'Drug / Low', color: '#f97316', count: 24 },
  { name: 'Drug / High', color: '#dc2626', count: 24 },
  { name: 'QC', color: '#16a34a', count: 8 },
]

const sampleTreeNodes = [
  {
    id: 'study-dose',
    label: 'Dose Response Study',
    type: 'study',
    badge: 2,
    children: [
      {
        id: 'exp-mint-042',
        label: 'MINT-EXP-2026-0042',
        type: 'experiment',
        badge: 'active',
        badgeVariant: 'success',
        children: [
          {
            id: 'plate-a',
            label: 'Plate A',
            type: 'plate',
            children: [
              { id: 'sample-vehicle-a1', label: 'Vehicle_A1', type: 'sample', badge: 'control' },
              { id: 'sample-drug-a1', label: 'Drug_A1', type: 'sample', badge: 'treated', badgeVariant: 'warning' },
            ],
          },
        ],
      },
    ],
  },
]

const experimentSummaryData = {
  metadata: {
    experiment_code: 'MINT-EXP-2026-0042',
    project: 'Metabolomics QC',
    plugin: 'Dose response',
  },
  sections: [
    {
      key: 'qc',
      label: 'QC Summary',
      type: 'table',
      columns: ['metric', 'value', 'status'],
      rows: [
        { metric: 'Median CV', value: '8.2%', status: 'pass' },
        { metric: 'Blank carryover', value: '0.4%', status: 'pass' },
      ],
      row_count: 2,
    },
  ],
}

const experimentTableColumns = [
  { key: 'sample', label: 'Sample', sortable: true },
  { key: 'group', label: 'Group', sortable: true },
  { key: 'response', label: 'Response', align: 'right', sortable: true },
]

const experimentTableRows = [
  { sample: 'Vehicle_A1', group: 'Vehicle', response: 3.5 },
  { sample: 'Drug_A1', group: 'Drug / Low', response: 51.2 },
  { sample: 'Drug_B1', group: 'Drug / High', response: 91.7 },
]

const shellPillNav = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'results', label: 'Results', badge: 12 },
  { id: 'settings', label: 'Settings' },
]

const topBarPages = [
  { id: 'workspace', label: 'Workspace', hint: 'Home' },
  { id: 'experiments', label: 'Experiments', hint: '28 mine' },
  { id: 'plugins', label: 'Plugins', hint: '4 installed' },
]

const accountMenuItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings', rightLabel: 'S' },
  { id: 'divider', label: '', divider: true },
  { id: 'docs', label: 'Documentation', href: '/sdk/components' },
]

const pluginSwitcherInfo = {
  current: { id: 'dose', label: 'Dose Response', version: '1.0.41', color: '#f97316' },
  plugins: [
    { id: 'dose', label: 'Dose Response', version: '1.0.41', color: '#f97316' },
    { id: 'lcms', label: 'LC-MS Batch', version: '0.9.4', color: '#0ea5e9' },
    { id: 'qc', label: 'QC Review', version: '0.4.1', color: '#16a34a' },
  ],
  installHref: '/workflow/plugins',
}

const appSidebarPanels = {
  analysis: [
    { id: 'parameters', label: 'Parameters', subtitle: 'Model and thresholds', defaultOpen: true, badge: 2 },
    { id: 'filters', label: 'Filters', subtitle: 'QC visibility', defaultOpen: false },
  ],
  results: [
    { id: 'display', label: 'Display', subtitle: 'Chart options', defaultOpen: true },
    { id: 'export', label: 'Export', subtitle: 'Result files', defaultOpen: false },
  ],
}

const formBuilderSchema = {
  sections: [
    {
      id: 'analysis',
      title: 'Analysis settings',
      description: 'Example schema that plugin authors can ship with a frontend.',
      columns: 2,
      fields: [
        {
          name: 'panelName',
          label: 'Panel name',
          type: 'text',
          placeholder: 'Dose-response panel',
          validation: { required: true },
        },
        {
          name: 'method',
          label: 'Fit model',
          type: 'select',
          props: {
            options: [
              { value: 'four-pl', label: '4-parameter logistic' },
              { value: 'linear', label: 'Linear' },
              { value: 'spline', label: 'Spline' },
            ],
          },
        },
        {
          name: 'threshold',
          label: 'QC threshold',
          type: 'number',
          props: { min: 0, max: 1, step: 0.01 },
          hint: 'Acceptable median CV cutoff.',
        },
        {
          name: 'normalize',
          label: 'Normalize intensities',
          type: 'toggle',
          hint: 'Scale peak areas before fitting.',
        },
        {
          name: 'tags',
          label: 'Tags',
          type: 'tags',
          colSpan: 2,
          props: { suggestions: ['qc', 'dose', 'vehicle', 'blank'] },
        },
      ],
    },
  ],
  submitLabel: 'Save design',
  showCancel: true,
}

const rackEditorValue = ref([
  {
    id: 'rack-1',
    name: 'Sample Rack',
    format: 96,
    slot: 'R',
    injectionVolume: 2,
    wells: {
      A1: { id: 'A1', row: 0, col: 0, state: 'filled', sampleType: 'control', metadata: { label: 'Vehicle_A1' } },
      A2: { id: 'A2', row: 0, col: 1, state: 'filled', sampleType: 'sample', metadata: { label: 'Drug_A1' } },
      B1: { id: 'B1', row: 1, col: 0, state: 'filled', sampleType: 'qc', metadata: { label: 'QC_01' } },
    },
  },
  {
    id: 'rack-2',
    name: 'Backup Rack',
    format: 54,
    slot: 'G',
    injectionVolume: 5,
    wells: {},
  },
])

const plateEditorSamples = [
  { id: 'control', name: 'Control', color: '#2563eb', count: 2 },
  { id: 'treated', name: 'Treated', color: '#f97316', count: 2 },
  { id: 'qc', name: 'QC', color: '#16a34a', count: 1 },
]

const plateMapState = ref({
  plates: [
    {
      id: 'plate-a',
      name: 'Plate A',
      format: 96,
      wells: {
        A1: { id: 'A1', row: 0, col: 0, state: 'filled', sampleType: 'control' },
        A2: { id: 'A2', row: 0, col: 1, state: 'filled', sampleType: 'control' },
        B1: { id: 'B1', row: 1, col: 0, state: 'filled', sampleType: 'treated' },
        B2: { id: 'B2', row: 1, col: 1, state: 'filled', sampleType: 'treated' },
        H12: { id: 'H12', row: 7, col: 11, state: 'filled', sampleType: 'qc' },
      },
    },
  ],
  activePlateId: 'plate-a',
  samples: plateEditorSamples,
  selectedWells: ['A1', 'A2'],
  activeSampleId: 'treated',
})

const moleculeValue = ref({
  smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
  molfile: '',
})

const componentBindings = [
  {
    id: 'dose-table',
    component: 'DataFrame',
    template_id: 'results.table',
    description: 'A generated result table binding.',
    propsObject: {
      data: resultRows,
      columns: resultColumns,
      rowKey: 'id',
      searchable: false,
      sortable: true,
      stickyHeader: true,
      pagination: false,
    },
  },
  {
    id: 'plate-preview',
    component: 'WellPlate',
    template_id: 'design.plate',
    description: 'A generated plate preview binding.',
    propsObject: {
      wells: plateWells,
      selectionMode: 'multiple',
      modelValue: ['B2', 'B3', 'C2'],
      size: 'fill',
    },
  },
]

const controlWorkspaceValues = ref<Record<string, unknown>>({
  threshold: 0.1,
  method: 'logistic',
  chartScale: 'linear',
})

const controlWorkspaceControls = {
  threshold: {
    type: 'number',
    label: 'Threshold',
    default: 0.05,
    min: 0,
    max: 1,
    section: 'parameters',
    sectionLabel: 'Parameters',
    view: 'analysis',
  },
  method: {
    label: 'Method',
    default: 'linear',
    options: ['linear', 'logistic', 'spline'],
    section: 'parameters',
    view: 'analysis',
  },
  chartScale: {
    label: 'Scale',
    default: 'linear',
    options: ['linear', 'log'],
    section: 'display',
    sectionLabel: 'Display',
    view: 'results',
  },
}

const controlWorkspaceOptions = {
  views: {
    analysis: { label: 'Run' },
    results: { label: 'Results' },
  },
  topBarSettings: {
    title: 'Workspace settings',
    showAppearance: false,
  },
}

const doseDesignValues = ref<Record<string, unknown>>({})
const doseDesignOptions = {
  selectedWells: ['A1', 'A2', 'B1', 'B2'],
  plateFormat: 96,
  includeMolecularWeight: true,
}

const bioTemplateValues = ref<Record<string, unknown>>({
  sampleNames: ['Vehicle', 'Drug'],
  unit: 'nM',
})

const wellplateScreenTemplate = createWellPlateScreenCollection({
  samples: ['Vehicle', 'Treatment'],
  compounds: {
    'MINT-2847': [0, 1, 10, 100],
  },
  unit: 'nM',
})

const lcmsBatchTemplate = createLcmsBatchCollection({
  samples: ['Blank', 'Pooled QC', 'S001', 'S002'],
  features: ['Glucose', 'Lactate', 'Citrate'],
  instrument: 'Orbitrap LC-MS',
  method: 'HILIC negative',
  includeQc: true,
})

const bioTemplateStatus = {
  hasExperiment: true,
  currentExperimentId: 42,
  lastLoadedAt: null,
  lastSavedAt: null,
}

const bioTemplateActions = {
  load: () => undefined,
  reset: () => undefined,
  save: () => undefined,
}

const experimentSelectorOpen = ref(false)
const selectedExperiment = ref<Record<string, unknown> | null>(null)
const selectedExperimentLabel = computed(() => {
  const experiment = selectedExperiment.value
  if (!experiment) return ''
  const code = typeof experiment.experiment_code === 'string' ? experiment.experiment_code : ''
  const name = typeof experiment.name === 'string' ? experiment.name : 'Selected experiment'
  return code ? `${code} - ${name}` : name
})
const selectedExperimentId = computed(() => {
  const id = selectedExperiment.value?.id
  return typeof id === 'number' ? id : null
})

const mockExperiments = [
  {
    id: 1,
    experiment_code: 'DR-HeLa-DOX-001',
    name: 'Doxorubicin dose-response in HeLa cells',
    status: 'completed',
    experiment_type: 'dose_response',
    project: 'Oncology Screen Q1',
    project_name: 'Oncology Screen Q1',
    created_at: '2026-02-28T14:30:00Z',
    updated_at: '2026-03-01T09:15:00Z',
    has_design_data: true,
  },
  {
    id: 2,
    experiment_code: 'LCMS-QC-042',
    name: 'LC-MS pooled QC validation',
    status: 'ongoing',
    experiment_type: 'lcms_batch',
    project: 'Metabolomics QC',
    project_name: 'Metabolomics QC',
    created_at: '2026-05-20T09:00:00Z',
    updated_at: '2026-05-22T11:30:00Z',
    has_design_data: true,
  },
  {
    id: 3,
    experiment_code: 'DR-PANC1-GEM-003',
    name: 'Gemcitabine IC50 in PANC-1',
    status: 'planned',
    experiment_type: 'dose_response',
    project: 'Pancreatic Cancer',
    project_name: 'Pancreatic Cancer',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-02T11:30:00Z',
    has_design_data: false,
  },
]

const mockExperimentTypes = [
  { value: 'dose_response', label: 'Dose response', color: '#3b82f6' },
  { value: 'lcms_batch', label: 'LC-MS batch', color: '#10b981' },
]

const mockProjects = [
  { id: 1, name: 'Oncology Screen Q1' },
  { id: 2, name: 'Metabolomics QC' },
  { id: 3, name: 'Pancreatic Cancer' },
]

function handleExperimentSelect(experiment: Record<string, unknown>) {
  selectedExperiment.value = experiment
}

function handleExperimentDeselect() {
  selectedExperiment.value = null
}

function filterMockExperiments(url: string) {
  const params = new URLSearchParams(url.split('?')[1] ?? '')
  const status = params.get('status')
  const experimentType = params.get('experiment_type')
  const project = params.get('project')
  const search = params.get('search')?.toLowerCase()
  const skip = Number(params.get('skip') ?? 0)
  const limit = Number(params.get('limit') ?? 100)

  let filtered = [...mockExperiments]
  if (status) filtered = filtered.filter(experiment => experiment.status === status)
  if (experimentType) filtered = filtered.filter(experiment => experiment.experiment_type === experimentType)
  if (project) filtered = filtered.filter(experiment => experiment.project === project)
  if (search) {
    filtered = filtered.filter(experiment =>
      experiment.name.toLowerCase().includes(search) ||
      experiment.experiment_code.toLowerCase().includes(search) ||
      experiment.project.toLowerCase().includes(search),
    )
  }

  return {
    experiments: filtered.slice(skip, skip + limit),
    total: filtered.length,
  }
}

onMounted(() => {
  isClient.value = true

  const win = window as Window & { __mintDocsExperimentSelectorMock?: boolean }
  if (win.__mintDocsExperimentSelectorMock) return
  win.__mintDocsExperimentSelectorMock = true

  const { client } = useApi()

  client.interceptors.request.use((config) => {
    const url = String(config.url ?? '')

    if (url.includes('/experiments/experiment-types')) {
      config.adapter = () => Promise.resolve({
        data: mockExperimentTypes,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })
      return config
    }

    if (url.includes('/projects')) {
      config.adapter = () => Promise.resolve({
        data: { projects: mockProjects, total: mockProjects.length },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })
      return config
    }

    if (url.includes('/experiments')) {
      config.adapter = () => Promise.resolve({
        data: filterMockExperiments(url),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })
    }

    return config
  })
})

const previewNames = new Set([
  'AlertBox',
  'AppAvatarMenu',
  'AppContainer',
  'AppLayout',
  'AppPluginSwitcher',
  'AppSidebar',
  'AppToastContainer',
  'AppTopBar',
  'AuditTrail',
  'AutoGroupModal',
  'Avatar',
  'BatchProgressList',
  'BaseButton',
  'BaseCheckbox',
  'BaseInput',
  'BaseModal',
  'BasePill',
  'BaseRadioGroup',
  'BaseSelect',
  'BaseSlider',
  'BaseTabs',
  'BaseTextarea',
  'BaseToggle',
  'BioTemplateExperimentWorkspaceView',
  'BioTemplatePackWorkspaceView',
  'BioTemplatePresetWorkspaceView',
  'BioTemplateRenderer',
  'Breadcrumb',
  'Calendar',
  'ChartContainer',
  'ChemicalFormula',
  'CollapsibleCard',
  'ColorSlider',
  'ComponentBindingRenderer',
  'ConcentrationInput',
  'ControlWorkspaceView',
  'ConfirmDialog',
  'DataFrame',
  'DatePicker',
  'DateTimePicker',
  'Divider',
  'DoseCalculator',
  'DoseDesignWorkspaceView',
  'DropdownButton',
  'EmptyState',
  'ExperimentCodeBadge',
  'ExperimentDataViewer',
  'ExperimentPopover',
  'ExperimentSelectorModal',
  'ExperimentTimeline',
  'FileUploader',
  'FitPanel',
  'FormBuilder',
  'FormField',
  'FormulaInput',
  'FormActions',
  'GroupAssigner',
  'IconButton',
  'InstrumentAlertLog',
  'InstrumentStateBadge',
  'InstrumentStatusCard',
  'LcmsSequenceTable',
  'LoadingSpinner',
  'MoleculeInput',
  'MultiSelect',
  'NumberInput',
  'PlateMapEditor',
  'PluginIcon',
  'PluginWorkspaceView',
  'ProgressBar',
  'ProtocolStepEditor',
  'RackEditor',
  'ReagentEditor',
  'ReagentList',
  'ResourceCard',
  'SampleLegend',
  'SampleHierarchyTree',
  'SampleSelector',
  'ScheduleCalendar',
  'ScientificNumber',
  'SegmentedControl',
  'SequenceInput',
  'SequenceProgressBar',
  'SettingsModal',
  'SmartGroupFieldRecipe',
  'SmartGroupManual',
  'SmartGroupModal',
  'Skeleton',
  'StatusIndicator',
  'StepWizard',
  'TagsInput',
  'ThemeToggle',
  'TimePicker',
  'TimeRangeInput',
  'Tooltip',
  'UnitInput',
  'WellPlate',
])

const hasLivePreview = computed(() => previewNames.has(props.name))

const shellPreviewNames = new Set<string>([])

const fixturePreviewNames = new Set([
])

const fallbackReason = computed(() => {
  if (shellPreviewNames.has(props.name)) {
    return 'This component belongs to the platform or plugin shell and expects auth, settings, router, or project context. It needs a mocked shell wrapper before it can be shown as a static docs preview.'
  }

  if (fixturePreviewNames.has(props.name)) {
    return 'This component can likely be prebuilt into the docs, but it needs a realistic experiment fixture before the preview is useful and safe to render.'
  }

  return 'This component needs a component-specific fixture before it can render safely here.'
})
</script>

<template>
  <section class="mint-component-playground">
    <div class="mint-component-playground__header">
      <div>
        <h2>Playground</h2>
        <p>Live preview generated for <code>{{ name }}</code> inside this component page.</p>
      </div>
    </div>

    <div class="mint-component-playground__surface">
      <ClientOnly>
      <template v-if="name === 'AlertBox'">
        <AlertBox type="success" title="Analysis complete" action-label="Open result">
          24 samples processed. QC checks passed for 23 samples.
        </AlertBox>
      </template>

      <template v-else-if="name === 'PluginWorkspaceView'">
        <div class="mint-app-shell-demo mint-app-shell-demo--workspace">
          <PluginWorkspaceView
            title="Dose Response"
            subtitle="Plugin workspace"
            home-path="/"
            :pill-nav="shellPillNav"
            :current-pill-id="activeShellView"
            :panels="appSidebarPanels"
            :active-view="activeShellView"
            :account-menu="accountMenuItems"
            user-name="MINT Operator"
            user-email="operator@morscher.lab"
            sidebar-title="Tools"
            sidebar-subtitle="Experiment controls"
            :sidebar-badge="2"
            @pill-select="activeShellView = $event.id"
            @update:active-view="activeShellView = $event"
          >
            <template #section-parameters>
              <BaseSlider v-model="sliderValue" label="Threshold" :min="0" :max="100" show-value />
              <BaseSelect v-model="selectValue" label="Workflow" :options="selectOptions" />
            </template>
            <template #section-filters>
              <BaseToggle v-model="toggleValue" label="Show QC warnings" />
            </template>
            <template #section-display>
              <BaseCheckbox v-model="checkboxValue" label="Include controls" />
            </template>
            <template #section-export>
              <BaseButton size="sm" variant="secondary">Export CSV</BaseButton>
            </template>

            <AppContainer direction="column" gap="0.75rem">
              <div class="mint-workspace-card">
                <strong>Dose response analysis</strong>
                <span>Switch the top pills to see the sidebar follow the active workspace view.</span>
              </div>
              <DataFrame
                :data="resultRows.slice(0, 3)"
                :columns="resultColumns"
                row-key="id"
                size="sm"
                :pagination="false"
              />
            </AppContainer>
          </PluginWorkspaceView>
        </div>
      </template>

      <template v-else-if="name === 'AppLayout'">
        <div class="mint-app-shell-demo">
          <AppLayout floating sidebar-width="18rem" responsive-sidebar>
            <template #topbar>
              <AppTopBar
                title="Plate Analyzer"
                subtitle="Embedded shell"
                home-path="/"
                :pill-nav="shellPillNav"
                :current-pill-id="activeShellView"
                :account-menu="accountMenuItems"
                user-name="MINT Operator"
                user-email="operator@morscher.lab"
                :show-standalone-label="false"
                @pill-select="activeShellView = $event.id"
              />
            </template>
            <template #sidebar>
              <AppSidebar :panels="appSidebarPanels" :active-view="activeShellView" :floating="false" dense>
                <template #section-parameters>
                  <BaseSlider v-model="sliderValue" label="Threshold" :min="0" :max="100" show-value />
                </template>
                <template #section-filters>
                  <BaseToggle v-model="toggleValue" label="Show QC warnings" />
                </template>
                <template #section-display>
                  <BaseCheckbox v-model="checkboxValue" label="Include controls" />
                </template>
                <template #section-export>
                  <BaseButton size="sm" variant="secondary">Export CSV</BaseButton>
                </template>
              </AppSidebar>
            </template>
            <div class="mint-workspace-card">
              <strong>{{ activeShellView.charAt(0).toUpperCase() + activeShellView.slice(1) }}</strong>
              <span>The layout owns the topbar, main region, and responsive sidebar frame.</span>
            </div>
          </AppLayout>
        </div>
      </template>

      <template v-else-if="name === 'AppContainer'">
        <AppContainer direction="row" gap="0.75rem">
          <div class="mint-workspace-card">
            <strong>Plate A</strong>
            <span>96 wells</span>
          </div>
          <div class="mint-workspace-card">
            <strong>QC</strong>
            <span>8 samples</span>
          </div>
          <div class="mint-workspace-card">
            <strong>Status</strong>
            <span>Ready</span>
          </div>
        </AppContainer>
      </template>

      <template v-else-if="name === 'AppTopBar'">
        <div class="mint-topbar-demo">
          <AppTopBar
            :page-selector="topBarPages"
            current-page-selector-id="experiments"
            :pill-nav="shellPillNav"
            :current-pill-id="activeShellView"
            :account-menu="accountMenuItems"
            user-name="MINT Operator"
            user-email="operator@morscher.lab"
            show-notifications
            has-notification-dot
            home-path="/"
            :show-standalone-label="false"
            @pill-select="activeShellView = $event.id"
          />
        </div>
      </template>

      <template v-else-if="name === 'AppSidebar'">
        <div class="mint-sidebar-demo">
          <AppSidebar
            title="Analysis tools"
            subtitle="Current view controls"
            :badge="2"
            variant="analysis"
            :panels="appSidebarPanels"
            :active-view="activeShellView"
            :floating="false"
          >
            <template #section-parameters>
              <BaseSlider v-model="sliderValue" label="Threshold" :min="0" :max="100" show-value />
              <BaseSelect v-model="selectValue" label="Workflow" :options="selectOptions" />
            </template>
            <template #section-filters>
              <BaseToggle v-model="toggleValue" label="Show QC warnings" />
            </template>
            <template #section-display>
              <BaseCheckbox v-model="checkboxValue" label="Include controls" />
            </template>
            <template #section-export>
              <BaseButton size="sm" variant="secondary">Export CSV</BaseButton>
            </template>
          </AppSidebar>
        </div>
      </template>

      <template v-else-if="name === 'AppAvatarMenu'">
        <div class="mint-menu-demo">
          <AppAvatarMenu
            user-name="MINT Operator"
            user-email="operator@morscher.lab"
            user-initial="MO"
            :items="accountMenuItems"
          />
        </div>
      </template>

      <template v-else-if="name === 'AppPluginSwitcher'">
        <div class="mint-menu-demo">
          <AppPluginSwitcher
            :current="pluginSwitcherInfo.current"
            :plugins="pluginSwitcherInfo.plugins"
            :install-href="pluginSwitcherInfo.installHref"
          />
        </div>
      </template>

      <template v-else-if="name === 'AppToastContainer'">
        <div class="mint-live-row">
          <BaseButton variant="primary" @click="toast.info('Export file is being generated...')">
            Show toast
          </BaseButton>
          <BaseButton variant="secondary" @click="toast.success('Experiment saved.')">
            Success
          </BaseButton>
          <AppToastContainer />
        </div>
      </template>

      <template v-else-if="name === 'ThemeToggle' && !isClient">
        <div class="mint-live-row">
          <span class="mint-live-caption">Preview loads in the browser.</span>
        </div>
      </template>

      <template v-else-if="name === 'ThemeToggle'">
        <div class="mint-live-row">
          <ThemeToggle size="md" />
          <span class="mint-live-caption">Toggles the active docs theme through the SDK settings store.</span>
        </div>
      </template>

      <template v-else-if="name === 'SettingsModal'">
        <BaseButton variant="primary" @click="settingsDemoOpen = true">Open settings</BaseButton>
        <SettingsModal
          v-model="settingsDemoOpen"
          title="Plugin settings"
          :tabs="[{ id: 'analysis', label: 'Analysis' }]"
          :show-appearance="false"
        >
          <template #tab-analysis>
            <div class="mint-settings-demo">
              <FormField label="Panel name">
                <BaseInput v-model="textValue" />
              </FormField>
              <FormField label="Workflow">
                <BaseSelect v-model="selectValue" :options="selectOptions" />
              </FormField>
              <BaseToggle v-model="toggleValue" label="Show QC warnings" />
            </div>
          </template>
        </SettingsModal>
      </template>

      <template v-else-if="name === 'ExperimentPopover'">
        <div class="mint-menu-demo">
          <ExperimentPopover
            experiment-name="DRP Dose-Response Screen"
            experiment-code="EXP-042"
            experiment-status="ongoing"
            show-save
            show-detach
            :confirm-save="false"
          />
        </div>
      </template>

      <template v-else-if="name === 'BaseButton'">
        <div class="mint-live-row">
          <BaseButton variant="primary">Publish</BaseButton>
          <BaseButton variant="secondary">Review</BaseButton>
          <BaseButton variant="ghost" loading>Saving</BaseButton>
        </div>
      </template>

      <template v-else-if="name === 'BaseInput'">
        <FormField label="Panel name">
          <BaseInput v-model="textValue" placeholder="Panel name" />
        </FormField>
      </template>

      <template v-else-if="name === 'FormField'">
        <FormField label="Required metadata" hint="Hints and validation messages stay close to the control." required field-id="metadata-title">
          <BaseInput id="metadata-title" v-model="textValue" placeholder="Metadata title" />
        </FormField>
      </template>

      <template v-else-if="name === 'BaseTextarea'">
        <BaseTextarea v-model="notesValue" :rows="4" resize="vertical" />
      </template>

      <template v-else-if="name === 'BaseSelect'">
        <BaseSelect v-model="selectValue" :options="selectOptions" />
        <p class="mint-live-caption">Selected: {{ selectValue }}</p>
      </template>

      <template v-else-if="name === 'BaseCheckbox'">
        <BaseCheckbox v-model="checkboxValue" label="Include blanks" />
      </template>

      <template v-else-if="name === 'BaseToggle'">
        <BaseToggle v-model="toggleValue" label="Show QC warnings" description="Use platform warning treatment for flagged rows." />
      </template>

      <template v-else-if="name === 'BaseRadioGroup'">
        <BaseRadioGroup v-model="radioValue" name="sample-type" :options="radioOptions" direction="horizontal" variant="tile" />
      </template>

      <template v-else-if="name === 'BaseSlider'">
        <BaseSlider v-model="sliderValue" :min="0" :max="100" show-value />
      </template>

      <template v-else-if="name === 'ColorSlider'">
        <ColorSlider v-model="colorValue" :min="0" :max="100" show-value show-labels min-label="Low" max-label="High" />
      </template>

      <template v-else-if="name === 'SegmentedControl'">
        <SegmentedControl v-model="segmentedValue" :options="segmentedOptions" variant="card" full-width />
      </template>

      <template v-else-if="name === 'DropdownButton'">
        <DropdownButton v-model="dropdownValue" :options="dropdownOptions" variant="secondary" />
      </template>

      <template v-else-if="name === 'NumberInput'">
        <NumberInput v-model="numberValue" :min="0" :max="384" :step="1" unit="wells" />
      </template>

      <template v-else-if="name === 'FormulaInput'">
        <FormulaInput v-model="formulaValue" />
      </template>

      <template v-else-if="name === 'SequenceInput'">
        <SequenceInput v-model="sequenceValue" type="dna" :rows="4" :show-tools="true" :show-stats="true" />
      </template>

      <template v-else-if="name === 'UnitInput'">
        <UnitInput
          v-model="unitValue"
          v-model:unit="unitName"
          :units="unitOptions"
          :step="0.5"
          :precision="2"
          convert-on-unit-change
        />
      </template>

      <template v-else-if="name === 'ConcentrationInput'">
        <ConcentrationInput
          v-model="concentrationValue"
          :allowed-units="['nM', 'mM', 'M', 'ng/mL', 'mg/mL']"
          :molecular-weight="180.16"
        />
      </template>

      <template v-else-if="name === 'MoleculeInput'">
        <MoleculeInput v-model="moleculeValue" readonly :height="180" />
      </template>

      <template v-else-if="name === 'BaseTabs'">
        <BaseTabs v-model="activeTab" :tabs="tabs" variant="pills" />
        <p class="mint-live-caption">Active tab: {{ activeTab }}</p>
      </template>

      <template v-else-if="name === 'DatePicker'">
        <DatePicker v-model="dateValue" placeholder="Select run date" clearable />
      </template>

      <template v-else-if="name === 'TimePicker'">
        <TimePicker v-model="timeValue" min="08:00" max="18:00" :step="30" format="12h" clearable />
      </template>

      <template v-else-if="name === 'DateTimePicker'">
        <DateTimePicker v-model="dateTimeValue" min="2026-05-29T08:00" max="2026-05-29T18:00" :time-step="30" time-format="12h" clearable />
      </template>

      <template v-else-if="name === 'DoseCalculator'">
        <DoseCalculator :target-wells="['B2', 'B3', 'B4', 'B5']" :molecular-weight="180.16" />
      </template>

      <template v-else-if="name === 'TimeRangeInput'">
        <TimeRangeInput v-model="timeRangeValue" min="08:00" max="18:00" :step="30" format="12h" show-duration />
      </template>

      <template v-else-if="name === 'Calendar'">
        <Calendar v-model="calendarValue" :month="4" :year="2026" :markers="calendarMarkers" />
      </template>

      <template v-else-if="name === 'BaseModal'">
        <BaseButton variant="primary" @click="modalOpen = true">Open modal</BaseButton>
        <BaseModal v-model="modalOpen" title="Edit panel">
          <p>Modal body content for a plugin workflow.</p>
          <template #footer>
            <BaseButton variant="ghost" @click="modalOpen = false">Cancel</BaseButton>
            <BaseButton variant="primary" @click="modalOpen = false">Save</BaseButton>
          </template>
        </BaseModal>
      </template>

      <template v-else-if="name === 'BasePill'">
        <div class="mint-live-row">
          <BasePill variant="success">Completed</BasePill>
          <BasePill variant="warning">Needs review</BasePill>
          <BasePill variant="error">Failed</BasePill>
        </div>
      </template>

      <template v-else-if="name === 'IconButton'">
        <div class="mint-live-row">
          <IconButton label="Add sample" variant="primary">+</IconButton>
          <IconButton label="Refresh data" variant="secondary">R</IconButton>
          <IconButton label="Deleting" variant="danger" loading>D</IconButton>
        </div>
      </template>

      <template v-else-if="name === 'PluginIcon'">
        <div class="mint-live-row">
          <PluginIcon :icon="pluginIconPath" size="sm" />
          <PluginIcon :icon="pluginIconPath" size="md" variant="tinted" />
          <PluginIcon :icon="pluginIconPath" size="lg" variant="solid" tone="#0ea5e9" />
        </div>
      </template>

      <template v-else-if="name === 'Skeleton'">
        <div class="mint-skeleton-demo">
          <Skeleton variant="circular" :width="48" :height="48" />
          <div>
            <Skeleton variant="text" width="65%" />
            <Skeleton variant="text" width="42%" />
            <Skeleton variant="rounded" height="72px" />
          </div>
        </div>
      </template>

      <template v-else-if="name === 'LoadingSpinner'">
        <div class="mint-live-row">
          <LoadingSpinner size="sm" variant="muted" label="Loading metadata" />
          <LoadingSpinner size="md" variant="primary" label="Running" />
          <LoadingSpinner size="lg" variant="cta" label="Exporting" />
        </div>
      </template>

      <template v-else-if="name === 'Avatar'">
        <div class="mint-live-row">
          <Avatar name="MINT Operator" size="sm" status="online" />
          <Avatar initials="QC" size="md" status="away" />
          <Avatar name="Analysis Lead" size="lg" status="busy" />
        </div>
      </template>

      <template v-else-if="name === 'Tooltip'">
        <Tooltip text="Refresh experiment data" shortcut="R">
          <BaseButton variant="secondary">Hover for tooltip</BaseButton>
        </Tooltip>
      </template>

      <template v-else-if="name === 'Breadcrumb'">
        <Breadcrumb :items="breadcrumbItems" />
      </template>

      <template v-else-if="name === 'Divider'">
        <div>
          <p class="mint-live-caption">Sample preparation</p>
          <Divider label="Instrument run" />
          <p class="mint-live-caption">Post-processing</p>
        </div>
      </template>

      <template v-else-if="name === 'ResourceCard'">
        <ResourceCard
          name="LC-MS Orbitrap"
          description="Shared instrument for metabolomics runs."
          status="available"
          location="Room 3.214"
          :specs="resourceSpecs"
          :tags="['LC-MS', 'Metabolomics']"
          next-available="Today, 15:30"
        />
      </template>

      <template v-else-if="name === 'SampleLegend'">
        <SampleLegend v-model="sampleLegendValue" :samples="sampleLegendItems" orientation="horizontal" />
      </template>

      <template v-else-if="name === 'SampleHierarchyTree'">
        <SampleHierarchyTree :nodes="sampleTreeNodes" :default-expanded-ids="['study-dose', 'exp-mint-042', 'plate-a']" />
      </template>

      <template v-else-if="name === 'SampleSelector' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'SampleSelector'">
        <SampleSelector
          v-model="sampleSelection"
          v-model:groups="sampleGroups"
          :samples="['Vehicle_A1', 'Vehicle_A2', 'Drug_A1', 'Drug_A2', 'Drug_B1', 'Drug_B2', 'QC_01', 'QC_02']"
          :enable-smart-group="false"
          :autoload-experiment-data="false"
        />
      </template>

      <template v-else-if="name === 'AutoGroupModal' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'AutoGroupModal'">
        <div class="mint-experiment-selector-demo">
          <BaseButton variant="primary" @click="autoGroupDemoOpen = true">Open smart grouping</BaseButton>
          <AutoGroupModal
            v-model="autoGroupDemoOpen"
            :samples="['Vehicle_A1', 'Vehicle_A2', 'DrugLow_A1', 'DrugLow_A2', 'DrugHigh_B1', 'DrugHigh_B2', 'QC_01', 'QC_02']"
            @apply="autoGroupDemoOpen = false"
          />
        </div>
      </template>

      <template v-else-if="name === 'SmartGroupModal'">
        <SmartGroupModal
          v-model:mode="smartGroupMode"
          @apply="smartGroupMode = 'manual'"
          @done="smartGroupMode = 'auto'"
        />
      </template>

      <template v-else-if="name === 'SmartGroupFieldRecipe'">
        <SmartGroupFieldRecipe @apply="smartGroupMode = 'manual'" @manual="smartGroupMode = 'manual'" />
      </template>

      <template v-else-if="name === 'SmartGroupManual'">
        <SmartGroupManual @done="smartGroupMode = 'auto'" @auto="smartGroupMode = 'auto'" />
      </template>

      <template v-else-if="name === 'GroupAssigner'">
        <GroupAssigner
          :groups="groupAssignerGroups"
          v-model:group1="assignedControlGroups"
          v-model:group2="assignedTreatmentGroups"
          label1="Control"
          label2="Treatment"
        />
      </template>

      <template v-else-if="name === 'ScheduleCalendar'">
        <div class="mint-schedule-demo">
          <ScheduleCalendar
            model-value="2026-05-29"
            view="day"
            :events="scheduleEvents"
            :blocked-slots="scheduleBlockedSlots"
            :day-start-hour="8"
            :day-end-hour="18"
            :slot-duration="60"
            :show-view-toggle="false"
            :show-now-indicator="false"
            readonly
          />
        </div>
      </template>

      <template v-else-if="name === 'CollapsibleCard'">
        <CollapsibleCard
          title="Analysis settings"
          subtitle="Open to review plugin defaults."
          badge="3"
          default-open
          show-toggle
          :toggle-value="cardToggleValue"
          @update:toggle-value="cardToggleValue = $event"
        >
          <div class="mint-wizard-panel">
            <strong>Normalization</strong>
            <span>Median fold change with QC samples included.</span>
          </div>
        </CollapsibleCard>
      </template>

      <template v-else-if="name === 'ExperimentTimeline'">
        <ExperimentTimeline :model-value="protocolSteps" expanded-step-id="step-2" color-by-type />
      </template>

      <template v-else-if="name === 'ProtocolStepEditor' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'ProtocolStepEditor'">
        <ProtocolStepEditor v-model="protocolStepValue" mode="edit" />
      </template>

      <template v-else-if="name === 'ReagentList'">
        <ReagentList v-model="reagentListValue" :columns="['name', 'lot', 'expiry', 'storage', 'stock']" />
      </template>

      <template v-else-if="name === 'ReagentEditor'">
        <ReagentEditor v-model="reagentEditorValue" :plate-format="96" />
      </template>

      <template v-else-if="name === 'RackEditor'">
        <div class="mint-rack-editor-demo">
          <RackEditor
            v-model="rackEditorValue"
            v-model:active-rack-id="activeRackId"
            :max-racks="3"
            :min-racks="1"
            :allow-reorder="true"
            well-plate-size="sm"
            show-legend
            show-badges
          />
        </div>
      </template>

      <template v-else-if="name === 'PlateMapEditor'">
        <div class="mint-plate-editor-demo">
          <PlateMapEditor
            v-model="plateMapState"
            :format="96"
            :samples="plateEditorSamples"
            :max-plates="2"
            size="sm"
            :allow-add-plates="false"
            :allow-add-samples="false"
          />
        </div>
      </template>

      <template v-else-if="name === 'FormActions'">
        <div class="mint-form-actions-demo">
          <FormActions show-cancel submit-label="Save experiment" />
          <Divider label="Wizard" />
          <FormActions is-wizard :is-first="false" :is-last="false" />
          <FormActions is-wizard :is-first="false" is-last loading submit-label="Publishing" />
        </div>
      </template>

      <template v-else-if="name === 'FormBuilder'">
        <div class="mint-form-builder-demo">
          <FormBuilder v-model="formBuilderValues" :schema="formBuilderSchema" size="sm" />
          <pre>{{ JSON.stringify(formBuilderValues, null, 2) }}</pre>
        </div>
      </template>

      <template v-else-if="name === 'MultiSelect'">
        <MultiSelect v-model="multiValue" :options="[
          { value: 'qc', label: 'QC sample' },
          { value: 'treated', label: 'Treated' },
          { value: 'control', label: 'Control' },
        ]" />
      </template>

      <template v-else-if="name === 'TagsInput'">
        <TagsInput v-model="tagsValue" :suggestions="['control', 'dose', 'qc', 'blank']" />
      </template>

      <template v-else-if="name === 'ConfirmDialog'">
        <BaseButton variant="danger" @click="confirmOpen = true">Delete panel</BaseButton>
        <ConfirmDialog
          v-model="confirmOpen"
          title="Delete panel?"
          message="This cannot be undone."
          variant="danger"
          confirm-label="Delete"
          @confirm="confirmOpen = false"
        />
      </template>

      <template v-else-if="name === 'ChartContainer'">
        <ChartContainer title="Response by dose" description="Minimal static chart content inside the SDK chart frame.">
          <template #toolbar>
            <BaseButton variant="ghost" size="sm">Export</BaseButton>
          </template>
          <div class="mint-chart-demo" aria-label="Example response chart">
            <div class="mint-chart-demo__bar" style="height: 34%"><span>0 nM</span></div>
            <div class="mint-chart-demo__bar" style="height: 52%"><span>10 nM</span></div>
            <div class="mint-chart-demo__bar" style="height: 78%"><span>100 nM</span></div>
            <div class="mint-chart-demo__bar" style="height: 92%"><span>1 mM</span></div>
          </div>
          <template #legend>
            <span class="mint-live-caption">Peak area normalized to vehicle control.</span>
          </template>
        </ChartContainer>
      </template>

      <template v-else-if="name === 'DataFrame'">
        <DataFrame
          :data="resultRows"
          :columns="resultColumns"
          row-key="id"
          :selected-keys="selectedRows"
          searchable
          sortable
          selectable
          sticky-header
          resizable
          deletable
          bordered
          size="sm"
          :pagination="false"
          v-model:column-widths="dataFrameColumnWidths"
          @update:selected-keys="selectedRows = $event"
        />
      </template>

      <template v-else-if="name === 'ExperimentDataViewer'">
        <ExperimentDataViewer
          title="Dose response output"
          plugin-name="Dose response"
          default-view="summary"
          :summary-data="experimentSummaryData"
          :tree-data="sampleTreeNodes"
          :table-data="experimentTableRows"
          :table-columns="experimentTableColumns"
          :auto-fetch="false"
        />
      </template>

      <template v-else-if="name === 'ComponentBindingRenderer'">
        <div class="mint-component-binding-demo">
          <ComponentBindingRenderer
            :bindings="componentBindings"
            readonly
            dense
            layout="stack"
          />
        </div>
      </template>

      <template v-else-if="name === 'ControlWorkspaceView'">
        <div class="mint-workspace-preview">
          <ControlWorkspaceView
            v-model="controlWorkspaceValues"
            :controls="controlWorkspaceControls"
            :control-options="controlWorkspaceOptions"
            title="Analysis Workspace"
            sidebar-title="Analysis Controls"
            sidebar-subtitle="Current run"
            :show-settings="false"
            dense
          />
        </div>
      </template>

      <template v-else-if="name === 'DoseDesignWorkspaceView'">
        <div class="mint-workspace-preview">
          <DoseDesignWorkspaceView
            v-model="doseDesignValues"
            title="Dose Design Workspace"
            sidebar-title="Dose Controls"
            sidebar-subtitle="Plate setup"
            :dose-design-options="doseDesignOptions"
            :show-settings="false"
            :well-plate-props="{
              heatmap: { enabled: true, min: 0, max: 100, colorScale: 'viridis' },
            }"
          />
        </div>
      </template>

      <template v-else-if="name === 'BioTemplateRenderer'">
        <div class="mint-template-demo">
          <BioTemplateRenderer :target="lcmsBatchTemplate" :include="['DataFrame', 'ExperimentTimeline', 'ScheduleCalendar']" dense />
        </div>
      </template>

      <template v-else-if="name === 'BioTemplateExperimentWorkspaceView'">
        <div class="mint-template-demo">
          <BioTemplateExperimentWorkspaceView
            :target="wellplateScreenTemplate"
            kind="collection"
            label="Wellplate Screen"
            :status="bioTemplateStatus"
            :actions="bioTemplateActions"
            show-template-summary
            dense
            v-slot="{ target }"
          >
            <BioTemplateRenderer :target="target" :exclude="['SampleSelector']" dense />
          </BioTemplateExperimentWorkspaceView>
        </div>
      </template>

      <template v-else-if="name === 'BioTemplatePackWorkspaceView' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'BioTemplatePackWorkspaceView'">
        <div class="mint-template-demo">
          <BioTemplatePackWorkspaceView
            pack="cell-culture-screen"
            :status="bioTemplateStatus"
            :actions="bioTemplateActions"
            show-template-summary
            dense
            v-slot="{ target }"
          >
            <BioTemplateRenderer :target="target" :exclude="['SampleSelector']" dense />
          </BioTemplatePackWorkspaceView>
        </div>
      </template>

      <template v-else-if="name === 'BioTemplatePresetWorkspaceView' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'BioTemplatePresetWorkspaceView'">
        <div class="mint-template-demo">
          <BioTemplatePresetWorkspaceView
            v-model="bioTemplateValues"
            preset="wellplate-screen"
            show-template-summary
            show-component-summary
            dense
            v-slot="{ collection }"
          >
            <BioTemplateRenderer :target="collection" :exclude="['SampleSelector']" dense />
          </BioTemplatePresetWorkspaceView>
        </div>
      </template>

      <template v-else-if="name === 'ExperimentSelectorModal' && !isClient">
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>

      <template v-else-if="name === 'ExperimentSelectorModal'">
        <div class="mint-experiment-selector-demo">
          <BaseButton variant="primary" @click="experimentSelectorOpen = true">
            Open experiment selector
          </BaseButton>
          <p v-if="selectedExperimentLabel" class="mint-live-caption">
            Selected: {{ selectedExperimentLabel }}
          </p>
          <ExperimentSelectorModal
            v-model="experimentSelectorOpen"
            title="Select Experiment"
            :current-experiment-id="selectedExperimentId"
            show-filters
            group-by-project
            @select="handleExperimentSelect"
            @deselect="handleExperimentDeselect"
          />
        </div>
      </template>

      <template v-else-if="name === 'LcmsSequenceTable'">
        <LcmsSequenceTable :items="lcmsSequenceItems" :max-rows="3" />
      </template>

      <template v-else-if="name === 'FileUploader'">
        <FileUploader accept=".csv,.xlsx" multiple />
      </template>

      <template v-else-if="name === 'EmptyState'">
        <EmptyState
          title="No results yet"
          description="Run an analysis to populate this view."
          action-label="Start analysis"
        />
      </template>

      <template v-else-if="name === 'StatusIndicator'">
        <div class="mint-live-row">
          <StatusIndicator status="success" label="Validated" />
          <StatusIndicator status="warning" label="Needs review" />
          <StatusIndicator status="info" label="Queued" pulse />
        </div>
      </template>

      <template v-else-if="name === 'InstrumentStateBadge'">
        <div class="mint-live-row">
          <InstrumentStateBadge state="running" />
          <InstrumentStateBadge state="standby" />
          <InstrumentStateBadge state="error" />
          <InstrumentStateBadge state="disconnected" />
        </div>
      </template>

      <template v-else-if="name === 'InstrumentStatusCard'">
        <InstrumentStatusCard :status="instrumentStatus" />
      </template>

      <template v-else-if="name === 'InstrumentAlertLog'">
        <InstrumentAlertLog :alerts="instrumentAlerts" title="Instrument Events" />
      </template>

      <template v-else-if="name === 'ProgressBar'">
        <ProgressBar :value="68" label="Processing samples" show-value />
      </template>

      <template v-else-if="name === 'SequenceProgressBar'">
        <SequenceProgressBar :progress="sequenceProgress" label="samples" />
      </template>

      <template v-else-if="name === 'ExperimentCodeBadge'">
        <div class="mint-live-row">
          <ExperimentCodeBadge code="MINT-EXP-2026-0042" />
          <ExperimentCodeBadge code="QC-PLATE-17" size="sm" :copyable="false" />
        </div>
      </template>

      <template v-else-if="name === 'AuditTrail'">
        <AuditTrail :entries="auditEntries" show-filters max-height="18rem" />
      </template>

      <template v-else-if="name === 'BatchProgressList'">
        <BatchProgressList :items="batchItems" title="Analysis batch" max-height="18rem" />
      </template>

      <template v-else-if="name === 'FitPanel'">
        <FitPanel state="completed" :results="fitResults" run-label="Run curve fit">
          <template #controls>
            <FormField label="Model">
              <BaseSelect :model-value="'four-pl'" :options="[
                { value: 'four-pl', label: '4-parameter logistic' },
                { value: 'linear', label: 'Linear' },
              ]" />
            </FormField>
          </template>
          <template #footer>
            <p class="mint-live-caption">Results are rendered from a fixed fixture.</p>
          </template>
        </FitPanel>
      </template>

      <template v-else-if="name === 'ChemicalFormula'">
        <div class="mint-formula-row">
          <ChemicalFormula formula="C6H12O6" />
          <ChemicalFormula formula="C8H10N4O2" />
        </div>
      </template>

      <template v-else-if="name === 'ScientificNumber'">
        <div class="mint-live-row">
          <ScientificNumber :value="0.0000342" notation="scientific" unit="M" />
          <ScientificNumber :value="1234567" notation="compact" />
        </div>
      </template>

      <template v-else-if="name === 'WellPlate'">
        <WellPlate
          v-model="selectedWells"
          :wells="plateWells"
          :heatmap="{ enabled: true, min: 0, max: 1, colorScale: 'viridis', showLegend: true }"
          selection-mode="multiple"
          size="fill"
        />
      </template>

      <template v-else-if="name === 'StepWizard'">
        <StepWizard v-model="currentStep" :steps="wizardSteps" :linear="false">
          <template #step-setup>
            <div class="mint-wizard-panel">
              <strong>Setup</strong>
              <span>Choose experiment metadata and defaults.</span>
            </div>
          </template>
          <template #step-samples>
            <div class="mint-wizard-panel">
              <strong>Samples</strong>
              <span>Select wells, controls, and replicate groups.</span>
            </div>
          </template>
          <template #step-review>
            <div class="mint-wizard-panel">
              <strong>Review</strong>
              <span>Confirm settings before publishing the design.</span>
            </div>
          </template>
        </StepWizard>
      </template>

      <template v-else>
        <div class="mint-component-playground__fallback">
          <strong>Embedded preview pending for {{ name }}.</strong>
          <p>{{ fallbackReason }}</p>
        </div>
      </template>
      <template #fallback>
        <span class="mint-live-caption">Preview loads in the browser.</span>
      </template>
      </ClientOnly>
    </div>

    <p class="mint-live-caption" v-if="hasLivePreview">
      This preview is compiled into the VitePress docs build from the published SDK package.
    </p>
  </section>
</template>
