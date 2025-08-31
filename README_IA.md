# README IA – Migración/Instalación en nuevo PC (Windows)

Objetivo: reproducir el servicio (Flask + React + Cloudflare Tunnel) en Windows, restaurar la BD SQLite y dejarlo operativo con HTTPS.

Parámetros
- Repo: C:\Nioxtec\Nioxtec_Facturer
- API pública: https://api.nioxtec.es
- Frontend público: https://app.nioxtec.es
- UUID túnel: 478db0c4-6db4-4094-9896-52622211f7c1
- JWT_SECRET_KEY: generar uno único

## 1) Requisitos
- Python 3.10.x (x64), Node.js LTS, Cloudflared
- PowerShell con permisos

## 2) Clonado y carpetas
mkdir C:\Nioxtec -Force
cd C:\
git clone --depth=1 REPO_URL C:\Nioxtec\Nioxtec_Facturer

## 3) Restaurar BD
Copiar app.db a C:\Nioxtec\Nioxtec_Facturer\instance\app.db
(si no existe: mkdir C:\Nioxtec\Nioxtec_Facturer\instance -Force)

## 4) Backend
cd C:\Nioxtec\Nioxtec_Facturer
py -3.10 -m venv .venv310
.\.venv310\Scripts\python.exe -m pip install --upgrade pip
.\.venv310\Scripts\pip.exe install -r requirements.txt

Crear scripts\start_backend.ps1:
Set-Location "C:\Nioxtec\Nioxtec_Facturer"
$env:FLASK_DEBUG="false"
$env:ENABLE_TALISMAN="true"
$env:FORCE_HTTPS="true"
$env:JWT_SECRET_KEY="PON_UN_SECRETO_LARGO_UNICO"
$env:CORS_ORIGINS="https://app.nioxtec.es,http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080"
$env:APP_ORIGIN="https://app.nioxtec.es"
& "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe" "C:\Nioxtec\Nioxtec_Facturer\app.py"

## 5) Frontend (build)
cd C:\Nioxtec\Nioxtec_Facturer\frontend
npm ci
$env:VITE_API_BASE="https://api.nioxtec.es"
npm run build

Crear scripts\start_frontend.ps1:
Set-Location "C:\Nioxtec\Nioxtec_Facturer\frontend"
$env:Path="$env:APPDATA\npm;$env:Path"
if (-not (Test-Path "$env:APPDATA\npm\serve.cmd")) { npm i -g serve }
npx serve -s dist -l 8080

### 5.1) Datos de empresa para PDFs
Si no existe una fila en la tabla `company_config`, define en `C:\\Nioxtec\\Nioxtec_Facturer\\.env` estas variables (el script `scripts/start_backend.ps1` las carga automáticamente):

```
COMPANY_NAME=D. José Luis Condolo Cuenca
COMPANY_CIF=12450905Q
COMPANY_ADDRESS=Calle Hacienda de Pavones 150, 3A, Madrid
COMPANY_CITY=Madrid
COMPANY_PROVINCE=Madrid
COMPANY_EMAIL=info@nioxtec.es
COMPANY_PHONE=+34 613094653
COMPANY_IBAN=ES89 2080 0609 1030 4011 5824
COMPANY_WEBSITE=nioxtec.es
```

## 6) Cloudflare Tunnel
Crear C:\ProgramData\Cloudflare\cloudflared\config.yml:
tunnel: 478db0c4-6db4-4094-9896-52622211f7c1
credentials-file: C:\ProgramData\Cloudflare\cloudflared\478db0c4-6db4-4094-9896-52622211f7c1.json
ingress:
  - hostname: api.nioxtec.es
    service: http://localhost:5000
  - hostname: app.nioxtec.es
    service: http://localhost:8080
  - service: http_status:404

Si falta el JSON: Copy-Item "C:\Users\angel\.cloudflared\478db0c4-....json" "C:\ProgramData\Cloudflare\cloudflared\" -Force

## 7) Levantar túnel sin ventana (elige una)

Servicio:
cloudflared service uninstall
cloudflared service install
sc.exe config cloudflared start= auto
sc.exe failure cloudflared reset= 86400 actions= restart/60000/restart/60000/restart/60000
sc.exe start cloudflared

Programador de tareas:
$action= New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `\"cloudflared --config 'C:\ProgramData\Cloudflare\cloudflared\config.yml' tunnel run 478db0c4-6db4-4094-9896-52622211f7c1`\""
$trigger= New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "Cloudflared Tunnel" -Action $action -Trigger $trigger -RunLevel Highest -Force
Start-ScheduledTask -TaskName "Cloudflared Tunnel"

## 8) Registrar tareas backend/frontend
schtasks /Create /TN "Nioxtec Backend"  /SC ONSTART /RL HIGHEST /F /TR "powershell -NoProfile -WindowStyle Hidden -File C:\Nioxtec\Nioxtec_Facturer\scripts\start_backend.ps1"
schtasks /Create /TN "Nioxtec Frontend" /SC ONSTART /RL HIGHEST /F /TR "powershell -NoProfile -WindowStyle Hidden -File C:\Nioxtec\Nioxtec_Facturer\scripts\start_frontend.ps1"
schtasks /Run /TN "Nioxtec Backend"
schtasks /Run /TN "Nioxtec Frontend"

## 9) Verificación
iwr https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10
curl.exe -i -X OPTIONS "https://api.nioxtec.es/api/auth/login" -H "Origin: https://app.nioxtec.es" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"

## 10) DNS (si procede)
CNAME proxied en Cloudflare para api/app apuntando a *.cfargotunnel.com

## 11) Acceso
Frontend: https://app.nioxtec.es (Ctrl+F5)
Login con el usuario existente en SQLite
