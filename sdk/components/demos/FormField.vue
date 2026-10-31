<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput, FormField } from '@morscherlab/mint-sdk'

const textValue = ref('Dose-response panel')
</script>

<template>
  <FormField label="Required metadata" hint="Hints and validation messages stay close to the control." required field-id="metadata-title">
    <BaseInput id="metadata-title" v-model="textValue" placeholder="Metadata title" />
  </FormField>
</template>
