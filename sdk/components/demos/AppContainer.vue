<script setup lang="ts">
import { AppContainer } from '@morscherlab/mint-sdk'
</script>

<template>
  <AppContainer direction="row" gap="0.75rem">
    <div class="mint-workspace-card">
      <strong>Plate A</strong>
      <span>96 wells</span>
    </div>
    <div class="mint-workspace-card">
      <strong>QC</strong>
      <span>8 samples</span>
    </div>
    <div class="mint-workspace-card">
      <strong>Status</strong>
      <span>Ready</span>
    </div>
  </AppContainer>
</template>
