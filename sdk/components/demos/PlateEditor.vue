<script setup lang="ts">
import { PlateEditor, useRackEditor } from '@morscherlab/mint-sdk/lab'
import type { Rack } from '@morscherlab/mint-sdk'

const seed: Rack[] = [{
  id: 'rack-1', name: 'Rack 1', format: 96, slot: 'R', injectionVolume: 5,
  wells: {
    A1: { state: 'filled', sampleType: 'blank', metadata: { label: 'Blank' } },
    A2: { state: 'filled', sampleType: 'qc', metadata: { label: 'QC01' } },
    A3: { state: 'filled', sampleType: 'sample', metadata: { label: 'S001' } },
    A4: { state: 'filled', sampleType: 'sample', metadata: { label: 'S002' } },
    B1: { state: 'filled', sampleType: 'sample', metadata: { label: 'S003' } },
  },
}]
const { racks, activeRackId, plateEditorListeners, canUndo, canRedo } = useRackEditor(seed)
</script>

<template>
  <div class="mint-live-surface mint-live-surface--plate">
    <PlateEditor v-model="racks" v-model:active-rack="activeRackId" :can-undo="canUndo" :can-redo="canRedo" v-on="plateEditorListeners" />
  </div>
</template>
