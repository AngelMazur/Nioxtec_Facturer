# Histórico de Fases

Registra aquí cada fase con fecha, alcance, PR/tag y notas. Mantener orden inverso (lo más reciente arriba).

## 2025-08-31 — Fase 2 (Iniciada)
- Alcance:
  - Documentación OpenAPI accesible en `/apidocs` para endpoints clave (auth/login, clientes, facturas).
  - Validación de entrada con schemas (Pydantic/Marshmallow) y errores 400 uniformes `{error, code}`.
  - Sin cambios de esquema (solo contrato y manejo de errores).
- Estado: En progreso
- PR: (añadir enlace cuando se cree)
- Tag: (añadir cuando se despliegue)
- Notas: Objetivo es estandarizar contrato y mejorar DX/QA.

## 2025-08-31 — Fase 1 (Deploy en curso)
- Alcance:
  - Alembic integrado; pipeline de deploy con backup + migración + health-check.
  - `Flask-Compress` habilitado; `/health` expone `APP_VERSION`.
- Estado: Despliegue iniciado por tag
- PR: #1 (release/v0.1.0 → main)
- Tag: v0.1.1
- Notas: Se disparó el workflow de producción por tag; actualizar este bloque cuando finalice con el resultado del health-check.

## 2025-08-31 — Fase 0 (Baseline)
- Alcance:
  - Alineada plantilla `templates/invoice_template.html` para usar `company.*` en emisor (coherente con `CompanyConfig`).
  - Revisión de arquitectura y plan de fases.
- Estado: Completado (pendiente de desplegar con próximo tag)
- PR: (añadir enlace)
- Tag: (añadir cuando se despliegue)
- Notas: Sin impacto de esquema ni servicios.

## Próxima — Fase 1 (Infra de deploy seguro)
- Alcance previsto:
  - Integración de Alembic.
  - Pipeline con backup DB + migración + health-check.
  - `Flask-Compress` en JSON/HTML.
- Criterios: Deploy en Windows con health 200 y rollback verificado.

## 2025-08-31 — Fase 1 (Iniciada)
- Alcance realizado:
  - Añadido `Flask-Compress` (JSON/HTML) y `version` en `/health`.
  - Estructura Alembic creada (`alembic.ini`, `migrations/`, revisión base `0001_baseline`).
  - Validado ciclo `alembic upgrade head` → `alembic downgrade -1` → `alembic upgrade head` en local.
  - Workflow de deploy actualizado: backup+migración+health-check y trigger por tags `v*`, exporta `APP_VERSION` al job.
- Próximos pasos:
  - Completar checklist de release y documentar resultado del tag `v0.1.1`.
