# Script para gestionar logs de startup manualmente

param(
    [switch]$Clean,        # Limpiar logs antiguos manualmente
    [int]$Days = 7,        # Días de retención (default: 7)
    [switch]$Size,         # Mostrar tamaño total de logs
    [switch]$List,         # Listar todos los logs
    [switch]$CleanAll      # Limpiar TODOS los logs (cuidado!)
)

$logDir = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs"

# Verificar que existe el directorio
if (-not (Test-Path $logDir)) {
    Write-Host "No hay logs aún. El directorio no existe." -ForegroundColor Yellow
    exit 0
}

# Función para formatear tamaños
function Format-FileSize {
    param([long]$Size)
    if ($Size -gt 1GB) {
        return "{0:N2} GB" -f ($Size / 1GB)
    } elseif ($Size -gt 1MB) {
        return "{0:N2} MB" -f ($Size / 1MB)
    } elseif ($Size -gt 1KB) {
        return "{0:N2} KB" -f ($Size / 1KB)
    } else {
        return "{0} bytes" -f $Size
    }
}

# Mostrar tamaño total
if ($Size) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ESPACIO UTILIZADO POR LOGS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $logs = Get-ChildItem -Path $logDir -Filter "*.log" -ErrorAction SilentlyContinue
    if ($logs) {
        $totalSize = ($logs | Measure-Object -Property Length -Sum).Sum
        $count = $logs.Count
        
        Write-Host ""
        Write-Host "  Total de archivos: $count logs" -ForegroundColor White
        Write-Host "  Espacio total: $(Format-FileSize $totalSize)" -ForegroundColor White
        Write-Host "  Promedio por log: $(Format-FileSize ($totalSize / $count))" -ForegroundColor Gray
        Write-Host ""
        
        # Agrupar por edad
        $now = Get-Date
        $logsHoy = $logs | Where-Object { $_.LastWriteTime.Date -eq $now.Date }
        $logsUltimaSemana = $logs | Where-Object { $_.LastWriteTime -gt $now.AddDays(-7) -and $_.LastWriteTime.Date -ne $now.Date }
        $logsViejos = $logs | Where-Object { $_.LastWriteTime -le $now.AddDays(-7) }
        
        Write-Host "  Distribución por edad:" -ForegroundColor Yellow
        Write-Host "    Hoy:               $($logsHoy.Count) logs - $(Format-FileSize (($logsHoy | Measure-Object -Property Length -Sum).Sum))" -ForegroundColor Green
        Write-Host "    Última semana:     $($logsUltimaSemana.Count) logs - $(Format-FileSize (($logsUltimaSemana | Measure-Object -Property Length -Sum).Sum))" -ForegroundColor Cyan
        if ($logsViejos) {
            Write-Host "    Más de 7 días:     $($logsViejos.Count) logs - $(Format-FileSize (($logsViejos | Measure-Object -Property Length -Sum).Sum))" -ForegroundColor Red
            Write-Host ""
            Write-Host "  ⚠ Hay logs antiguos que se eliminarán automáticamente" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "  No hay logs." -ForegroundColor Yellow
    }
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    exit 0
}

# Listar todos los logs
if ($List) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  LISTADO DE LOGS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $logs = Get-ChildItem -Path $logDir -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($logs) {
        Write-Host ""
        Write-Host ("  {0,-35} {1,-20} {2,-12} {3}" -f "Archivo", "Fecha", "Tamaño", "Edad") -ForegroundColor Yellow
        Write-Host ("  {0,-35} {1,-20} {2,-12} {3}" -f "-------", "-----", "------", "----") -ForegroundColor DarkGray
        
        foreach ($log in $logs) {
            $age = (Get-Date) - $log.LastWriteTime
            $ageStr = if ($age.Days -eq 0) { "Hoy" } 
                     elseif ($age.Days -eq 1) { "Ayer" } 
                     else { "$($age.Days) días" }
            
            $color = if ($age.Days -eq 0) { "Green" } 
                    elseif ($age.Days -le 7) { "Cyan" } 
                    else { "Red" }
            
            Write-Host ("  {0,-35} {1,-20} {2,-12} {3}" -f 
                $log.Name,
                $log.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss"),
                (Format-FileSize $log.Length),
                $ageStr
            ) -ForegroundColor $color
        }
        Write-Host ""
        Write-Host "  Total: $($logs.Count) logs" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "  No hay logs." -ForegroundColor Yellow
    }
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    exit 0
}

