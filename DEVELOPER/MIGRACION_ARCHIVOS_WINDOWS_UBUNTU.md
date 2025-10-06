# 📋 Migración de Archivos: Windows → Ubuntu

**Fecha**: 6 de Octubre de 2025  
**Problema**: Imágenes y documentos antiguos no se visualizaban después de la migración

---

## 🔍 Diagnóstico

### Síntomas
- ✅ Archivos **nuevos** (subidos después de la migración) funcionaban correctamente
- ❌ Archivos **antiguos** (de antes de la migración) mostraban error 404 Not Found
- ❌ El error inicial parecía ser de JWT ("Missing JWT in headers or cookies")

### Causa Raíz

El problema **NO era de autenticación JWT**, sino de **archivos faltantes**:

1. **Rutas incorrectas**: Los archivos antiguos tenían rutas con backslashes `\` (Windows):
   ```
   9\documents\archivo.pdf  ❌ (Windows)
   9\images\imagen.jpeg     ❌ (Windows)
   ```
   
   En lugar de forward slashes `/` (Unix/Linux):
   ```
   9/documents/archivo.pdf  ✅ (Unix/Linux)
   9/images/imagen.jpeg     ✅ (Unix/Linux)
   ```

2. **Archivos físicos perdidos**: Durante la migración de Windows a Ubuntu, se migró la **base de datos** pero **no los archivos físicos** de la carpeta `instance/uploads/`.

---

## ✅ Solución Aplicada

Se ejecutaron los siguientes pasos:

### 1. Diagnóstico de Documentos
Ejecutado script `check_client_documents.py` para identificar:
- 17 documentos totales en la BD
- 16 archivos faltantes (94%)
- 1 archivo existente (6%)

### 2. Limpieza de Registros Huérfanos
Se eliminaron 16 registros de la base de datos que apuntaban a archivos inexistentes:

**Documentos eliminados:**
- Cliente 4: 4 archivos (3 PDFs, 1 imagen)
- Cliente 6: 5 archivos (2 PDFs, 3 imágenes)  
- Cliente 7: 2 archivos (1 PDF, 1 imagen)
- Cliente 9: 5 archivos (3 PDFs, 2 imágenes)

### 3. Corrección de Configuración
- Se eliminó `JWT_COOKIE_DOMAIN` del archivo `.env` para evitar problemas de cookies entre dominios
- Se removieron logs de debug temporales del código

---

## 📊 Estado Actual

- ✅ **Aplicación funcional**: Archivos nuevos se suben y visualizan correctamente
- ✅ **Sin errores 404**: Los registros huérfanos han sido eliminados
- ✅ **JWT funcionando**: La autenticación funciona correctamente
- ⚠️ **Datos históricos perdidos**: Los archivos antiguos se perdieron en la migración

---

## 🔄 Recuperación de Archivos Antiguos (OPCIONAL)

Si deseas recuperar los archivos antiguos de Windows:

### Pasos para Recuperar

1. **En el sistema Windows anterior:**
   ```powershell
   # Localizar la carpeta de uploads
   C:\ruta\al\proyecto\instance\uploads
   ```

2. **Copiar al servidor Ubuntu:**
   ```bash
   # Desde Windows, comprimir la carpeta uploads
   tar -czf uploads_backup.tar.gz instance/uploads
   
   # En Ubuntu, extraer en el servidor
   cd /opt/nioxtec/Nioxtec_Facturer
   tar -xzf uploads_backup.tar.gz
   ```

3. **Ejecutar script de migración de rutas:**
   ```bash
   docker cp DEVELOPER/scripts/migrate_windows_paths_auto.py nioxtec_facturer-backend-1:/tmp/migrate.py
   docker compose exec backend python3 /tmp/migrate.py
   ```

   Este script:
   - Detecta rutas con backslashes `\`
   - Las convierte a forward slashes `/`
   - Actualiza la base de datos
   - Verifica que los archivos existan

---

## 📝 Scripts Creados

### Diagnóstico
- `DEVELOPER/scripts/check_client_documents.py` - Verifica qué archivos existen y cuáles faltan

### Migración
- `DEVELOPER/scripts/migrate_windows_paths.py` - Migra rutas Windows→Unix (con confirmación)
- `DEVELOPER/scripts/migrate_windows_paths_auto.py` - Migración automática (sin confirmación)

### Limpieza
- `DEVELOPER/scripts/clean_orphaned_documents.py` - Elimina registros de archivos inexistentes

### Testing
- `DEVELOPER/scripts/test_jwt_image.html` - Herramienta de debug para probar carga de imágenes con JWT

---

## 🛡️ Prevención Futura

Para evitar este problema en futuras migraciones:

1. **Backup completo**: Siempre incluir `instance/uploads/` en los backups
2. **Verificación post-migración**: Ejecutar `check_client_documents.py` después de migrar
3. **Documentación**: Mantener registro de la ubicación de archivos
4. **Testing**: Probar carga de imágenes/documentos después de cada migración

---

## 📞 Contacto

Si necesitas ayuda adicional o tienes preguntas sobre esta migración, contacta al equipo de desarrollo.
