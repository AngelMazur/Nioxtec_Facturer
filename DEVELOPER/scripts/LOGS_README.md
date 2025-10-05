# 🗂️ Gestión de Logs - Sistema de Startup

## 📝 Resumen Rápido

**¿Los logs se quedan para siempre?**
❌ **NO** - Se limpian automáticamente después de **7 días**

**¿Tengo que hacer algo?**
❌ **NO** - Es completamente automático

**¿Puedo ver los logs antiguos?**
✅ **SÍ** - Durante 7 días están disponibles

---

## 📁 Ubicación de los Logs

```
C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\logs\
```

### Formato de nombres:
```
startup_20251005_103015.log
        ↓       ↓
     YYYYMMDD  HHmmss
```

---

## 🗑️ Política de Limpieza Automática

### ¿Cuándo se limpian?
- ✅ **Cada vez** que arranca el sistema
- ✅ Antes de crear el nuevo log

### ¿Qué se elimina?
- ✅ Logs con más de **7 días** de antigüedad
- ✅ Solo archivos `.log` en el directorio `logs/`

### ¿Qué se conserva?
- ✅ Logs de los últimos **7 días**
- ✅ Suficiente para diagnosticar problemas recientes

### Ejemplo:
```
Hoy: 2025-10-05

Se CONSERVAN logs desde: 2025-09-28 hasta hoy
Se ELIMINAN logs anteriores a: 2025-09-28
```

---

## 🔧 Gestión Manual de Logs

### Script de Gestión
Tienes disponible el script `manage_logs.ps1` para gestionar logs manualmente:

### Ver Espacio Utilizado
```powershell
.\manage_logs.ps1 -Size
```
**Muestra:**
- Número total de logs
- Espacio total ocupado
- Promedio por log
- Distribución por edad (hoy, última semana, >7 días)

### Listar Todos los Logs
```powershell
.\manage_logs.ps1 -List
```
**Muestra:**
- Nombre de cada log
- Fecha de creación
- Tamaño
- Edad (días)
- Código de colores:
  - 🟢 Verde = Hoy
  - 🔵 Cyan = Última semana
  - 🔴 Rojo = Más de 7 días

### Limpiar Manualmente (>7 días)
```powershell
.\manage_logs.ps1 -Clean
```
**Hace:**
- Elimina logs con más de 7 días
- Muestra cuántos elimina
- Muestra espacio liberado

### Limpiar con Retención Personalizada
```powershell
# Limpiar logs más antiguos de 30 días
.\manage_logs.ps1 -Clean -Days 30

# Limpiar logs más antiguos de 3 días
.\manage_logs.ps1 -Clean -Days 3
```

### Limpiar TODOS los Logs (⚠️ Con Precaución)
```powershell
.\manage_logs.ps1 -CleanAll
```
**Hace:**
- Elimina TODOS los logs (sin importar edad)
- Pide confirmación (debes escribir "SI")
- Usa con precaución

---

## 📊 Ejemplos de Uso

### Ver cuánto espacio ocupan los logs
```powershell
cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts
.\manage_logs.ps1 -Size
```
**Salida ejemplo:**
```
═══════════════════════════════════════════════════════════════
  ESPACIO UTILIZADO POR LOGS
═══════════════════════════════════════════════════════════════

  Total de archivos: 5 logs
  Espacio total: 24,35 KB
  Promedio por log: 4,87 KB

  Distribución por edad:
    Hoy:               1 logs - 4,87 KB
    Última semana:     4 logs - 19,48 KB
```

### Ver todos los logs con detalles
```powershell
.\manage_logs.ps1 -List
```
**Salida ejemplo:**
```
  Archivo                             Fecha                Tamaño       Edad
  -------                             -----                ------       ----
  startup_20251005_103015.log         2025-10-05 10:30:15  4,87 KB      Hoy
  startup_20251004_100230.log         2025-10-04 10:02:30  4,91 KB      1 día
  startup_20251003_095845.log         2025-10-03 09:58:45  4,85 KB      2 días
```

### Limpiar logs antiguos manualmente
```powershell
.\manage_logs.ps1 -Clean
```
**Salida ejemplo:**
```
═══════════════════════════════════════════════════════════════
  LIMPIEZA DE LOGS ANTIGUOS
═══════════════════════════════════════════════════════════════

  Eliminando logs anteriores a: 2025-09-28
  (Logs con más de 7 días)

  Logs a eliminar: 3
  Espacio a liberar: 14,61 KB

  ✓ Eliminado: startup_20250927_102530.log
  ✓ Eliminado: startup_20250926_103215.log
  ✓ Eliminado: startup_20250925_101145.log

  Completado:
    • 3 logs eliminados
    • 14,61 KB liberados
```

---

## 🎯 Casos de Uso

### Quiero saber si los logs ocupan mucho espacio
```powershell
.\manage_logs.ps1 -Size
```

### Quiero ver todos los arranques de la última semana
```powershell
.\manage_logs.ps1 -List
```

### Quiero conservar logs por más tiempo (ej: 30 días)
**Opción 1: Modificar el código**
Edita `startup_master.ps1`, línea que dice:
```powershell
$cutoffDate = (Get-Date).AddDays(-7)
```
Cambia `-7` por `-30`

**Opción 2: Limpiar manualmente solo lo muy antiguo**
```powershell
# Esto solo limpiará logs >30 días
.\manage_logs.ps1 -Clean -Days 30
```

### Quiero liberar espacio inmediatamente
```powershell
# Limpiar logs antiguos ahora (sin esperar al próximo arranque)
.\manage_logs.ps1 -Clean
```

---

## 💡 Preguntas Frecuentes

### ¿Cuánto espacio ocupan normalmente los logs?
- Cada log: ~5 KB
- 7 días de logs: ~35 KB (asumiendo un arranque por día)
- **Espacio mínimo**, no es un problema

### ¿Puedo cambiar la política de 7 días?
Sí, edita `startup_master.ps1` en la línea:
```powershell
$cutoffDate = (Get-Date).AddDays(-7)  # Cambia -7 por el número que quieras
```

### ¿Qué pasa si borro todos los logs?
- No afecta al funcionamiento del sistema
- Se crearán nuevos logs en el próximo arranque
- Solo pierdes el historial

### ¿Los logs se sincronizan con Git?
No, el directorio `logs/` debería estar en `.gitignore` para no subir logs locales al repositorio.

### ¿Puedo desactivar la limpieza automática?
Sí, comenta estas líneas en `startup_master.ps1`:
```powershell
# Limpiar logs antiguos de la carpeta logs/
# if (Test-Path $script:logDir) {
#     ...código de limpieza...
# }
```

---

## 🚀 Resumen

| Característica | Detalle |
|---------------|---------|
| **Retención** | 7 días |
| **Limpieza** | Automática en cada arranque |
| **Ubicación** | `DEVELOPER/scripts/logs/` |
| **Tamaño típico** | ~5 KB por log |
| **Gestión manual** | `manage_logs.ps1` |
| **Impacto disco** | Mínimo (~35 KB para 7 días) |

**Conclusión:** Los logs se gestionan automáticamente, no ocupan espacio significativo, y tienes control total si necesitas hacer algo manualmente. 🎉
