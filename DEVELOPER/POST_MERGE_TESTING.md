# 🧪 Plan de Pruebas de Integración - feat/products-inventory

**Fecha:** 4 de octubre de 2025  
**Objetivo:** Verificar que la fusión de feat/products-inventory funciona correctamente en Windows producción

## ✅ Estado Actual

### Servicios Activos:
- ✅ **Backend:** http://localhost:5001 (Flask + Python 3.11.9)
  - Venv: `.venv_20251004213314`
  - Health check: ✅ `http://localhost:5001/health`
  - Base de datos: SQLite `instance/app.db` (132 KB)
  - Migraciones: Alembic version `0005_add_product_images`

- ✅ **Frontend:** http://localhost:5173 (Vite + React)
  - Estado: Corriendo en modo desarrollo
  - CORS: Configurado para backend en puerto 5001

### Tablas en Base de Datos:
- ✅ `company_config` (1 registro)
- ✅ `client` (9 registros)
- ✅ `invoice` (17 registros)
- ✅ `invoice_item` (46 registros)
- ✅ `user` (2 usuarios)
- ✅ `document_sequence` (8 registros)
- ✅ `client_document` (14 documentos)
- ✅ `expense` (0 registros)
- ✅ `product` (0 registros) ⭐ NUEVA
- ✅ `stock_movement` (0 registros) ⭐ NUEVA
- ✅ `inventory` (0 registros) ⭐ NUEVA
- ✅ `alembic_version` (version: 0005_add_product_images)

## 📋 Checklist de Pruebas

### 1. ✅ Verificación del Sistema
- [x] Backend responde en puerto 5001
- [x] Frontend responde en puerto 5173
- [x] Health check del backend funciona
- [x] Base de datos conectada correctamente
- [x] Migraciones aplicadas (0005_add_product_images)

### 2. 🔐 Autenticación
- [ ] Login con usuario existente
- [ ] Verificar token JWT
- [ ] Comprobar redirección al dashboard
- [ ] Logout funcional

### 3. 📦 Funcionalidad de Productos (NUEVA)
- [ ] Acceder a sección de productos
- [ ] Ver lista de productos (vacía inicialmente)
- [ ] Crear nuevo producto
  - [ ] Categoría
  - [ ] Modelo
  - [ ] SKU
  - [ ] Stock inicial
  - [ ] Precio compra
  - [ ] Precio venta
- [ ] Subir imágenes de producto ⭐ NUEVO
  - [ ] Máximo 4 imágenes
  - [ ] Validación de tamaño
  - [ ] Preview de imágenes
- [ ] Ver lightbox de imágenes ⭐ NUEVO
  - [ ] z-index 9999 correcto
  - [ ] createPortal funciona
  - [ ] Cerrar con ESC o click fuera
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Filtrar productos por categoría
- [ ] Buscar productos

### 4. 📊 Inventario (NUEVO)
- [ ] Ver stock actual de productos
- [ ] Registrar entrada de inventario
- [ ] Registrar salida de inventario
- [ ] Ver historial de movimientos
- [ ] Filtrar por tipo de movimiento
- [ ] Exportar inventario

### 5. 📄 Facturas con Productos
- [ ] Crear factura nueva
- [ ] Agregar productos desde selector ⭐ NUEVO
  - [ ] Buscar productos
  - [ ] Ver precio de venta
  - [ ] Ver stock disponible
  - [ ] Añadir múltiples unidades
- [ ] Calcular totales correctamente
- [ ] Guardar factura
- [ ] Verificar stock se actualiza automáticamente ⭐ NUEVO
- [ ] Ver factura generada
- [ ] Descargar PDF con productos incluidos

### 6. 💰 Gastos - Importación CSV (NUEVO)
- [ ] Acceder a sección de gastos
- [ ] Ver interfaz de importación CSV
- [ ] Subir archivo CSV válido
  - [ ] Validar formato
  - [ ] Preview de datos
  - [ ] Confirmar importación
- [ ] Ver gastos importados en lista
- [ ] Editar gasto importado
- [ ] Eliminar gasto
- [ ] Exportar gastos a Excel

### 7. 📝 Contratos - Auto-guardado
- [ ] Acceder a editor de contratos
- [ ] Escribir contenido
- [ ] Verificar auto-guardado cada 30s ⭐ NUEVO
  - [ ] Indicador visual de guardado
  - [ ] No perder datos al cambiar de pestaña
- [ ] Guardar manualmente
- [ ] Ver historial de versiones
- [ ] Generar PDF de contrato

### 8. 🖼️ UI/UX - Mejoras Visuales
- [ ] Lightbox de imágenes funciona correctamente
  - [ ] z-index máximo (9999)
  - [ ] Overlay oscuro
  - [ ] Navegación entre imágenes
  - [ ] Cerrar con ESC
  - [ ] createPortal en body
