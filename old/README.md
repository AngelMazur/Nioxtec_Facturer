# 📦 Archivos Obsoletos (Post-Migración Ubuntu)

Este directorio contiene archivos que ya no son necesarios después de la migración de Windows a Ubuntu en la Odroid.

## 📁 Contenido

### `/old/windows_scripts/` (23 archivos)
Scripts PowerShell (`.ps1`) que solo funcionaban en Windows:
- Scripts de inicio automático de Windows
- Scripts de deploy para Windows
- Utilidades de gestión de logs en PowerShell
- Scripts de limpieza y mantenimiento de Windows

**Razón:** Estos scripts usaban cmdlets de PowerShell y rutas de Windows (`C:\Nioxtec\...`) que no son compatibles con Linux/Ubuntu.

### `/old/docs/` (7 archivos)
Documentación antigua que ha sido reorganizada:
- `SOLUCION_*.md` → Movidos a `docs/`
- `README_DEV.md` → Integrado en `docs/DESARROLLO.md`
- `README_IA.md` → Referencia histórica
- `start_backend.ps1` → Reemplazado por `start_backend_dev.sh`

## ⚠️ Importante

Estos archivos se mantienen por:
1. **Referencia histórica**: Por si necesitas consultar configuraciones antiguas
2. **Backup**: En caso de necesitar revertir algo
3. **Documentación**: Entender cómo funcionaba el sistema en Windows

## 🗑️ ¿Puedo eliminar este directorio?

**Recomendación:** Mantenerlo por al menos 1-2 meses después de la migración.

Después de ese periodo, si todo funciona correctamente en Ubuntu, puedes eliminarlo con:
```bash
rm -rf /opt/nioxtec/Nioxtec_Facturer/old/
```

## 📝 Scripts Equivalentes en Ubuntu

| Windows (PowerShell)         | Ubuntu (Bash)              |
|------------------------------|----------------------------|
| `start_backend.ps1`          | `start_backend_dev.sh`     |
| `startup_master.ps1`         | `start_all.sh`             |
| `start_all.ps1`              | `start_dev.sh`             |
| `cleanup_*.ps1`              | (No necesario en Ubuntu)   |
| `deploy_*.ps1`               | Scripts de Docker Compose  |

## 🔄 Migración Completada

✅ Sistema migrado exitosamente de Windows 10 a Ubuntu (Odroid)  
✅ Todos los scripts convertidos a Bash  
✅ Rutas actualizadas para sistema Linux  
✅ Configuración de servicios adaptada  
✅ Docker Compose configurado para producción

---

**Fecha de migración:** Octubre 2025  
**Sistema origen:** Windows 10  
**Sistema destino:** Ubuntu (ARM64 - Odroid)
