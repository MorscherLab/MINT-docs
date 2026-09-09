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
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SettingsModal.vue">Source</a>
</div>

<ComponentPlayground name="SettingsModal" />

## Import

```ts
import { SettingsModal } from "@morscherlab/mint-sdk/components"
```

<!-- sdk-props:start -->
## Props

MINT SDK **1.2.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/components/SettingsModal.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` modelValue ` | ` boolean ` | Yes | — | — |
| ` title ` | ` string ` | No | ` 'Settings' ` | — |
| ` tabs ` | ` SettingsTabInput[] ` | No | ` () => [] ` | Manual tab descriptors. Ignored when schema is set (groups become tabs). |
| ` showAppearance ` | ` boolean ` | No | ` true ` | — |
| ` size ` | ` 'md' \| 'lg' \| 'xl' ` | No | ` 'lg' ` | — |
| ` layout ` | ` SettingsModalLayout ` | No | ` 'horizontal' ` | — |
| ` schema ` | ` SettingsModalSchema ` | No | ` undefined ` | Declarative schema — fields auto-render via SDK form components. |
| ` model ` | ` ControlModel \| ControlModelBinding ` | No | ` undefined ` | Model returned by defineControlModel(), or a raw nested ControlModel for one-step settings generation. |
| ` controls ` | ` ControlSchema ` | No | ` undefined ` | Compact controls model — converted to schema when schema is not set. |
| ` controlOptions ` | ` ControlWorkspaceOptions ` | No | ` undefined ` | Conversion options for controls, such as section labels, columns, and shared initialValues. |
| ` values ` | ` Record<string, unknown> ` | No | ` undefined ` | Two-way bound values when schema, model, or controls is set. |
| ` enhancements ` | ` FormEnhancements<Record<string, unknown>> ` | No | ` undefined ` | Optional dynamic enhancements (validators, dynamic options, callbacks). |
| ` userType ` | ` SettingsUserType ` | No | ` undefined ` | Optional user type override for permission-filtered settings content. Defaults to SDK auth/platform context. |

Defaults are source expressions; factory functions are evaluated for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` SettingsTabInput `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L482) | See the linked SDK type definition. |
| [` SettingsModalLayout `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L484) | ` 'horizontal' \| 'vertical' ` |
| [` SettingsModalSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L509) | See the linked SDK type definition. |
| [` ControlModel `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L173) | See the linked SDK type definition. |
| [` ControlModelBinding `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L187) | See the linked SDK type definition. |
| [` ControlSchema `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L140) | See the linked SDK type definition. |
| [` ControlWorkspaceOptions `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/composables/controlSchemaTypes.ts#L155) | See the linked SDK type definition. |
| [` FormEnhancements `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/form-builder.ts#L166) | See the linked SDK type definition. |
| [` SettingsUserType `](https://github.com/MorscherLab/MINT/blob/v1.2.1/packages/sdk-frontend/src/types/components.ts#L513) | See the linked SDK type definition. |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
