<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox } from '@morscherlab/mint-sdk'

const checkboxValue = ref(true)
</script>

<template>
  <BaseCheckbox v-model="checkboxValue" label="Include blanks" />
</template>
