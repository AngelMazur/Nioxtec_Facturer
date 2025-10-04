# Changelog

Entradas en orden inverso (más reciente primero). Para detalles de implementación, ver referencias a archivos.

## 2025-10-03 — Contratos (Renting) y UX Productos
- Contratos:
  - Estilos corporativos para títulos H1/H2/H3 en DOCX→HTML.
  - Preservación de negritas del DOCX en párrafos y tablas (`_format_paragraph_with_bold`).
  - Auto‑guardado del PDF al generar si se pasa `client_id` (crea `ClientDocument`).
  - Frontend: `ContractGeneratorModal.jsx` y `contractService.js` soportan `clientId` y mensajes diferenciados.
- Productos:
  - Mejora de layout (hero, iconos, estado vacío, badge de stock bajo, ratio de imágenes).
  - `ProductDetailModal.jsx` con tabs y guardado rápido de características/imágenes.
  - Menú de acciones (Editar/Archivar/Eliminar) integrado en detalle.

## 2025-09-02 — Migración Products/Inventory aplicada (nota)
- Alembic `0003_products_inventory` (tablas `product`, `stock_movement` y `invoice_item.product_id`).
- Recomendación: tolerar objetos existentes en entornos con datos (idempotencia).

## 2025-09-01 — Validación local Fase 3
- Scripts de verificación locales (auth, CORS, listados, política `?token`).
- Tests básicos con pytest.

## 2025-08-31 — Fase 3 (Robustez)
- Logging JSON opcional, rate limiting por endpoint, integración Sentry (opcional), listados homogéneos.

## 2025-08-31 — Fase 2 (OpenAPI/Validación)
- OpenAPI `/openapi.json` y `/apidocs`; validación 400 uniforme; login con cookies JWT; descargas sin `?token`.

## 2025-08-31 — Fase 1 (Deploy seguro)
- Alembic integrado; pipeline con backup + migración + health‑check.

## 2025-08-31 — Fase 0 (Baseline)
- Ajustes de plantilla y preparación de entorno.

