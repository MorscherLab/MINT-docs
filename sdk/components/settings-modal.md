---
aside: false
title: SettingsModal
description: "SettingsModal is a feedback component exported by @morscherlab/mint-sdk for plugin frontends."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# SettingsModal

SettingsModal is a feedback component exported by @morscherlab/mint-sdk for plugin frontends.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SettingsModal.vue">Source</a>
</div>

<demo vue="./demos/SettingsModal.vue" title="SettingsModal" description="Settings dialog with a custom tab and form fields. Click the button to open it and change values." />

## Import

```ts
import { SettingsModal } from "@morscherlab/mint-sdk"
```

## Layout

With `layout` omitted, the modal shows a rail when there are more than three groups and stacks every group on one page otherwise; `layout="horizontal"` and `layout="vertical"` force a layout. The rail separates plugin groups from personal (Appearance) settings. Schema-driven settings get a search across groups, a modified-from-default marker with a per-row reset, and "Restore group defaults". Changes apply immediately; the default footer closes with "Done", and a `#footer` slot replaces it.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/SettingsModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` open ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` "Settings" ` | — |
| ` tabs ` | ` SettingsTabInput[] ` | No | ` [] ` | Manual tab descriptors. Ignored when spec is set (groups become tabs). |
| ` showAppearance ` | ` boolean ` | No | ` true ` | — |
| ` appearanceFirst ` | ` boolean ` | No | ` false ` | List Appearance before the other tabs and open on it. |
| ` size ` | ` 'md' \| 'lg' \| 'xl' ` | No | ` "lg" ` | — |
| ` layout ` | ` SettingsModalLayout ` | No | ` undefined ` | — |
| ` spec ` | ` ControlModelBinding \| SettingsModalSchema ` | No | ` undefined ` | Control model built with defineControlModel(), or a SettingsModalSchema (e.g. the generated settingsForm). Fields auto-render via SDK form components. |
| ` values ` | ` Record<string, unknown> ` | No | ` undefined ` | Two-way bound values when spec is set. |
| ` userType ` | ` SettingsUserType ` | No | ` undefined ` | Optional user type override for permission-filtered settings content. Defaults to SDK auth/platform context. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SettingsTabInput `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L550) | See the linked SDK type definition. |
| [` SettingsModalLayout `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L552) | ` 'horizontal' \| 'vertical' ` |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L156) | See the linked SDK type definition. |
| [` SettingsModalSchema `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L577) | See the linked SDK type definition. |
| [` SettingsUserType `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/types/components.ts#L581) | See the linked SDK type definition. |

### Events

| Event | Payload | Description |
|---|---|---|
| ` update:values ` | ` data: Record<string, unknown> ` | — |
| ` update:open ` | ` value: boolean ` | — |
| ` close ` | — | — |

### Slots

| Slot | Props | Description |
|---|---|---|
| ` appearance ` | — | — |
| ` footer ` | ` { values: Record<string, unknown>; close: () => void; } ` | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