# Limpiar logs antiguos
if ($Clean) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  LIMPIEZA DE LOGS ANTIGUOS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $cutoffDate = (Get-Date).AddDays(-$Days)
    Write-Host ""
    Write-Host "  Eliminando logs anteriores a: $($cutoffDate.ToString('yyyy-MM-dd'))" -ForegroundColor Yellow
    Write-Host "  (Logs con más de $Days días)" -ForegroundColor Gray
    Write-Host ""
    
    $oldLogs = Get-ChildItem -Path $logDir -Filter "*.log" -ErrorAction SilentlyContinue | 
        Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($oldLogs) {
        $totalSize = ($oldLogs | Measure-Object -Property Length -Sum).Sum
        Write-Host "  Logs a eliminar: $($oldLogs.Count)" -ForegroundColor White
        Write-Host "  Espacio a liberar: $(Format-FileSize $totalSize)" -ForegroundColor White
        Write-Host ""
        
        $deletedCount = 0
        $deletedSize = 0
        
        foreach ($log in $oldLogs) {
            try {
                $size = $log.Length
                Remove-Item $log.FullName -Force
                $deletedCount++
                $deletedSize += $size
                Write-Host "  ✓ Eliminado: $($log.Name)" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Error: $($log.Name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "  Completado:" -ForegroundColor Green
        Write-Host "    • $deletedCount logs eliminados" -ForegroundColor Cyan
        Write-Host "    • $(Format-FileSize $deletedSize) liberados" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "  ✓ No hay logs antiguos para limpiar" -ForegroundColor Green
        Write-Host ""
    }
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    exit 0
}

# Limpiar TODOS los logs
if ($CleanAll) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ⚠ ADVERTENCIA: LIMPIAR TODOS LOS LOGS" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    
    $logs = Get-ChildItem -Path $logDir -Filter "*.log" -ErrorAction SilentlyContinue
    if ($logs) {
        $totalSize = ($logs | Measure-Object -Property Length -Sum).Sum
        Write-Host "  Se eliminarán TODOS los logs:" -ForegroundColor Yellow
        Write-Host "    • Total de archivos: $($logs.Count)" -ForegroundColor White
        Write-Host "    • Espacio a liberar: $(Format-FileSize $totalSize)" -ForegroundColor White
        Write-Host ""
        
        $confirmation = Read-Host "  ¿Estás seguro? (escribe 'SI' para confirmar)"
        
        if ($confirmation -eq "SI") {
            Write-Host ""
            $deletedCount = 0
            $deletedSize = 0
            
            foreach ($log in $logs) {
                try {
                    $size = $log.Length
                    Remove-Item $log.FullName -Force
                    $deletedCount++
                    $deletedSize += $size
                    Write-Host "  ✓ Eliminado: $($log.Name)" -ForegroundColor Green
                } catch {
                    Write-Host "  ✗ Error: $($log.Name) - $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            Write-Host ""
            Write-Host "  Completado:" -ForegroundColor Green
            Write-Host "    • $deletedCount logs eliminados" -ForegroundColor Cyan
            Write-Host "    • $(Format-FileSize $deletedSize) liberados" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "  Cancelado. No se eliminó nada." -ForegroundColor Yellow
            Write-Host ""
        }
    } else {
        Write-Host "  No hay logs para eliminar." -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    exit 0
}

# Si no se especifica ningún parámetro, mostrar ayuda
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GESTIÓN DE LOGS DE STARTUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Uso:" -ForegroundColor Yellow
Write-Host "  .\manage_logs.ps1 -List                Ver todos los logs" -ForegroundColor White
Write-Host "  .\manage_logs.ps1 -Size                Ver espacio utilizado" -ForegroundColor White
Write-Host "  .\manage_logs.ps1 -Clean               Limpiar logs >7 días" -ForegroundColor White
Write-Host "  .\manage_logs.ps1 -Clean -Days 30      Limpiar logs >30 días" -ForegroundColor White
Write-Host "  .\manage_logs.ps1 -CleanAll            Limpiar TODOS los logs" -ForegroundColor White
Write-Host ""
Write-Host "Información:" -ForegroundColor Yellow
Write-Host "  • Política automática: Los logs se eliminan después de 7 días" -ForegroundColor Gray
Write-Host "  • La limpieza automática se ejecuta cada vez que arranca el sistema" -ForegroundColor Gray
Write-Host "  • Ubicación: $logDir" -ForegroundColor Gray
Write-Host ""
Write-Host "Ejemplos:" -ForegroundColor Yellow
Write-Host "  # Ver cuánto espacio ocupan los logs" -ForegroundColor Gray
Write-Host "  .\manage_logs.ps1 -Size" -ForegroundColor Green
Write-Host ""
Write-Host "  # Ver listado de todos los logs con su edad" -ForegroundColor Gray
Write-Host "  .\manage_logs.ps1 -List" -ForegroundColor Green
Write-Host ""
Write-Host "  # Limpiar manualmente logs antiguos (>7 días)" -ForegroundColor Gray
Write-Host "  .\manage_logs.ps1 -Clean" -ForegroundColor Green
Write-Host ""
Write-Host "  # Limpiar logs más antiguos de 30 días" -ForegroundColor Gray
Write-Host "  .\manage_logs.ps1 -Clean -Days 30" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
