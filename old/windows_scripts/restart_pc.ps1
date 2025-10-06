# Script para reiniciar PC y verificar estado de servicios
Write-Host "=== REINICIO DE PC NIOXTEC ==="

# Funcion de logging
function Log([string]$message) {
    Write-Host ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message)
}

# Verificar estado actual antes del reinicio
Log "Verificando estado actual antes del reinicio..."

# Verificar procesos
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($pythonProcesses) {
    Log "Procesos Python activos: $($pythonProcesses.Count)"
    $pythonProcesses | ForEach-Object {
        Log "  PID: $($_.Id), CPU: $($_.CPU), Memoria: $([math]::Round($_.WorkingSet/1MB,2))MB"
    }
} else {
    Log "No hay procesos Python activos"
}

if ($nodeProcesses) {
    Log "Procesos Node activos: $($nodeProcesses.Count)"
    $nodeProcesses | ForEach-Object {
        Log "  PID: $($_.Id), CPU: $($_.CPU), Memoria: $([math]::Round($_.WorkingSet/1MB,2))MB"
    }
} else {
    Log "No hay procesos Node activos"
}

# Verificar puertos
$port5000 = netstat -ano | findstr ":5000"
$port8080 = netstat -ano | findstr ":8080"

if ($port5000) {
    Log "Puerto 5000 ocupado: $port5000"
} else {
    Log "Puerto 5000 libre"
}

if ($port8080) {
    Log "Puerto 8080 ocupado: $port8080"
} else {
    Log "Puerto 8080 libre"
}

# Verificar API
try {
    $response = Invoke-WebRequest "https://api.nioxtec.es/health" -UseBasicParsing -TimeoutSec 10
    Log "API responde con codigo: $($response.StatusCode)"
} catch {
    Log "API no responde: $($_.Exception.Message)"
}

# Confirmar reinicio
Log "¿Estas seguro de que quieres reiniciar el PC?"
Log "Esto cerrara todos los procesos y reiniciara el sistema."
Log "El auto-deploy deberia levantar los servicios automaticamente."

# Reiniciar PC
Log "Reiniciando PC en 10 segundos..."
Start-Sleep -Seconds 10

Log "REINICIANDO PC AHORA..."
Restart-Computer -Force
