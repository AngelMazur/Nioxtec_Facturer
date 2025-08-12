param(
  [switch]$HardReset
)

$ErrorActionPreference = "Stop"
$repo = "C:\Nioxtec\Nioxtec_Facturer"
function Log([string]$m){ Write-Host ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) }

Set-Location $repo

try { git --version | Out-Null } catch { Write-Error "git no está disponible en PATH"; exit 1 }

# Marcar repo como segura para el runner/usuarios
try { git config --global --add safe.directory $repo | Out-Null } catch {}

# Guardar cambios locales si los hay
$dirty = git status --porcelain
if ($dirty) {
  $msg = "auto-stash before sync " + (Get-Date -Format yyyyMMdd_HHmm)
  Log "Cambios locales detectados, creando stash: $msg"
  git stash push -u -m $msg | Out-Null
}

Log 'git fetch origin'
git fetch origin

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { $branch = 'main' }

if ($HardReset) {
  Log ("git reset --hard origin/{0}" -f $branch)
  git reset --hard ("origin/" + $branch)
} else {
  Log ("git pull --ff-only origin {0}" -f $branch)
  git pull --ff-only origin $branch
  if ($LASTEXITCODE -ne 0) {
    Log 'pull --ff-only no posible, forzando reset --hard'
    git reset --hard ("origin/" + $branch)
  }
}

Log 'Estado final:'
$st = git status -sb
$st
