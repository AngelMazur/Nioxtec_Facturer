# ✅ POST-MERGE CHECKLIST
**Fecha:** 2025-01-04  
**Rama:** main (producción Windows)  
**Commit:** fe39e09

## 🎯 Estado Actual
- ✅ Merge de feat/products-inventory a main completado
- ✅ Push a origin/main exitoso (d20a844..fe39e09)
- 🔄 GitHub Action ejecutándose → Desplegando a Windows

---

## 📝 VERIFICACIONES POST-DEPLOY (Producción Windows)

### 1. Monitoreo de Despliegue
- [ ] Abrir GitHub → Actions → Ver workflow en ejecución
- [ ] Esperar a que termine (aprox. 2-5 minutos)
- [ ] Verificar que termine con ✅ (sin errores)
- [ ] Revisar logs si hay fallos

**URL Actions:** https://github.com/AngelMazur/Nioxtec_Facturer/actions

### 2. Backend (Producción Windows)
- [ ] **Servicio activo**: Backend Flask corriendo en puerto 5001
- [ ] **Health check**: GET /api/health → HTTP 200
- [ ] **Base de datos**: Migraciones aplicadas correctamente
  - Tabla `products` existe
  - Tabla `inventory` existe  
  - Columnas nuevas en `invoices` (paid, etc.)
- [ ] **Autenticación JWT**: Login funcional
- [ ] **CORS**: Frontend puede hacer requests

**Comando verificación BD:**
```bash
# En servidor Windows
python -c "from app import app, db; app.app_context().push(); print(db.engine.table_names())"
```

### 3. Endpoints API Críticos
Probar desde Postman/curl en producción:

- [ ] **POST /api/login** → Obtener JWT token
- [ ] **GET /api/clients** (con token) → Listar clientes
- [ ] **GET /api/invoices** (con token) → Listar facturas
- [ ] **GET /api/products** (con token) → Listar productos ⭐ NUEVO
- [ ] **GET /api/expenses** (con token) → Listar gastos
- [ ] **POST /api/products** (con token) → Crear producto ⭐ NUEVO
- [ ] **POST /api/products/{id}/upload-image** → Subir imagen ⭐ NUEVO
- [ ] **GET /static/uploads/products/{filename}** → Servir imagen ⭐ NUEVO

### 4. Frontend (Producción)
- [ ] **Build**: Frontend compilado correctamente
- [ ] **Assets cargados**: CSS, JS, imágenes
- [ ] **Routing**: Todas las rutas funcionan
- [ ] **Login**: Autenticación funcional
- [ ] **Dark mode**: Toggle funciona

### 5. Flujo Completo de Productos ⭐ NUEVO
- [ ] **Crear producto**:
  - Ir a "Productos"
  - Click "Crear Producto"
  - Rellenar: nombre, descripción, precio, stock, categoría
  - Subir 1-3 imágenes
  - Guardar → Producto aparece en lista

- [ ] **Ver detalle producto**:
  - Click en tarjeta de producto
  - Modal abre con toda la info
  - Galería de imágenes visible
  - Click en imagen → Lightbox abre
  - Lightbox sobre modal (z-index correcto)
  - Imágenes escalan bien (max-w-[90vw] max-h-[85vh])
  - ESC cierra lightbox

- [ ] **Editar producto**:
  - En modal, click "Editar"
  - Modificar campos
  - Agregar/quitar imágenes
  - Guardar → Cambios reflejados

- [ ] **Eliminar producto**:
  - Click "Eliminar"
  - Confirmar → Producto eliminado

- [ ] **Gestión de stock**:
  - Verificar que stock se actualiza
  - Notificaciones de stock bajo (si configurado)

### 6. Flujo Completo de Gastos (Mejoras)
- [ ] **Importar CSV**:
  - Click "Importar CSV"
  - Seleccionar archivo CSV válido
  - Mapear columnas
  - Importar → Gastos creados

- [ ] **Autocompletado**:
  - Crear gasto
  - Escribir en concepto/proveedor
  - Autocompletado sugiere opciones
  - Seleccionar → Datos rellenados

- [ ] **Categorización**:
  - Crear/editar gasto
  - Asignar categoría
  - Filtrar por categoría → Funciona

### 7. Flujo Completo de Contratos (Mejoras)
- [ ] **Auto-guardado**:
  - Abrir generador de contrato
  - Rellenar campos
  - Esperar 2-3 segundos sin escribir
  - Mensaje "Guardado automático" aparece
  - Refrescar página → Datos persisten

