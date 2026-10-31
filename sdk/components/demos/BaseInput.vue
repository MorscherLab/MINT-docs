<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput, FormField } from '@morscherlab/mint-sdk'

const textValue = ref('Dose-response panel')
</script>

<template>
  <FormField label="Panel name">
    <BaseInput v-model="textValue" placeholder="Panel name" />
  </FormField>
</template>
