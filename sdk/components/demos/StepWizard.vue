<script setup lang="ts">
import { ref } from 'vue'
import { StepWizard } from '@morscherlab/mint-sdk/lab'

const currentStep = ref(1)
const wizardSteps = [
  { id: 'setup', label: 'Setup', description: 'Configure metadata' },
  { id: 'samples', label: 'Samples', description: 'Choose wells' },
  { id: 'review', label: 'Review', description: 'Confirm' },
]
</script>

<template>
  <StepWizard v-model="currentStep" :steps="wizardSteps" :linear="false">
    <template #step-setup>
      <div class="mint-wizard-panel">
        <strong>Setup</strong>
        <span>Choose experiment metadata and defaults.</span>
      </div>
    </template>
    <template #step-samples>
      <div class="mint-wizard-panel">
        <strong>Samples</strong>
        <span>Select wells, controls, and replicate groups.</span>
      </div>
    </template>
    <template #step-review>
      <div class="mint-wizard-panel">
        <strong>Review</strong>
        <span>Confirm settings before publishing the design.</span>
      </div>
    </template>
  </StepWizard>
</template>
