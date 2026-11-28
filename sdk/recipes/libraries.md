# Use a reference library

Read a large read-only reference file, such as a spectral library, from the platform [library store](/admin/libraries). The plugin gets a local path and does not bundle the file.

## Declare the library

List each library in `Metadata.libraries` as `"<publisher>/<name>"`. This release has one publisher, `platform`.

```python
from mint_sdk import Metadata, Plugin, plugin


class Annotator(Metadata):
    domain = "metabolomics"
    title = "Annotator"
    libraries = {"platform/gnps"}


@plugin(Annotator)
class AnnotatorPlugin(Plugin):
    async def load_spectra(self):
        lib = await self.context.libraries.get("platform/gnps")
        return lib.path  # read-only
```

## Read the files

`context.libraries.get(ref, version=None)` returns a `Library`. The platform uses the `version` that you pass, else the administrator's pin for your plugin, else the latest version. See [Pin a plugin to a version](/admin/libraries#pin-a-plugin-to-a-version).

| Field | Meaning |
|-------|---------|
| `path` | The read-only file, or the read-only directory |
| `kind` | `"file"` or `"directory"` |
| `version`, `sha256`, `size`, `media_type`, `license`, `meta` | The library record |
| `cache_dir` | A writable directory of your plugin for files derived from this exact content |

- Write derived files, such as an index, to `self.context.libraries.cache_dir(lib)`. MINT creates the directory on first use. It is keyed by `sha256`, so a new version starts with an empty cache. MINT deletes it with the version.
- To record which version produced a result, store `lib.provenance()`. It returns `publisher`, `name`, `version` and `sha256`.

| Exception | Code |
|-----------|------|
| `PermissionException` | `library.not_declared` |
| `NotFoundException` | `library.not_found` |
| `ConflictException` | `library.integrity` |

For the cause of each code, see [Libraries → Errors](/admin/libraries#errors).

## Run it standalone

In `mint dev` and in tests, `context.libraries` reads a local store, `LocalLibraryStore`, under `~/.mint/libraries`: a SQLite registry plus the files. It has no pins. Fill it with the same CLI and `--local`:

```bash
mint libraries import ./gnps.mgf --local --name gnps --version 2024.1 --promote
mint libraries list --local
```

`mint doctor` warns about a declared library that is not in the local store and prints the import command. See [`mint libraries`](/sdk/api/cli-reference#mint-libraries).

## Pitfalls

- Do not write into `lib.path`. Every plugin shares these read-only files.
- Do not keep the path across restarts. A promote or a pin change can select another version.
- A plugin in its own Docker container needs the library directory mounted read-only at the same path. See [Libraries → Docker](/admin/libraries#docker).
