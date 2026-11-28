<script setup lang="ts">
import { ref } from 'vue'
import { PanelSections } from '@morscherlab/mint-sdk/lab'
import type { PanelSection } from '@morscherlab/mint-sdk'

const sections: PanelSection[] = [
  {
    kind: 'kv',
    title: 'Summary',
    width: 'half',
    items: [
      ['Samples', 24],
      ['Method', 'HILIC_pos_20min'],
      ['Blank subtracted', true],
    ],
  },
  {
    kind: 'status',
    title: 'Sync',
    width: 'half',
    state: 'warning',
    label: 'Two samples have no injection',
    detail: 'S_103 and S_104 are not in the sequence file.',
  },
  {
    kind: 'table',
    title: 'Top features',
    columns: ['feature', 'mz', 'fold_change'],
    rows: [
      { feature: 'Citrate', mz: 191.0197, fold_change: 2.4 },
      { feature: 'Lactate', mz: 89.0244, fold_change: 1.7 },
      { feature: 'Glutamine', mz: 145.0619, fold_change: 0.6 },
    ],
  },
  {
    kind: 'plate',
    title: 'Plate layout',
    format: 96,
    groups: [
      { id: 'ctrl', label: 'Control' },
      { id: 'drug', label: 'Drug' },
      { id: 'qc', label: 'QC', role: 'qc' },
    ],
    wells: [
      { well: 'A1', group: 'ctrl' },
      { well: 'A2', group: 'ctrl' },
      { well: 'B1', group: 'drug' },
      { well: 'B2', group: 'drug' },
      { well: 'C1', group: 'qc', label: 'QC 1' },
    ],
    highlight: ['B2'],
  },
  { kind: 'link', title: 'Details', label: 'Open the analysis page', href: '/plugin/peak-qc/runs/42' },
]
const lastLink = ref('none')

function onNavigate(href: string, event: MouseEvent): void {
  event.preventDefault()
  lastLink.value = href
}
</script>

<template>
  <div>
    <PanelSections :sections="sections" @navigate="onNavigate" />
    <p class="mint-live-caption">Last plugin link: {{ lastLink }}</p>
  </div>
</template>
