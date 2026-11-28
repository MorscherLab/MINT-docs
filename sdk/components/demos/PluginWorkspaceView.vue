<script setup lang="ts">
import { ref } from 'vue'
import {
  DataFrame,
  PluginWorkspaceView,
  SectionCard,
  defineControlModel,
  defineDataFrame,
  definePluginWorkspaceView,
} from '@morscherlab/mint-sdk'

const controls = defineControlModel({
  views: {
    analysis: {
      label: 'Analysis',
      sections: {
        parameters: {
          label: 'Parameters',
          controls: {
            threshold: { type: 'number', label: 'Threshold (%)', default: 72 },
            workflow: {
              type: 'select',
              label: 'Workflow',
              default: 'dose',
              options: [
                { value: 'dose', label: 'Dose response' },
                { value: 'qc', label: 'QC review' },
              ],
            },
          },
        },
      },
    },
    results: {
      label: 'Results',
      sections: {
        display: {
          label: 'Display',
          controls: {
            includeControls: { type: 'checkbox', label: 'Include controls', default: true },
          },
        },
      },
    },
  },
})

const workspace = definePluginWorkspaceView({
  title: 'Dose Response',
  subtitle: 'Plugin workspace',
  main: 'card',
  sidebar: { title: 'Tools', controls },
})

const view = ref('analysis')
const values = ref<Record<string, unknown>>({})

const table = defineDataFrame({
  rowKey: 'id',
  size: 'sm',
  columns: [
    { key: 'id', label: 'Run', align: 'center' },
    { key: 'compound', label: 'Compound' },
    { key: 'response', label: 'Response %', align: 'right' },
  ],
})

const rows = [
  { id: 1, compound: 'MINT-2847', response: 98 },
  { id: 2, compound: 'MINT-3192', response: 93.4 },
  { id: 3, compound: 'Vehicle', response: 3.5 },
]
</script>

<template>
  <div class="mint-app-shell-demo mint-app-shell-demo--workspace">
    <PluginWorkspaceView v-model:view="view" v-model:values="values" :spec="workspace">
      <SectionCard title="Summary">
        <div class="mint-section-card__content">
          View: {{ view }}. Threshold: {{ values.threshold ?? 72 }} %.
        </div>
      </SectionCard>
      <SectionCard title="Results">
        <DataFrame :spec="table" :data="rows" />
      </SectionCard>
    </PluginWorkspaceView>
  </div>
</template>
