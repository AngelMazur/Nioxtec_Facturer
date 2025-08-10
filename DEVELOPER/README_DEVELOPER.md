# README DESARROLLADOR

Guía práctica para trabajar en local (entorno de pruebas) y desplegar a producción. Incluye scripts de un clic en `DEVELOPER/scripts/`.

## Rutas y servicios
- Repo: `C:\Nioxtec\Nioxtec_Facturer`
- SQLite prod: `C:\Nioxtec\Nioxtec_Facturer\instance\app.db`
- Backend prod (tarea): `Nioxtec Backend`
- Frontend prod (tarea): `Nioxtec Frontend`
- Túnel Cloudflare: servicio `cloudflared` o tarea `Cloudflared Tunnel`

## Trabajo en desarrollo (local)

1) Backend (modo debug)
```powershell
cd C:\Nioxtec\Nioxtec_Facturer
 .\.venv310\Scripts\activate
$env:FLASK_DEBUG="true"
$env:ENABLE_TALISMAN="false"
$env:FORCE_HTTPS="false"
python app.py
```

2) Frontend (Vite con proxy a 5000)
```powershell
cd C:\Nioxtec\Nioxtec_Facturer\frontend
npm i
npm run dev
# abre http://localhost:5173
```

3) Base de datos de pruebas
- Opcionalmente usa otra BD: `setx DATABASE_URL "sqlite:///C:\\Nioxtec\\Nioxtec_Facturer\\instance\\app_dev.db"`

## Despliegue a producción (servidor)

Resumen de pasos:
1. Parar tareas prod (backend y frontend)
2. Backup de la BD
3. `git pull` y actualizar dependencias
4. Compilar frontend con API pública
5. Arrancar tareas y verificar salud

Comandos:
```powershell
# Parar
schtasks /End /TN "Nioxtec Backend"
schtasks /End /TN "Nioxtec Frontend"

# Backup BD
$bk="C:\Backups"; if(-not(Test-Path $bk)){ New-Item -ItemType Directory -Path $bk | Out-Null }
Copy-Item C:\Nioxtec\Nioxtec_Facturer\instance\app.db "$bk\app_$(Get-Date -Format yyyyMMdd_HHmm).db"

# Actualizar código y deps
cd C:\Nioxtec\Nioxtec_Facturer
git pull
 .\.venv310\Scripts\pip.exe install -r requirements.txt

# Frontend
cd frontend
npm ci
$env:VITE_API_BASE="https://api.nioxtec.es"
npm run build

# Arrancar
schtasks /Run /TN "Nioxtec Backend"
schtasks /Run /TN "Nioxtec Frontend"

# Verificar API
iwr https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10
```

## Scripts de un clic

Están en `DEVELOPER/scripts/`:

- `stop_all.ps1`: detiene Backend y Frontend
- `start_all.ps1`: inicia Backend y Frontend
- `deploy_prod.ps1`: despliegue completo (para en orden, hace backup, actualiza, compila y arranca; incluye health-check)

Ejecuta con PowerShell (Administrador):
```powershell
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\stop_all.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_all.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1
```

## Cloudflare Tunnel

- Servicio: `cloudflared` (recomendado) o tarea `Cloudflared Tunnel`.
- Comprobación:
```powershell
sc.exe query cloudflared
# o
Get-ScheduledTask -TaskName "Cloudflared Tunnel" | Get-ScheduledTaskInfo
```

## Diagnóstico rápido
```powershell
# Túnel en primer plano (logs)
cloudflared --loglevel debug --config "C:\ProgramData\Cloudflare\cloudflared\config.yml" tunnel run 478db0c4-6db4-4094-9896-52622211f7c1

# API
iwr https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10

# CORS preflight
curl.exe -i -X OPTIONS "https://api.nioxtec.es/api/auth/login" -H "Origin: https://app.nioxtec.es" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"
```


