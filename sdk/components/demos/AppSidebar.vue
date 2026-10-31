<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCheckbox, BaseSelect, BaseSlider } from '@morscherlab/mint-sdk'
import { AppSidebar } from '@morscherlab/mint-sdk/shell'

const activeShellView = ref('analysis')
const selectValue = ref('dose')
const checkboxValue = ref(true)
const toggleValue = ref(true)
const sliderValue = ref(72)

const selectOptions = [
  { value: 'dose', label: 'Dose response' },
  { value: 'qc', label: 'QC review' },
  { value: 'export', label: 'Export' },
]

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
</script>

<template>
  <div class="mint-sidebar-demo">
    <AppSidebar
      title="Analysis tools"
      subtitle="Current view controls"
      :badge="2"
      density="compact"
      :panels="appSidebarPanels"
      :active-view="activeShellView"
      :floating="false"
    >
      <template #section-parameters>
        <BaseSlider v-model="sliderValue" label="Threshold" :min="0" :max="100" show-value />
        <BaseSelect v-model="selectValue" label="Workflow" :options="selectOptions" />
      </template>
      <template #section-filters>
        <BaseCheckbox v-model="toggleValue" type="switch" label="Show QC warnings" />
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
