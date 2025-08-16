# Script maestro para inicio completo del sistema
# Se ejecuta al arrancar el PC y coordina todos los servicios

# Limpiar logs antiguos (mas de 7 dias)
$logFile = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.log"
$logDir = Split-Path $logFile
$cutoffDate = (Get-Date).AddDays(-7)

Write-Host "=== LIMPIEZA DE LOGS ANTIGUOS ===" -ForegroundColor Cyan
$oldLogs = Get-ChildItem -Path $logDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
if ($oldLogs) {
    $deletedCount = 0
    foreach ($log in $oldLogs) {
        try {
            Remove-Item $log.FullName -Force
            $deletedCount++
            Write-Host "Eliminado log antiguo: $($log.Name)" -ForegroundColor Yellow
        } catch {
            Write-Host "ERROR: Error eliminando $($log.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host "OK: Limpieza completada: $deletedCount logs antiguos eliminados" -ForegroundColor Green
} else {
    Write-Host "OK: No hay logs antiguos para limpiar" -ForegroundColor Green
}

Write-Host "=== INICIO COMPLETO DEL SISTEMA NIOXTEC ===" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 1. Iniciar Cloudflare
Write-Host "`nPaso 1: Iniciando Cloudflare Tunnel..." -ForegroundColor Yellow
try {
    & "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_cloudflare.ps1"
    Write-Host "OK: Cloudflare iniciado correctamente" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Error iniciando Cloudflare: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "AVISO: Continuando con el deploy..." -ForegroundColor Yellow
}

# 2. Ejecutar deploy
Write-Host "`nPaso 2: Ejecutando deploy de la aplicación..." -ForegroundColor Yellow
try {
    & "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1"
    Write-Host "OK: Deploy completado correctamente" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Error en el deploy: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== SISTEMA NIOXTEC COMPLETAMENTE INICIADO ===" -ForegroundColor Green
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "API: https://api.nioxtec.es" -ForegroundColor Cyan
Write-Host "Frontend: https://app.nioxtec.es" -ForegroundColor Cyan
