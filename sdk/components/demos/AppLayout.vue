<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCheckbox, BaseSlider } from '@morscherlab/mint-sdk'
import { AppLayout, AppSidebar, AppTopBar } from '@morscherlab/mint-sdk/shell'

const activeShellView = ref('analysis')
const checkboxValue = ref(true)
const toggleValue = ref(true)
const sliderValue = ref(72)

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
            <BaseCheckbox v-model="toggleValue" type="switch" label="Show QC warnings" />
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
