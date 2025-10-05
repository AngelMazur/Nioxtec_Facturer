# Script para registrar el startup_master como tarea de auto-inicio
# Reemplaza la tarea de auto-deploy anterior

Write-Host "=== REGISTRANDO STARTUP MASTER PARA AUTO-INICIO ===" -ForegroundColor Cyan

# Eliminar la tarea anterior si existe
try {
    schtasks /Delete /TN "Nioxtec Auto Deploy" /F 2>$null
    Write-Host "OK: Tarea anterior eliminada" -ForegroundColor Green
} catch {
    Write-Host "INFO: No había tarea anterior para eliminar" -ForegroundColor Yellow
}

# Eliminar la tarea actual si existe para recrearla
try {
    schtasks /Delete /TN "Nioxtec Startup Master" /F 2>$null
    Write-Host "INFO: Tarea existente eliminada para recrear" -ForegroundColor Yellow
} catch {
    Write-Host "INFO: No había tarea para eliminar" -ForegroundColor Yellow
}

# Crear nueva tarea con el script maestro usando el wrapper
# IMPORTANTE: Usar wrapper para capturar errores y mantener ventana visible
$wrapperScript = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_wrapper.ps1"
$command = "powershell.exe -NoLogo -ExecutionPolicy Bypass -WindowStyle Normal -File `"$wrapperScript`""

schtasks /Create /TN "Nioxtec Startup Master" /SC ONSTART /RL HIGHEST /F /TR $command /DELAY 0000:30

Write-Host "OK: Tarea 'Nioxtec Startup Master' registrada para auto-inicio" -ForegroundColor Green
Write-Host "INFO: Se ejecutará automáticamente 30 segundos después de arrancar el PC" -ForegroundColor Cyan
Write-Host "INFO: La ventana permanecerá visible si hay errores" -ForegroundColor Cyan

# Verificar que se creó correctamente
Write-Host "`nVerificando tarea creada:" -ForegroundColor Yellow
schtasks /Query /TN "Nioxtec Startup Master" /FO LIST
