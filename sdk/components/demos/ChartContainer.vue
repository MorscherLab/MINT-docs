<script setup lang="ts">
import { BaseButton } from '@morscherlab/mint-sdk'
import { ChartContainer } from '@morscherlab/mint-sdk/lab'
</script>

<template>
  <ChartContainer title="Response by dose" description="Minimal static chart content inside the SDK chart frame.">
    <template #toolbar>
      <BaseButton variant="ghost" size="sm">Export</BaseButton>
    </template>
    <div class="mint-chart-demo" aria-label="Example response chart">
      <div class="mint-chart-demo__bar" style="height: 34%"><span>0 nM</span></div>
      <div class="mint-chart-demo__bar" style="height: 52%"><span>10 nM</span></div>
      <div class="mint-chart-demo__bar" style="height: 78%"><span>100 nM</span></div>
      <div class="mint-chart-demo__bar" style="height: 92%"><span>1 mM</span></div>
    </div>
    <template #legend>
      <span class="mint-live-caption">Peak area normalized to vehicle control.</span>
    </template>
  </ChartContainer>
</template>
