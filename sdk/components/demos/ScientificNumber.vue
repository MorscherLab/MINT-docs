<script setup lang="ts">
import { ScientificNumber } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <div class="mint-live-row">
    <ScientificNumber :value="0.0000342" notation="scientific" unit="M" />
    <ScientificNumber :value="1234567" notation="compact" />
  </div>
</template>
