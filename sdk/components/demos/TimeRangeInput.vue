<script setup lang="ts">
import { ref } from 'vue'
import { TimeRangeInput } from '@morscherlab/mint-sdk/lab'

const timeRangeValue = ref({ start: '09:00', end: '11:30' })
</script>

<template>
  <TimeRangeInput v-model="timeRangeValue" min="08:00" max="18:00" :step="30" format="12h" show-duration />
</template>
