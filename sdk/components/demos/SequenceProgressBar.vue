<script setup lang="ts">
import { SequenceProgressBar } from '@morscherlab/mint-sdk/lab'

const sequenceProgress = {
  sequence_name: 'MINT_Dose_Response_042',
  current_sample: 18,
  total_samples: 48,
  elapsed_seconds: 3240,
  estimated_remaining_seconds: 5400,
  current_sample_name: 'Sample B07',
  current_method: 'polar_pos_12min.raw',
}
</script>

<template>
  <SequenceProgressBar :progress="sequenceProgress" label="samples" />
</template>
