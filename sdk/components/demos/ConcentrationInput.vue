<script setup lang="ts">
import { ref } from 'vue'
import { ConcentrationInput } from '@morscherlab/mint-sdk/lab'

const concentrationValue = ref({ value: 10, unit: 'nM' })
</script>

<template>
  <ConcentrationInput
    v-model="concentrationValue"
    :allowed-units="['nM', 'mM', 'M', 'ng/mL', 'mg/mL']"
    :molecular-weight="180.16"
  />
</template>
