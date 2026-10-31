<script setup lang="ts">
import { DoseCalculator } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <DoseCalculator :target-wells="['B2', 'B3', 'B4', 'B5']" :molecular-weight="180.16" />
</template>
