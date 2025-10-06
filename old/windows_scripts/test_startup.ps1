# Script para probar el startup manualmente sin reiniciar el PC
# Simula la ejecución al arrancar el sistema

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST DE STARTUP - Simulación de inicio automático" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el wrapper (que a su vez ejecuta startup_master.ps1)
& "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_wrapper.ps1"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FIN DEL TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
