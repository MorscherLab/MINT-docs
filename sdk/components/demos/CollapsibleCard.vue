<script setup lang="ts">
import { ref } from 'vue'
import { CollapsibleCard } from '@morscherlab/mint-sdk'

const cardToggleValue = ref(true)
</script>

<template>
  <CollapsibleCard
    title="Analysis settings"
    subtitle="Open to review plugin defaults."
    badge="3"
    default-open
    show-toggle
    :toggle-value="cardToggleValue"
    @update:toggle-value="cardToggleValue = $event"
  >
    <div class="mint-wizard-panel">
      <strong>Normalization</strong>
      <span>Median fold change with QC samples included.</span>
    </div>
  </CollapsibleCard>
</template>
