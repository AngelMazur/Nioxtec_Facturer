# ✅ CHECKLIST PRE-MERGE A MAIN
## Rama: feat/products-inventory → main
**Fecha:** 4 de octubre de 2025

---

## 📋 PRUEBAS LOCALES REQUERIDAS

### 🔧 Backend (Flask)
- [ ] El servidor backend arranca sin errores
- [ ] Endpoint `/health` responde correctamente
- [ ] Endpoint `/api/clientes` funciona
- [ ] Endpoint `/api/facturas` funciona
- [ ] Endpoint `/api/productos` funciona (NUEVO)
- [ ] Endpoint `/api/gastos` funciona
- [ ] Generación de PDFs funciona

### ⚛️ Frontend (React)
- [ ] El frontend arranca sin errores en consola
- [ ] Página de Login funciona
- [ ] Página de Clientes carga y muestra datos
- [ ] Página de Facturas carga y muestra datos
- [ ] Página de Productos carga y muestra datos (NUEVO)
- [ ] Página de Gastos carga y muestra datos
- [ ] Página de Reportes carga

### 🆕 Funcionalidades Nuevas (Productos)
- [ ] Crear nuevo producto
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Ver detalle de producto
- [ ] Buscar/filtrar productos
- [ ] Asociar productos a facturas
- [ ] Control de stock funciona

### 📄 Generación de Documentos
- [ ] Generar factura en PDF
- [ ] Generar contrato de renting
- [ ] Generar contrato de compraventa
- [ ] Los PDFs se descargan correctamente

### 🔐 Autenticación
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Rutas protegidas funcionan

---

## 🚀 PASOS PARA PROBAR

### 1. Arrancar el proyecto
```bash
cd /Users/mazur/NioxtecProject/Nioxtec_Facturer
./start_dev.sh
```

### 2. Abrir en navegador
- Frontend: http://localhost:5173
- Backend Health: http://localhost:5001/health

### 3. Probar flujo completo
1. Login con usuario de prueba
2. Navegar por todas las páginas
3. Crear/editar/eliminar un registro en cada módulo
4. Generar al menos un PDF
5. Verificar consola del navegador (no debe haber errores críticos)

### 4. Revisar logs
- Revisar consola del backend (no debe haber errores críticos)
- Revisar consola del navegador (DevTools)

---

## ✅ CRITERIOS DE APROBACIÓN

Para aprobar el merge a main, TODOS estos criterios deben cumplirse:

1. ✅ **Sin errores críticos** en backend
2. ✅ **Sin errores críticos** en frontend  
3. ✅ **Todas las páginas cargan** correctamente
4. ✅ **CRUD básico funciona** en cada módulo (Crear, Leer, Editar, Eliminar)
5. ✅ **Generación de PDFs** funciona
6. ✅ **Nuevas funcionalidades de productos** operan correctamente
7. ✅ **No hay regresiones** (funcionalidades antiguas siguen funcionando)

---

## ⚠️ SI ENCUENTRAS ERRORES

1. **Anotar el error** con detalle:
   - ¿Qué estabas haciendo?
   - ¿Qué mensaje de error apareció?
   - ¿En qué página/módulo?

2. **Capturar evidencia**:
   - Captura de pantalla
   - Logs de consola
   - Logs del backend

3. **NO hacer merge a main** hasta resolver todos los errores críticos

---

## 📝 NOTAS

- Esta es la rama `feat/products-inventory` con ~54 commits nuevos
- Incluye el módulo completo de productos e inventario
- Incluye mejoras en contratos y gastos
- Incluye reorganización de documentación y scripts

---

## 🎯 DESPUÉS DE APROBAR

Una vez que TODAS las pruebas pasen:

1. ✅ Confirmar que todo funciona
2. 🔄 Merge a main (GitHub Action desplegará automáticamente)
3. 🐧 Preparar migración a Ubuntu

---

**Estado actual:** ⏳ PENDIENTE DE PRUEBAS

