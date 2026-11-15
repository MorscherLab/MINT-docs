<script setup lang="ts">
import { ref } from 'vue'
import { MetadataSheet, type MetadataSheetColumn, type MetadataSheetRow } from '@morscherlab/mint-sdk/lab'

const columns = ref<MetadataSheetColumn[]>([
  { key: 'treatment', label: 'Treatment', kind: 'text', role: 'group' },
  { key: 'time', label: 'Time', kind: 'number', role: 'order', unit: 'h' },
  { key: 'note', label: 'Note', kind: 'text', role: 'info' },
])
const rows = ref<MetadataSheetRow[]>([
  { run: 'ctrl_0h_1', type: 'sample', values: { treatment: 'Control', time: '0', note: '' } },
  { run: 'ctrl_0h_2', type: 'sample', values: { treatment: 'Control', time: '0', note: '' } },
  { run: 'drug_6h_1', type: 'sample', values: { treatment: 'Drug', time: '6', note: 're-injected' } },
  { run: 'drug_6h_2', type: 'sample', values: { treatment: 'Drug', time: '', note: '' } },
  { run: 'blank_1', type: 'blank', values: {} },
])
</script>

<template>
  <MetadataSheet v-model:rows="rows" v-model:columns="columns" run-hint="from files" />
</template>
