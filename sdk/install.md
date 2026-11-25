# Install the toolchain

One command installs everything a plugin developer needs. It installs for the
current user and does not use `sudo` or administrator rights.

::: code-group

```bash [macOS, Linux, WSL]
curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash
```

```powershell [Windows PowerShell]
irm https://mint-docs.morscherlab.org/install.ps1 | iex
```

:::

Open a new terminal afterwards, so that `PATH` is up to date.

## What it installs

| Tool | Why | How |
|---|---|---|
| [uv](https://docs.astral.sh/uv/) | Python and package management | The official uv installer, when `uv` is not found |
| Python 3.14 | The SDK needs 3.14 or later | `uv python install 3.14` |
| `mint` | The plugin CLI: `init`, `dev`, `lint`, `doctor`, `build` | `uv tool install 'mint-sdk[cli,server]'`, in its own environment |
| ruff | The Python section of `mint lint` | Inside the environment of `mint`; a ruff of your own stays untouched |
| [Vite+](https://viteplus.dev/) (`vp`) | Every frontend command of the CLI; it manages Node and pnpm | The official Vite+ installer, when `vp` is missing or older than 1.5.1 |

The script only checks for git. `mint init` creates a repository, so install git
when the script says it is missing.

A tool that is already installed is kept. Run the same command again to update
`mint`.

## Options

Pass options after `bash -s --`:

```bash
curl -fsSL https://mint-docs.morscherlab.org/install.sh | bash -s -- --cli-only
```

| Option | Effect |
|---|---|
| `--cli-only` | Install uv, Python and `mint` only. Skip Vite+, Node and pnpm. Enough for the `mint platform` commands and for a plugin with no frontend. |
| `--version X.Y.Z` | Install this `mint-sdk` version. The default is the latest stable release. `MINT_VERSION` in the environment does the same. |
| `--pre` | Allow a pre-release (beta, release candidate). |
| `--dry-run` | Print the commands and change nothing. |

In PowerShell, download the script to use options:

```powershell
irm https://mint-docs.morscherlab.org/install.ps1 -OutFile install.ps1
.\install.ps1 -CliOnly
```

The switches are `-CliOnly`, `-Version X.Y.Z`, `-Pre` and `-DryRun`.

## Read it first

Both scripts are short. Read one before you run it:

```bash
curl -fsSL https://mint-docs.morscherlab.org/install.sh | less
```

The script downloads two more installers and runs them: the uv installer from
`astral.sh` and the Vite+ installer from `vite.plus`. It installs `mint-sdk`
from PyPI.

## After the install

```bash
mint --version
mint init my-plugin
mint platform auth login --url https://<your-mint-server>
```

Continue with [the first analysis plugin](/sdk/tutorials/first-analysis-plugin).

## Uninstall

```bash
uv tool uninstall mint-sdk
```

uv and Vite+ have their own uninstall steps; see their documentation.
