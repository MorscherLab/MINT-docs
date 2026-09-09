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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AuditTrail.vue">Source</a>
</div>

<ComponentPlayground name="AuditTrail" />

## Import

```ts
import { AuditTrail } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.0**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/components/AuditTrail.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` entries ` | ` AuditEntry[] ` | Yes | — | — |
| ` maxHeight ` | ` string ` | No | ` undefined ` | — |
| ` showFilters ` | ` boolean ` | No | ` false ` | — |
| ` emptyMessage ` | ` string ` | No | ` 'No activity yet' ` | — |
| ` order ` | ` 'newest' \| 'oldest' ` | No | ` 'newest' ` | — |
| ` size ` | ` 'sm' \| 'md' \| 'lg' ` | No | ` 'md' ` | — |
| ` loading ` | ` boolean ` | No | ` false ` | Replace the timeline with a loading placeholder. |
| ` error ` | ` string \| null ` | No | ` null ` | Error message. When set, the timeline is replaced by an error state. null/undefined renders normally. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` AuditEntry `](https://github.com/MorscherLab/MINT/blob/v1.2.0/packages/sdk-frontend/src/types/componentWorkflowTypes.ts#L28) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
