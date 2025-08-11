# Parar
schtasks /End /TN "Nioxtec Backend"  | Out-Null
schtasks /End /TN "Nioxtec Frontend" | Out-Null

# Backup BD
$bk = "C:\Backups"
if (-not (Test-Path $bk)) { New-Item -ItemType Directory -Path $bk | Out-Null }
Copy-Item C:\Nioxtec\Nioxtec_Facturer\instance\app.db "$bk\app_$(Get-Date -Format yyyyMMdd_HHmm).db"

# Pull y dependencias backend
cd C:\Nioxtec\Nioxtec_Facturer
git pull
if (Test-Path .\.venv310\Scripts\pip.exe) {
  .\.venv310\Scripts\pip.exe install -r requirements.txt
}

# Frontend build
cd frontend
npm ci
$env:VITE_API_BASE = "https://api.nioxtec.es"
npm run build

# Arrancar
schtasks /Run /TN "Nioxtec Backend"  | Out-Null
schtasks /Run /TN "Nioxtec Frontend" | Out-Null

# Espera y reintentos del health-check
$maxRetries = 3
$delaySec   = 10
for ($i=1; $i -le $maxRetries; $i++) {
  Start-Sleep -Seconds $delaySec
  try {
    $code = (Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10).StatusCode
    if ($code -eq 200) {
      Write-Host "Despliegue OK, status API: $code"
      exit 0
    } else {
      Write-Host "Health intento $i: código $code, reintentando..."
    }
  } catch {
    Write-Host "Health intento $i: $($_.Exception.Message), reintentando..."
  }
}
Write-Error "Health-check fallo tras $maxRetries intentos"
exit 1

