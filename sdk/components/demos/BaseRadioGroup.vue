<script setup lang="ts">
import { ref } from 'vue'
import { BaseRadioGroup } from '@morscherlab/mint-sdk'

const radioValue = ref('treated')
const radioOptions = [
  { value: 'control', label: 'Control' },
  { value: 'treated', label: 'Treated' },
  { value: 'blank', label: 'Blank' },
]
</script>

<template>
  <BaseRadioGroup v-model="radioValue" name="sample-type" :options="radioOptions" direction="horizontal" variant="tile" />
</template>
