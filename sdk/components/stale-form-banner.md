---
aside: false
title: StaleFormBanner
description: "Strip above a form that someone else changed while it held unsaved edits."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# StaleFormBanner

Strip above a form that someone else changed while it held unsaved edits.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/StaleFormBanner.vue">Source</a>
</div>

<demo vue="./demos/StaleFormBanner.vue" title="StaleFormBanner" description="A banner names two writers and three changed fields. Click Reload form or dismiss it." />

## Import

```ts
import { StaleFormBanner } from "@morscherlab/mint-sdk/data"
```

## Usage

Show the banner while `useVersionedSave().stale` is set. Pass that value as `change`. A save that would overwrite opens [VersionConflictDialog](/sdk/components/version-conflict-dialog).

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/StaleFormBanner.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` change ` | ` StaleChange ` | Yes | — | — |
| ` reviewHref ` | ` string ` | No | ` "" ` | The entity's page; Review opens it in a new tab. Without it, there is no Review. |
| ` entityNoun ` | ` string ` | No | ` "this record" ` | What the form edits, for a write that names no fields. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` StaleChange `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/useVersionedSave.ts#L12) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` dismiss ` | — | — |
| ` reload ` | — | — |

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
