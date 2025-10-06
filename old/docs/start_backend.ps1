# Script de inicio del backend en Windows
# Captura errores y muestra logs detallados

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Blue
Write-Host "INICIANDO BACKEND NIOXTEC FACTURER" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

# Verificar que estamos en el directorio correcto
$projectRoot = "C:\Nioxtec\Nioxtec_Facturer"
if (-Not (Test-Path $projectRoot)) {
    Write-Host "[ERROR] Directorio de proyecto no encontrado: $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot
Write-Host "[INFO] Directorio: $projectRoot" -ForegroundColor Cyan

# Verificar entorno virtual - usar el más reciente
$venvDirs = Get-ChildItem -Directory -Filter ".venv*" | Sort-Object Name -Descending
if ($venvDirs.Count -eq 0) {
    Write-Host "[ERROR] No se encontró ningún entorno virtual" -ForegroundColor Red
    exit 1
}

$venvPath = Join-Path $venvDirs[0].FullName "Scripts\python.exe"
if (-Not (Test-Path $venvPath)) {
    Write-Host "[ERROR] Entorno virtual no encontrado: $venvPath" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Python: $venvPath" -ForegroundColor Cyan

# Verificar base de datos
if (-Not (Test-Path "instance\app.db")) {
    Write-Host "[WARNING] Base de datos no encontrada en instance\app.db" -ForegroundColor Yellow
} else {
    $dbSize = (Get-Item "instance\app.db").Length / 1KB
    Write-Host "[OK] Base de datos: instance\app.db ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
}

# Configurar variables de entorno
$env:FLASK_APP = "app.py"
$env:FLASK_DEBUG = "false"
$env:FLASK_ENV = "production"
$env:PORT = "5001"

Write-Host "[INFO] Variables de entorno configuradas:" -ForegroundColor Cyan
Write-Host "   PORT: $env:PORT"
Write-Host "   FLASK_DEBUG: $env:FLASK_DEBUG"
Write-Host "   FLASK_ENV: $env:FLASK_ENV"

Write-Host "" 
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "Iniciando servidor Flask en http://localhost:5001" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

# Ejecutar Flask
try {
    & $venvPath app.py
} catch {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "[ERROR] Error al iniciar backend" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Yellow
    exit 1
}
