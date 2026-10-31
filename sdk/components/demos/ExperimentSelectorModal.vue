<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BaseButton } from '@morscherlab/mint-sdk'
import { ExperimentSelectorModal } from '@morscherlab/mint-sdk/data'
import { useApi } from '@morscherlab/mint-sdk/runtime'

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
</script>

<template>
  <div class="mint-experiment-selector-demo">
    <BaseButton variant="primary" @click="experimentSelectorOpen = true">
      Open experiment selector
    </BaseButton>
    <p v-if="selectedExperimentLabel" class="mint-live-caption">
      Selected: {{ selectedExperimentLabel }}
    </p>
    <ExperimentSelectorModal
      v-model:open="experimentSelectorOpen"
      title="Select Experiment"
      :current-experiment-id="selectedExperimentId"
      show-filters
      group-by-project
      @select="handleExperimentSelect"
      @deselect="handleExperimentDeselect"
    />
  </div>
</template>
