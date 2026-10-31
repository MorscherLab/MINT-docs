<script setup lang="ts">
import { ref } from 'vue'
import { SegmentedControl } from '@morscherlab/mint-sdk'

const segmentedValue = ref('plate')
const segmentedOptions = [
  { value: 'plate', label: 'Plate', description: '96/384 well layout' },
  { value: 'table', label: 'Table', description: 'Tabular sample list' },
  { value: 'timeline', label: 'Timeline', description: 'Protocol schedule' },
]
</script>

<template>
  <SegmentedControl v-model="segmentedValue" :options="segmentedOptions" variant="card" full-width />
</template>
