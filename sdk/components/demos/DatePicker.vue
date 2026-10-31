<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@morscherlab/mint-sdk'

const dateValue = ref('2026-05-29')
</script>

<template>
  <DatePicker v-model="dateValue" placeholder="Select run date" clearable />
</template>
