<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, ConfirmDialog } from '@morscherlab/mint-sdk'

const confirmOpen = ref(false)
</script>

<template>
  <BaseButton variant="danger" @click="confirmOpen = true">Delete panel</BaseButton>
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Delete panel?"
    message="This cannot be undone."
    tone="error"
    confirm-label="Delete"
    @confirm="confirmOpen = false"
  />
</template>
