# NIOXTEC Facturer

Aplicación de facturación simple: Backend Flask + Frontend React (Vite) sin Docker.

## Entornos soportados

- Producción (Windows Server):
  - Backend Flask ejecutado como tarea programada (schtasks) con entorno virtual Windows `.venv310` (gunicorn o `python app.py`).
  - Frontend React servido como estático tras `npm run build` (IIS/Nginx/serve) como tarea programada.
  - Scripts PowerShell: `DEVELOPER/scripts/start_all.ps1`, `stop_all.ps1`, `deploy_prod.ps1`, `register_deploy_task.ps1`.
- Desarrollo (macOS):
  - Backend Flask (debug) en 5000.
  - Frontend con Vite dev server en 5173 (hot reload). `start_app.command` levanta este flujo y abre `http://localhost:5173`.
  - Alternativa prod-like local: gunicorn en 5000 y `serve` en 8080 (opcional).

## Requisitos

- macOS/Linux
- Python 3.11+
- Node.js 18+

## Backend (Flask)

1. Crear y activar venv
   ```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Variables de entorno (crear `.env` si lo deseas)
```env
JWT_SECRET_KEY=pon-un-secreto
CORS_ORIGINS=http://localhost:8080
# Para producción local sin HTTPS forzado
FORCE_HTTPS=false
# Si usas Postgres
# DATABASE_URL=postgresql+psycopg://usuario:pass@host:5432/basedatos
```

3. Arranque en producción (local) con gunicorn (macOS)
   ```bash
pip install gunicorn
FORCE_HTTPS=false FLASK_DEBUG=0 gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

4. Arranque en desarrollo
   ```bash
FLASK_DEBUG=1 python app.py
```
   
   **Nota macOS:** Si el puerto 5000 está ocupado por AirPlay, usar puerto alternativo:
   ```bash
PORT=5001 python app.py
```
   En ese caso, también modificar `frontend/src/lib/api.js` línea 12: cambiar `:5000` por `:5001`

## Frontend (React + Vite)

### Desarrollo (macOS)
```bash
cd frontend
npm install
npm run dev
# Vite escuchará en http://localhost:5173
```

### Producción (estático)
```bash
cd frontend
npm install
npm run build
npx serve -s dist -l 8080
```

El frontend se conectará al backend en `http://127.0.0.1:5000` (auto-config en `frontend/src/lib/api.js`).

## Numeración automática

- Facturas: `FAAMM###` (ej.: `F2508001`).
- Proformas: `PAAMM###`.
- El contador se reinicia por año/mes y se basa en la fecha del documento.

## Scripts útiles

- macOS
  - `start_app.command`: levanta backend (Flask debug) y Vite en 5173.
  - `stop_app.command`: detiene servicios locales en 5000/8080.
  - Semilla local (opcional): `python DEVELOPER/scripts/dev_seed.py` (crea usuario `dev/devpass`, cliente demo y una factura de ejemplo).
- Windows (producción)
  - `DEVELOPER/scripts/register_deploy_task.ps1`: registra la tarea "Nioxtec Deploy".
  - `DEVELOPER/scripts/deploy_prod.ps1`: para servicios, backup de `instance/app.db`, `git pull`, instala dependencias, build frontend y arranca tareas Backend/Frontend.
  - `DEVELOPER/scripts/start_all.ps1` y `stop_all.ps1`: inician/detienen tareas programadas "Nioxtec Backend" y "Nioxtec Frontend".

## Checklist antes de subir a producción

1. Tests manuales rápidos
   - Login OK (`/api/auth/login`).
   - Crear factura y proforma: número asignado automáticamente y formato correcto.
   - Cambio de fecha en formulario: número se recalcula (`next_number`).
   - Conversión proforma→factura: número de factura asignado.
   - Reportes (`/api/reports/summary`, `/api/reports/heatmap`): datos correctos.
   - PDF: generar y previsualizar.
2. Seguridad
   - `JWT_SECRET_KEY` definido en entorno de prod.
   - `CORS_ORIGINS` con dominios correctos.
   - `FORCE_HTTPS=true` detrás de proxy HTTPS.
3. Base de datos
   - Si usas SQLite, verifica permisos de `instance/app.db`.
   - Si usas Postgres, revisa `DATABASE_URL`.

## Despliegue (sin Docker)

- macOS/staging local:
  - Backend: `gunicorn -w 2 -b 0.0.0.0:5000 app:app` con variables de entorno adecuadas.
  - Frontend: servir `frontend/dist/` con tu server (Nginx/Apache) o con `npx serve -s dist -l 8080`.
- Windows producción:
  - Ejecutar `DEVELOPER/scripts/deploy_prod.ps1` (parada, backup, pull, build, arranque, health-check).
  - O bien usar la tarea registrada "Nioxtec Deploy" (`schtasks /Run /TN "Nioxtec Deploy"`).

## Procedimiento de Troubleshooting y Reinicio de Producción

### 🔧 Diagnóstico Completo del Sistema

Cuando los servicios de producción no respondan, seguir este proceso paso a paso:

