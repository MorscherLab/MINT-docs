<script setup lang="ts">
import { ref } from 'vue'
import {
  AppContainer,
  BaseButton,
  BaseCheckbox,
  BaseSelect,
  BaseSlider,
  DataFrame,
  PluginWorkspaceView,
} from '@morscherlab/mint-sdk'

const sliderValue = ref(72)
const selectValue = ref('dose')
const toggleValue = ref(true)
const checkboxValue = ref(true)
const activeShellView = ref('analysis')

const selectOptions = [
  { value: 'dose', label: 'Dose response' },
  { value: 'qc', label: 'QC review' },
  { value: 'export', label: 'Export' },
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

const shellPillNav = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'results', label: 'Results', badge: 12 },
  { id: 'settings', label: 'Settings' },
]

const accountMenuItems = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings', rightLabel: 'S' },
  { id: 'divider', label: '', divider: true },
  { id: 'docs', label: 'Documentation', href: '/sdk/components' },
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
        <BaseCheckbox v-model="toggleValue" type="switch" label="Show QC warnings" />
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
