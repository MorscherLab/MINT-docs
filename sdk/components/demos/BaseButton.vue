<script setup lang="ts">
import { BaseButton } from '@morscherlab/mint-sdk'
</script>

<template>
  <div class="mint-live-row">
    <BaseButton variant="primary">Publish</BaseButton>
    <BaseButton variant="secondary">Review</BaseButton>
    <BaseButton variant="ghost" loading>Saving</BaseButton>
  </div>
</template>