- [ ] Selector de productos en facturas
  - [ ] Diseño claro
  - [ ] Búsqueda responsive
  - [ ] Información de stock visible
- [ ] Formularios validados
- [ ] Mensajes de error claros
- [ ] Loading states en operaciones

### 9. 🔄 Integridad de Datos
- [ ] Stock se actualiza al crear factura
- [ ] Stock se actualiza al eliminar factura
- [ ] No permitir vender con stock insuficiente
- [ ] Historial de movimientos correcto
- [ ] Precios se mantienen consistentes

### 10. 📱 Responsividad
- [ ] Frontend funciona en móvil (preview)
- [ ] Tablas responsivas
- [ ] Formularios usables en pantallas pequeñas
- [ ] Lightbox adaptado a móvil

## 🐛 Registro de Problemas Encontrados

### Durante las pruebas:
_(Rellenar durante la sesión de testing)_

| # | Problema | Severidad | Estado | Solución |
|---|----------|-----------|--------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## 📸 Capturas de Pantalla

### Funcionalidades Nuevas:
_(Tomar screenshots de las nuevas funcionalidades)_
- [ ] Gestión de productos
- [ ] Lightbox de imágenes
- [ ] Selector de productos en facturas
- [ ] Importación CSV de gastos
- [ ] Auto-guardado de contratos

## 🎯 Criterios de Aceptación

Para considerar la integración exitosa:

1. ✅ **Sistema Operativo:** Backend y frontend arrancan sin errores
2. ⏳ **Autenticación:** Login y JWT funcionan correctamente
3. ⏳ **Productos:** CRUD completo de productos con imágenes
4. ⏳ **Inventario:** Registro y visualización de movimientos
5. ⏳ **Facturas:** Integración de productos en facturas
6. ⏳ **Gastos:** Importación CSV funcional
7. ⏳ **Contratos:** Auto-guardado operativo
8. ⏳ **UI/UX:** Lightbox y selector de productos funcionando
9. ⏳ **Datos:** Integridad mantenida en todas las operaciones
10. ⏳ **Performance:** Sin errores de CORS, CSP, o carga

## 📝 Notas Adicionales

### Configuración Actual:
```bash
# Backend
FLASK_APP=app.py
PORT=5001
FLASK_DEBUG=false
ENABLE_TALISMAN=false
FORCE_HTTPS=false

# Frontend
VITE_API_BASE= (vacío, usa defaultBase automático)
```

### 🐛 Problemas Comunes y Soluciones:

#### Error: CORS - "blocked by CORS policy"
**Síntoma:** Errores en consola mostrando `https://api.nioxtec.es` en lugar de `http://localhost:5001`

**Causas posibles:**
1. Caché del navegador con configuración antigua
2. Variable de entorno del sistema `VITE_API_BASE` configurada
3. Archivo `.env.local` o `.env` en frontend con URL de producción

**Solución:**
```powershell
# 1. Verificar variables de entorno
cd C:\Nioxtec\Nioxtec_Facturer\frontend
echo %VITE_API_BASE%  # Debe mostrar %VITE_API_BASE% (no definida)

# 2. Verificar archivos .env
dir .env* | findstr ".env"  # Solo debe haber .env.development y .env.production

# 3. Limpiar caché de npm y Vite
npm run dev -- --force  # Fuerza reconstrucción sin caché

# 4. En el navegador:
# - Ctrl+Shift+R (hard reload)
# - F12 → Application → Clear storage → Clear site data
# - Verificar en Console los logs "🔧 [API Debug]"
```

**Verificación:**
En la consola del navegador deberías ver:
```
🔧 [API Debug] API_BASE: http://localhost:5001
🔧 [API Debug] VITE_API_BASE: undefined
🔧 [API Debug] defaultBase: http://localhost:5001
```

### Comandos Útiles:
```powershell
# Ver logs del backend
Get-Content backend.log -Wait

# Reiniciar backend
Stop-Process -Name python -Force
.\.venv_20251004213314\Scripts\python.exe app.py

# Reiniciar frontend
cd frontend
npm run dev

# Ver base de datos
.\.venv_20251004213314\Scripts\python.exe DEVELOPER\scripts\check_db_simple.py
```

## ✅ Conclusión

Una vez completadas todas las pruebas y resueltos los problemas encontrados:

- [ ] Marcar todas las pruebas como completadas
- [ ] Documentar problemas y soluciones
- [ ] Actualizar README.md si es necesario
- [ ] Commitear cambios de testing
- [ ] Preparar para migración a Ubuntu

---

**Fecha de inicio:** 4 de octubre de 2025  
**Fecha de finalización:** _Por determinar_  
**Testeado por:** Angel Mazur
