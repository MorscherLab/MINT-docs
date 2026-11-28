---
aside: false
title: SettingsModal
description: "Tabbed settings dialog for plugin settings and the personal Appearance tab."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# SettingsModal

Use `SettingsModal` to show plugin settings and the personal Appearance settings in one dialog.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SettingsModal.vue">Source</a>
</div>

<demo vue="./demos/SettingsModal.vue" title="SettingsModal" description="Settings dialog with a custom tab and form fields. Click the button to open it and change values." />

## Import

```ts
import { SettingsModal } from "@morscherlab/mint-sdk"
```

## Layout

- Without `layout`, the modal puts the tabs in a sidebar rail when there is more than one tab. The Appearance tab counts. A single tab is a plain page without navigation.
- `layout="vertical"` is the same rail. The rail separates the plugin groups from the personal Appearance settings.
- `layout="horizontal"` puts the tabs in a strip above the pane. A single tab is a plain page.
- Schema-driven settings get a search across groups, a marker on values changed from the default with a reset for each row, and "Restore group defaults".
- Changes apply at once. The default footer has a Done button. The `#footer` slot replaces it.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/SettingsModal.vue).

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
| [` SettingsTabInput `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L579) | See the linked SDK type definition. |
| [` SettingsModalLayout `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L581) | ` 'horizontal' \| 'vertical' ` |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L153) | See the linked SDK type definition. |
| [` SettingsModalSchema `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L606) | See the linked SDK type definition. |
| [` SettingsUserType `](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/types/components.ts#L610) | See the linked SDK type definition. |

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
