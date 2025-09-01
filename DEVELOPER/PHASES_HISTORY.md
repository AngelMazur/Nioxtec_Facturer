# Histórico de Fases

Registra aquí cada fase con fecha, alcance, PR/tag y notas. Mantener orden inverso (lo más reciente arriba).

## 2025-08-31 — Fase 3 (Iniciada)
- Alcance realizado:
  - Logging JSON opcional (`JSON_LOGS=true`) y handler 500 uniforme.
  - Rate limits por endpoint: login, uploads, PDFs y exportaciones.
  - Integración Sentry opcional (activar con `SENTRY_DSN`).
  - Handler JSON para 429 (rate limit excedido).
  - Bugfix PDF: datos del emisor desde BD con fallback `.env`; dirección compuesta sin duplicar ciudad/provincia.
  - Desactivar `?token=` en prod mediante flag `ALLOW_QUERY_TOKEN` (por defecto `false` en prod, `true` en dev). Cookies y cabecera siguen soportadas.
  - Listados de Clientes y Facturas: paginación, búsqueda (`q`) y orden (`sort`, `dir`) homogéneos a Gastos.
- Próximos pasos:
  - Homogeneizar respuesta y parámetros en endpoints secundarios (p. ej. facturas por cliente ya actualizado; revisar contratos si aplicase).
- Notas de despliegue (2025-08-31):
  - Pipeline robustece deploy: venv por despliegue, escritura de `APP_VERSION` y `VENV_DIR` en `.env`, reinicio de tareas Backend/Frontend/Cloudflared.
  - Verificación pública con reintentos y tolerancia de 502 si la salud local (8000) está OK.
  - Cloudflare Tunnel mapeado a `http://localhost:8000` para `api.nioxtec.es`.
- Estado: En progreso (parcial desplegado)
- PR: `feat/fase-3-robustez` → `main`
- Tag: `v0.2.2` (pendiente `v0.2.3` para bugfix PDF si procede)

### 2025-09-01 — Validación local Fase 3
- Resultados (macOS, backend 5001):
  - `DEVELOPER/scripts/check_phase3_local.sh` (dev) → OK (`?token` aceptado en dev, CORS, login, listados, OpenAPI).
  - `DEVELOPER/scripts/check_phase3_local.sh` (simulado prod con `ALLOW_QUERY_TOKEN=false`) → OK (`?token` rechazado, resto OK).
  - `pytest tests/test_phase3_api.py` → 4 tests OK.
- Rama creada: `release/v0.2.3` (incluye gating `?token`, listados homogéneos, script y tests; docs actualizadas).
- Política: al cerrar Fase 3 y pasar a Fase 3.1/4 se eliminarán scripts `check_phase*_local.sh` obsoletos, dejando constancia en este histórico.
 - Migraciones: añadido Alembic `0002_phase3_schema` (client.created_at, invoice.payment_method, company_config.city/province, doc_sequence year/month + unique).

## 2025-09-02 — UX y Animaciones (ajustes menores)
- Frontend:
  - Formato de fecha DD‑MM‑AAAA en Facturas y Clientes.
  - Persistencia de filtros en URL limpiando valores por defecto (sin `?page=1&sort=date&dir=desc`).
  - Logo: `animate-blurred-fade-in` al hover (Header) y en carga en Login.
  - Spinner: doble aro con colores de marca y `spin-clockwise` rápido; estructura corregida para evitar “óvalo”.
  - Tailwind: migración a `tailwind.config.mjs` (ESM) con plugin `tailwind-animations`; fallback CSS para `animate-spin` en caso de caché.
  - Linter: limpio sin warnings.
- Notas: reiniciar Vite cuando cambie `tailwind.config.mjs` para regenerar utilidades.

Próximo objetivo
- Fase 3.2 — Productos e Inventario: catálogo + stock y selección en factura con descuento automático. Rama sugerida: `feat/products-inventory`.

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
