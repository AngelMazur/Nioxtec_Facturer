# Plan de Fases y Despliegues Seguros

Este documento consolida el plan operativo para fases y despliegues (contenido movido desde `DEVELOPER/RELEASE_PLAN.md`).

## Convenciones
- Ramas: `feat/*`, `fix/*`, `chore/*` → PR a `main`.
- Despliegue: push/tag en `main` dispara deploy (runner Windows).
- Entornos: macOS (dev) y Windows Server (prod). Health `/health` debe devolver 200.

## Resumen de Fases
- Fase 0 (Baseline): infraestructura mínima y salud.
- Fase 1 (Deploy seguro): Alembic + backup + health‑check.
- Fase 2 (OpenAPI/Validación): `/openapi.json`, `/apidocs`, validación 400 uniforme.
- Fase 3 (Robustez): logging JSON, Sentry, rate limiting, listados homogéneos.
- Fase 3.1 (Refactor): modularización de backend (pendiente), tests mínimos.
- Fase 3.2 (Productos/Inventario): catálogo, stock y selección en factura.
- Futuras (4–6): rendimiento/coste, jobs y notificaciones, UX.

## Reglas de seguridad y despliegue
- Venv por despliegue en runner, `APP_VERSION` y `VENV_DIR` en `.env`.
- Cloudflare Tunnel `api.nioxtec.es` → `http://localhost:8000`.
- No `?token` en prod (`ALLOW_QUERY_TOKEN=false`).

## Checklists
- Ver `docs/operations/RELEASE_CHECKLIST.md`.

