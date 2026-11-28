<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton } from '@morscherlab/mint-sdk'
import type { ActionMenuItem } from '@morscherlab/mint-sdk'

const items: ActionMenuItem[] = [
  { id: 'csv', label: 'Export CSV' },
  { id: 'xlsx', label: 'Export Excel' },
  { id: 'copy', label: 'Copy to clipboard' },
]
const defaultAction = ref<string | undefined>('csv')
const last = ref('none')
</script>

<template>
  <div class="mint-live-row">
    <SplitButton v-model="defaultAction" label="More export actions" :items="items" @select="last = $event.label" />
    <p class="mint-live-caption">Last action: {{ last }}. Default: {{ defaultAction }}</p>
  </div>
</template>
