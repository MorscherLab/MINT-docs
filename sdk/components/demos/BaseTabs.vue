<script setup lang="ts">
import { ref } from 'vue'
import { BaseTabs } from '@morscherlab/mint-sdk'

const activeTab = ref('results')
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'results', label: 'Results', badge: 12 },
  { value: 'settings', label: 'Settings' },
]
</script>

<template>
  <BaseTabs v-model="activeTab" :options="tabs" />
  <p class="mint-live-caption">Active tab: {{ activeTab }}</p>
</template>
