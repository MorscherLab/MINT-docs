<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@morscherlab/mint-sdk'
import { VersionConflictDialog } from '@morscherlab/mint-sdk/data'

const open = ref(false)
const loading = ref(false)
const result = ref('')

function overwrite() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    open.value = false
    result.value = 'Overwritten'
  }, 800)
}
function reload() {
  open.value = false
  result.value = 'Reloaded, edits discarded'
}
</script>

<template>
  <div class="mint-live-row">
    <BaseButton variant="secondary" @click="open = true">Save with a version conflict</BaseButton>
  </div>
  <VersionConflictDialog
    v-model:open="open"
    entity="EXP-042 · Cisplatin dose response"
    :changes="['Cell line', 'Dose']"
    :loading="loading"
    @reload="reload"
    @overwrite="overwrite"
  />
  <p class="mint-live-caption">{{ result || 'Open the dialog, then pick Overwrite or Reload.' }}</p>
</template>
