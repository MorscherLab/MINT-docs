<script setup lang="ts">
import { ref } from 'vue'
import { FormulaInput } from '@morscherlab/mint-sdk/lab'

const formulaValue = ref('C6H12O6')
</script>

<template>
  <FormulaInput v-model="formulaValue" />
</template>
