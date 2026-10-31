<script setup lang="ts">
import { ref } from 'vue'
import { WellPlate } from '@morscherlab/mint-sdk/lab'

const selectedWells = ref(['B2', 'H12', 'P24'])
const plateWells = Object.fromEntries(
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => {
      const id = `${String.fromCharCode(65 + row)}${col + 1}`
      const value = Math.max(0.05, 1 - (row + col) / 19)
      return [id, { state: 'filled', sampleType: col % 3 === 0 ? 'control' : 'sample', value }]
    }),
  ).flat(),
)
</script>

<template>
  <WellPlate
    v-model="selectedWells"
    :wells="plateWells"
    :heatmap="{ enabled: true, min: 0, max: 1, colorScale: 'viridis', showLegend: true }"
    selection-mode="multiple"
    size="fill"
  />
</template>
