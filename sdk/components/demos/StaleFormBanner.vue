<script setup lang="ts">
import { ref } from 'vue'
import { StaleFormBanner } from '@morscherlab/mint-sdk/data'

const change = {
  actors: ['Jonas Weiss', 'Lena Fischer'],
  fields: ['Cell line', 'Dose', 'End date'],
  at: new Date(Date.now() - 45_000).toISOString(),
}
const visible = ref(true)
const log = ref('')
</script>

<template>
  <StaleFormBanner
    v-if="visible"
    :change="change"
    review-href="#"
    @reload="log = 'Reload requested'"
    @dismiss="visible = false"
  />
  <p class="mint-live-caption">{{ visible ? (log || 'Click Reload form or the dismiss button.') : 'Banner dismissed.' }}</p>
</template>
