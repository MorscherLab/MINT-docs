---
title: Component playground
description: Live previews for MINT frontend SDK components.
---

<script setup lang="ts">
import { computed, ref } from 'vue'
import '@morscherlab/mint-sdk/styles'
import {
  AlertBox,
  BaseButton,
  ChemicalFormula,
  DataFrame,
  StatusIndicator,
  StepWizard,
  WellPlate,
} from '@morscherlab/mint-sdk/components'

const categories = ['All', 'Layout', 'Forms', 'Data', 'Lab', 'Feedback', 'Workflow']
const activeCategory = ref('All')
const query = ref('')
const selectedWells = ref(['B2', 'C3'])
const currentStep = ref(1)

const components = [
  { name: 'AppLayout', category: 'Layout', description: 'Plugin shell with topbar, sidebars, content regions, and platform spacing.', href: '/sdk/frontend/components#applayout' },
  { name: 'AppTopBar', category: 'Layout', description: 'Platform navigation bar with project context, tabs, avatar menu, and plugin state.', href: '/sdk/frontend/components#apptopbar' },
  { name: 'BaseButton', category: 'Forms', description: 'Action button variants, sizes, disabled states, and loading treatment.', href: '/sdk/frontend/components#basebutton' },
  { name: 'BaseInput', category: 'Forms', description: 'Text and numeric input states with MINT design-token styling.', href: '/sdk/frontend/components#baseinput' },
  { name: 'DataFrame', category: 'Data', description: 'Dense data table with sorting, search, pagination, selection, and loading states.', href: '/sdk/frontend/components#dataframe' },
  { name: 'ChemicalFormula', category: 'Data', description: 'Formula display with scientific typography and token-aware color.', href: '/sdk/frontend/components#chemicalformula' },
  { name: 'WellPlate', category: 'Lab', description: 'Interactive plate visualization for sample layouts, heatmaps, and conditions.', href: '/sdk/frontend/components#wellplate' },
  { name: 'DoseCalculator', category: 'Lab', description: 'Dilution and serial dilution planning for experiment setup.', href: '/sdk/frontend/components#dosecalculator' },
  { name: 'ExperimentTimeline', category: 'Lab', description: 'Experiment event timeline for protocol and result review.', href: '/sdk/frontend/components#experimenttimeline' },
  { name: 'AlertBox', category: 'Feedback', description: 'Inline status, warning, error, and success messages with optional actions.', href: '/sdk/frontend/components#alertbox' },
  { name: 'StatusIndicator', category: 'Feedback', description: 'Compact status labels for table rows, process state, and experiment checks.', href: '/sdk/frontend/components#statusindicator' },
  { name: 'StepWizard', category: 'Workflow', description: 'Multi-step analysis and experiment design flows with optional steps.', href: '/sdk/frontend/components#stepwizard' },
]

const resultColumns = [
  { key: 'compound', label: 'Compound', sortable: true },
  { key: 'well', label: 'Well', align: 'center' },
  { key: 'response', label: 'Response %', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
]

const resultRows = [
  { id: 1, compound: 'MINT-2847', well: 'A1', response: 95.2, status: 'Pass' },
  { id: 2, compound: 'MINT-2847', well: 'A2', response: 82.1, status: 'Pass' },
  { id: 3, compound: 'MINT-2847', well: 'A3', response: 54.7, status: 'Pass' },
  { id: 4, compound: 'MINT-3192', well: 'B1', response: 88.7, status: 'Pass' },
  { id: 5, compound: 'MINT-3192', well: 'B2', response: 45.2, status: 'Flagged' },
  { id: 6, compound: 'Vehicle', well: 'C1', response: 2.3, status: 'Pass' },
]

const heatmapWells = Object.fromEntries(
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => {
      const id = `${String.fromCharCode(65 + row)}${col + 1}`
      const value = Math.max(0.05, 1 - (row + col) / 19)
      return [id, { state: 'filled', sampleType: col % 3 === 0 ? 'control' : 'sample', value }]
    }),
  ).flat(),
)

const wizardSteps = [
  { id: 'setup', label: 'Setup', description: 'Configure the experiment' },
  { id: 'samples', label: 'Samples', description: 'Choose wells and groups' },
  { id: 'review', label: 'Review', description: 'Confirm and submit' },
]

const codeSamples = {
  feedback: `<AlertBox type="success" title="Analysis complete" action-label="Open result">
  24 samples processed. QC checks passed for 23 samples.
</AlertBox>

<BaseButton variant="primary">Publish</BaseButton>`,
  data: `<DataFrame
  :data="resultRows"
  :columns="resultColumns"
  row-key="id"
  searchable
  sortable
  bordered
/>`,
  plate: `<WellPlate
  v-model="selectedWells"
  :wells="heatmapWells"
  :heatmap="{ enabled: true, min: 0, max: 1, colorScale: 'viridis' }"
  selection-mode="multiple"
/>`,
  wizard: `<StepWizard v-model="currentStep" :steps="wizardSteps" :linear="false">
  <template #step-samples>Select wells and groups</template>
</StepWizard>`,
  science: `<StatusIndicator status="success" label="Validated" />
<ChemicalFormula formula="C6H12O6" />`,
}

