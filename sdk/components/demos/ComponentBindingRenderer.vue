<script setup lang="ts">
import { ComponentBindingRenderer } from '@morscherlab/mint-sdk/runtime'

const resultColumns = [
  { key: 'id', label: 'Run', align: 'center', sortable: true },
  { key: 'compound', label: 'Compound', sortable: true },
  { key: 'well', label: 'Well', align: 'center' },
  { key: 'response', label: 'Response %', align: 'right', sortable: true },
  { key: 'status', label: 'Status' },
]

const resultRows = [
  { id: 1, compound: 'MINT-2847', well: 'A1', response: 98, status: 'Pass' },
  { id: 2, compound: 'MINT-3192', well: 'A2', response: 93.4, status: 'Pass' },
  { id: 3, compound: 'Vehicle', well: 'A3', response: 3.5, status: 'Pass' },
  { id: 4, compound: 'MINT-2847', well: 'B1', response: 84.2, status: 'Flagged' },
]

const plateWells = Object.fromEntries(
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => {
      const id = `${String.fromCharCode(65 + row)}${col + 1}`
      const value = Math.max(0.05, 1 - (row + col) / 19)
      return [id, { state: 'filled', sampleType: col % 3 === 0 ? 'control' : 'sample', value }]
    }),
  ).flat(),
)

const componentBindings = [
  {
    id: 'dose-table',
    component: 'DataFrame',
    template_id: 'results.table',
    description: 'A generated result table binding.',
    propsObject: {
      data: resultRows,
      columns: resultColumns,
      rowKey: 'id',
      searchable: false,
      sortable: true,
      stickyHeader: true,
      pagination: false,
    },
  },
  {
    id: 'plate-preview',
    component: 'WellPlate',
    template_id: 'design.plate',
    description: 'A generated plate preview binding.',
    propsObject: {
      wells: plateWells,
      selectionMode: 'multiple',
      modelValue: ['B2', 'B3', 'C2'],
      size: 'fill',
    },
  },
]
</script>

<template>
  <div class="mint-component-binding-demo">
    <ComponentBindingRenderer
      :bindings="componentBindings"
      readonly
      dense
      layout="stack"
    />
  </div>
</template>
