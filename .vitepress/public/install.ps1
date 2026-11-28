[CmdletBinding()]
param(
    [switch]$CliOnly,
    [switch]$Pre,
    [switch]$DryRun,
    [string]$Version = $env:MINT_VERSION
)

$PythonVersion = '3.14'
$MinVpVersion = [version]'1.5.1'
$UvInstaller = 'https://astral.sh/uv/install.ps1'
$VpInstaller = 'https://vite.plus/ps1'
$DocsUrl = 'https://mint-docs.morscherlab.org/sdk/install'

function Write-Step([string]$Text) { Write-Host "==> $Text" -ForegroundColor White }
function Write-Ok([string]$Text) { Write-Host "  + $Text" -ForegroundColor Green }
function Write-Note([string]$Text) { Write-Host "  ! $Text" -ForegroundColor Yellow }

function Test-Command([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Add-ToPath([string]$Directory) {
    if ((Test-Path $Directory) -and (($env:Path -split ';') -notcontains $Directory)) {
        $env:Path = "$Directory;$env:Path"
    }
}

function Invoke-Step([string]$Command, [string[]]$Arguments) {
    if ($DryRun) {
        Write-Host "  > $Command $($Arguments -join ' ')" -ForegroundColor DarkGray
        return
    }
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE" }
}

function Invoke-Installer([string]$Url) {
    if ($DryRun) {
        Write-Host "  > irm $Url | iex" -ForegroundColor DarkGray
        return
    }
    Invoke-Expression (Invoke-RestMethod -Uri $Url)
}

function Get-VpVersion {
    $neutral = New-Item -ItemType Directory -Path (Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName()))
    Push-Location $neutral
    try {
        $text = (& vp --version | Out-String)
    } finally {
        Pop-Location
        Remove-Item $neutral -Recurse -Force
    }
    if ($text -match '(?m)^vp\s+v?(\d+\.\d+\.\d+)') { return [version]$Matches[1] }
    return $null
}

function Install-Uv {
    Write-Step 'uv'
    Add-ToPath (Join-Path $HOME '.local\bin')
    if (Test-Command 'uv') {
        Write-Ok "$(uv --version) (found)"
        return
    }
    Invoke-Installer $UvInstaller
    Add-ToPath (Join-Path $HOME '.local\bin')
    if (-not $DryRun) {
        if (-not (Test-Command 'uv')) { throw 'uv was installed but is not on PATH. Open a new terminal and run this script again.' }
        Write-Ok "$(uv --version) (installed)"
    }
}

function Install-Python {
    Write-Step "Python $PythonVersion"
    Invoke-Step 'uv' @('python', 'install', $PythonVersion)
    if (-not $DryRun) { Write-Ok "Python $PythonVersion" }
}

function Install-Mint {
    Write-Step 'mint CLI'
    $spec = 'mint-sdk[cli,server]'
    if ($Version) { $spec = "$spec==$Version" }
    $arguments = @('tool', 'install', '--python', $PythonVersion, '--upgrade', '--with', 'ruff')
    if ($Pre) { $arguments += @('--prerelease', 'allow') }
    Invoke-Step 'uv' ($arguments + $spec)
    if (-not $DryRun) {
        $toolBin = (& uv tool dir --bin 2>$null | Out-String).Trim()
        if ($toolBin) { Add-ToPath $toolBin }
        if (-not (Test-Command 'mint')) { throw 'mint was installed but is not on PATH. Run: uv tool update-shell' }
        Write-Ok ((& mint --version | Select-Object -First 1) -as [string])
    }
}

function Install-Vp {
    Write-Step 'Vite+ (vp)'
    if (Test-Command 'vp') {
        $found = Get-VpVersion
        if ($found -and $found -ge $MinVpVersion) {
            Write-Ok "vp $found (found)"
            return
        }
        Write-Note "vp $(if ($found) { $found } else { 'of an unknown version' }) is older than $MinVpVersion; installing a current one"
    }
    Invoke-Installer $VpInstaller
    if (-not $DryRun) {
        if (-not (Test-Command 'vp')) {
            Write-Note 'vp was installed but is not on PATH in this session. Open a new terminal, then run: vp --version'
            return
        }
        $found = Get-VpVersion
        if (-not $found -or $found -lt $MinVpVersion) {
            throw "The vp at $((Get-Command vp).Source) is $(if ($found) { $found } else { 'of an unknown version' }); mint needs $MinVpVersion or later. Upgrade or remove it, then run this script again."
        }
        Write-Ok "vp $found (installed)"
    }
}

function Test-Git {
    Write-Step 'git'
    if (Test-Command 'git') {
        Write-Ok (git --version)
    } else {
        Write-Note 'git was not found. mint init creates a repository, so install git:'
        Write-Note '  winget install --id Git.Git -e'
    }
}

Write-Host 'MINT installer' -ForegroundColor White -NoNewline
Write-Host '  plugin developer toolchain' -ForegroundColor DarkGray
if ($DryRun) { Write-Host 'dry run: nothing is changed' -ForegroundColor DarkGray }

$callerErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Stop'
try {
    Install-Uv
    Install-Python
    Install-Mint
    if (-not $CliOnly) { Install-Vp }
    Test-Git
} finally {
    $ErrorActionPreference = $callerErrorAction
}

# Windows PowerShell 5.1 turns redirected stderr of a native command into errors, which 'Stop' makes fatal.
if (-not $DryRun) { & uv tool update-shell *> $null }

Write-Host ''
Write-Host 'Done.' -ForegroundColor White -NoNewline
Write-Host ' Open a new terminal so that PATH is up to date, then:'
Write-Host '  mint init my-plugin'
Write-Host '  mint platform auth login --url https://<your-mint-server>'
Write-Host ''
Write-Host "Update later: run this script again.  Docs: $DocsUrl" -ForegroundColor DarkGray
