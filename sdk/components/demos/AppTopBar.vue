<script setup lang="ts">
import { ref } from 'vue'
import { AppTopBar } from '@morscherlab/mint-sdk/shell'

const activeShellView = ref('analysis')

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
</script>

<template>
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
