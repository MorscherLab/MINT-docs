<script setup lang="ts">
import { computed, ref } from 'vue'
import { componentCategories, componentDocs, componentSlug } from '../../componentCatalog'

const query = ref('')

const filteredGroups = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return componentCategories
    .map((category) => ({
      category,
      components: componentDocs.filter((component) => {
        const matchesCategory = component.category === category
        const matchesQuery = !normalizedQuery
          || `${component.name} ${component.description} ${component.category}`.toLowerCase().includes(normalizedQuery)
        return matchesCategory && matchesQuery
      }),
    }))
    .filter((group) => group.components.length > 0)
})
</script>

<template>
  <div class="mint-component-library">
    <div class="mint-showcase-toolbar">
      <input
        v-model="query"
        class="mint-showcase-search"
        type="search"
        placeholder="Search components"
        aria-label="Search components"
      />
    </div>

    <section
      v-for="group in filteredGroups"
      :key="group.category"
      class="mint-component-section"
    >
      <h2>{{ group.category }}</h2>
      <div class="mint-component-grid">
        <a
          v-for="component in group.components"
          :key="component.name"
          class="mint-component-tile"
          :href="`/sdk/components/${componentSlug(component.name)}`"
        >
          <span class="mint-component-tile__meta">{{ component.category }}</span>
          <span class="mint-component-tile__name">{{ component.name }}</span>
          <span class="mint-component-tile__desc">{{ component.description }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
