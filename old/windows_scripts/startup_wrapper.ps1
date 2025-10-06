# Wrapper para asegurar que la ventana permanezca visible ante errores
# Este script envuelve al startup_master.ps1

$ErrorActionPreference = "Continue"

# Configurar logging del wrapper
$wrapperLogFile = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs\wrapper_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$wrapperLogDir = Split-Path $wrapperLogFile
if (-not (Test-Path $wrapperLogDir)) { 
    New-Item -ItemType Directory -Path $wrapperLogDir -Force | Out-Null 
}

# Iniciar transcript del wrapper
Start-Transcript -Path $wrapperLogFile -Append

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  WRAPPER DE INICIO - INICIANDO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "Log del wrapper: $wrapperLogFile" -ForegroundColor Gray
Write-Host ""

$exitCode = 0
$hasError = $false

try {
    # Ejecutar el script principal mostrando TODO en pantalla
    Write-Host "Ejecutando startup_master.ps1..." -ForegroundColor Cyan
    Write-Host ""
    
    # Ejecutar y capturar toda la salida para mostrarla en pantalla
    $output = & "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.ps1" 2>&1
    $exitCode = $LASTEXITCODE
    
    # Mostrar toda la salida en pantalla
    $output | ForEach-Object {
        Write-Host $_
    }
    
    if ($null -eq $exitCode) {
        $exitCode = 0
    }
    
    Write-Host ""
    Write-Host "Script finalizado con código: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { "Green" } else { "Red" })
    
    # Si hubo error, marcarlo
    if ($exitCode -ne 0) {
        $hasError = $true
    }
} catch {
    $hasError = $true
    $exitCode = 1
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ERROR CRÍTICO CAPTURADO POR EL WRAPPER" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mensaje de error:" -ForegroundColor Yellow
    Write-Host "$($_.Exception.Message)" -ForegroundColor White
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host "$($_.ScriptStackTrace)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Exception completa:" -ForegroundColor Yellow
    Write-Host "$($_ | Out-String)" -ForegroundColor Gray
}

# Detener transcript antes de la pausa
Stop-Transcript

# SIEMPRE mostrar información de los logs
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LOGS GUARDADOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Los logs completos están guardados en:" -ForegroundColor Yellow
Write-Host "  $wrapperLogFile" -ForegroundColor White
Write-Host ""
Write-Host "Para ver el log completo, ejecuta:" -ForegroundColor Yellow
Write-Host "  Get-Content `"$wrapperLogFile`"" -ForegroundColor Green
Write-Host ""
Write-Host "O usa el visor de logs:" -ForegroundColor Yellow
Write-Host "  cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts" -ForegroundColor Green
Write-Host "  .\view_startup_logs.ps1 -Last" -ForegroundColor Green
Write-Host ""

# Si hubo error, ESPERAR INDEFINIDAMENTE
if ($hasError) {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ✗ ERROR DETECTADO - LA VENTANA NO SE CERRARÁ" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "El script finalizó con código de error: $exitCode" -ForegroundColor Red
    Write-Host ""
    Write-Host "¿Qué hacer ahora?" -ForegroundColor Yellow
    Write-Host "  1. Lee los mensajes de error arriba" -ForegroundColor White
    Write-Host "  2. Revisa el log: .\view_startup_logs.ps1 -Last" -ForegroundColor White
    Write-Host "  3. Presiona cualquier tecla cuando termines de leer" -ForegroundColor White
    Write-Host ""
    Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit $exitCode
}

# Si todo fue OK, informar y dar tiempo para leer
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ TODO CORRECTO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "La terminal se cerrará automáticamente en 30 segundos..." -ForegroundColor Gray
Write-Host "O presiona cualquier tecla para cerrar ahora." -ForegroundColor Gray
Write-Host ""

# Esperar 30 segundos o hasta que se presione una tecla
$timeout = 30
$startTime = Get-Date
while (((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
    if ([Console]::KeyAvailable) {
        $null = [Console]::ReadKey($true)
        break
    }
    Start-Sleep -Milliseconds 100
}

exit 0
