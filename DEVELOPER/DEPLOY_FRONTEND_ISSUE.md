# 🐛 Problema: Frontend no se actualiza automáticamente en deploy

**Fecha:** 4 de octubre de 2025  
**Issue:** El GitHub Action compila el frontend pero no siempre se reinicia correctamente

## 📋 Síntomas

- El deploy completa exitosamente (✅ verde en GitHub Actions)
- Backend se actualiza correctamente
- **Frontend sirve versión antigua** hasta reinicio manual
- Error 502 Bad Gateway en `https://app.nioxtec.es`

## 🔍 Causa Raíz

### El GitHub Action hace:

1. ✅ `npm ci` - Instala dependencias
2. ✅ `npm run build` - Compila frontend a `dist/`
3. ✅ `schtasks /End /TN "Nioxtec Frontend"` - Detiene tarea
4. ✅ `schtasks /Run /TN "Nioxtec Frontend"` - Intenta arrancar tarea
5. ❌ **La tarea NO arranca** porque:
   - Configurada como "Solo interactivo"
   - No tiene permisos para auto-arranque sin sesión
   - El proceso anterior no se cerró completamente

### Configuración Actual de la Tarea:

```
Modo de inicio de sesión: Solo interactivo
Tipo de programación: Cuando se inicia el sistema
Ejecutar como usuario: angel
```

## 🛠️ Soluciones Propuestas

### Opción 1: Cambiar configuración de tarea (RECOMENDADO)

**Modificar la tarea para que permita ejecución sin sesión interactiva:**

```powershell
# Recrear tarea con permisos correctos
schtasks /Delete /TN "Nioxtec Frontend" /F

schtasks /Create /TN "Nioxtec Frontend" /TR "powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File C:\Nioxtec\Nioxtec_Facturer\scripts\start_frontend.ps1" /SC ONSTART /RU "SYSTEM" /RL HIGHEST /F
```

**Ventajas:**
- ✅ Deploy completamente automático
- ✅ No requiere sesión de usuario
- ✅ Funciona en GitHub Actions

**Desventajas:**
- ⚠️ Requiere permisos de administrador para recrear
- ⚠️ Cambio de configuración del sistema

---

### Opción 2: Mejorar verificación en GitHub Action

**Agregar reintentos y verificación:**

```yaml
# En deploy.yml, después de reiniciar servicios:
try {
  Log 'Verificando que frontend arrancó...'
  $frontendOk = $false
  for ($i=1; $i -le 10; $i++) {
    try {
      $resp = Invoke-WebRequest http://localhost:8080 -UseBasicParsing -TimeoutSec 5
      if ($resp.StatusCode -eq 200) { $frontendOk = $true; break }
    } catch { }
    Start-Sleep -Seconds 3
    # Reintentar arrancar si no responde
    schtasks /Run /TN "Nioxtec Frontend" 2>$null | Out-Null
  }
  if (-not $frontendOk) {
    Log 'WARNING: Frontend no arrancó automáticamente. Requiere reinicio manual.'
  }
} catch { }
```

**Ventajas:**
- ✅ Detecta si el frontend no arrancó
- ✅ Reintenta automáticamente
- ✅ No requiere cambios de permisos

**Desventajas:**
- ⚠️ No garantiza arranque automático
- ⚠️ Puede requerir intervención manual

---

### Opción 3: Reiniciar túnel de Cloudflare siempre

**Forzar reinicio de Cloudflare tras frontend:**

```yaml
# Después de arrancar servicios:
try {
  Log 'Forzando reconexión de Cloudflare Tunnel...'
  schtasks /End /TN "Cloudflared Tunnel" 2>$null | Out-Null
  Start-Sleep -Seconds 5
  schtasks /Run /TN "Cloudflared Tunnel" 2>$null | Out-Null
  Start-Sleep -Seconds 10
} catch { }
```

**Ventajas:**
- ✅ Asegura que Cloudflare detecte el nuevo frontend
- ✅ Fácil de implementar

**Desventajas:**
- ⚠️ No resuelve el problema raíz
- ⚠️ Añade 15 segundos al deploy

---

## 📝 Solución Implementada Temporalmente

**Manual workaround usado el 4 de octubre de 2025:**

```powershell
# 1. Reiniciar frontend manualmente
schtasks /Run /TN "Nioxtec Frontend"

# 2. Esperar 5 segundos
Start-Sleep -Seconds 5

# 3. Verificar que arrancó
curl.exe http://localhost:8080

# 4. Reiniciar túnel de Cloudflare
schtasks /End /TN "Cloudflared Tunnel"
Start-Sleep -Seconds 2
schtasks /Run /TN "Cloudflared Tunnel"

# 5. Esperar 10 segundos y verificar
Start-Sleep -Seconds 10
curl.exe https://app.nioxtec.es
```

## 🎯 Recomendación Final

**Implementar OPCIÓN 1 + OPCIÓN 2 + OPCIÓN 3:**

1. **Recrear tareas con permisos SYSTEM** (una vez, requiere admin)
2. **Agregar verificación con reintentos** en `deploy.yml`
3. **Forzar reinicio de Cloudflare** siempre

Esto garantizará deploys 100% automáticos sin intervención manual.

---

## 📚 Referencias

- GitHub Actions: `.github/workflows/deploy.yml` líneas 258-264
- Script frontend: `scripts/start_frontend.ps1`
- Documentación: `DEVELOPER/POST_MERGE_TESTING.md`

## ✅ TODO

- [ ] Recrear tareas con permisos SYSTEM
- [ ] Actualizar `deploy.yml` con verificaciones
- [ ] Probar deploy automático completo
- [ ] Documentar en README.md