const filteredComponents = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  return components.filter((component) => {
    const matchesCategory = activeCategory.value === 'All' || component.category === activeCategory.value
    const matchesQuery = !normalizedQuery || `${component.name} ${component.category} ${component.description}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesQuery
  })
})

</script>

# Component Playground

<div class="mint-showcase-hero">
  <p>
    Explore the MINT frontend SDK through live package-backed Vue demos. The examples below import the published SDK components used by plugin frontends.
  </p>
  <div class="mint-showcase-actions">
    <a class="mint-showcase-button mint-showcase-button--primary" href="#live-examples">View live examples</a>
    <a class="mint-showcase-button" href="/sdk/frontend/components">Read component docs</a>
  </div>
</div>

## Live Examples

<div class="mint-demo-grid">
  <section class="mint-demo-card">
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">Feedback and actions</h3>
        <p class="mint-demo-card__desc">Status messaging and primary/secondary commands.</p>
      </div>
    </div>
    <div class="mint-live-surface">
      <AlertBox type="success" title="Analysis complete" action-label="Open result">
        24 samples processed. QC checks passed for 23 samples.
      </AlertBox>
      <div class="mint-live-row">
        <BaseButton variant="primary">Publish</BaseButton>
        <BaseButton variant="secondary">Review</BaseButton>
        <BaseButton variant="ghost" loading>Saving</BaseButton>
      </div>
    </div>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code v-text="codeSamples.feedback"></code></pre>
      </div>
    </details>
  </section>

  <section class="mint-demo-card mint-demo-card--wide">
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">Data review</h3>
        <p class="mint-demo-card__desc">Searchable and sortable result tables for plugin outputs.</p>
      </div>
    </div>
    <div class="mint-live-surface mint-live-surface--table">
      <DataFrame
        :data="resultRows"
        :columns="resultColumns"
        row-key="id"
        searchable
        sortable
        bordered
        size="sm"
        :pagination="false"
      />
    </div>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code v-text="codeSamples.data"></code></pre>
      </div>
    </details>
  </section>

  <section class="mint-demo-card mint-demo-card--wide">
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">Plate map</h3>
        <p class="mint-demo-card__desc">Interactive 96-well heatmap with selectable wells.</p>
      </div>
    </div>
    <div class="mint-live-surface">
      <WellPlate
        v-model="selectedWells"
        :wells="heatmapWells"
        :heatmap="{ enabled: true, min: 0, max: 1, colorScale: 'viridis' }"
        selection-mode="multiple"
        size="sm"
        :show-labels="true"
      />
      <p class="mint-live-caption">Selected wells: {{ selectedWells.join(', ') || 'none' }}</p>
    </div>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code v-text="codeSamples.plate"></code></pre>
      </div>
    </details>
  </section>

  <section class="mint-demo-card">
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">Workflow steps</h3>
        <p class="mint-demo-card__desc">Guided plugin workflows with progress and step content.</p>
      </div>
    </div>
    <div class="mint-live-surface">
      <StepWizard v-model="currentStep" :steps="wizardSteps" :linear="false" size="sm">
        <template #step-setup>
          <div class="mint-wizard-panel">
            <strong>Setup</strong>
            <span>Choose experiment metadata and defaults.</span>
          </div>
        </template>
        <template #step-samples>
          <div class="mint-wizard-panel">
            <strong>Samples</strong>
            <span>Select wells, controls, and replicate groups.</span>
          </div>
        </template>
        <template #step-review>
          <div class="mint-wizard-panel">
            <strong>Review</strong>
            <span>Confirm settings before publishing the design.</span>
          </div>
        </template>
      </StepWizard>
    </div>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code v-text="codeSamples.wizard"></code></pre>
      </div>
    </details>
  </section>

  <section class="mint-demo-card">
    <div class="mint-demo-card__header">
      <div>
        <h3 class="mint-demo-card__title">Scientific display</h3>
        <p class="mint-demo-card__desc">Compact domain labels for experiment state and chemistry.</p>
      </div>
    </div>
    <div class="mint-live-surface">
      <div class="mint-live-row">
        <StatusIndicator status="success" label="Validated" />
        <StatusIndicator status="warning" label="Needs review" />
        <StatusIndicator status="info" label="Queued" pulse />
      </div>
      <div class="mint-formula-row">
        <ChemicalFormula formula="C6H12O6" />
        <ChemicalFormula formula="C8H10N4O2" />
      </div>
    </div>
    <details class="mint-code-toggle">
      <summary>Show code</summary>
      <div>
        <pre><code v-text="codeSamples.science"></code></pre>
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
    :href="component.href"
  >
    <span class="mint-component-tile__meta">{{ component.category }}</span>
    <span class="mint-component-tile__name">{{ component.name }}</span>
    <span class="mint-component-tile__desc">{{ component.description }}</span>
  </a>
</div>

<div class="mint-showcase-note">
  The showcase highlights common plugin workflows. For exhaustive prop controls and edge-case variants, run the SDK Histoire stories locally while developing components.
</div>

## Local Development

Use the same stories locally while building SDK components:

```bash
cd packages/sdk-frontend
bun run story:dev
# http://localhost:6006
```
