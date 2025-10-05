# Función para mostrar progreso visual
function Show-Progress {
    param(
        [string]$Step,
        [string]$Message,
        [string]$Status = "INFO"
    )
    $timestamp = Get-Date -Format 'HH:mm:ss'
    $color = switch ($Status) {
        "START"   { "Cyan" }
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARNING" { "Yellow" }
        default   { "White" }
    }
    $icon = switch ($Status) {
        "START"   { "⏳" }
        "SUCCESS" { "✓" }
        "ERROR"   { "✗" }
        "WARNING" { "⚠" }
        default   { "ℹ" }
    }
    Write-Host "[$timestamp] $icon [$Step] $Message" -ForegroundColor $color
}

# Parar servicios
Show-Progress "DEPLOY" "Deteniendo servicios actuales..." "START"
schtasks /End /TN "Nioxtec Backend" 2>$null | Out-Null
schtasks /End /TN "Nioxtec Frontend" 2>$null | Out-Null
Show-Progress "DEPLOY" "Servicios detenidos (o no estaban corriendo)" "SUCCESS"

# Backup BD
Show-Progress "BACKUP" "Creando backup de base de datos..." "START"
$bk = "C:\Backups"
if (-not (Test-Path $bk)) { New-Item -ItemType Directory -Path $bk | Out-Null }
Copy-Item C:\Nioxtec\Nioxtec_Facturer\instance\app.db "$bk\app_$(Get-Date -Format yyyyMMdd_HHmm).db"
Show-Progress "BACKUP" "Backup creado: app_$(Get-Date -Format yyyyMMdd_HHmm).db" "SUCCESS"

# Pull y dependencias backend
Show-Progress "GIT" "Actualizando código desde repositorio..." "START"
cd C:\Nioxtec\Nioxtec_Facturer
git pull | Out-Null
Show-Progress "GIT" "Código actualizado" "SUCCESS"

Show-Progress "BACKEND" "Instalando dependencias Python..." "START"
if (Test-Path .\.venv310\Scripts\pip.exe) {
  .\.venv310\Scripts\pip.exe install -r requirements.txt --quiet
  Show-Progress "BACKEND" "Dependencias instaladas" "SUCCESS"
} else {
  Show-Progress "BACKEND" "No se encontró entorno virtual" "WARNING"
}

# Frontend build
Show-Progress "FRONTEND" "Instalando dependencias Node.js..." "START"
cd frontend
npm ci --silent
Show-Progress "FRONTEND" "Dependencias instaladas" "SUCCESS"

Show-Progress "FRONTEND" "Construyendo aplicación frontend..." "START"
$env:VITE_API_BASE = "https://api.nioxtec.es"
npm run build --silent
Show-Progress "FRONTEND" "Build completado" "SUCCESS"

# Arrancar servicios
Show-Progress "DEPLOY" "Iniciando servicios..." "START"
schtasks /Run /TN "Nioxtec Backend" 2>$null | Out-Null
schtasks /Run /TN "Nioxtec Frontend" 2>$null | Out-Null
Show-Progress "DEPLOY" "Servicios iniciados (si las tareas existen)" "SUCCESS"

# Espera y reintentos del health-check
Show-Progress "HEALTH" "Verificando estado de la API..." "START"
$maxRetries = 3
$delaySec   = 10
$success = $false

for ($i=1; $i -le $maxRetries; $i++) {
  Show-Progress "HEALTH" "Intento $i/$maxRetries (esperando ${delaySec}s)..." "START"
  Start-Sleep -Seconds $delaySec
  try {
    $code = (Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10).StatusCode
    if ($code -eq 200) {
      Show-Progress "HEALTH" "API respondiendo correctamente (HTTP $code)" "SUCCESS"
      $success = $true
      break
    } else {
      Show-Progress "HEALTH" "Código inesperado: $code" "WARNING"
    }
  } catch {
    Show-Progress "HEALTH" "Error: $($_.Exception.Message)" "WARNING"
  }
}

if ($success) {
  Show-Progress "DEPLOY" "Deploy completado exitosamente" "SUCCESS"
  exit 0
} else {
  Show-Progress "DEPLOY" "Health-check falló tras $maxRetries intentos" "ERROR"
  exit 1
}

