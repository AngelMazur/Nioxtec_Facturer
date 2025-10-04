# Especificación — Productos e Inventario (Fase 3.2)

## Objetivo
- Gestionar catálogo de productos y su stock.
- Integrar selección de productos en facturación: precarga de precio/IVA y descuento de stock al confirmar.

## Modelo de Datos (Alembic)
- `product`
  - `id: int PK`
  - `category: str(64)` — ej.: `pantallas`, `tpvs` (libre pero normalizada)
  - `model: str(128)` — nombre del modelo comercial (p. ej. `Modelo A`)
  - `sku: str(64) nullable` — opcional
  - `stock_qty: int default 0`
  - `price_net: float` — precio unitario sin IVA
  - `tax_rate: float default 21.0`
  - `features: JSON` — medidas, tipo SW, vida útil (meses), consumo (W), notas
  - `created_at: datetime`
- `stock_movement`
  - `id: int PK`
  - `product_id: FK -> product`
  - `qty: int` (positivo entrada, negativo salida)
  - `type: str(16)` — `sale|manual|adjust`
  - `invoice_id: FK -> invoice nullable`
  - `created_at: datetime`

Notas:
- Índices: `(category, model)`, `sku` único opcional.
- Integridad: trigger lógico en servicio para no permitir `stock_qty < 0`.

## Endpoints API
- `GET /api/products` — lista con `limit/offset/q/sort/dir`, filtros `category`, `model`.
- `POST /api/products` — crear.
- `GET /api/products/:id` — detalle.
- `PUT /api/products/:id` — actualizar.
- `DELETE /api/products/:id` — borrar (si no hay movimientos, o permitir con flag).
- `GET /api/products/summary` — agregados por `category` y por `model` dentro de categoría (para tarjetas). Respuesta:
  ```json
  {
    "categories": [
      { "category": "pantallas", "total": 12, "models": [ {"model": "Modelo 1", "count": 5}, {"model": "Modelo 2", "count": 7} ]},
      { "category": "tpvs", "total": 9,  "models": [ ... ]}
    ]
  }
  ```

## Integración con Facturas
- `InvoiceItem` acepta `product_id` (nullable) además de descripción y precios.
- Flujo creación:
  1) En el modal de factura, selector de producto → setea `tax_rate`, `unit_price` neto, descripción; unidades por defecto 1.
  2) Al confirmar `POST /api/invoices`, si la línea tiene `product_id`, el backend comprueba `stock_qty >= units` y resta stock dentro de la misma transacción (registra `StockMovement` con `type='sale'`).
  3) Si no hay stock suficiente → 409 con `{error}`.
- Borrado/edición de factura: política a definir (opción A: impedir si tiene ventas; opción B: reponer stock al borrar).

## UI (Mockup e Interacción)
- Página `Productos` (ruta `/productos`):
  - Tarjetas por `category` (Pantallas, TPVs...). Cada tarjeta muestra los `models` más frecuentes con el nº de productos por modelo.
  - Click en un modelo abre modal con lista filtrada de productos de ese modelo: tabla sencilla (SKU, precio con IVA, stock, acciones editar/eliminar) y botón "Añadir".
  - Buscador global y filtros por categoría/modelo.
- Facturas (modal crear):
  - Campo "Añadir producto" con autocomplete. Al seleccionar, precarga los campos del ítem.
  - Mostrar precio con IVA (bruto) en UI; enviar `price_net` al backend (como ya hacemos).

## Validaciones
- `price_net >= 0`, `tax_rate` 0–100, `stock_qty >= 0`.
- Al vender: rechazar si `units > stock_qty`.

## Tests mínimos
- CRUD de productos + búsqueda/orden.
- Resumen `/products/summary`.
- Crear factura con producto y verificar que descuenta stock.

## Plan de Entrega (por PRs)
1) Migración Alembic + modelos SQLAlchemy (sin exponer en API aún).
2) Endpoints `/api/products` + `/api/products/summary` + tests básicos.
3) UI Productos (tarjetas + modal lista/crear/editar).
4) Integración en factura (selector + descuento stock) + tests de venta.

