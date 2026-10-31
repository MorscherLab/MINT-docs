<script setup lang="ts">
import { ref } from 'vue'
import { ProtocolStepEditor } from '@morscherlab/mint-sdk/lab'
import type { ProtocolStep } from '@morscherlab/mint-sdk'

const protocolStepValue = ref<ProtocolStep>({
  id: 'step-edit',
  type: 'incubation',
  name: 'Incubate plate',
  description: 'Incubate treated and control wells before LC-MS extraction.',
  duration: 45,
  status: 'in_progress',
  order: 1,
  parameters: { temperature: 37, unit: 'C' },
})
</script>

<template>
  <ProtocolStepEditor v-model="protocolStepValue" mode="edit" />
</template>
