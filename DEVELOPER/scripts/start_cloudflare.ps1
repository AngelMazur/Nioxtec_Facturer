# Script para iniciar Cloudflare cuando esté caído
# Uso: Cuando el túnel de Cloudflare no se conecta automáticamente al reiniciar

Write-Host "=== INICIANDO CLOUDFLARE TUNNEL ===" -ForegroundColor Cyan

# Ejecutar la tarea programada de Cloudflare
try {
    schtasks /Run /TN "Cloudflared Tunnel"
    Write-Host "OK: Tarea Cloudflared Tunnel ejecutada" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Error ejecutando tarea Cloudflared Tunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Esperar a que se conecte
Write-Host "Esperando a que Cloudflare se conecte..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar que funciona
Write-Host "Verificando conexión..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "OK: Cloudflare funcionando correctamente" -ForegroundColor Green
        Write-Host "API responde: $($response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "AVISO: API responde con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Cloudflare no responde: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "INFO: Puede tardar más tiempo en conectarse" -ForegroundColor Gray
    exit 1
}

Write-Host "=== CLOUDFLARE INICIADO ===" -ForegroundColor Green
