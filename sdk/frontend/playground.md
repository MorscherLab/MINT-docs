---
title: Component playground
description: Live previews and the full Histoire lab for MINT frontend SDK components.
---

<script setup lang="ts">
import { computed, ref } from 'vue'

const categories = ['All', 'Layout', 'Forms', 'Data', 'Lab', 'Feedback', 'Workflow']
const activeCategory = ref('All')
const query = ref('')

const components = [
  { name: 'AppLayout', category: 'Layout', description: 'Plugin shell with topbar, sidebars, content regions, and platform spacing.', story: 'src-components-applayout-story-vue', variant: 'src-components-applayout-story-vue-1' },
  { name: 'AppTopBar', category: 'Layout', description: 'Platform navigation bar with project context, tabs, avatar menu, and plugin state.', story: 'src-components-apptopbar-story-vue', variant: 'src-components-apptopbar-story-vue-0' },
  { name: 'AppSidebar', category: 'Layout', description: 'Structured side navigation for plugin tools and long-running workflows.', story: 'src-components-appsidebar-story-vue', variant: 'src-components-appsidebar-story-vue-0' },
  { name: 'BaseButton', category: 'Forms', description: 'Action button variants, sizes, disabled states, and loading treatment.', story: 'src-components-basebutton-story-vue', variant: 'src-components-basebutton-story-vue-1' },
  { name: 'BaseInput', category: 'Forms', description: 'Text and numeric input states with MINT design-token styling.', story: 'src-components-baseinput-story-vue', variant: 'src-components-baseinput-story-vue-0' },
  { name: 'FormField', category: 'Forms', description: 'Label, helper text, validation, and control layout wrapper.', story: 'src-components-formfield-story-vue', variant: 'src-components-formfield-story-vue-0' },
  { name: 'DataFrame', category: 'Data', description: 'Dense data table with sorting, search, pagination, selection, and loading states.', story: 'src-components-dataframe-story-vue', variant: 'src-components-dataframe-story-vue-1' },
  { name: 'ChemicalFormula', category: 'Data', description: 'Formula display with scientific typography and token-aware color.', story: 'src-components-chemicalformula-story-vue', variant: 'src-components-chemicalformula-story-vue-0' },
  { name: 'WellPlate', category: 'Lab', description: 'Interactive plate visualization for sample layouts, heatmaps, and conditions.', story: 'src-components-wellplate-story-vue', variant: 'src-components-wellplate-story-vue-1' },
  { name: 'DoseCalculator', category: 'Lab', description: 'Dilution and serial dilution planning for experiment setup.', story: 'src-components-dosecalculator-story-vue', variant: 'src-components-dosecalculator-story-vue-0' },
  { name: 'MoleculeInput', category: 'Lab', description: 'Chemical structure input and readonly structure previews.', story: 'src-components-moleculeinput-story-vue', variant: 'src-components-moleculeinput-story-vue-0' },
  { name: 'ExperimentTimeline', category: 'Lab', description: 'Experiment event timeline for protocol and result review.', story: 'src-components-experimenttimeline-story-vue', variant: 'src-components-experimenttimeline-story-vue-0' },
  { name: 'AlertBox', category: 'Feedback', description: 'Inline status, warning, error, and success messages with optional actions.', story: 'src-components-alertbox-story-vue', variant: 'src-components-alertbox-story-vue-1' },
  { name: 'ToastNotification', category: 'Feedback', description: 'Transient feedback for saves, failures, and background operations.', story: 'src-components-toastnotification-story-vue', variant: 'src-components-toastnotification-story-vue-0' },
  { name: 'StepWizard', category: 'Workflow', description: 'Multi-step analysis and experiment design flows with optional steps.', story: 'src-components-stepwizard-story-vue', variant: 'src-components-stepwizard-story-vue-0' },
]

