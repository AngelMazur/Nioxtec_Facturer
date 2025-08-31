# Histórico de Fases

Registra aquí cada fase con fecha, alcance, PR/tag y notas. Mantener orden inverso (lo más reciente arriba).

## 2025-08-31 — Fase 3 (Iniciada)
- Alcance realizado:
  - Logging JSON opcional (`JSON_LOGS=true`) y handler 500 uniforme.
  - Rate limits por endpoint: login, uploads, PDFs y exportaciones.
  - Integración Sentry opcional (activar con `SENTRY_DSN`).
  - Handler JSON para 429 (rate limit excedido).
- Próximos pasos:
  - Homogeneizar paginación/sort en listados restantes y respuestas 401 uniformes.
- Notas de despliegue (2025-08-31):
  - Pipeline robustece deploy: venv por despliegue, escritura de `APP_VERSION` y `VENV_DIR` en `.env`, reinicio de tareas Backend/Frontend/Cloudflared.
  - Verificación pública con reintentos y tolerancia de 502 si la salud local (8000) está OK.
  - Cloudflare Tunnel mapeado a `http://localhost:8000` para `api.nioxtec.es`.
- Estado: En progreso (parcial desplegado)
- PR: `feat/fase-3-robustez` → `main`
- Tag: `v0.2.2`

## 2025-08-31 — Fase 2 (Desplegada)
- Alcance:
  - Documentación OpenAPI en `/openapi.json` y `/apidocs` (login, clientes, facturas).
  - Validación de entrada con schemas (Pydantic/Marshmallow) y errores 400 uniformes `{error, code}`.
  - Sin cambios de esquema (solo contrato y manejo de errores).
- Estado: Completado (desplegada en prod)
- PR: `release/v0.2.0` → `main`
- Tag: `v0.2.1`
- Notas:
  - Script `DEVELOPER/scripts/check_phase2_local.sh` para verificación local.
  - Cookies JWT en login para evitar `?token=`; cabecera `Cache-Control: private, no-store` en descargas; `?dl=1` para descarga forzada.

## 2025-08-31 — Fase 1 (Desplegada)
- Alcance:
  - Alembic integrado; pipeline de deploy con backup + migración + health-check.
  - `Flask-Compress` habilitado; `/health` expone `APP_VERSION`.
- Estado: Desplegada (tag)
- PR: `release/v0.1.0` → `main`
- Tag: `v0.1.1`
- Notas: Validado health 200 tras deploy.

## 2025-08-31 — Fase 0 (Baseline)
- Alcance:
  - Alineada plantilla `templates/invoice_template.html` para usar `company.*` en emisor (coherente con `CompanyConfig`).
  - Revisión de arquitectura y plan de fases.
- Estado: Completado (incluida en despliegues posteriores)
- PR: (añadir enlace si aplica)
- Tag: (añadir si aplica)
- Notas: Sin impacto de esquema ni servicios.
