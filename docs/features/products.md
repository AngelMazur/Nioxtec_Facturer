# Productos e Inventario

Estado: Implementado (Fase 3.2)

## Especificación funcional (resumen)
- Catálogo de productos con campos: `category`, `model`, `sku (opcional)`, `stock_qty`, `price_net`, `tax_rate`, `features (JSON)`, `images (JSON opcional)`.
- Movimientos de stock (`stock_movement`): `qty` positivo/negativo, `type` = `sale|manual|adjust`, opcional `invoice_id`.
- Integración con facturas: las líneas aceptan `product_id`; al confirmar, se valida stock y se descuenta en una transacción atómica.

## Modelo de datos (Alembic)
- Migraciones: `0003_products_inventory` (tablas `product`, `stock_movement` y `invoice_item.product_id`) y `0005_add_product_images` (campo `images`).
- Índices: `category`, `model`, `invoice_item.product_id`, `stock_movement.(product_id, invoice_id)`.

## API (principal)
- `GET /api/products` — lista con `limit/offset/q/sort/dir`, filtros `category`, `model`, `active`.
- `POST /api/products` — crear producto.
- `GET /api/products/:id` — detalle.
- `PUT /api/products/:id` — actualizar (incluye `features` e `images`).
- `DELETE /api/products/:id` — eliminar.
- `GET /api/products/summary` — agregados por categoría y modelos.

## UI (React)
- Página `Productos.jsx`:
  - Hero con estadísticas (total, categorías, stock bajo).
  - Tarjetas por categoría con imagen, icono y badge de “stock bajo”.
  - Búsqueda por categoría/modelo; pestañas Activos/Archivados.
  - Lista por modelo con apertura de detalle si hay 1 resultado.
- `ProductModal.jsx` (crear/editar): tabs General, Características, Imágenes.
- `ProductDetailModal.jsx` (visualización avanzada): tabs con cards, galería e indicadores de stock; permite guardar cambios rápidos (features/imágenes).
- Menú de acciones desde detalle: Editar, Archivar/Restaurar, Eliminar (con confirmaciones y toasts).

## Decisiones de UX implementadas
- Altura uniforme de tarjetas con `grid auto-rows-fr`.
- Ratio de imágenes con `aspect-*` y `object-contain` para evitar recortes.
- Iconos SVG por categoría (Pantallas/TPVs) y estados visuales de stock.
- Estado vacío elegante y accesible.

## Validaciones clave
- `stock_qty >= 0`, `price_net >= 0`, `tax_rate` en 0–100.
- Venta: rechazar si `units > stock_qty` (409) y registrar `StockMovement`.

## Pendientes y extensiones
- Endpoint de subida de imágenes por producto y storage externo (S3/Cloudinary) si se requiere.
- Thumbnails automáticos.

## Archivos relevantes
- Backend: `migrations/versions/0003_products_inventory.py`, `0005_add_product_images.py`, endpoints en `app.py`.
- Frontend: `frontend/src/pages/Productos.jsx`, `frontend/src/components/ProductModal.jsx`, `frontend/src/components/ProductDetailModal.jsx`.

