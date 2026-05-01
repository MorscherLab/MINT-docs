# Upgrading the SDK

`mint-sdk` ships independently from the platform on its own tag stream (`sdk-v*`). Plugins follow at their own pace. This page covers when to upgrade, how to upgrade safely, and how to handle SDK-major breaks.

## When to upgrade

| Trigger | Action |
|---------|--------|
| New SDK feature you need | Bump the floor in your `mint-sdk` range; release a minor version |
| SDK security fix | Bump the floor; release a patch |
| New SDK major (breaking) | Plan a migration; release a major version of your plugin |
| Routine maintenance | Bump the ceiling when a new SDK minor lands and you've tested |

You don't have to upgrade on every SDK release. Pinning to `mint-sdk>=1.0.0,<2.0.0` and staying there for the lifetime of SDK 1.x is a perfectly reasonable strategy.

## Routine upgrade flow

```bash
# In your plugin project
mint sdk update
```

This:

1. Reads `pyproject.toml` and updates `mint-sdk` to the latest version satisfying your range
2. Reads `package.json` and updates `@morscherlab/mint-sdk` similarly
3. Runs `uv sync` and `bun install` to apply the changes
4. Prints a diff of what changed

After running:

```bash
uv run pytest -v
mint doctor
mint dev    # smoke test
```

Commit the lockfile changes. The next CI run validates the new version against your test suite.

## Bumping the ceiling for a new SDK major

When `mint-sdk` 2.0 lands, your `>=1.0.0,<2.0.0` range excludes it. To opt in:

1. Read the SDK changelog for breaking changes
2. Update your plugin code to handle the breaks
3. Bump the range to `>=2.0.0,<3.0.0`
4. Release a major version of your plugin (since the floor is now 2.0)

```toml
# pyproject.toml — before
[project]
dependencies = [
  "mint-sdk>=1.0.0,<2.0.0",
]
```

```toml
# pyproject.toml — after
[project]
dependencies = [
  "mint-sdk>=2.0.0,<3.0.0",
]
```

Release `2.0.0` of your plugin alongside.

## Supporting two SDK majors

Some plugins want to keep working under both old and new SDK majors during a transition window. Pattern:

```toml
[project]
dependencies = [
  "mint-sdk>=1.5.0,<3.0.0",   # spans two majors
]
```

In code, branch on SDK version where APIs differ:

```python
import mint_sdk

if mint_sdk.__version__.startswith("2."):
    from mint_sdk import NewAccessor
    accessor = NewAccessor()
else:
    from mint_sdk import OldAccessor
    accessor = OldAccessor()
```

This trades plugin code complexity for compatibility breadth. Worthwhile only when you have users you can't easily move forward.

## Reading the SDK changelog

Each SDK release publishes its changelog at:

- [`MINT/packages/sdk-python/CHANGELOG.md`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-python/CHANGELOG.md) — Python SDK
- [`MINT/packages/sdk-frontend/CHANGELOG.md`](https://github.com/MorscherLab/mld/blob/main/packages/sdk-frontend/CHANGELOG.md) — Frontend SDK

For breaking changes, the changelog entries follow the pattern:

```
### Removed (BREAKING)
- `OldAccessor.foo()` — replaced by `NewAccessor.foo()` in v2.0. Migration: replace `Old` with `New` and the API is otherwise identical.
```

## Beta SDK testing

When the SDK ships a `2.0.0-beta.1`, opt your plugin into the beta channel:

```toml
[project]
dependencies = [
  "mint-sdk>=2.0.0b1,<3.0.0",
]
```

```bash
mint sdk update --pre
uv run pytest -v
```

Run your full test suite. File any issues against [`MorscherLab/mld`](https://github.com/MorscherLab/mld). Once 2.0 stable lands, drop the `b1` from your range.

::: warning Don't ship plugin releases against SDK betas
A plugin built against `mint-sdk==2.0.0b1` may not work against `mint-sdk==2.0.0` if a beta-only API changes. Test against beta, ship against stable.
:::

## SDK-major break: a worked example

Suppose `mint-sdk` 2.0 renames `PlatformContext.get_plugin_data_repository()` to `PlatformContext.plugin_data_repo()`.

### Single-major support

```python
# Before (1.x)
async def initialize(self, context=None):
    self._context = context
    self._data_repo = context.get_plugin_data_repository() if context else None

# After (2.x only)
async def initialize(self, context=None):
    self._context = context
    self._data_repo = context.plugin_data_repo() if context else None
```

Bump your plugin's major; done.

### Two-major support during the transition

```python
async def initialize(self, context=None):
    self._context = context
    if context is None:
        self._data_repo = None
    elif hasattr(context, "plugin_data_repo"):
        self._data_repo = context.plugin_data_repo()         # 2.x
    else:
        self._data_repo = context.get_plugin_data_repository()  # 1.x
```

Ship as a minor version with the broader range. Drop the 1.x branch when you bump to a major release.

## Frontend SDK upgrades

The frontend SDK ships on the same tag stream, with the same major-version cadence. Frontend breaks are usually:

- Component renames or removed components → search-and-replace + storybook visual review
- Composable signature changes → TypeScript catches them at build time
- Token renames → grep for the old variable name in `.css` / Tailwind config

```bash
cd frontend
bun update @morscherlab/mint-sdk
bun run typecheck    # surfaces breaks immediately
bun run build
```

For visual review, run your frontend's Histoire (if you have one) or `bun run dev` and click through the affected pages.

## Skipping SDK majors

It's fine to skip an SDK major if its features don't matter to you:

```
mint-sdk 1.x ──► your plugin 1.x ─┐
mint-sdk 2.x  (skip)              │
mint-sdk 3.x ──► your plugin 2.x ◄┘
```

Your plugin can jump from `mint-sdk>=1.0.0,<2.0.0` directly to `>=3.0.0,<4.0.0`. Read the cumulative changelogs (1→2 + 2→3) to know what to migrate.

## Notes

- The SDK's internal modules (`mint_sdk._discover`, `mint_sdk._version`, etc.) are private. Don't import them — they break without notice. Stick to the symbols documented in `mint_sdk/__init__.py`.
- A plugin pinned to `mint-sdk==1.5.3` blocks the platform from upgrading the SDK. The marketplace UI flags this; admins know to either bump the plugin or hold the platform back.
- For long-lived plugins, schedule a quarterly "upgrade SDK" task — the longer you wait, the bigger the diff and the harder the migration.

## Related

- [Versioning](/sdk/operations/versioning) — bumping your plugin's version when the SDK changes
- [CI patterns → SDK-compatibility check](/sdk/operations/ci-patterns#sdk-compatibility-check) — automated detection
