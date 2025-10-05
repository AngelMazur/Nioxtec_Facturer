# Script maestro para inicio completo del sistema
# Se ejecuta al arrancar el PC y coordina todos los servicios

# CONFIGURACIÓN DE LOGGING
$script:logFile = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs\startup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:logDir = Split-Path $script:logFile
if (-not (Test-Path $script:logDir)) { 
    New-Item -ItemType Directory -Path $script:logDir -Force | Out-Null 
}

# CAPTURAR TODO (stdout y stderr) y guardarlo en el log
try {
    Start-Transcript -Path $script:logFile -Append -ErrorAction Stop
} catch {
    Write-Host "ADVERTENCIA: No se pudo iniciar el transcript: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Configurar manejo de errores
$ErrorActionPreference = "Continue"
$script:hasErrors = $false
$script:transcriptStarted = $true

# Función para mostrar progreso visual Y guardar en log
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
        "ERROR"   { "Red"; $script:hasErrors = $true }
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
    $logMessage = "[$timestamp] $icon [$Step] $Message"
    Write-Host $logMessage -ForegroundColor $color
    # También escribir en el log sin formato
    Add-Content -Path $script:logFile -Value $logMessage -ErrorAction SilentlyContinue
}

# Función para mostrar separador
function Show-Separator {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
}

# Inicio del script
Clear-Host
Show-Separator "INICIO DEL SISTEMA NIOXTEC"
Show-Progress "SISTEMA" "Iniciando todos los servicios..." "START"
Show-Progress "SISTEMA" "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "INFO"
Show-Progress "LOG" "Archivo de log: $script:logFile" "INFO"

# Limpiar logs antiguos (mas de 7 dias)
Show-Separator "LIMPIEZA DE LOGS"
$logFileTemp = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.log"
$logDirOld = Split-Path $logFileTemp
$cutoffDate = (Get-Date).AddDays(-7)

# Limpiar logs antiguos de la carpeta logs/
if (Test-Path $script:logDir) {
    $oldLogs = Get-ChildItem -Path $script:logDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    if ($oldLogs) {
        $deletedCount = 0
        foreach ($log in $oldLogs) {
            try {
                Remove-Item $log.FullName -Force
                $deletedCount++
                Show-Progress "LIMPIEZA" "Eliminado: $($log.Name)" "SUCCESS"
            } catch {
                Show-Progress "LIMPIEZA" "Error eliminando $($log.Name): $($_.Exception.Message)" "ERROR"
            }
        }
        Show-Progress "LIMPIEZA" "Completado: $deletedCount logs eliminados" "SUCCESS"
    } else {
        Show-Progress "LIMPIEZA" "No hay logs antiguos para limpiar" "SUCCESS"
    }
}

# 1. Iniciar Cloudflare
Show-Separator "PASO 1/2: CLOUDFLARE TUNNEL"
Show-Progress "CLOUDFLARE" "Iniciando túnel Cloudflare..." "START"
try {
    & "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_cloudflare.ps1"
    Show-Progress "CLOUDFLARE" "Túnel iniciado correctamente" "SUCCESS"
} catch {
    Show-Progress "CLOUDFLARE" "Error: $($_.Exception.Message)" "ERROR"
    Show-Progress "CLOUDFLARE" "Continuando con el deploy..." "WARNING"
}

# 2. Ejecutar deploy
Show-Separator "PASO 2/2: DEPLOY DE LA APLICACIÓN"
Show-Progress "DEPLOY" "Iniciando proceso de deploy..." "START"
try {
    & "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "Deploy retornó código de error: $LASTEXITCODE"
    }
    Show-Progress "DEPLOY" "Deploy completado correctamente" "SUCCESS"
} catch {
    Show-Progress "DEPLOY" "Error en el deploy: $($_.Exception.Message)" "ERROR"
    Show-Progress "SISTEMA" "El sistema no pudo iniciarse correctamente" "ERROR"
    $script:hasErrors = $true
}

# Detener transcript antes de mostrar el resumen final
if ($script:transcriptStarted) {
    try {
        Stop-Transcript -ErrorAction SilentlyContinue
    } catch {
        # Ignorar errores al detener transcript
    }
}

# Resumen final
if ($script:hasErrors) {
    Show-Separator "ERROR: SISTEMA NO PUDO INICIARSE"
    Show-Progress "ERROR" "Revisa el log para más detalles: $script:logFile" "ERROR"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  Para ver el error completo, ejecuta:" -ForegroundColor Yellow
    Write-Host "  Get-Content `"$script:logFile`"" -ForegroundColor White
    Write-Host ""
    Write-Host "  O usa:" -ForegroundColor Yellow
    Write-Host "  cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts" -ForegroundColor White
    Write-Host "  .\view_startup_logs.ps1 -Last" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    exit 1
} else {
    Show-Separator "SISTEMA INICIADO CORRECTAMENTE"
    Show-Progress "SISTEMA" "Todos los servicios están activos" "SUCCESS"
    Show-Progress "API" "https://api.nioxtec.es" "SUCCESS"
    Show-Progress "FRONTEND" "https://app.nioxtec.es" "SUCCESS"
    Show-Progress "SISTEMA" "Hora de inicio: $(Get-Date -Format 'HH:mm:ss')" "INFO"
    Show-Progress "LOG" "Log guardado en: $script:logFile" "INFO"

    # Cerrar automáticamente la terminal en 10 segundos
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Show-Progress "SISTEMA" "Cerrando terminal en 10 segundos..." "INFO"
    Write-Host "  (Presiona Ctrl+C para mantener abierta)" -ForegroundColor Gray
    Start-Sleep -Seconds 10
    exit 0
}
