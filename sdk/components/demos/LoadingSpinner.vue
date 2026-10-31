<script setup lang="ts">
import { LoadingSpinner } from '@morscherlab/mint-sdk'
</script>

<template>
  <div class="mint-live-row">
    <LoadingSpinner size="sm" variant="muted" label="Loading metadata" />
    <LoadingSpinner size="md" variant="primary" label="Running" />
    <LoadingSpinner size="lg" variant="cta" label="Exporting" />
  </div>
</template>
