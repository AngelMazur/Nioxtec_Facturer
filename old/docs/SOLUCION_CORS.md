# Solución al Error de CORS

## 🔍 Problema Identificado

El error de CORS ocurre porque tienes **dos dominios diferentes** configurados en Cloudflare Tunnel:

```
Access to fetch at 'https://api.nioxtec.es/api/auth/login' from origin 'https://app.nioxtec.es' 
has been blocked by CORS policy
```

### Configuración actual (INCORRECTA):
- `api.nioxtec.es` → Puerto 5000 (backend directo)
- `app.nioxtec.es` → Puerto 8080 (frontend)

**Problema**: El navegador bloquea peticiones entre dominios diferentes (app → api) por seguridad (CORS).

## ✅ Solución

### Opción 1: Una sola URL con proxy (RECOMENDADA)

Usa **solo** `app.nioxtec.es` para todo. El Nginx ya está configurado para hacer proxy de `/api` al backend.

#### Pasos para aplicar:

1. **Ejecuta el script de corrección**:
   ```bash
   cd /opt/nioxtec/Nioxtec_Facturer
   ./fix-cloudflare-tunnel.sh
   ```

2. **Verifica que cloudflared se reinició**:
   ```bash
   sudo systemctl status cloudflared
   ```

3. **Prueba el acceso**:
   - Frontend: `https://app.nioxtec.es`
   - API (vía proxy): `https://app.nioxtec.es/api/auth/login`

#### Resultado:
- ✅ `app.nioxtec.es` → Acceso completo (frontend + API vía /api)
- ❌ `api.nioxtec.es` → Eliminado (ya no es necesario)
- ✅ Sin problemas de CORS

---

### Opción 2: Mantener ambos dominios (NO RECOMENDADA)

Si quieres mantener `api.nioxtec.es`, necesitas modificar el backend para permitir CORS desde ambos dominios.

#### Paso 1: Modificar `.env`

```bash
# Agregar api.nioxtec.es a CORS_ORIGINS
CORS_ORIGINS=https://app.nioxtec.es,https://api.nioxtec.es,http://localhost:8080
EXTRA_ORIGINS=https://app.nioxtec.es,https://api.nioxtec.es
```

#### Paso 2: Configurar el frontend para usar api.nioxtec.es

```bash
cd frontend
nano .env.production
```

Agregar:
```env
VITE_API_BASE=https://api.nioxtec.es
```

#### Paso 3: Rebuild del frontend

```bash
cd /opt/nioxtec/Nioxtec_Facturer
docker compose build web
docker compose up -d web
```

**Desventaja**: Más complejo, requiere configuración adicional, y expones el backend directamente.

---

## 🎯 Recomendación Final

**Usa la Opción 1** (una sola URL). Es más simple, más segura, y es la arquitectura estándar:

```
┌─────────────────────────────────────────┐
│  Usuario                                │
│  https://app.nioxtec.es                 │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────▼──────────────┐
    │  Cloudflare Tunnel         │
    │  app.nioxtec.es            │
    └─────────────┬──────────────┘
                  │
    ┌─────────────▼──────────────┐
    │  Nginx (puerto 8080)       │
    │  - / → Frontend (SPA)      │
    │  - /api → Backend (proxy)  │
    └─────────────┬──────────────┘
                  │
    ┌─────────────▼──────────────┐
    │  Backend (puerto 5000)     │
    │  Flask API                 │
    └────────────────────────────┘
```

---

## 📝 Pasos para Verificar

Después de aplicar la Opción 1:

1. **Limpia el caché del navegador**:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

2. **Accede a**: `https://app.nioxtec.es`

3. **Inicia sesión**:
   - Usuario: `nioxtec@gmail.com`
   - Contraseña: `Nioxtec@2024!!`

4. **Verifica que carga sin errores de CORS** ✅

---

**Fecha**: 5 de octubre de 2025  
**Autor**: GitHub Copilot
