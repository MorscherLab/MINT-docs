---
aside: false
title: LiveDesignForm
description: "Self-saving form of a live design, driven by a useLiveDesign() result, with field locks and save state."
---

<p class="mint-component-library__eyebrow">Workflow</p>

# LiveDesignForm

Self-saving form of a live design, driven by a `useLiveDesign()` result, with field locks and save state.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/LiveDesignForm.vue">Source</a>
</div>

::: info Needs the platform
This component edits the design data of an experiment through `useLiveDesign()`, which reads and saves with the platform API. To see it work, open a plugin with `mint dev --platform`.
:::

## Import

```ts
import { LiveDesignForm, useLiveDesign } from "@morscherlab/mint-sdk/data"
```

## When to use it

A plugin that declares `Design(live=True)` with a design schema gets a form on the experiment page. The platform draws that form with this component. You do not need to add it there.

Use `LiveDesignForm` on your own plugin page when users must edit the same design data there. Each edit saves itself; the form has no Save button.

## Basic Usage

```vue
<script setup lang="ts">
import { LiveDesignForm, useLiveDesign } from '@morscherlab/mint-sdk/data'
import { BaseButton, useExperiment } from '@morscherlab/mint-sdk'

const experiment = useExperiment()
const design = useLiveDesign(() => experiment.id.value ?? 0, 'cell-culture')
</script>

<template>
  <LiveDesignForm :design="design" title="Cell seeding" :user-names="{ '7': 'Ada Kim' }">
    <template #actions>
      <BaseButton size="sm" variant="secondary">Export</BaseButton>
    </template>
  </LiveDesignForm>
</template>
```

## Behavior

- The form shows string, number, integer, boolean and enum properties of the design schema as fields. It shows other values (objects, arrays) as read-only JSON.
- The header shows the save state: "Saved", "Unsaved", "Saving…", "Offline · retry in N s" with **Retry now**, "N changes not saved" or "View only".
- Empty required root fields get a dashed border and the word "Required". The header shows "N required left".
- Another editor shows as an avatar in the field. A field that another user edits is disabled with "X is editing this field".
- A field that another user changed flashes one time. With reduced motion, it shows "Updated by …" instead.
- A refused value stays in its field with the message and a **Discard** action. **Try again** shows only when the server could not be reached and for a failed load.
- A boolean without a value shows a switch that is off, with "Not set".
- When the design is not live or the schema cannot be read, the values show as text with a notice.
- A polite live region announces only a change to offline or to not saved, and the return to saved after it.
- Presence gives user ids only. Give `userNames` to show names.

## Slots and tabs

- `#actions` adds tools to the header.
- `#toolbar` shows content under the header, for example a [BaseTabs](/sdk/components/base-tabs) bar.
- The default slot replaces the form body, for example while another tab of the card is selected.
- With `tabId`, the form body is the tab panel `mint-tabpanel-<tabId>` of that `BaseTabs` tab.

## `useLiveDesign`

`useLiveDesign(experimentId, pluginId, options?)` from `@morscherlab/mint-sdk/data` holds the state of the form. See [Composables → useLiveDesign](/sdk/frontend/composables#uselivedesign).

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/LiveDesignForm.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` design ` | ` UseLiveDesignReturn ` | Yes | — | The useLiveDesign() result the form shows and edits. |
| ` userNames ` | ` Readonly<Record<string, string>> ` | No | ` {} ` | Display names by user id, for the editors and the writers of remote changes. |
| ` title ` | ` string ` | No | ` "Design data" ` | — |
| ` count ` | ` string ` | No | ` undefined ` | Monospace meta next to the title, e.g. "schema 1.2 · Cell seeding". |
| ` icon ` | ` string \| string[] ` | No | ` undefined ` | SVG path(s) of the header icon chip. |
| ` tabId ` | ` string ` | No | ` undefined ` | The tab id of the form when the toolbar holds a BaseTabs bar: the form body is then the tab panel mint-tabpanel-&lt;tabId&gt;, labelled by the tab mint-tab-&lt;tabId&gt;. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` UseLiveDesignReturn `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/composables/useLiveDesign.ts#L114) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` actions ` | — | Header tools after the save state, e.g. export buttons. |
| ` toolbar ` | — | Controls under the header, e.g. a tab bar; they stay while the body changes. |
| ` default ` | — | Shown in place of the form, e.g. while another tab of the card is selected. The header keeps the save state. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
