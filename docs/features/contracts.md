# Generador de Contratos (Compraventa y Renting)

Estado: Implementado con mejoras recientes (estilos y auto-guardado)

## Resumen
- Generación de PDF a partir de plantillas DOCX con placeholders.
- Detección y preservación de negritas del DOCX.
- Detección de títulos H1/H2/H3 y estilos corporativos.
- Auto-guardado del PDF como documento del cliente si se pasa `client_id`.

## Uso en Frontend
- Modal principal: `frontend/src/features/contracts/components/ContractGeneratorModal.jsx`.
- Servicio: `frontend/src/features/contracts/services/contractService.js`.
- Flujo:
  1) Selección de plantilla y carga de placeholders.
  2) Relleno de formulario (con auto-relleno de cliente/empresa).
  3) Vista previa opcional.
  4) Generar PDF (y auto-guardar si hay cliente seleccionado) o Guardar como documento directamente.

## Endpoints Backend
- `GET /api/contracts/templates` — Lista plantillas disponibles.
- `GET /api/contracts/templates/<template_id>/placeholders` — Extrae placeholders.
- `POST /api/contracts/generate-pdf` — Genera PDF; si incluye `client_id`, guarda automáticamente el documento del cliente.
- `GET /api/contracts/download/<filename>` — Descarga el PDF generado.
- `POST /api/contracts/save-as-document` — Genera y guarda el PDF en documentos del cliente (sin descarga).

## Mejoras de estilo y parsing (DOCX → HTML)
- `_format_paragraph_with_bold(paragraph)` preserva negritas en párrafos y tablas.
- `_docx_to_html(...)` detecta títulos:
  - H1: títulos principales (compraventa/renting).
  - H2: secciones (p. ej., CLÁUSULAS, ACEPTACIÓN DEL CONTRATO).
  - H3: subsecciones (p. ej., 3.x/4.x y apartados de renting), y variaciones por estilo "Heading 3".
- Estilos corporativos aplicados (color `#65AAC3`, tamaños y espaciados ajustados, tablas con cabecera resaltada).

## Auto‑guardado de contratos
- `POST /api/contracts/generate-pdf` acepta opcional `client_id`.
- Si se proporciona y el cliente existe:
  - Guarda el PDF en `instance/uploads/<client_id>/documents/`.
  - Crea registro `ClientDocument` en la base de datos.
  - Respuesta incluye `document_saved: true` y `filename`.
- Frontend muestra mensajes diferenciados y refresca documentos del cliente mediante callback.

## Archivos relevantes
- Backend: endpoints y helpers en `app.py` (sección "Contract Generation").
- Frontend: servicio y modal en `frontend/src/features/contracts/`.
- Plantillas: `static/contracts/templates/*.docx`.

## Referencias adicionales
- Documentación por feature en el propio módulo: `frontend/src/features/contracts/README.md`.

