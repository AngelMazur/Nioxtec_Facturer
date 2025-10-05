# Sistema de Inicio Automático - Documentación

## 📋 Descripción

Sistema mejorado de inicio automático que se ejecuta al arrancar el PC y coordina todos los servicios de Nioxtec (Cloudflare, Backend, Frontend).

## 🎯 Características Principales

### ✅ Logging Completo
- **Todos** los mensajes se guardan automáticamente en archivos de log
- Ubicación: `DEVELOPER/scripts/logs/startup_YYYYMMDD_HHmmss.log`
- Los logs antiguos (>7 días) se eliminan automáticamente

### ✅ Manejo Robusto de Errores
- La ventana **SIEMPRE** permanece visible si hay errores
- Espera a que presiones una tecla antes de cerrar
- Muestra el código de error y mensaje descriptivo
- Stack trace completo para errores críticos

### ✅ Visualización Mejorada
- Iconos visuales: ⏳ ✓ ✗ ⚠ ℹ
- Colores según estado (Verde=éxito, Rojo=error, Amarillo=advertencia)
- Timestamps en cada mensaje
- Separadores visuales entre secciones
- Barra de progreso clara

### ✅ Cierre Automático Inteligente
- **CON ÉXITO**: Se cierra automáticamente en 10 segundos
  - Puedes presionar Ctrl+C para mantenerla abierta
- **CON ERROR**: Espera a que presiones una tecla
  - Muestra toda la información del error
  - Indica dónde está el log completo

## 📁 Archivos del Sistema

### Scripts Principales

1. **`startup_wrapper.ps1`** (Nuevo)
   - Wrapper que captura errores críticos
   - Asegura que la ventana se mantenga visible ante errores
   - Usado por la tarea programada

2. **`startup_master.ps1`** (Mejorado)
   - Script principal que coordina todo el inicio
   - Ahora con logging completo y mejor manejo de errores
   - Limpia logs antiguos automáticamente

3. **`start_cloudflare.ps1`** (Mejorado)
   - Inicia el túnel Cloudflare
   - Mejor visualización del progreso

4. **`deploy_prod.ps1`** (Mejorado)
   - Ejecuta el deploy completo
   - Visualización paso a paso
   - Health check mejorado

5. **`register_startup_master.ps1`** (Mejorado)
   - Registra la tarea de inicio automático
   - Ahora usa el wrapper para mejor manejo de errores
   - Delay de 30 segundos después del arranque

6. **`test_startup.ps1`** (Nuevo)
   - Script de prueba para simular el inicio sin reiniciar
   - Útil para debugging

## 🚀 Uso

### Registrar/Actualizar Tarea de Inicio
```powershell
.\DEVELOPER\scripts\register_startup_master.ps1
```

### Probar el Sistema (sin reiniciar)
```powershell
.\DEVELOPER\scripts\test_startup.ps1
```

### Ver Logs
```powershell
# Ver el último log
Get-ChildItem .\DEVELOPER\scripts\logs\startup_*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# Ver todos los logs
Get-ChildItem .\DEVELOPER\scripts\logs\startup_*.log
```

### Ejecutar Manualmente (como lo haría Windows)
```powershell
.\DEVELOPER\scripts\startup_wrapper.ps1
```

## 🔍 Solución de Problemas

### La ventana se cierra antes de poder leer
✅ **RESUELTO**: Ahora la ventana permanece abierta si hay errores

### No puedo ver qué pasó
✅ **RESUELTO**: Todo se guarda en `DEVELOPER\scripts\logs\`

### Quiero mantener la ventana abierta después del éxito
💡 **Solución**: Presiona Ctrl+C durante los 10 segundos de espera

### Quiero ver qué pasó en el último inicio
```powershell
# Ver el último log
notepad (Get-ChildItem .\DEVELOPER\scripts\logs\startup_*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
```

## 📊 Ejemplo de Salida

### Inicio Exitoso
```
═══════════════════════════════════════════════════════════════
  INICIO DEL SISTEMA NIOXTEC
═══════════════════════════════════════════════════════════════
[10:30:15] ⏳ [SISTEMA] Iniciando todos los servicios...
[10:30:15] ℹ [SISTEMA] Fecha: 2025-10-05 10:30:15
[10:30:15] ℹ [LOG] Archivo de log: C:\...\logs\startup_20251005_103015.log

═══════════════════════════════════════════════════════════════
  LIMPIEZA DE LOGS
═══════════════════════════════════════════════════════════════
[10:30:15] ✓ [LIMPIEZA] No hay logs antiguos para limpiar

═══════════════════════════════════════════════════════════════
  PASO 1/2: CLOUDFLARE TUNNEL
═══════════════════════════════════════════════════════════════
[10:30:16] ⏳ [CLOUDFLARE] Iniciando túnel Cloudflare...
[10:30:16] ✓ [CLOUDFLARE] Tarea ejecutada correctamente
[10:30:31] ✓ [CLOUDFLARE] Túnel funcionando correctamente (HTTP 200)

═══════════════════════════════════════════════════════════════
  PASO 2/2: DEPLOY DE LA APLICACIÓN
═══════════════════════════════════════════════════════════════
[10:30:32] ⏳ [DEPLOY] Deteniendo servicios actuales...
[10:30:45] ✓ [FRONTEND] Build completado

═══════════════════════════════════════════════════════════════
  SISTEMA INICIADO CORRECTAMENTE
═══════════════════════════════════════════════════════════════
[10:31:16] ✓ [SISTEMA] Todos los servicios están activos
[10:31:16] ✓ [API] https://api.nioxtec.es
[10:31:16] ✓ [FRONTEND] https://app.nioxtec.es

═══════════════════════════════════════════════════════════════
[10:31:16] ℹ [SISTEMA] Cerrando terminal en 10 segundos...
  (Presiona Ctrl+C para mantener abierta)
```

### Inicio con Error
```
═══════════════════════════════════════════════════════════════
  ERROR: SISTEMA NO PUDO INICIARSE
═══════════════════════════════════════════════════════════════
[10:35:20] ✗ [ERROR] Revisa el log para más detalles: C:\...\logs\startup_20251005_103520.log

═══════════════════════════════════════════════════════════════
  Presiona cualquier tecla para cerrar y revisar el log...
═══════════════════════════════════════════════════════════════
```

## 🔧 Configuración de la Tarea Programada

- **Nombre**: Nioxtec Startup Master
- **Trigger**: Al iniciar el sistema (con delay de 30 segundos)
- **Acción**: Ejecutar `startup_wrapper.ps1`
- **Nivel**: HIGHEST (máximos privilegios)
- **Usuario**: Tu usuario actual

## 📝 Notas

- Los logs se limpian automáticamente después de 7 días
- El sistema espera 30 segundos después del arranque para dar tiempo a que se inicien otros servicios
- Si todo funciona correctamente, la terminal se cierra en 10 segundos
- Si hay errores, la terminal permanece abierta hasta que presiones una tecla
