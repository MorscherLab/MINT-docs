<script setup lang="ts">
import { ExperimentPopover } from '@morscherlab/mint-sdk/data'
</script>

<template>
  <div class="mint-menu-demo">
    <ExperimentPopover
      experiment-name="DRP Dose-Response Screen"
      experiment-code="EXP-042"
      experiment-status="ongoing"
      show-save
      show-detach
      :confirm-save="false"
    />
  </div>
</template>
