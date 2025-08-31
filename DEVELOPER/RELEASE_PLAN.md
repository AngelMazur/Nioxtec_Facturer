# Plan de Fases y Despliegues Seguros

Este documento define las fases de mejora y cómo desplegarlas sin romper producción.
Mantén este archivo actualizado en cada fase y vincula PRs/tags.

## Convenciones
- Ramas: `feat/*`, `fix/*`, `chore/*` → PR a `main`.
- Despliegue: push a `main` o tag `vX.Y.Z` en `main` dispara deploy a producción.
- Entornos: macOS (dev) y Windows Server (prod, runner Actions).
- Health: `/health` debe devolver 200 tras cada despliegue.
 - Infra de deploy (Windows): venv por despliegue (`.venv_<timestamp>`), backend enlaza `PORT=8000`, el workflow escribe `APP_VERSION` y `VENV_DIR` en `.env` y reinicia tareas programadas (Backend/Frontend/Cloudflared).
 - Dominio público: Cloudflare Tunnel mapea `api.nioxtec.es` → `http://localhost:8000`.

## Fases

### Fase 0 — Preparación (Baseline)
- Objetivo: infra mínima para poder desplegar con seguridad.
- Alcance:
  - Variables de entorno separadas por entorno.
  - Endpoint `/health` (ya existe) y `APP_VERSION` opcional.
  - Ajustes menores en plantillas (ej. emisor dinámico en factura).
- Criterios de aceptación:
  - App arranca en dev y prod como antes.
  - Health 200.
- Rollback: N/A (cambios de bajo riesgo).

### Fase 1 — Infra de deploy seguro
- Objetivo: migraciones y checks automatizados.
- Alcance:
  - Integrar Alembic (migraciones versionadas).
  - Pipeline: backup DB → `alembic upgrade head` → restart servicio → health-check.
  - `Flask-Compress` para JSON/HTML.
- Criterios de aceptación:
  - PR con CI verde (lint/tests/build).
  - Despliegue en Windows con backup + migración + health 200.
- Rollback: `alembic downgrade -1` + restart.

### Fase 2 — Contrato y validación
- Objetivo: contrato API visible y validación robusta.
- Alcance:
  - OpenAPI con `/openapi.json` y página `/apidocs` (Redoc) para 3 endpoints clave (login, clientes, invoices).
  - Validación de entrada con schemas Pydantic y errores 400 uniformes `{error, code}`.
  - Autenticación via JWT con compatibilidad en cookies: login fija cookie para que descargas no expongan el token en la URL.
  - Descargas de documentos sin `?token=` en enlaces; encabezado `Cache-Control: private, no-store` en `/api/clients/:id/documents/:doc_id`.
  - `?dl=1` fuerza descarga como adjunto; inline por defecto para previsualizar.
- Criterios de aceptación: `/apidocs` accesible; `/openapi.json` válido; payloads inválidos devuelven 400 con forma uniforme; documentos accesibles sin `?token=`.
- Verificación local: `DEVELOPER/scripts/check_phase2_local.sh` + prueba manual de descarga inline/forzada.
- Rollback: revertir PR (no impacta datos).

### Fase 3 — Robustez runtime
- Objetivo: proteger recursos y homogeneizar listados.
- Alcance:
  - Logs estructurados JSON y Sentry (opcional, pendiente de `SENTRY_DSN`).
  - Rate limiting por endpoint con Redis en prod (login, uploads, PDF/contratos, exportaciones).
  - Paginación y sort consistentes en listados (clientes, facturas, gastos) y respuestas uniformes.
- Criterios: límites efectivos; formato uniforme de respuestas.
- Rollback: desactivar límites o revertir cambios.

### Fase 4 — Rendimiento y coste
- Objetivo: acelerar reportes y asegurar integridad.
- Alcance:
  - Redis cache en reportes (TTL 5–10 min) + invalidación.
  - Índices compuestos/UNIQUE necesarios.
  - Soft delete en `Client`/`Invoice` (opcional).
- Criterios: menor latencia en reportes; no rompe integridad.
- Rollback: limpiar cache y revertir migraciones si procede.

### Fase 5 — Jobs y notificaciones
- Objetivo: sacar tareas pesadas del request.
- Alcance:
  - Cola (RQ/Celery + Redis) para PDFs, emails, exportaciones.
  - Endpoint 202 con `job_id` y consulta de estado.
- Criterios: PDFs/emails no bloquean, con reintentos.
- Rollback: desactivar workers y servir vía síncrona temporalmente.

### Fase 6 — Frontend UX
- Objetivo: experiencia moderna y resiliente.
- Alcance:
  - PWA (installable) + offline básico con Workbox.
  - Optimización de bundle, a11y, y tests E2E (Playwright).
- Criterios: Lighthouse PWA ok; flujos E2E verdes en CI.
- Rollback: desactivar service worker.

---

## Checklist de despliegue (por versión)
1. CI: lint + tests + build ok en PR.
2. Push a `main` o tag `vX.Y.Z` creado en `main`.
3. Infra runner verificada: tareas programadas (Backend/Frontend/Cloudflared) habilitadas; Cloudflare mapea `api.nioxtec.es` → `http://localhost:8000`.
4. Backup DB realizado en runner Windows.
5. `alembic upgrade head` ejecutado sin errores.
6. Servicios reiniciados correctamente (incluye Cloudflared Tunnel).
7. Health-check local y público (`/health`) responden 200 (con reintentos si CDN tarda).
8. Monitoreo 30–60 min y validación de rutas críticas.
9. Si falla: `alembic downgrade -1` y reinicio.
