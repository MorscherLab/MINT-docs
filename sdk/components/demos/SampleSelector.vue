<script setup lang="ts">
import { ref } from 'vue'
import { SampleSelector } from '@morscherlab/mint-sdk/lab'

const sampleSelection = ref(['Vehicle_A1', 'Drug_A1', 'Drug_A2'])
const sampleGroups = ref([
  { name: 'Vehicle', color: '#2563eb', samples: ['Vehicle_A1', 'Vehicle_A2'] },
  { name: 'Drug / Low', color: '#f97316', samples: ['Drug_A1', 'Drug_A2'] },
  { name: 'Drug / High', color: '#dc2626', samples: ['Drug_B1', 'Drug_B2'] },
  { name: 'QC', color: '#16a34a', samples: ['QC_01', 'QC_02'] },
])
</script>

<template>
  <SampleSelector
    v-model="sampleSelection"
    v-model:groups="sampleGroups"
    :samples="['Vehicle_A1', 'Vehicle_A2', 'Drug_A1', 'Drug_A2', 'Drug_B1', 'Drug_B2', 'QC_01', 'QC_02']"
    :enable-smart-group="false"
    :autoload-experiment-data="false"
  />
</template>
