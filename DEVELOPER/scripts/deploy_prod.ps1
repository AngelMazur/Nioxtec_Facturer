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

Start-Sleep -Seconds 3
try {
  $code = (Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10).StatusCode
  Write-Host "Despliegue OK, status API:" $code
} catch {
  Write-Host "Verifica túnel/servicios: health-check falló." $_.Exception.Message
}

