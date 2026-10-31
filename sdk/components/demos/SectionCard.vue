<script setup lang="ts">
import { SectionCard, BaseButton } from '@morscherlab/mint-sdk'

const runs = [
  { id: 'EXP-041', instrument: 'Orbitrap Exploris 240', samples: 48 },
  { id: 'EXP-042', instrument: 'Orbitrap Exploris 240', samples: 96 },
  { id: 'EXP-043', instrument: 'Q Exactive HF', samples: 24 },
]
</script>

<template>
  <SectionCard title="Ongoing runs" :count="`${runs.length} ongoing`" accent="primary">
    <template #actions>
      <BaseButton size="sm" variant="ghost">Export</BaseButton>
    </template>
    <div v-for="run in runs" :key="run.id" class="mint-live-row">
      <strong>{{ run.id }}</strong>
      <span class="mint-live-caption">{{ run.instrument }} · {{ run.samples }} samples</span>
    </div>
  </SectionCard>
</template>
