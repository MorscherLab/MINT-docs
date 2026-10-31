<script setup lang="ts">
import { ResourceCard } from '@morscherlab/mint-sdk/lab'

const resourceSpecs = [
  { label: 'Mode', value: 'ESI+' },
  { label: 'Queue', value: '3 runs' },
  { label: 'Runtime', value: '42 min' },
]
</script>

<template>
  <ResourceCard
    name="LC-MS Orbitrap"
    description="Shared instrument for metabolomics runs."
    status="available"
    location="Room 3.214"
    :specs="resourceSpecs"
    :tags="['LC-MS', 'Metabolomics']"
    next-available="Today, 15:30"
  />
</template>
