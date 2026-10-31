<script setup lang="ts">
import { ref } from 'vue'
import { ActionMenu } from '@morscherlab/mint-sdk'
import type { ActionMenuItem } from '@morscherlab/mint-sdk'

const items: ActionMenuItem[] = [
  { id: 'export', label: 'Export CSV' },
  { id: 'rerun', label: 'Re-run QC' },
  { id: 'archive', label: 'Archive run' },
  { id: 'delete', label: 'Delete run', danger: true },
]
const last = ref('none')
</script>

<template>
  <div class="mint-live-row">
    <ActionMenu label="Row actions for run EXP-042" :items="items" @select="last = $event.label" />
    <p class="mint-live-caption">Last action: {{ last }}</p>
  </div>
</template>
