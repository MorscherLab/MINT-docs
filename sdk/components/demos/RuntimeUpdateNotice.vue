<script setup lang="ts">
import { ref } from 'vue'
import { RuntimeUpdateNotice } from '@morscherlab/mint-sdk/runtime'
import { BaseButton } from '@morscherlab/mint-sdk'

const visible = ref(true)
const reloads = ref(0)
</script>

<template>
  <div class="mint-live-row">
    <BaseButton size="sm" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }} notice</BaseButton>
    <p class="mint-live-caption">Reload requests: {{ reloads }}</p>
  </div>
  <RuntimeUpdateNotice :visible="visible" @reload="reloads++" />
</template>
