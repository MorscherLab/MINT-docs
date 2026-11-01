# Database and revisions

::: warning MINT 1.5 (beta)
This page describes features of MINT 1.5, which is in beta. The [Migrations](/sdk/concepts/migrations) page describes the 1.3 declaration. In SDK 1.4 and later, you declare the database with `Metadata.database`.
:::

A plugin that owns tables keeps their structure in **revisions**. A revision is a small Alembic module that ships with the plugin. MINT applies the revisions before the plugin starts. MINT 1.5 writes these revisions for you from your models.

## Declare the database

```python
from mint_sdk import Metadata
from mint_sdk.migrations import MigrationSpec

from my_plugin.models import Panel


class MyPlugin(Metadata):
    domain = "lab"
    database = MigrationSpec(package="my_plugin.migrations", models=(Panel,))
```

`models` is the set of models that MINT compares with the revisions.

## Workflow

| Step | Command | Result |
|---|---|---|
| 1. Change a model | `mint dev` | MINT writes the revision into the plugin source, applies it, and prints the file and its operations |
| 2. Write a revision yourself | `mint add migration NAME` | MINT generates the revision from the model difference. A package without revisions gets the empty baseline first |
| 3. Write an empty revision | `mint add migration NAME --empty` | MINT writes a blank revision for a manual change |
| 4. Check | `mint doctor` | The check fails when the models differ from the packaged revisions |
| 5. Repair | `mint doctor --fix` | MINT writes the missing revision |

`mint add migration` generates the revision by default. Before 1.5, you passed `--autogenerate`. The option still works.

### How the comparison works

Without `--database-url`, MINT builds a temporary SQLite database from the packaged revisions. It compares your models with that database. Pass `--database-url` to compare with a development database instead.

### Review the revision

`mint dev` and `mint add migration` write a file. Read it before you commit it.

- `mint dev` warns when it sees a rename. A rename looks like a dropped column and an added column in one table. The generated revision then loses the data in that column. Edit the revision to rename the column.
- `mint dev` warns for each operation other than `add_table`, `add_column` and `add_index`. Check these operations by hand.
- Keep every shipped revision file unchanged. MINT rejects a change to a revision that it has applied.
- `mint dev` also applies the revision to the standalone database. After you edit a revision that `mint dev` applied, delete the standalone database. Otherwise the next start fails on the changed revision.

## Check in CI

Run `mint doctor` in CI. It fails when someone changes a model and does not add a revision. Run `mint doctor --fix` on a development machine to write the revision.

`run_migrations(..., check_models=False)` skips the model comparison after the upgrade. The dev tools use it to reach the head revision before they write the revision for a model change.

See also: [Migrations](/sdk/concepts/migrations), [Backfill migrations](/sdk/recipes/backfill-migration) and the [migrations API reference](/sdk/api/migrations).
