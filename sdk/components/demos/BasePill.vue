<script setup lang="ts">
import { BasePill } from '@morscherlab/mint-sdk'
</script>

<template>
  <div class="mint-live-row">
    <BasePill tone="success" dot>Completed</BasePill>
    <BasePill tone="warning">Needs review</BasePill>
    <BasePill tone="error">Failed</BasePill>
  </div>
</template>
