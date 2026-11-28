---
aside: false
title: AppToastContainer
description: "Toast container for the useToast() queue: title, detail, actions and a progress bar."
---

<p class="mint-component-library__eyebrow">Feedback</p>

# AppToastContainer

`AppToastContainer` shows the toasts of the shared `useToast()` queue. Mount it one time on a page without `PluginWorkspaceView`. The workspace renders one already (`spec.toasts`, default `true`).

<div class="mint-component-reference__actions">
  <a class="mint-showcase-button" href="#props">Props</a>
  <a class="mint-showcase-button mint-showcase-button--primary" href="https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppToastContainer.vue">Source</a>
</div>

<demo vue="./demos/AppToastContainer.vue" title="AppToastContainer" description="Two buttons that show toast messages. Click a button to see the toast container display the message." />

## Import

```ts
import { AppToastContainer } from "@morscherlab/mint-sdk"
```

## Show a toast

Call `toast.push()` for a toast with a title, a detail, up to two actions and a progress bar. The `success()`, `error()`, `warning()` and `info()` helpers show a toast with a title only. For an example and the dismiss behavior, see [useToast](/sdk/frontend/composables#usetoast).

## Toast positioning

A mounted [AppTopBar](/sdk/components/app-top-bar) sets `--mint-toast-offset-top` on `<html>`. It measures from the top-most bar and updates on resize and scroll. The container reads the variable and shows the toasts 1rem below the top bar, clear of its controls. Without an `AppTopBar`, the toasts are 1rem below the top of the viewport.

<!-- sdk-props:start -->
## Props

MINT SDK **1.6.1**. [Component source](https://github.com/MorscherLab/MINT/blob/v1.6.1/packages/sdk-frontend/src/components/AppToastContainer.vue).

This component declares no public props. Its behavior is controlled through SDK state and composables.

### Events

This component emits no events.

### Slots

This component declares no slots.

<!-- sdk-props:end -->

[Back to component library](/sdk/components/)