#### 1. **Análisis de la Arquitectura**
```powershell
# Verificar configuración SSH para Git
git remote -v
# Asegurar que usa SSH: git@github.com:AngelMazur/Nioxtec_Facturer.git

# Verificar estado del repositorio
git status
git fetch origin -v
```

#### 2. **Diagnóstico de Servicios Locales**
```powershell
# Verificar puertos ocupados
netstat -ano | findstr ":5000\|:8080"

# Verificar procesos activos
Get-Process | Where-Object {$_.ProcessName -eq 'python' -or $_.ProcessName -eq 'node'}

# Probar endpoints locales
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing
```

#### 3. **Verificación de Scripts de Inicio**
```powershell
# Verificar que el entorno virtual existe
Test-Path "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe"

# Verificar que el build del frontend existe  
Test-Path "C:\Nioxtec\Nioxtec_Facturer\frontend\dist"

# Probar scripts manualmente
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\start_backend.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\start_frontend.ps1"
```

#### 4. **Corrección de Scripts si es Necesario**

**Script Backend (`scripts/start_backend.ps1`):**
```powershell
# Script para iniciar backend Flask en producción
Set-Location "C:\Nioxtec\Nioxtec_Facturer"

# Configuración de producción
$env:FLASK_DEBUG = "false"
$env:ENABLE_TALISMAN = "true"
$env:FORCE_HTTPS = "true"
$env:JWT_SECRET_KEY = "Rbd4?P5Axi@aS0bhNwN07sptS4&S?R"
$env:CORS_ORIGINS = "https://app.nioxtec.es,http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080"
$env:APP_ORIGIN = "https://app.nioxtec.es"

# Ejecutar Flask
try {
    & "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe" "C:\Nioxtec\Nioxtec_Facturer\app.py"
} catch {
    Write-Host "Error iniciando backend: $($_.Exception.Message)"
    exit 1
}
```

**Script Frontend (`scripts/start_frontend.ps1`):**
```powershell
Set-Location "C:\Nioxtec\Nioxtec_Facturer\frontend"

# Asegura que Node.js y npm están en PATH
$env:PATH = "C:\Program Files\nodejs\;C:\Users\angel\AppData\Roaming\npm;$env:PATH"

# Servir archivos estáticos del build en puerto 8080
& "C:\Users\angel\AppData\Roaming\npm\npx.cmd" --yes serve -s dist -l 8080
```

#### 5. **Proceso de Reinicio Completo**

**Paso 1: Detener servicios existentes**
```powershell
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

**Paso 2: Sincronizar Git**
```powershell
# Fetch y pull de cambios remotos
git fetch origin -v
git status

# Si hay cambios locales, commitear primero
git add -A
git commit -m "fix: correcciones de producción"
git pull origin main
git push origin main
```

**Paso 3: Ejecutar despliegue automatizado**
```powershell
& ".\DEVELOPER\scripts\deploy_prod.ps1"
```

#### 6. **Inicio Manual de Servicios (si deploy_prod.ps1 falla)**
```powershell
# Iniciar servicios usando Start-Process
Start-Process powershell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts\start_backend.ps1' -WindowStyle Hidden
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts\start_frontend.ps1' -WindowStyle Hidden
```

#### 7. **Verificación Final**
```powershell
# Esperar que los servicios se inicien
Start-Sleep -Seconds 15

# Verificar puertos locales
netstat -ano | findstr ":5000\|:8080"

# Verificar servicios de producción
Invoke-WebRequest -Uri "https://api.nioxtec.es/health" -UseBasicParsing -TimeoutSec 30
Invoke-WebRequest -Uri "https://app.nioxtec.es" -UseBasicParsing -TimeoutSec 30
```

### 🎯 **Arquitectura de Producción**

- **Backend Local**: Puerto 5000 ← **Túnel Cloudflare** ← `https://api.nioxtec.es`  
- **Frontend Local**: Puerto 8080 ← **Túnel Cloudflare** ← `https://app.nioxtec.es`
- **Git**: SSH `git@github.com:AngelMazur/Nioxtec_Facturer.git`
- **Scripts**: PowerShell optimizados para tareas programadas

### ⚠️ **Puntos Críticos**

1. **Scripts deben funcionar en tareas programadas** (sin dependencias de PATH del usuario)
2. **Túneles Cloudflare necesitan tiempo** para reconectar (~30 segundos)
3. **Variables de entorno** deben configurarse en cada script
4. **Git debe usar SSH** para evitar problemas de autenticación
5. **Frontend requiere build actualizado** antes del despliegue

### 🔄 **Comando de Emergencia**
```powershell
# Reinicio rápido completo
taskkill /F /IM python.exe; taskkill /F /IM node.exe; & ".\DEVELOPER\scripts\deploy_prod.ps1"
```

## Notas

- Eliminado soporte Docker del README para evitar confusión. Los archivos de Docker pueden mantenerse fuera del flujo de despliegue si no se usan.
# Deploy automático test
# ✅ Deploy automático FUNCIONANDO - Thu Aug 14 18:14:07 CEST 2025
# ✅ Deploy automático FUNCIONANDO - Thu Aug 14 18:15:35 CEST 2025
# 🔧 Workflow corregido - Thu Aug 14 18:22:21 CEST 2025