- [ ] **Estilos mejorados**:
  - Formulario se ve bien
  - Responsive en móvil/tablet
  - Tipografía nítida
  - Secciones bien separadas

### 8. CSP y Seguridad
- [ ] **Consola del navegador**: Sin errores CSP
- [ ] **Imágenes de productos**: Cargan sin bloqueo CSP
- [ ] **Headers de seguridad**: Flask-Talisman activo
- [ ] **HTTPS**: Conexión segura (si SSL configurado)

### 9. Performance
- [ ] **Carga inicial**: < 3 segundos
- [ ] **Navegación**: Transiciones suaves (Framer Motion)
- [ ] **Listados grandes**: Paginación funciona
- [ ] **Subida de imágenes**: Progreso visible, sin cuelgues

### 10. Logs y Errores
- [ ] **Backend logs**: Sin errores críticos
  ```bash
  # Ver logs en Windows
  tail -f backend.log
  # o
  Get-Content backend.log -Tail 50 -Wait
  ```

- [ ] **Frontend console**: Sin errores JavaScript
- [ ] **Network tab**: Todas las requests HTTP 2xx (o 401 esperados)

---

## 🚨 PROBLEMAS CONOCIDOS (Revisar si aparecen)

### CSP Bloqueando Imágenes
**Síntoma**: Consola dice "Refused to load image... Content Security Policy"  
**Solución**: Verificar que `DEBUG_MODE` esté configurado en producción o ajustar CSP en `app.py` líneas 374-387

### Lightbox Detrás del Modal
**Síntoma**: Click en imagen abre lightbox pero aparece detrás del modal  
**Solución**: Ya está corregido con `createPortal` y `z-[9999]` en `ProductDetailModal.jsx`

### Imágenes No Cargan (404)
**Síntoma**: GET /static/uploads/products/xxx.jpg → 404  
**Solución**: 
1. Verificar que carpeta `static/uploads/products/` existe
2. Crear si no existe: `mkdir -p static/uploads/products`
3. Verificar permisos de escritura en Windows

### Migraciones No Aplicadas
**Síntoma**: Error "no such table: products" o "no such column: paid"  
**Solución**: Ejecutar en servidor Windows:
```bash
cd /ruta/al/proyecto
flask db upgrade
# o directamente
alembic upgrade head
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| GitHub Action | ✅ Sin errores | 🔄 |
| Backend Health | HTTP 200 | ⏳ |
| Frontend Load | < 3s | ⏳ |
| Login Flow | ✅ Funcional | ⏳ |
| CRUD Productos | 100% funcional | ⏳ |
| Lightbox | z-index correcto | ⏳ |
| CSP | Sin bloqueos | ⏳ |
| Migraciones BD | Todas aplicadas | ⏳ |

---

## 🎯 SIGUIENTE FASE: Migración a Ubuntu

Una vez que **TODAS** las verificaciones de arriba estén ✅:

1. **Documentar estado final** de Windows
2. **Crear backup completo** de BD producción
3. **Seguir guía**: `DEVELOPER/UBUNTU_MIGRATION_GUIDE.md`
4. **Configurar servidor Ubuntu** paso a paso
5. **Migrar BD** desde Windows → Ubuntu
6. **Configurar Nginx + Systemd**
7. **SSL con Let's Encrypt**
8. **Probar en Ubuntu** antes de cambiar DNS
9. **Cambiar DNS** a servidor Ubuntu
10. **Monitorear 24-48h** post-migración

---

## 📝 Notas Importantes

- **NO hacer cambios** en producción hasta verificar todo
- **NO eliminar** servidor Windows hasta confirmar Ubuntu estable
- **Mantener backups** de BD antes de migraciones
- **Documentar** cualquier problema encontrado
- **Probar en horario de bajo tráfico** (si es posible)

---

## ✅ Checklist de Aprobación Final

Para dar el OK final y proceder a Ubuntu, necesitas:

- [ ] Todos los puntos de verificación marcados ✅
- [ ] Sin errores críticos en producción
- [ ] Usuario/cliente ha probado y aprobado
- [ ] Backup completo de BD Windows creado
- [ ] Documentación de cualquier issue encontrado

**Cuando todo esté ✅, podemos comenzar la migración a Ubuntu.**

---

**Creado:** 2025-01-04  
**Última actualización:** 2025-01-04  
**Responsable:** GitHub Copilot (supervisado por usuario)
