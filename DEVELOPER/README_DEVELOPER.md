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

Importante: este despliegue NO toca la base de datos (`app.db`). Solo para/arranca servicios, hace backup preventivo del fichero y actualiza código / dependencias / build del frontend. Si introduces cambios de esquema, define un plan de migración explícito.

## Desarrollo en macOS y despliegue a producción (Windows)

### macOS – entorno de pruebas
Backend:
```bash
cd ~/Nioxtec_Facturer
python3 -m venv venv
source venv/bin/activate
export FLASK_DEBUG=true
export ENABLE_TALISMAN=false
export FORCE_HTTPS=false
python app.py
```

Frontend:
```bash
cd ~/Nioxtec_Facturer/frontend
npm i
npm run dev  # http://localhost:5173
```

### Flujo de despliegue desde macOS
1. Sube tus cambios al remoto:
```bash
git add -A && git commit -m "feat: ..." && git push
```
2. En el servidor Windows, lanza el despliegue:
```powershell
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1
```
Esto actualizará el código/producto en Madrid sin modificar la base de datos.

### Despliegue con un clic (tarea programada)
Crea una tarea para el despliegue (script incluido) y ejecútala cuando quieras:
```powershell
# Registrar una vez
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\register_deploy_task.ps1
# Ejecutar cada vez que quieras desplegar
schtasks /Run /TN "Nioxtec Deploy"
```

### Auto-inicio completo del sistema
Para configurar el inicio automático completo (Cloudflare + Deploy) al arrancar el PC:
```powershell
# Registrar startup master para auto-inicio
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\register_startup_master.ps1
```
Esto creará la tarea "Nioxtec Startup Master" que se ejecutará automáticamente al arrancar el PC.

## Scripts de un clic

Están en `DEVELOPER/scripts/`:

- `stop_all.ps1`: detiene Backend y Frontend
- `start_all.ps1`: inicia Backend y Frontend
- `deploy_prod.ps1`: despliegue completo (para en orden, hace backup, actualiza, compila y arranca; incluye health-check)
- `start_cloudflare.ps1`: inicia Cloudflare cuando está caído (útil después de reinicios)
- `startup_master.ps1`: script maestro que coordina el inicio completo del sistema (incluye limpieza automática de logs)
- `register_startup_master.ps1`: registra el startup_master para auto-inicio al arrancar el PC

Ejecuta con PowerShell (Administrador):
```powershell
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\stop_all.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_all.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_cloudflare.ps1
PS C:\> C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\startup_master.ps1
```

## Cloudflare Tunnel

- Servicio: `cloudflared` (recomendado) o tarea `Cloudflared Tunnel`.
- Comprobación:
```powershell
sc.exe query cloudflared
# o
Get-ScheduledTask -TaskName "Cloudflared Tunnel" | Get-ScheduledTaskInfo
```

### Si Cloudflare está caído después de reiniciar

Si después de reiniciar el PC, Cloudflare no se conecta automáticamente:

```powershell
# Ejecutar script para iniciar Cloudflare
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\start_cloudflare.ps1
```

Este script:
- Ejecuta la tarea programada de Cloudflare
- Espera a que se conecte
- Verifica que la API responde correctamente
- Muestra el estado de la conexión

## Diagnóstico rápido
```powershell
# Túnel en primer plano (logs)
cloudflared --loglevel debug --config "C:\ProgramData\Cloudflare\cloudflared\config.yml" tunnel run 478db0c4-6db4-4094-9896-52622211f7c1

# API
iwr https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10

# CORS preflight
curl.exe -i -X OPTIONS "https://api.nioxtec.es/api/auth/login" -H "Origin: https://app.nioxtec.es" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"
```


