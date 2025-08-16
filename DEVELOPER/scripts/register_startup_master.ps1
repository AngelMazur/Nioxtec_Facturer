# Script para registrar el startup_master como tarea de auto-inicio
# Reemplaza la tarea de auto-deploy anterior

Write-Host "=== REGISTRANDO STARTUP MASTER PARA AUTO-INICIO ===" -ForegroundColor Cyan

# Eliminar la tarea anterior si existe
try {
    schtasks /Delete /TN "Nioxtec Auto Deploy" /F
    Write-Host "OK: Tarea anterior eliminada" -ForegroundColor Green
} catch {
    Write-Host "INFO: No había tarea anterior para eliminar" -ForegroundColor Yellow
}

# Crear nueva tarea con el script maestro
$masterScript = "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.ps1"
schtasks /Create /TN "Nioxtec Startup Master" /SC ONSTART /RL HIGHEST /F /TR $masterScript

Write-Host "OK: Tarea 'Nioxtec Startup Master' registrada para auto-inicio" -ForegroundColor Green
Write-Host "INFO: Se ejecutará automáticamente al arrancar el PC" -ForegroundColor Cyan

# Verificar que se creó correctamente
Write-Host "`nVerificando tarea creada:" -ForegroundColor Yellow
schtasks /Query /TN "Nioxtec Startup Master"
