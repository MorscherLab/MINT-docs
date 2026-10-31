<script setup lang="ts">
import { ref } from 'vue'
import { DataFrame } from '@morscherlab/mint-sdk'

const selectedRows = ref<(string | number)[]>([2])
const dataFrameColumnWidths = ref<Record<string, number>>({})

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
</script>

<template>
  <DataFrame
    :data="resultRows"
    :columns="resultColumns"
    row-key="id"
    :selected-keys="selectedRows"
    searchable
    sortable
    selectable
    sticky-header
    resizable
    deletable
    bordered
    size="sm"
    :pagination="false"
    v-model:column-widths="dataFrameColumnWidths"
    @update:selected-keys="selectedRows = $event"
  />
</template>
