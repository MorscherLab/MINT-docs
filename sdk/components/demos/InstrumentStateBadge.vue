<script setup lang="ts">
import { InstrumentStateBadge } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <div class="mint-live-row">
    <InstrumentStateBadge state="running" />
    <InstrumentStateBadge state="standby" />
    <InstrumentStateBadge state="error" />
    <InstrumentStateBadge state="disconnected" />
  </div>
</template>
