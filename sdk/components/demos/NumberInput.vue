<script setup lang="ts">
import { ref } from 'vue'
import { NumberInput } from '@morscherlab/mint-sdk'

const numberValue = ref(96)
</script>

<template>
  <NumberInput v-model="numberValue" :min="0" :max="384" :step="1" unit="wells" />
</template>
