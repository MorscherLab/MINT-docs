<script setup lang="ts">
import { ref } from 'vue'
import { BaseSelect } from '@morscherlab/mint-sdk'

const selectValue = ref('dose')
const selectOptions = [
  { value: 'dose', label: 'Dose response' },
  { value: 'qc', label: 'QC review' },
  { value: 'export', label: 'Export' },
]
</script>

<template>
  <BaseSelect v-model="selectValue" :options="selectOptions" />
  <p class="mint-live-caption">Selected: {{ selectValue }}</p>
</template>
