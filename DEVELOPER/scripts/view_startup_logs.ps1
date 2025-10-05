# Script para ver y analizar logs de startup

param(
    [switch]$Last,      # Ver el último log
    [switch]$All,       # Listar todos los logs
    [switch]$Errors,    # Mostrar solo los logs con errores
    [int]$Tail = 0      # Mostrar las últimas N líneas
)

$logDir = "C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs"

# Verificar que existe el directorio
if (-not (Test-Path $logDir)) {
    Write-Host "ERROR: No se encontró el directorio de logs: $logDir" -ForegroundColor Red
    exit 1
}

# Función para mostrar un log con formato
function Show-Log {
    param([string]$Path, [int]$TailLines = 0)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  LOG: $(Split-Path $Path -Leaf)" -ForegroundColor Cyan
    Write-Host "  Fecha: $((Get-Item $Path).LastWriteTime)" -ForegroundColor Gray
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    if ($TailLines -gt 0) {
        Get-Content $Path | Select-Object -Last $TailLines
    } else {
        Get-Content $Path
    }
}

# Ver el último log
if ($Last) {
    $lastLog = Get-ChildItem -Path $logDir -Filter "startup_*.log" -ErrorAction SilentlyContinue | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    
    if ($lastLog) {
        Show-Log -Path $lastLog.FullName -TailLines $Tail
    } else {
        Write-Host "No se encontraron logs de startup" -ForegroundColor Yellow
    }
    exit 0
}

# Listar todos los logs
if ($All) {
    $logs = Get-ChildItem -Path $logDir -Filter "startup_*.log" -ErrorAction SilentlyContinue | 
        Sort-Object LastWriteTime -Descending
    
    if ($logs) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  LOGS DE STARTUP DISPONIBLES" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        
        $logs | ForEach-Object {
            $hasError = Select-String -Path $_.FullName -Pattern "ERROR" -Quiet
            $color = if ($hasError) { "Red" } else { "Green" }
            $status = if ($hasError) { "[X] CON ERRORES" } else { "[OK]" }
            
            Write-Host ("  {0,-30} {1,-20} {2}" -f $_.Name, $_.LastWriteTime, $status) -ForegroundColor $color
        }
        
        Write-Host ""
        Write-Host "Usar: .\view_startup_logs.ps1 -Last       para ver el último" -ForegroundColor Gray
        Write-Host "Usar: .\view_startup_logs.ps1 -Errors     para ver logs con errores" -ForegroundColor Gray
        Write-Host "Usar: .\view_startup_logs.ps1 -Last -Tail 50  para ver las últimas 50 líneas" -ForegroundColor Gray
    } else {
        Write-Host "No se encontraron logs de startup" -ForegroundColor Yellow
    }
    exit 0
}

# Mostrar solo logs con errores
if ($Errors) {
    $logs = Get-ChildItem -Path $logDir -Filter "startup_*.log" -ErrorAction SilentlyContinue | 
        Sort-Object LastWriteTime -Descending
    
    $errorLogs = $logs | Where-Object {
        Select-String -Path $_.FullName -Pattern "ERROR" -Quiet
    }
    
    if ($errorLogs) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "  LOGS CON ERRORES" -ForegroundColor Red
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
        
        foreach ($log in $errorLogs) {
            Show-Log -Path $log.FullName -TailLines $Tail
            Write-Host ""
        }
    } else {
        Write-Host "[OK] No se encontraron logs con errores" -ForegroundColor Green
    }
    exit 0
}

# Si no se especifica ningún parámetro, mostrar ayuda
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VISOR DE LOGS DE STARTUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Uso:" -ForegroundColor Yellow
Write-Host "  .\view_startup_logs.ps1 -Last           Ver el último log completo" -ForegroundColor White
Write-Host "  .\view_startup_logs.ps1 -Last -Tail 50  Ver las últimas 50 líneas del último log" -ForegroundColor White
Write-Host "  .\view_startup_logs.ps1 -All            Listar todos los logs disponibles" -ForegroundColor White
Write-Host "  .\view_startup_logs.ps1 -Errors         Mostrar solo logs con errores" -ForegroundColor White
Write-Host ""
Write-Host "Ejemplos:" -ForegroundColor Yellow
Write-Host "  # Ver qué pasó en el último inicio" -ForegroundColor Gray
Write-Host "  .\view_startup_logs.ps1 -Last" -ForegroundColor Green
Write-Host ""
Write-Host "  # Ver si hubo algún error recientemente" -ForegroundColor Gray
Write-Host "  .\view_startup_logs.ps1 -Errors" -ForegroundColor Green
Write-Host ""
Write-Host "  # Ver las últimas 20 líneas del último inicio" -ForegroundColor Gray
Write-Host "  .\view_startup_logs.ps1 -Last -Tail 20" -ForegroundColor Green
Write-Host ""
