# 🚀 Sistema de Startup Mejorado - Guía Rápida

## ✅ ¿Qué se arregló?

**Problema que tenías:**
- PowerShell se abría al reiniciar
- Mostraba un error por unos segundos
- Se cerraba inmediatamente
- No podías ver qué había pasado

**Solución implementada:**
1. ✅ **Logging completo**: TODO se guarda en archivos
2. ✅ **Ventana visible**: Si hay error, espera a que presiones una tecla
3. ✅ **Mejor visualización**: Iconos, colores, timestamps
4. ✅ **Diagnóstico**: Scripts para verificar todo

---

## 🧪 PASO 1: Probar ANTES de reiniciar (RECOMENDADO)

Abre PowerShell en `DEVELOPER\scripts` y ejecuta:

```powershell
cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts
.\test_startup.ps1
```

Esto simulará el arranque automático y podrás ver:
- ✅ Si todo funciona correctamente
- ❌ Si hay algún error (y podrás leerlo completo)

---

## 🔄 PASO 2: Reiniciar el PC

Cuando reinicies el PC:

1. **Espera 30 segundos** después del arranque
2. Se abrirá una ventana de PowerShell automáticamente
3. Verás el progreso paso a paso:
   ```
   [10:30:15] ⏳ [CLOUDFLARE] Iniciando túnel Cloudflare...
   [10:30:31] ✓ [CLOUDFLARE] Túnel funcionando correctamente
   [10:31:16] ✓ [DEPLOY] Deploy completado exitosamente
   ```

### Si TODO funciona bien ✅
- La ventana mostrará: "✓ SISTEMA INICIADO CORRECTAMENTE"
- Se cerrará automáticamente en **10 segundos**
- Si quieres mantenerla abierta: presiona `Ctrl+C`

### Si hay un ERROR ❌
- La ventana mostrará: "✗ ERROR: SISTEMA NO PUDO INICIARSE"
- **LA VENTANA NO SE CERRARÁ**
- Esperará a que presiones una tecla
- Podrás leer todo el error tranquilamente
- Te dirá dónde está el log completo

---

## 📖 Ver qué pasó después de reiniciar

Si la ventana se cerró muy rápido o quieres revisar:

```powershell
cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts

# Ver el último log completo
.\view_startup_logs.ps1 -Last

# Ver solo si hubo errores
.\view_startup_logs.ps1 -Errors

# Ver diagnóstico completo del sistema
.\diagnose_startup.ps1
```

---

## 📁 Dónde están los logs

Todos los logs se guardan automáticamente en:
```
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs\
```

Nombre del archivo:
```
startup_20251005_103015.log
         YYYYMMDD_HHmmss
```

### 🗑️ Política de Limpieza Automática

**Los logs antiguos se eliminan automáticamente:**
- ✅ Se conservan durante **7 días**
- ✅ Después de 7 días se eliminan automáticamente
- ✅ La limpieza se ejecuta cada vez que arranca el sistema
- ✅ **No tienes que hacer nada**, es completamente automático

**Gestión manual de logs:**
```powershell
# Ver espacio utilizado
.\manage_logs.ps1 -Size

# Listar todos los logs con su edad
.\manage_logs.ps1 -List

# Limpiar manualmente logs antiguos (>7 días)
.\manage_logs.ps1 -Clean

# Limpiar logs más antiguos de 30 días
.\manage_logs.ps1 -Clean -Days 30

# Limpiar TODOS los logs (cuidado!)
.\manage_logs.ps1 -CleanAll
```

---

## 🔧 Scripts disponibles

| Script | Para qué sirve |
|--------|----------------|
| `test_startup.ps1` | Probar el startup SIN reiniciar |
| `diagnose_startup.ps1` | Ver estado del sistema completo |
| `view_startup_logs.ps1 -Last` | Ver el último log |
| `view_startup_logs.ps1 -Errors` | Ver logs con errores |
| `manage_logs.ps1 -Size` | Ver espacio usado por logs |
| `manage_logs.ps1 -List` | Listar todos los logs con edad |
| `manage_logs.ps1 -Clean` | Limpiar logs antiguos manualmente |
| `show_mejoras.ps1` | Ver resumen de todas las mejoras |

---

## ❓ Preguntas Frecuentes

### ¿Qué hago si veo un error al reiniciar?

1. **NO cierres la ventana** - Ya no se cerrará automáticamente
2. Lee el mensaje de error completo
3. Anota el nombre del archivo de log que te muestra
4. Presiona cualquier tecla para cerrar
5. Luego ejecuta: `.\view_startup_logs.ps1 -Last` para ver el log completo

### ¿Cómo sé si el startup funcionó bien?

```powershell
.\diagnose_startup.ps1
```

Te mostrará el estado de todo y te dirá si hay problemas.

### ¿La ventana se cerró muy rápido y no vi nada?

```powershell
.\view_startup_logs.ps1 -Last
```

Verás TODO lo que pasó en el último inicio.

### ¿Quiero probar sin reiniciar?

```powershell
.\test_startup.ps1
```

### ¿Necesito re-registrar la tarea?

Solo si hiciste cambios en los scripts. Ejecuta como administrador:
```powershell
.\register_startup_master.ps1
```

---

## 📊 Ejemplo de salida exitosa

```
═══════════════════════════════════════════════════════════════
  INICIO DEL SISTEMA NIOXTEC
═══════════════════════════════════════════════════════════════
[10:30:15] ⏳ [SISTEMA] Iniciando todos los servicios...
[10:30:15] ℹ [LOG] Archivo de log: C:\...\logs\startup_20251005_103015.log

═══════════════════════════════════════════════════════════════
  PASO 1/2: CLOUDFLARE TUNNEL
═══════════════════════════════════════════════════════════════
[10:30:16] ⏳ [CLOUDFLARE] Iniciando túnel Cloudflare...
[10:30:31] ✓ [CLOUDFLARE] Túnel funcionando correctamente (HTTP 200)

═══════════════════════════════════════════════════════════════
  PASO 2/2: DEPLOY DE LA APLICACIÓN
═══════════════════════════════════════════════════════════════
[10:30:32] ⏳ [DEPLOY] Deteniendo servicios actuales...
[10:30:32] ✓ [DEPLOY] Servicios detenidos
[10:30:32] ⏳ [BACKUP] Creando backup de base de datos...
[10:30:33] ✓ [BACKUP] Backup creado
[10:31:16] ✓ [DEPLOY] Deploy completado exitosamente

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

---

## 🎯 RECOMENDACIÓN FINAL

Antes de reiniciar, ejecuta:
```powershell
cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts
.\test_startup.ps1
```

Así verificas que todo funciona correctamente primero. 🚀
