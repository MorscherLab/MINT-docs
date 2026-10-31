<script setup lang="ts">
import { Skeleton } from '@morscherlab/mint-sdk'
</script>

<template>
  <div class="mint-skeleton-demo">
    <Skeleton variant="circular" :width="48" :height="48" />
    <div>
      <Skeleton variant="text" width="65%" />
      <Skeleton variant="text" width="42%" />
      <Skeleton variant="rounded" height="72px" />
    </div>
  </div>
</template>
