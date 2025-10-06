# Script de diagnóstico del sistema de startup

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DIAGNÓSTICO DEL SISTEMA DE STARTUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar scripts
Write-Host "1. VERIFICANDO SCRIPTS..." -ForegroundColor Yellow
$scripts = @(
    "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_wrapper.ps1",
    "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.ps1",
    "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_cloudflare.ps1",
    "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "  ✓ $(Split-Path $script -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $(Split-Path $script -Leaf) NO ENCONTRADO" -ForegroundColor Red
    }
}

# 2. Verificar tarea programada
Write-Host ""
Write-Host "2. VERIFICANDO TAREA PROGRAMADA..." -ForegroundColor Yellow
try {
    $task = schtasks /Query /TN "Nioxtec Startup Master" /FO LIST /V 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Tarea 'Nioxtec Startup Master' existe" -ForegroundColor Green
        
        # Extraer información clave
        $taskInfo = $task | Out-String
        if ($taskInfo -match "Estado:\s+(.+)") {
            Write-Host "    Estado: $($matches[1])" -ForegroundColor Gray
        }
        if ($taskInfo -match "Último tiempo de ejecución:\s+(.+)") {
            Write-Host "    Última ejecución: $($matches[1])" -ForegroundColor Gray
        }
        if ($taskInfo -match "Último resultado:\s+(.+)") {
            $result = $matches[1].Trim()
            $color = if ($result -eq "0") { "Green" } else { "Red" }
            Write-Host "    Último resultado: $result" -ForegroundColor $color
        }
        if ($taskInfo -match "Tarea que se ejecutará:\s+(.+)") {
            Write-Host "    Comando: $($matches[1])" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Tarea 'Nioxtec Startup Master' NO EXISTE" -ForegroundColor Red
        Write-Host "    Ejecuta: .\register_startup_master.ps1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Error verificando tarea: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Verificar directorio de logs
Write-Host ""
Write-Host "3. VERIFICANDO LOGS..." -ForegroundColor Yellow
$logDir = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs"
if (Test-Path $logDir) {
    Write-Host "  ✓ Directorio de logs existe" -ForegroundColor Green
    
    $logs = Get-ChildItem -Path $logDir -Filter "startup_*.log" -ErrorAction SilentlyContinue
    if ($logs) {
        $totalSize = ($logs | Measure-Object -Property Length -Sum).Sum
        $sizeStr = if ($totalSize -gt 1MB) {
            "{0:N2} MB" -f ($totalSize / 1MB)
        } elseif ($totalSize -gt 1KB) {
            "{0:N2} KB" -f ($totalSize / 1KB)
        } else {
            "$totalSize bytes"
        }
        
        Write-Host "    Total de logs: $($logs.Count)" -ForegroundColor Gray
        Write-Host "    Espacio usado: $sizeStr" -ForegroundColor Gray
        
        # Verificar logs antiguos
        $cutoffDate = (Get-Date).AddDays(-7)
        $oldLogs = $logs | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        if ($oldLogs) {
            Write-Host "    ⚠ Logs antiguos (>7 días): $($oldLogs.Count) - Se eliminarán automáticamente" -ForegroundColor Yellow
        }
        
        $lastLog = $logs | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Host "    Último log: $($lastLog.Name)" -ForegroundColor Gray
        Write-Host "    Fecha: $($lastLog.LastWriteTime)" -ForegroundColor Gray
        
        $hasError = Select-String -Path $lastLog.FullName -Pattern "ERROR|✗" -Quiet
        if ($hasError) {
            Write-Host "    Estado: ✗ CON ERRORES" -ForegroundColor Red
        } else {
            Write-Host "    Estado: ✓ OK" -ForegroundColor Green
        }
    } else {
        Write-Host "    ⚠ No hay logs aún (el sistema no se ha ejecutado)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Directorio de logs NO EXISTE" -ForegroundColor Red
    Write-Host "    Creando directorio..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "  ✓ Directorio creado" -ForegroundColor Green
}

# 4. Verificar servicios
Write-Host ""
Write-Host "4. VERIFICANDO SERVICIOS..." -ForegroundColor Yellow
$services = @(
    @{Name="Nioxtec Backend"; Task="Nioxtec Backend"},
    @{Name="Nioxtec Frontend"; Task="Nioxtec Frontend"},
    @{Name="Cloudflared Tunnel"; Task="Cloudflared Tunnel"}
)

foreach ($svc in $services) {
    try {
        $taskStatus = schtasks /Query /TN "$($svc.Task)" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $($svc.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($svc.Name) - Tarea no encontrada" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ $($svc.Name) - Error verificando" -ForegroundColor Red
    }
}

# 5. Verificar conectividad
Write-Host ""
Write-Host "5. VERIFICANDO CONECTIVIDAD..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ API responde correctamente (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ API responde con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ API no responde: $($_.Exception.Message)" -ForegroundColor Red
}

# Resumen
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ACCIONES DISPONIBLES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ver último log:" -ForegroundColor Yellow
Write-Host "    .\view_startup_logs.ps1 -Last" -ForegroundColor White
Write-Host ""
Write-Host "  Probar startup manualmente:" -ForegroundColor Yellow
Write-Host "    .\test_startup.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  Re-registrar tarea de inicio:" -ForegroundColor Yellow
Write-Host "    .\register_startup_master.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  Ver logs con errores:" -ForegroundColor Yellow
Write-Host "    .\view_startup_logs.ps1 -Errors" -ForegroundColor White
Write-Host ""
Write-Host "  Gestionar logs:" -ForegroundColor Yellow
Write-Host "    .\manage_logs.ps1 -Size    # Ver espacio usado" -ForegroundColor White
Write-Host "    .\manage_logs.ps1 -List    # Listar todos los logs" -ForegroundColor White
Write-Host "    .\manage_logs.ps1 -Clean   # Limpiar logs antiguos" -ForegroundColor White
Write-Host ""
