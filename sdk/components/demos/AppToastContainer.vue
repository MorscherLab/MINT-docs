<script setup lang="ts">
import { AppToastContainer, BaseButton, useToast } from '@morscherlab/mint-sdk'

const toast = useToast()
</script>

<template>
  <div class="mint-live-row">
    <BaseButton variant="primary" @click="toast.info('Export file is being generated...')">
      Show toast
    </BaseButton>
    <BaseButton variant="secondary" @click="toast.success('Experiment saved.')">
      Success
    </BaseButton>
    <AppToastContainer />
  </div>
</template>
