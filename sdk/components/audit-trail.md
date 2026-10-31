---
aside: false
title: AuditTrail
description: "AuditTrail is a data display component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Data display</p>

# AuditTrail

AuditTrail is a data display component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AuditTrail.vue">Source</a>
</div>

<demo vue="./demos/AuditTrail.vue" title="AuditTrail" description="An audit log with three entries and filters. Use the filters to narrow the list of events." />

## Import

```ts
import { AuditTrail } from "@morscherlab/mint-sdk/data"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/AuditTrail.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` entries ` | ` AuditEntry[] ` | Yes | — | — |
| ` maxHeight ` | ` string ` | No | ` undefined ` | — |
| ` showFilters ` | ` boolean ` | No | ` false ` | — |
| ` emptyText ` | ` string ` | No | ` "No activity yet" ` | — |
| ` order ` | ` 'newest' \| 'oldest' ` | No | ` "newest" ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` "md" ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the timeline with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the timeline is replaced by an error state. null/undefined renders normally. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` AuditEntry `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L28) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` entry-click ` | ` entry: AuditEntry ` | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` entry ` | ` { entry: AuditEntry; } ` | — |
| ` error ` | ` { error: string; } ` | — |
| ` loading ` | — | — |
| ` empty ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
