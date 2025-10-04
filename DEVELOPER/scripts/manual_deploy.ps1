# Script de Deploy Manual para Nioxtec Facturer
# Úsalo cuando GitHub Actions falle o para deploys locales urgentes

Write-Host "=== DEPLOY MANUAL NIOXTEC FACTURER ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = 'Stop'

# 1. GIT PULL
Write-Host "1. Actualizando código desde GitHub..." -ForegroundColor Yellow
Set-Location "C:\Nioxtec\Nioxtec_Facturer"
git fetch origin main
git reset --hard origin/main
Write-Host "   ✓ Código actualizado" -ForegroundColor Green

# 2. DETENER SERVICIOS
Write-Host "`n2. Deteniendo servicios..." -ForegroundColor Yellow
schtasks /End /TN "Nioxtec Backend" 2>$null | Out-Null
schtasks /End /TN "Nioxtec Frontend" 2>$null | Out-Null
schtasks /End /TN "Cloudflared Tunnel" 2>$null | Out-Null
Start-Sleep -Seconds 3
Write-Host "   ✓ Servicios detenidos" -ForegroundColor Green

# 3. MATAR PROCESOS PYTHON
Write-Host "`n3. Matando procesos Python (limpiar código cacheado)..." -ForegroundColor Yellow
Get-Process python* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "   ✓ Procesos Python terminados" -ForegroundColor Green

# 4. LIMPIAR CACHÉ PYTHON
Write-Host "`n4. Limpiando caché de Python (__pycache__ y .pyc)..." -ForegroundColor Yellow
$cacheCount = 0
Get-ChildItem -Path "C:\Nioxtec\Nioxtec_Facturer" -Recurse -Directory -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -eq '__pycache__' } | 
    ForEach-Object { 
        Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
        $cacheCount++
    }
Get-ChildItem -Path "C:\Nioxtec\Nioxtec_Facturer" -Recurse -Filter '*.pyc' -File -ErrorAction SilentlyContinue | 
    ForEach-Object { 
        Remove-Item -Force $_.FullName -ErrorAction SilentlyContinue
        $cacheCount++
    }
Write-Host "   ✓ $cacheCount archivos/carpetas de caché eliminados" -ForegroundColor Green

# 5. ACTUALIZAR BACKEND DEPENDENCIES (opcional, comentado por defecto para rapidez)
# Write-Host "`n5. Actualizando dependencias del backend..." -ForegroundColor Yellow
# $venvPath = Get-ChildItem -Path "C:\Nioxtec\Nioxtec_Facturer" -Directory -Filter ".venv_*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
# if ($venvPath) {
#     $pythonExe = Join-Path $venvPath.FullName "Scripts\python.exe"
#     if (Test-Path $pythonExe) {
#         & $pythonExe -m pip install --upgrade pip
#         & $pythonExe -m pip install --upgrade -r requirements.txt
#         Write-Host "   ✓ Dependencias actualizadas" -ForegroundColor Green
#     }
# }

# 6. FRONTEND: NPM CI + BUILD
Write-Host "`n6. Compilando frontend..." -ForegroundColor Yellow
Set-Location "C:\Nioxtec\Nioxtec_Facturer\frontend"

Write-Host "   - Instalando dependencias con npm ci..." -ForegroundColor Gray
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ npm ci falló" -ForegroundColor Red
    exit 1
}

Write-Host "   - Compilando con npm run build..." -ForegroundColor Gray
$env:VITE_API_BASE = "https://api.nioxtec.es"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ npm run build falló" -ForegroundColor Red
    exit 1
}

# Verificar que dist fue creado
if (-not (Test-Path "dist\index.html")) {
    Write-Host "   ✗ dist/index.html no fue generado" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Frontend compilado exitosamente" -ForegroundColor Green

# 7. REINICIAR SERVICIOS
Write-Host "`n7. Reiniciando servicios..." -ForegroundColor Yellow

Write-Host "   - Iniciando Backend..." -ForegroundColor Gray
schtasks /Run /TN "Nioxtec Backend"
Start-Sleep -Seconds 8

Write-Host "   - Iniciando Frontend..." -ForegroundColor Gray
schtasks /Run /TN "Nioxtec Frontend"
Start-Sleep -Seconds 5

Write-Host "   - Iniciando Cloudflare Tunnel..." -ForegroundColor Gray
schtasks /Run /TN "Cloudflared Tunnel"
Start-Sleep -Seconds 8

Write-Host "   ✓ Servicios reiniciados" -ForegroundColor Green

# 8. VERIFICACIÓN
Write-Host "`n8. Verificando que los servicios estén activos..." -ForegroundColor Yellow

Write-Host "   - Verificando Backend local (puerto 5000)..." -ForegroundColor Gray
$backendOk = $false
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -eq 200) {
        $backendOk = $true
        Write-Host "     ✓ Backend local OK" -ForegroundColor Green
    }
} catch {
    Write-Host "     ✗ Backend local no responde" -ForegroundColor Red
}

Write-Host "   - Verificando API de producción..." -ForegroundColor Gray
$apiOk = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "https://api.nioxtec.es/health" -UseBasicParsing -TimeoutSec 10
        if ($resp.StatusCode -eq 200) {
            $apiOk = $true
            Write-Host "     ✓ API de producción OK" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -lt 5) {
            Write-Host "     - Intento $i/5: esperando..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $apiOk) {
    Write-Host "     ⚠ API de producción no responde (puede ser propagación de Cloudflare)" -ForegroundColor Yellow
}

# RESUMEN
Write-Host "`n=== DEPLOY COMPLETADO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estado:" -ForegroundColor White
Write-Host "  - Backend local:      $(if ($backendOk) { '✓ OK' } else { '✗ FALLO' })" -ForegroundColor $(if ($backendOk) { 'Green' } else { 'Red' })
Write-Host "  - API producción:     $(if ($apiOk) { '✓ OK' } else { '⚠ Verificar' })" -ForegroundColor $(if ($apiOk) { 'Green' } else { 'Yellow' })
Write-Host ""

if ($backendOk -or $apiOk) {
    Write-Host "✓ Deploy exitoso" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor White
    Write-Host "  1. Abre https://app.nioxtec.es" -ForegroundColor Gray
    Write-Host "  2. Recarga con Ctrl+Shift+R" -ForegroundColor Gray
    Write-Host "  3. Verifica que los cambios estén aplicados" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "✗ Hay problemas con el deploy" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa:" -ForegroundColor White
    Write-Host "  - Logs en C:\Nioxtec\Nioxtec_Facturer\logs\" -ForegroundColor Gray
    Write-Host "  - Estado de tareas programadas: schtasks /Query /TN 'Nioxtec Backend'" -ForegroundColor Gray
    exit 1
}
