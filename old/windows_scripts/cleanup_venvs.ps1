param(
  [string]$Root = 'C:\\Nioxtec\\Nioxtec_Facturer',
  [int]$Keep = 2,
  [switch]$DryRun,
  [int]$CleanDownloadsDays = 0,
  [switch]$Aggressive
)

function Log([string]$m){ Write-Host ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) }

try {
  if (-not (Test-Path $Root)) { throw "Ruta no encontrada: $Root" }

  $envFile = Join-Path $Root '.env'
  $activeVenv = $null
  if (Test-Path $envFile) {
    try {
      $line = (Select-String -Path $envFile -Pattern '^VENV_DIR=(.+)$' -ErrorAction SilentlyContinue | Select-Object -First 1)
      if ($line) {
        $val = $line.Matches[0].Groups[1].Value.Trim()
        if ($val) { $activeVenv = $val }
      }
    } catch {}
  }

  Log "Carpeta raíz: $Root"
  if ($activeVenv) { Log "VENV_DIR activo (.env): $activeVenv" } else { Log 'VENV_DIR no definido en .env (se conservará el más reciente).'}

  $venvDirs = Get-ChildItem -Path $Root -Directory | Where-Object { $_.Name -like '.venv_*' } | Sort-Object LastWriteTime -Descending
  $toKeep = @()

  if ($venvDirs.Count -gt 0) {
    $latestN = $venvDirs | Select-Object -First ([Math]::Max($Keep,1))
    $toKeep += $latestN.FullName
  }
  if ($activeVenv) { $toKeep += $activeVenv }
  $toKeep = $toKeep | Where-Object { $_ -ne $null -and $_ -ne '' } | Select-Object -Unique

  $candidates = @()
  foreach ($d in $venvDirs) {
    if ($toKeep -notcontains $d.FullName) { $candidates += $d.FullName }
  }

  if (-not $Aggressive) {
    # Conservar .venv y .venv310 por compat / debugging si existen
    $legacy1 = Join-Path $Root '.venv'
    $legacy2 = Join-Path $Root '.venv310'
    if (Test-Path $legacy1) { $toKeep += $legacy1 }
    if (Test-Path $legacy2) { $toKeep += $legacy2 }
  }

  Log ("Venvs encontrados: " + ($venvDirs | ForEach-Object { $_.Name } | Sort-Object | Out-String).Trim())
  Log ("Se conservarán (Keep=$Keep): " + ($toKeep | Out-String).Trim())

  if ($candidates.Count -eq 0) {
    Log 'No hay venvs para eliminar.'
  } else {
    Log ("A eliminar: " + ($candidates -join ', '))
    if ($DryRun) {
      Log 'DryRun activo: no se eliminó nada.'
    } else {
      # Detener backend por si hay handles abiertos
      try { schtasks /End /TN "Nioxtec Backend" 2>$null | Out-Null } catch {}
      foreach ($path in $candidates) {
        try {
          Log ("Eliminando " + $path)
          Remove-Item -Recurse -Force -LiteralPath $path -ErrorAction Stop
        } catch { Log ("ERROR eliminando " + $path + ": " + $_.Exception.Message) }
      }
      # Reasegurar arranque
      try { schtasks /Run /TN "Nioxtec Backend" 2>$null | Out-Null } catch {}
      Log 'Limpieza de venvs completada.'
    }
  }

  if ($CleanDownloadsDays -gt 0) {
    $dl = Join-Path $Root 'downloads'
    if (Test-Path $dl) {
      $cut = (Get-Date).AddDays(-1 * $CleanDownloadsDays)
      $oldFiles = Get-ChildItem -Path $dl -Recurse -File | Where-Object { $_.LastWriteTime -lt $cut }
      if ($oldFiles.Count -gt 0) {
        Log ("Descargas > " + $CleanDownloadsDays + " días: " + $oldFiles.Count)
        if ($DryRun) {
          $oldFiles | ForEach-Object { Write-Host ("DRYRUN: " + $_.FullName) }
        } else {
          $oldFiles | Remove-Item -Force -ErrorAction SilentlyContinue
          Log 'Descargas antiguas eliminadas.'
        }
      } else { Log 'No hay descargas antiguas para eliminar.' }
    }
  }

} catch {
  Write-Error $_.Exception.Message
  exit 1
}

exit 0

