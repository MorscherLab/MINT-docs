# API Reference

Back-of-book reference for the SDK's public surface. Each page enumerates exports from one area of `mint-sdk`, with one-line descriptions and links to the source on GitHub. For deeper coverage and exact method signatures with full type hints, the source itself is authoritative.

This section is intentionally **not** the front door for plugin development. Start with [Concepts](/sdk/concepts/) or jump to [Tutorials](/sdk/tutorials/) instead.

## Pages

| Area | Page |
|------|------|
| Python SDK exports | [Python SDK](/sdk/api/python) |
| Frontend SDK exports | [Frontend SDK](/sdk/api/frontend) |
| Migration framework | [Migrations](/sdk/api/migrations) |
| Typed REST client | [REST client](/sdk/api/client) |
| Exception taxonomy | [Exceptions](/sdk/api/exceptions) |
| `mint` CLI | [CLI reference](/sdk/api/cli-reference) |

## Source links

The SDK source is the canonical reference:

- [`MINT/packages/sdk-python/src/mint_sdk/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-python/src/mint_sdk) — every Python module
- [`MINT/packages/sdk-frontend/src/`](https://github.com/MorscherLab/mld/tree/main/packages/sdk-frontend/src) — every component, composable, and type
- [`MINT/packages/sdk-python/src/mint_sdk/__init__.py`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-python/src/mint_sdk/__init__.py) — the canonical Python export list
- [`MINT/packages/sdk-frontend/src/composables/index.ts`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-frontend/src/composables/index.ts) — the canonical frontend composable list

When this manual disagrees with the source, the source wins. Open a docs issue if you spot a divergence.
