---
aside: false
title: PresenceAvatars
description: "Avatar stack of the other people on a presence topic, with a list of each activity."
---

<p class="mint-component-library__eyebrow">Data display</p>

# PresenceAvatars

Avatar stack of the other people on a presence topic, with a list of each activity.

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PresenceAvatars.vue">Source</a>
</div>

<demo vue="./demos/PresenceAvatars.vue" title="PresenceAvatars" description="Avatars of six people, three shown. Click them to list each person and activity." />

## Import

```ts
import { PresenceAvatars } from "@morscherlab/mint-sdk/runtime"
```

## Usage

Pass `usePresence().viewers` with a display name for each person as `people`. Pass `usePresence().count` as `count` when the list is capped.

<!-- sdk-props:start -->
## Props

MINT SDK **1.4.3**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/components/PresenceAvatars.vue).

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| ` people ` | ` PresencePerson[] ` | Yes | — | The people on the topic, for example usePresence().viewers with names. |
| ` selfId ` | ` string \| null ` | No | ` null ` | The current user; never shown. |
| ` count ` | ` number ` | No | ` undefined ` | All people on the topic (usePresence().count), when the list is capped. |
| ` label ` | ` string ` | No | ` "People here" ` | Accessible name of the list. |
| ` max ` | ` number ` | No | ` 4 ` | Most avatars before +N. |

Defaults are the values that vue-component-meta resolves from the source; object and array defaults come from factories that run for each component instance. `undefined` may be resolved internally from other props or platform settings. “—” in Description means the source does not provide a prop comment.

### Related types

| Type | Definition / accepted values |
|---|---|
| [` PresencePerson `](https://github.com/MorscherLab/MINT/blob/v1.4.3/packages/sdk-frontend/src/utils/presenceAvatars.ts#L4) | See the linked SDK type definition. |

### Events

This component emits no events.

### Slots

| Slot | Props | Description |
|---|---|---|
| ` footer ` | — | — |

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
