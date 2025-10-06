# Script para iniciar Cloudflare cuando esté caído
# Uso: Cuando el túnel de Cloudflare no se conecta automáticamente al reiniciar

# Función para mostrar progreso visual
function Show-Progress {
    param(
        [string]$Step,
        [string]$Message,
        [string]$Status = "INFO"
    )
    $timestamp = Get-Date -Format 'HH:mm:ss'
    $color = switch ($Status) {
        "START"   { "Cyan" }
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARNING" { "Yellow" }
        default   { "White" }
    }
    $icon = switch ($Status) {
        "START"   { "⏳" }
        "SUCCESS" { "✓" }
        "ERROR"   { "✗" }
        "WARNING" { "⚠" }
        default   { "ℹ" }
    }
    Write-Host "[$timestamp] $icon [$Step] $Message" -ForegroundColor $color
}

Show-Progress "CLOUDFLARE" "Iniciando túnel Cloudflare..." "START"

# Ejecutar la tarea programada de Cloudflare
try {
    schtasks /Run /TN "Cloudflared Tunnel" | Out-Null
    Show-Progress "CLOUDFLARE" "Tarea ejecutada correctamente" "SUCCESS"
} catch {
    Show-Progress "CLOUDFLARE" "Error ejecutando tarea: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Esperar a que se conecte
Show-Progress "CLOUDFLARE" "Esperando conexión (15 segundos)..." "START"
Start-Sleep -Seconds 15

# Verificar que funciona
Show-Progress "CLOUDFLARE" "Verificando conectividad..." "START"
try {
    $response = Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Show-Progress "CLOUDFLARE" "Túnel funcionando correctamente (HTTP $($response.StatusCode))" "SUCCESS"
    } else {
        Show-Progress "CLOUDFLARE" "API responde con código: $($response.StatusCode)" "WARNING"
    }
} catch {
    Show-Progress "CLOUDFLARE" "Sin respuesta: $($_.Exception.Message)" "WARNING"
    Show-Progress "CLOUDFLARE" "El túnel puede tardar más tiempo en conectarse" "INFO"
    exit 1
}
