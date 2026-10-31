<script setup lang="ts">
import { ref } from 'vue'
import { FormBuilder } from '@morscherlab/mint-sdk'

const formBuilderValues = ref<Record<string, unknown>>({
  panelName: 'Dose-response panel',
  method: 'four-pl',
  normalize: true,
  threshold: 0.05,
  tags: ['qc', 'dose'],
})

const formBuilderSchema = {
  sections: [
    {
      id: 'analysis',
      title: 'Analysis settings',
      description: 'Example schema that plugin authors can ship with a frontend.',
      columns: 2,
      fields: [
        {
          name: 'panelName',
          label: 'Panel name',
          type: 'text',
          placeholder: 'Dose-response panel',
          validation: { required: true },
        },
        {
          name: 'method',
          label: 'Fit model',
          type: 'select',
          props: {
            options: [
              { value: 'four-pl', label: '4-parameter logistic' },
              { value: 'linear', label: 'Linear' },
              { value: 'spline', label: 'Spline' },
            ],
          },
        },
        {
          name: 'threshold',
          label: 'QC threshold',
          type: 'number',
          props: { min: 0, max: 1, step: 0.01 },
          hint: 'Acceptable median CV cutoff.',
        },
        {
          name: 'normalize',
          label: 'Normalize intensities',
          type: 'toggle',
          hint: 'Scale peak areas before fitting.',
        },
        {
          name: 'tags',
          label: 'Tags',
          type: 'tags',
          colSpan: 2,
          props: { suggestions: ['qc', 'dose', 'vehicle', 'blank'] },
        },
      ],
    },
  ],
  submitLabel: 'Save design',
  showCancel: true,
}
</script>

<template>
  <div class="mint-form-builder-demo">
    <FormBuilder v-model="formBuilderValues" :schema="formBuilderSchema" size="sm" />
    <pre>{{ JSON.stringify(formBuilderValues, null, 2) }}</pre>
  </div>
</template>
