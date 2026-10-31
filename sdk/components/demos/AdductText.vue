<script setup lang="ts">
import { AdductText } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <div class="mint-live-row">
    <AdductText value="[M+H]+" />
    <AdductText value="[M+Na]+" variant="badge" />
    <AdductText value="[M-H]-" tone="muted" />
  </div>
</template>
