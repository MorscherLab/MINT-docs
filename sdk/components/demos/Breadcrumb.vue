<script setup lang="ts">
import { Breadcrumb } from '@morscherlab/mint-sdk'

const breadcrumbItems = [
  { label: 'Project' },
  { label: 'Experiment' },
  { label: 'Dose response' },
]
</script>

<template>
  <Breadcrumb :items="breadcrumbItems" />
</template>
