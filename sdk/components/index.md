---
aside: false
title: Component Library
description: Standalone reference for MINT frontend SDK components.
---

# Component Library

Each page in this catalog shows one Vue component of `@morscherlab/mint-sdk` (MINT SDK @MINT_VERSION@): a live demo where possible, the import, usage examples and the props, events and slots. For tokens and themes, see [Design tokens](/sdk/frontend/design-tokens) and [Theming](/sdk/frontend/theming). For forms built from a control model, see the [FormBuilder guide](/sdk/frontend/form-builder).

<ComponentCatalog />

## Reading the props reference

- Props use their TypeScript names, such as `modelValue` or `maxHeight`. Templates also accept kebab-case names, such as `max-height`.
- Bind numbers, objects and arrays with `:`.
- `modelValue` pairs with `v-model`. A named model uses `v-model:name`.
- Required means that the caller must give the prop.
- A default shows the source expression of the SDK. `() => []` and `() => ({})` make a new value for each component instance.
- `undefined` means that no value is given. The component can then use platform settings or other props.
- An optional Boolean prop defaults to `false`, unless the component sets another default.
- Descriptions come from source comments, when there are any. Named object types link to their source definitions, when possible.

## SDK Maintainer Storybook

To change SDK components and try all prop controls, SDK maintainers can run the Histoire lab in the MINT repository:

```bash
cd packages/sdk-frontend
pnpm run story:dev
# http://localhost:6006
```
