# Script para iniciar backend Flask en producción
Set-Location "C:\Nioxtec\Nioxtec_Facturer"

# Configuración de producción
$env:FLASK_DEBUG = "false"
$env:ENABLE_TALISMAN = "true"
$env:FORCE_HTTPS = "true"
$env:JWT_SECRET_KEY = "Rbd4?P5Axi@aS0bhNwN07sptS4&S?R"
$env:CORS_ORIGINS = "https://app.nioxtec.es,http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080"
$env:APP_ORIGIN = "https://app.nioxtec.es"
$env:PORT = "8000"

# Cargar variables desde .env (VENV_DIR, etc.)
try {
    $envFile = "C:\Nioxtec\Nioxtec_Facturer\.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            # Ignorar líneas vacías o comentarios
            if (-not $_ -or $_.Trim().StartsWith('#')) { return }
            if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"')
                if ($name -and ($name -notmatch '[^A-Za-z0-9_]+')) {
                    Set-Item -Path ("Env:" + $name) -Value $value -ErrorAction SilentlyContinue
                }
            }
        }
    }
} catch {}

# Ejecutar Flask (elige venv desde VENV_DIR o detecta el más reciente .venv_*)
try {
    $venvDir = $env:VENV_DIR
    if (-not $venvDir -or -not (Test-Path $venvDir)) {
        $candidates = Get-ChildItem -Directory -Path "C:\Nioxtec\Nioxtec_Facturer" | Where-Object { $_.Name -like ".venv*" } | Sort-Object LastWriteTime -Descending
        if ($candidates -and $candidates.Count -gt 0) { $venvDir = $candidates[0].FullName }
    }
    if (-not $venvDir -or -not (Test-Path $venvDir)) { $venvDir = "C:\Nioxtec\Nioxtec_Facturer\.venv" }
    $py = Join-Path $venvDir 'Scripts\python.exe'
    if (-not (Test-Path $py)) { $py = "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe" }
    & $py "C:\Nioxtec\Nioxtec_Facturer\app.py"
} catch {
    Write-Host "Error iniciando backend: $($_.Exception.Message)"
    exit 1
}
