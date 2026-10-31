<script setup lang="ts">
import { InstrumentStatusPanels } from '@morscherlab/mint-sdk/lab'

const panels = [
  {
    kind: 'kv' as const,
    title: 'Run',
    items: [
      ['Method', 'HILIC_pos_20min'],
      ['Sample', 'QC_pool_07'],
      ['Injections left', 14],
      ['Column heater on', true],
    ] as [string, string | number | boolean | null][],
  },
  {
    kind: 'table' as const,
    title: 'Queue',
    columns: ['position', 'sample', 'method'],
    rows: [
      { position: 1, sample: 'QC_pool_08', method: 'HILIC_pos_20min' },
      { position: 2, sample: 'S_101', method: 'HILIC_pos_20min' },
      { position: 3, sample: 'S_102', method: 'HILIC_pos_20min' },
    ],
  },
  { kind: 'text' as const, title: 'Log', text: '10:42 Pressure stable at 410 bar\n10:44 Injection 12 started' },
  {
    kind: 'bar' as const,
    title: 'Durations',
    categories: ['S_097', 'S_098', 'S_099', 'S_100'],
    series: [
      { name: 'Run time', values: [19.8, 20.1, 20.0, 19.9], unit: 'min' },
      { name: 'Peak pressure', values: [412, 408, 415, 410], unit: 'bar' },
    ],
  },
]
</script>

<template>
  <InstrumentStatusPanels :panels="panels" meta="from MS Planner · 12 s ago" />
</template>
