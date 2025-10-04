# Fixes Aplicados en Producción - 04/10/2025

## Resumen Ejecutivo

Se identificaron y corrigieron problemas críticos en el proceso de deploy automático y configuración de CORS que impedían el funcionamiento correcto de las nuevas funcionalidades (productos e inventario) en producción.

---

## 1. Problema: Errores CORS en endpoints de productos

### Síntoma
```
Access to fetch at 'https://api.nioxtec.es/api/products?limit=200&offset=0' 
from origin 'https://app.nioxtec.es' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

### Causa Raíz
Los endpoints `/api/products` y `/api/products/summary` no manejaban correctamente las requests OPTIONS del preflight CORS. Aunque tenían `methods=['GET', 'OPTIONS']` y `@jwt_required(optional=True)`, **no retornaban inmediatamente** en el caso de OPTIONS, causando que Flask procesara la request y fallara.

### Solución Aplicada
**Commit:** `4390cbc` - "fix: add explicit OPTIONS handling for CORS preflight in products endpoints"

Agregado manejo explícito de OPTIONS antes de procesar la lógica del endpoint:

```python
@app.route('/api/products', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def list_products():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # ... resto de la lógica
```

Lo mismo para `/api/products/summary`.

### Verificación
```bash
curl -X OPTIONS https://api.nioxtec.es/api/products \
  -H "Origin: https://app.nioxtec.es" \
  -H "Access-Control-Request-Method: GET" -I

# Resultado esperado:
HTTP/1.1 200 OK
access-control-allow-origin: https://app.nioxtec.es
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

---

## 2. Problema: Deploy automático no actualiza código en producción

### Síntoma
- GitHub Actions completa exitosamente el deploy
- El backend sigue sirviendo código viejo
- Headers CORS muestran `access-control-allow-origin: http://127.0.0.1:8080` (valor antiguo)
- Frontend requiere reinicio manual con `schtasks /Run /TN "Nioxtec Frontend"`
- Cloudflare tunnel requiere reinicio manual

### Causa Raíz 1: Tareas programadas con permisos incorrectos
Las tareas `Nioxtec Backend`, `Nioxtec Frontend` y `Cloudflared Tunnel` estaban configuradas con:
- **Usuario:** `angel` (usuario local)
- **Modo:** "Solo interactivo" (Interactive only)

Esto impedía que GitHub Actions (ejecutándose como runner de servicio) pudiera iniciar las tareas con `schtasks /Run`.

### Solución 1: Recrear tareas con usuario SYSTEM
**Script:** `DEVELOPER/scripts/fix_deploy_tasks.ps1`

```powershell
# Recrear con SYSTEM y privilegios más altos
schtasks /Create /TN "Nioxtec Backend" \
  /TR "powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File C:\Nioxtec\Nioxtec_Facturer\scripts\start_backend.ps1" \
  /SC ONSTART \
  /RU "SYSTEM" \
  /RL HIGHEST \
  /F
```

Lo mismo para `Nioxtec Frontend` y `Cloudflared Tunnel`.

### Causa Raíz 2: Procesos Python cacheados en memoria
Incluso después de `schtasks /End`, los procesos Python podían quedar en memoria ejecutando código viejo debido a:
- Archivos `.pyd` (extensiones compiladas) bloqueados en Windows
- Código Python cacheado en `__pycache__`
- Procesos zombie no terminados correctamente

### Solución 2: Matar procesos Python antes de reiniciar
**Commit:** `4236610` - "fix(deploy): kill Python processes before restart to avoid cached code"

Modificación en `.github/workflows/deploy.yml`:

```powershell
# Detener servicios
schtasks /End /TN "Nioxtec Backend" 2>$null | Out-Null
schtasks /End /TN "Nioxtec Frontend" 2>$null | Out-Null
schtasks /End /TN "Cloudflared Tunnel" 2>$null | Out-Null

# NUEVO: Matar procesos Python para eliminar código cacheado
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Arrancar backend y esperar que esté listo
schtasks /Run /TN "Nioxtec Backend" 2>$null | Out-Null
Start-Sleep -Seconds 5

# Arrancar frontend y esperar
schtasks /Run /TN "Nioxtec Frontend" 2>$null | Out-Null
Start-Sleep -Seconds 3

# Arrancar Cloudflare tunnel (al final para que use backend nuevo)
schtasks /Run /TN "Cloudflared Tunnel" 2>$null | Out-Null
Start-Sleep -Seconds 5

# Segunda pasada para asegurar arranque
schtasks /Run /TN "Nioxtec Backend" 2>$null | Out-Null
schtasks /Run /TN "Nioxtec Frontend" 2>$null | Out-Null
Start-Sleep -Seconds 3
schtasks /Run /TN "Cloudflared Tunnel" 2>$null | Out-Null
```

### Mejoras Adicionales
1. **Tiempos de espera aumentados:** De 3s a 5-8s entre reinicios para dar tiempo a los servicios a inicializarse
2. **Orden de reinicio optimizado:** Backend → Frontend → Cloudflare (para que el tunnel use el backend actualizado)
3. **Segunda pasada de arranque:** Reintentar arranque de servicios por si la primera falló

---

## 3. Problema Previo: Variable de entorno VITE_API_BASE incorrecta

### Síntoma (resuelto anteriormente)
Frontend en desarrollo (`http://localhost:5173`) conectaba a API de producción (`https://api.nioxtec.es`) causando errores CORS.

### Causa
Variable de entorno Windows `VITE_API_BASE=https://api.nioxtec.es` en usuario `angel`, que sobreescribía la configuración del `.env.development`.

### Solución
```powershell
[System.Environment]::SetEnvironmentVariable('VITE_API_BASE', $null, 'User')
```

Creación de archivos `.env.development` y `.env.production` en `frontend/`:
- `.env.development`: `VITE_API_BASE=` (vacío, usa `http://localhost:5001`)
- `.env.production`: `VITE_API_BASE=` (GitHub Action lo sobrescribe con `https://api.nioxtec.es`)

---

## Commits Aplicados

| Commit | Descripción | Archivos |
|--------|-------------|----------|
| `4390cbc` | Fix CORS preflight en `/api/products` y `/api/products/summary` | `app.py` |
| `4236610` | Fix deploy automático: matar procesos Python antes de reiniciar | `.github/workflows/deploy.yml` |
| `c199096` | Add OPTIONS method y JWT opcional (paso previo) | `app.py` |

---

## Estado Final

### ✅ Funcionando Correctamente
- [x] Login y autenticación JWT
- [x] Endpoints `/api/products` y `/api/products/summary` con CORS correcto
- [x] Deploy automático vía GitHub Actions sin intervención manual
- [x] Servicios se reinician automáticamente con código actualizado
- [x] Frontend accesible en https://app.nioxtec.es sin 502
- [x] Backend accesible en https://api.nioxtec.es con health check OK

### 🔄 Pendiente de Testing Exhaustivo
- [ ] Productos con imágenes (crear, editar, eliminar, lightbox)
- [ ] Inventario (movimientos de stock, tracking)
- [ ] Facturas con productos (selector, actualización de stock)
- [ ] CSV import para gastos
- [ ] Auto-save de contratos

---

## Lecciones Aprendidas

1. **Windows Task Scheduler con SYSTEM es crítico para CI/CD:**
   - Tareas con usuario local y "Solo interactivo" no funcionan desde servicios/GitHub Actions
   - `RU=SYSTEM` y `RL=HIGHEST` permiten ejecución automática

2. **Procesos Python en Windows requieren kill forzoso:**
   - `schtasks /End` no garantiza terminación de procesos
   - `Get-Process python | Stop-Process -Force` es necesario para limpiar código cacheado
   - Archivos `.pyd` pueden quedar bloqueados y requerir kill de proceso

3. **CORS preflight OPTIONS debe retornar inmediatamente:**
   - No es suficiente agregar `'OPTIONS'` a `methods=[]`
   - Debe haber `if request.method == 'OPTIONS': return '', 200` al inicio
   - `@jwt_required(optional=True)` permite OPTIONS sin autenticación

4. **Orden de reinicio importa en arquitectura con túnel:**
   - Backend primero (código de negocio)
   - Frontend segundo (archivos estáticos)
   - Cloudflare tunnel último (para que cachee backend nuevo)

5. **Variables de entorno de Windows sobreescriben .env:**
   - `[System.Environment]::SetEnvironmentVariable()` debe usarse para limpieza
   - Variables de User tienen precedencia sobre archivos `.env`

---

## Próximos Pasos

1. **Testing de funcionalidades nuevas** (ver `DEVELOPER/POST_MERGE_TESTING.md`)
2. **Monitoreo de próximo deploy automático** para validar que funcione sin intervención
3. **Crear tag v0.3.0** para marcar el release de productos e inventario
4. **Documentar troubleshooting** de CORS y deploy en README.md

---

**Autor:** GitHub Copilot (asistido por Angel Mazur)  
**Fecha:** 4 de octubre de 2025  
**Versión:** 1.0
