<script setup lang="ts">
import { ref } from 'vue'
import { SecretInput } from '@morscherlab/mint-sdk/data'

const apiKey = ref<any>({ $secret: 'lims_api_key', set: true })
</script>

<template>
  <SecretInput v-model="apiKey" placeholder="Paste the LIMS API key" />
  <p class="mint-live-caption">Submitted value: {{ JSON.stringify(apiKey) }}</p>
</template>
