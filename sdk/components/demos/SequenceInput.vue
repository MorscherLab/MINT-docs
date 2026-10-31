<script setup lang="ts">
import { ref } from 'vue'
import { SequenceInput } from '@morscherlab/mint-sdk/lab'

const sequenceValue = ref('ATGCGTAGCTAGGCTAATCG')
</script>

<template>
  <SequenceInput v-model="sequenceValue" type="dna" :rows="4" :show-tools="true" :show-stats="true" />
</template>
