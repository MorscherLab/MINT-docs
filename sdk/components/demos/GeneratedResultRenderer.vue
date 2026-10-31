<script setup lang="ts">
import { GeneratedResultRenderer } from '@morscherlab/mint-sdk/runtime'

const result = {
  kind: 'table' as const,
  columns: ['compound', 'mz', 'rt_min', 'area'],
  rows: [
    { compound: 'Lactate', mz: 89.0244, rt_min: 1.82, area: 1.84e7 },
    { compound: 'Citrate', mz: 191.0197, rt_min: 2.41, area: 6.2e6 },
    { compound: 'Glutamine', mz: 145.0619, rt_min: 3.07, area: 9.7e6 },
    { compound: 'ATP', mz: 505.9885, rt_min: 6.55, area: 2.1e5 },
  ],
}
</script>

<template>
  <GeneratedResultRenderer :result="result" />
</template>
