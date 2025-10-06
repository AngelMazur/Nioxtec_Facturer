# Script para recrear tareas programadas con permisos SYSTEM
# Esto permite que el GitHub Action reinicie servicios automáticamente sin sesión interactiva

Write-Host "============================================================" -ForegroundColor Blue
Write-Host "RECREANDO TAREAS PROGRAMADAS CON PERMISOS SYSTEM" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

# Verificar que se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Este script requiere permisos de administrador" -ForegroundColor Red
    Write-Host "Ejecuta PowerShell como Administrador y vuelve a intentarlo" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Permisos de administrador: OK" -ForegroundColor Green
Write-Host ""

# Función para recrear una tarea
function Recreate-Task {
    param(
        [string]$TaskName,
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Host "Procesando: $TaskName" -ForegroundColor Cyan
    
    # Verificar que el script existe
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "  [ERROR] Script no encontrado: $ScriptPath" -ForegroundColor Red
        return $false
    }
    
    # Eliminar tarea existente
    try {
        $exists = schtasks /Query /TN $TaskName 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [INFO] Eliminando tarea existente..." -ForegroundColor Yellow
            schtasks /Delete /TN $TaskName /F 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Tarea eliminada" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  [INFO] Tarea no existe, creando nueva..." -ForegroundColor Gray
    }
    
    # Crear nueva tarea con permisos SYSTEM
    Write-Host "  [INFO] Creando tarea con RU SYSTEM..." -ForegroundColor Yellow
    
    $action = "powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
    
    $result = schtasks /Create `
        /TN $TaskName `
        /TR $action `
        /SC ONSTART `
        /RU "SYSTEM" `
        /RL HIGHEST `
        /F
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [SUCCESS] Tarea creada correctamente" -ForegroundColor Green
        
        # Verificar configuración
        $taskInfo = schtasks /Query /TN $TaskName /V /FO LIST 2>$null | Select-String "Ejecutar como usuario"
        Write-Host "  [INFO] $taskInfo" -ForegroundColor Cyan
        
        return $true
    } else {
        Write-Host "  [ERROR] No se pudo crear la tarea" -ForegroundColor Red
        return $false
    }
}

# Recrear tareas
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "RECREANDO TAREAS" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

$success = $true

# 1. Backend
$backendScript = "C:\Nioxtec\Nioxtec_Facturer\scripts\start_backend.ps1"
if (-not (Recreate-Task -TaskName "Nioxtec Backend" -ScriptPath $backendScript -Description "Backend Flask")) {
    $success = $false
}
Write-Host ""

# 2. Frontend
$frontendScript = "C:\Nioxtec\Nioxtec_Facturer\scripts\start_frontend.ps1"
if (-not (Recreate-Task -TaskName "Nioxtec Frontend" -ScriptPath $frontendScript -Description "Frontend Vite")) {
    $success = $false
}
Write-Host ""

# 3. Cloudflared Tunnel
$cloudflaredScript = "C:\Nioxtec\Nioxtec_Facturer\scripts\start_cloudflare.ps1"
if (Test-Path $cloudflaredScript) {
    if (-not (Recreate-Task -TaskName "Cloudflared Tunnel" -ScriptPath $cloudflaredScript -Description "Cloudflare Tunnel")) {
        $success = $false
    }
} else {
    Write-Host "[WARNING] Script de Cloudflare no encontrado: $cloudflaredScript" -ForegroundColor Yellow
    Write-Host "[INFO] Si usas Cloudflare Tunnel, verifica la ruta del script" -ForegroundColor Gray
}
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "RESUMEN" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue

if ($success) {
    Write-Host "[SUCCESS] Todas las tareas fueron recreadas correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Las tareas ahora se ejecutarán automáticamente durante el deploy." -ForegroundColor Cyan
    Write-Host "Ya no será necesario reiniciarlas manualmente." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Hacer git push para probar deploy automático" -ForegroundColor White
    Write-Host "2. Verificar que frontend y backend se reinician solos" -ForegroundColor White
    Write-Host "3. Verificar que https://app.nioxtec.es funciona sin 502" -ForegroundColor White
} else {
    Write-Host "[ERROR] Hubo errores al recrear algunas tareas" -ForegroundColor Red
    Write-Host "Revisa los mensajes anteriores para más detalles" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
