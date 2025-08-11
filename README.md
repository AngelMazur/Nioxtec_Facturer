# NIOXTEC Facturer

Aplicación de facturación simple: Backend Flask + Frontend React (Vite) sin Docker.

## Entornos soportados

- Producción (Windows Server):
  - Backend Flask ejecutado como tarea programada (schtasks) con entorno virtual Windows `.venv310` y gunicorn o `python app.py` según configuración actual.
  - Frontend React servido como estático tras `npm run build` (IIS/Nginx/serve) y levantado como tarea programada separada.
  - Scripts PowerShell de operación: `DEVELOPER/scripts/start_all.ps1`, `stop_all.ps1`, `deploy_prod.ps1`, `register_deploy_task.ps1`.
- Desarrollo (macOS):
  - Pruebas locales: Flask (debug) en 5000 y frontend estático en 8080 usando `start_app.command` / `stop_app.command`.
  - Alternativa prod-like local: gunicorn en 5000 y `serve` en 8080.

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

## Frontend (React + Vite)

   ```bash
   cd frontend
   npm install
   npm run build
   npx serve -s dist -l 8080
   ```

El frontend se conectará al backend en `http://127.0.0.1:5000` (configurado automáticamente por `frontend/src/lib/api.js`).

## Numeración automática

- Facturas: `FAAMM###` (ej.: `F2508001`).
- Proformas: `PAAMM###`.
- El contador se reinicia por año/mes y se basa en la fecha del documento.

## Scripts útiles

- macOS
  - `start_app.command`: levanta backend (Flask) y sirve frontend estático en 8080.
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

## Notas

- Eliminado soporte Docker del README para evitar confusión. Los archivos de Docker pueden mantenerse fuera del flujo de despliegue si no se usan.
