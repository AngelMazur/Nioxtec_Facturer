# Script para iniciar backend Flask en producción
Set-Location "C:\Nioxtec\Nioxtec_Facturer"

# Configuración de producción
$env:FLASK_DEBUG = "false"
$env:ENABLE_TALISMAN = "true"
$env:FORCE_HTTPS = "true"
$env:JWT_SECRET_KEY = "Rbd4?P5Axi@aS0bhNwN07sptS4&S?R"
$env:CORS_ORIGINS = "https://app.nioxtec.es,http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080"
$env:APP_ORIGIN = "https://app.nioxtec.es"

# Ejecutar Flask (soporta VENV_DIR en .env)
try {
    $venvDir = $env:VENV_DIR
    if (-not $venvDir -or -not (Test-Path $venvDir)) { $venvDir = "C:\Nioxtec\Nioxtec_Facturer\.venv" }
    $py = Join-Path $venvDir 'Scripts\python.exe'
    if (-not (Test-Path $py)) { $py = "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe" }
    & $py "C:\Nioxtec\Nioxtec_Facturer\app.py"
} catch {
    Write-Host "Error iniciando backend: $($_.Exception.Message)"
    exit 1
}
