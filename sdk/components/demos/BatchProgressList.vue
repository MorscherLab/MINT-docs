<script setup lang="ts">
import { BatchProgressList } from '@morscherlab/mint-sdk/data'
import type { BatchItem } from '@morscherlab/mint-sdk'

const batchItems: BatchItem[] = [
  { id: 'batch-1', label: 'Read metadata', status: 'completed' },
  { id: 'batch-2', label: 'Normalize peak areas', status: 'completed' },
  { id: 'batch-3', label: 'Fit dose curves', status: 'processing', progress: 62 },
  { id: 'batch-4', label: 'Generate report', status: 'pending' },
  { id: 'batch-5', label: 'Upload QC attachment', status: 'error', message: 'Checksum mismatch on retry.' },
]
</script>

<template>
  <BatchProgressList :items="batchItems" title="Analysis batch" max-height="18rem" />
</template>
