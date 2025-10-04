# 📋 PLAN DE INTEGRACIÓN Y MIGRACIÓN
## feat/products-inventory → main → Ubuntu
**Fecha:** 4 de octubre de 2025

---

## 🎯 OBJETIVO

Integrar la rama `feat/products-inventory` a `main` de forma segura y luego migrar de Windows a Ubuntu.

---

## 📊 ESTADO ACTUAL

✅ **Rama actual:** `feat/products-inventory`  
✅ **Commits adelantados:** 54 commits respecto a `origin/main`  
✅ **Conflictos:** NINGUNO (main no tiene commits nuevos)  
✅ **Tipo de merge:** Fast-forward limpio  
✅ **Backup creado:** `backup/products-inventory-20250104`  
✅ **Working tree:** Limpio, sin cambios pendientes

---

## 🚀 FASES DEL PLAN

### ✅ FASE 1: PREPARACIÓN (COMPLETADA)
- [x] Verificar estado del repositorio
- [x] Crear backup de seguridad
- [x] Actualizar referencias remotas
- [x] Confirmar ausencia de conflictos

### ⏳ FASE 2: PRUEBAS LOCALES (EN CURSO - TU TURNO)

**TU ACCIÓN REQUERIDA:**

1. **Arrancar el proyecto:**
   ```bash
   cd /Users/mazur/NioxtecProject/Nioxtec_Facturer
   ./start_dev.sh
   ```

2. **Abrir en navegador:**
   - Frontend: http://localhost:5173
   - Backend Health: http://localhost:5001/health

3. **Ejecutar verificación automatizada:**
   ```bash
   ./DEVELOPER/scripts/verify_pre_merge.sh
   ```

4. **Realizar pruebas manuales** (ver `DEVELOPER/PRE_MERGE_CHECKLIST.md`):
   - ✅ Login funciona
   - ✅ Todas las páginas cargan
   - ✅ CRUD funciona en cada módulo
   - ✅ Productos (NUEVO) funciona correctamente
   - ✅ Generación de PDFs funciona
   - ✅ Sin errores en consola

5. **Reportar resultados:**
   - ✅ TODO OK → Continuar a Fase 3
   - ❌ HAY ERRORES → Corregir antes de continuar

---

### ⏸️ FASE 3: MERGE A MAIN (DESPUÉS DE TU APROBACIÓN)

**Opción A: Via Pull Request (RECOMENDADO)**
```bash
# Ya tienes tu rama en remoto
# Crear PR en GitHub: feat/products-inventory → main
# Revisar cambios
# Aprobar y hacer merge desde GitHub
# GitHub Action desplegará automáticamente
```

**Opción B: Merge directo**
```bash
git checkout main
git pull origin main
git merge feat/products-inventory  # Fast-forward limpio
git push origin main
# GitHub Action desplegará automáticamente
```

⚠️ **IMPORTANTE:** El push a `main` activará el GitHub Action que desplegará a producción (Windows).

---

### ⏸️ FASE 4: VERIFICAR DESPLIEGUE EN PRODUCCIÓN (WINDOWS)

**Después del merge:**
1. Esperar que GitHub Action termine
2. Verificar que producción funcione correctamente
3. Probar las nuevas funcionalidades en producción

---

### ⏸️ FASE 5: MIGRACIÓN A UBUNTU (DESPUÉS DE VERIFICAR PRODUCCIÓN)

**Seguir:** `DEVELOPER/UBUNTU_MIGRATION_GUIDE.md`

Pasos principales:
1. Preparar servidor Ubuntu
2. Instalar dependencias
3. Clonar repositorio (rama main)
4. Configurar backend y frontend
5. Configurar Nginx
6. Configurar servicio systemd
7. Migrar datos
8. Configurar SSL (HTTPS)
9. Verificar funcionamiento

---

## 📁 DOCUMENTOS CREADOS

1. **`DEVELOPER/PRE_MERGE_CHECKLIST.md`**
   - Checklist completo de pruebas
   - Criterios de aprobación
   - Qué hacer si hay errores

2. **`DEVELOPER/scripts/verify_pre_merge.sh`**
   - Script de verificación automatizada
   - Verifica que todos los endpoints respondan
   - Genera reporte de estado

3. **`DEVELOPER/UBUNTU_MIGRATION_GUIDE.md`**
   - Guía completa paso a paso
   - Configuración de Nginx, systemd, SSL
   - Troubleshooting
   - Backups y mantenimiento

4. **`DEVELOPER/PLAN_INTEGRACION.md`** (este archivo)
   - Resumen ejecutivo
   - Estado actual
   - Fases del plan

---

## ⚠️ PRECAUCIONES DE SEGURIDAD

1. **NUNCA hacer push a main sin probar localmente primero**
2. **GitHub Action despliega AUTOMÁTICAMENTE a producción**
3. **Siempre tener backup antes de cambios importantes**
4. **Verificar que producción funcione después del despliegue**
5. **No migrar a Ubuntu hasta que producción Windows esté estable**

---

## 🎯 SIGUIENTE PASO

**👉 TU TURNO:** Realizar pruebas locales (Fase 2)

1. Arranca el proyecto: `./start_dev.sh`
2. Ejecuta verificación: `./DEVELOPER/scripts/verify_pre_merge.sh`
3. Prueba manualmente todas las funcionalidades
4. Reporta: ¿Todo OK? o ¿Hay errores?

**Cuando termines las pruebas, avísame y continuaremos con el merge a main.**

---

## 📞 CONTACTO/AYUDA

Si encuentras algún problema:
- Anota el error exacto
- Captura de pantalla
- Logs de consola (backend y frontend)
- Avísame y lo revisaremos juntos

---

**Estado:** ⏳ **ESPERANDO PRUEBAS LOCALES**

