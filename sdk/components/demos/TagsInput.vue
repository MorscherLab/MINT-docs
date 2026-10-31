<script setup lang="ts">
import { ref } from 'vue'
import { TagsInput } from '@morscherlab/mint-sdk/data'

const tagsValue = ref(['control', 'dose'])
</script>

<template>
  <TagsInput v-model="tagsValue" :suggestions="['control', 'dose', 'qc', 'blank']" />
</template>
