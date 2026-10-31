<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseModal } from '@morscherlab/mint-sdk'

const modalOpen = ref(false)
</script>

<template>
  <BaseButton variant="primary" @click="modalOpen = true">Open modal</BaseButton>
  <BaseModal v-model:open="modalOpen" title="Edit panel">
    <p>Modal body content for a plugin workflow.</p>
    <template #footer>
      <BaseButton variant="ghost" @click="modalOpen = false">Cancel</BaseButton>
      <BaseButton variant="primary" @click="modalOpen = false">Save</BaseButton>
    </template>
  </BaseModal>
</template>
