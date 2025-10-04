# Scripts de Desarrollo

Carpeta con utilidades para desarrollo y diagnóstico. No se usan en producción.

## Inventario
- `create_sample_products.py` — Crea productos de ejemplo vía API (login admin/admin en dev).
- `debug_bold_detection.py` — Analiza negritas en plantillas DOCX (contratos).
- `debug_env.py` — Imprime variables relevantes y el cálculo de CORS.
- `debug_frontend.py` — Diagnóstico de conexión frontend↔backend y estáticos.
- `diagnostics/debug_contracts.py` — Comprobaciones extendidas del módulo de contratos.
- `legacy/migrate_expense_table.py` — Migración ad‑hoc de la tabla `expense` (solo si aún no usas Alembic 0002+).

## Uso
Ejecuta estos scripts solo en entornos de desarrollo o en servidores de pruebas bajo tu control.