const demos = [
  {
    title: 'Platform shell',
    description: 'A full plugin frame with top navigation and workspace regions.',
    story: 'src-components-applayout-story-vue',
    variant: 'src-components-applayout-story-vue-1',
    height: 'tall',
    code: `<AppLayout :navigation="navigation" :user="user">
  <ExperimentSummary :experiment="activeExperiment" />
</AppLayout>`,
  },
  {
    title: 'Data review',
    description: 'Searchable, sortable, paginated data display for result tables.',
    story: 'src-components-dataframe-story-vue',
    variant: 'src-components-dataframe-story-vue-1',
    height: 'tall',
    code: `<DataFrame
  :data="metaboliteRows"
  :columns="resultColumns"
  searchable
  sortable
/>`,
  },
  {
    title: 'Plate map',
    description: 'Well-level visualization for conditions, heatmaps, and sample layouts.',
    story: 'src-components-wellplate-story-vue',
    variant: 'src-components-wellplate-story-vue-1',
    height: 'tall',
    code: `<WellPlate
  :wells="plate.wells"
  mode="heatmap"
  :selected-wells="selection"
/>`,
  },
  {
    title: 'Workflow steps',
    description: 'Guided setup for analysis plugins and experiment design flows.',
    story: 'src-components-stepwizard-story-vue',
    variant: 'src-components-stepwizard-story-vue-0',
    height: 'short',
    code: `<StepWizard
  :steps="steps"
  :current-step-id="currentStep"
  @next="saveAndContinue"
/>`,
  },
]

const filteredComponents = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  return components.filter((component) => {
    const matchesCategory = activeCategory.value === 'All' || component.category === activeCategory.value
    const matchesQuery = !normalizedQuery || `${component.name} ${component.category} ${component.description}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesQuery
  })
})

function storyUrl(story: string, variant: string) {
  return `/sdk/frontend/histoire/#/story/${story}?variantId=${variant}`
}

function sandboxUrl(story: string, variant: string) {
  return `/sdk/frontend/histoire/__sandbox.html?storyId=${story}&variantId=${variant}`
}
</script>

# Component Playground

<div class="mint-showcase-hero">
  <p>
    Explore the MINT frontend SDK as a public component showcase first, then open the full Histoire lab when you need exhaustive props, variants, and review backgrounds.
  </p>
  <div class="mint-showcase-actions">
    <a class="mint-showcase-button mint-showcase-button--primary" href="/sdk/frontend/histoire/">Open full Histoire lab</a>
    <a class="mint-showcase-button" href="/sdk/frontend/components">Read component docs</a>
  </div>
</div>

## Live Examples

<div class="mint-demo-grid">
  <section
    v-for="demo in demos"
    :key="demo.title"
    class="mint-demo-card"
    :class="{ 'mint-demo-card--wide': demo.title === 'Platform shell' }"
  >
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">{{ demo.title }}</h3>
        <p class="mint-demo-card__desc">{{ demo.description }}</p>
      </div>
      <a class="mint-demo-card__link" :href="storyUrl(demo.story, demo.variant)">Open</a>
    </div>
    <iframe
      class="mint-demo-frame"
      :class="{
        'mint-demo-frame--short': demo.height === 'short',
        'mint-demo-frame--tall': demo.height === 'tall',
      }"
      :src="sandboxUrl(demo.story, demo.variant)"
      :title="`${demo.title} live preview`"
      loading="lazy"
    ></iframe>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code>{{ demo.code }}</code></pre>
      </div>
    </details>
  </section>
</div>

## Component Index

<div class="mint-showcase-toolbar">
  <input
    v-model="query"
    class="mint-showcase-search"
    type="search"
    placeholder="Search components"
    aria-label="Search components"
  />
  <div class="mint-showcase-segments" aria-label="Component categories">
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      :class="{ 'is-active': activeCategory === category }"
      @click="activeCategory = category"
    >
      {{ category }}
    </button>
  </div>
</div>

<div class="mint-component-grid">
  <a
    v-for="component in filteredComponents"
    :key="component.name"
    class="mint-component-tile"
    :href="storyUrl(component.story, component.variant)"
  >
    <span class="mint-component-tile__meta">{{ component.category }}</span>
    <span class="mint-component-tile__name">{{ component.name }}</span>
    <span class="mint-component-tile__desc">{{ component.description }}</span>
  </a>
</div>

<div class="mint-showcase-note">
  The showcase highlights common plugin workflows. The Histoire lab remains the complete source for every component story, prop playground, theme background, and edge-case variant.
</div>

## Local Development

Use the same stories locally while building SDK components:

```bash
cd packages/sdk-frontend
bun run story:dev
# http://localhost:6006
```
