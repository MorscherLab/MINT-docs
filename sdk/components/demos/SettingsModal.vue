<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseInput, BaseSelect, BaseCheckbox, FormField, SettingsModal } from '@morscherlab/mint-sdk'

const settingsDemoOpen = ref(false)
const textValue = ref('Dose-response panel')
const selectValue = ref('dose')
const toggleValue = ref(true)
const selectOptions = [
  { value: 'dose', label: 'Dose response' },
  { value: 'qc', label: 'QC review' },
  { value: 'export', label: 'Export' },
]
</script>

<template>
  <BaseButton variant="primary" @click="settingsDemoOpen = true">Open settings</BaseButton>
  <SettingsModal
    v-model:open="settingsDemoOpen"
    title="Plugin settings"
    :tabs="[{ id: 'analysis', label: 'Analysis' }]"
    :show-appearance="false"
  >
    <template #tab-analysis>
      <div class="mint-settings-demo">
        <FormField label="Panel name">
          <BaseInput v-model="textValue" />
        </FormField>
        <FormField label="Workflow">
          <BaseSelect v-model="selectValue" :options="selectOptions" />
        </FormField>
        <BaseCheckbox v-model="toggleValue" type="switch" label="Show QC warnings" />
      </div>
    </template>
  </SettingsModal>
</template>
