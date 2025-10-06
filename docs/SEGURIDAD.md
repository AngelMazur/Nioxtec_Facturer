# 🔒 Configuración de Seguridad

**Fecha:** 2025-10-06  
**Estado:** ✅ Configurado y Verificado

## Resumen

Este documento describe todas las medidas de seguridad implementadas en la aplicación Nioxtec Facturer.

---

## 1. Autenticación JWT

### Configuración
- **Biblioteca:** `flask-jwt-extended`
- **Ubicación tokens:** Headers HTTP + Cookies (doble método para compatibilidad)
- **Expiración:** Configurable vía `JWT_ACCESS_TOKEN_EXPIRES` en `.env`

### Variables de Entorno Requeridas
```bash
# .env
JWT_SECRET_KEY=<clave-secreta-fuerte>  # OBLIGATORIO - debe ser diferente de "change-this-secret"
```

### Rutas Protegidas
Todas las rutas de API requieren autenticación JWT mediante el decorador `@jwt_required()`:
- `/api/clients` - Gestión de clientes
- `/api/products` - Gestión de productos
- `/api/invoices` - Gestión de facturas
- `/api/expenses` - Gestión de gastos
- `/api/client_documents` - Acceso a documentos de clientes
- Todas las demás rutas bajo `/api/*`

### Verificación
```bash
# Esta petición debe devolver 401 Unauthorized
curl http://127.0.0.1:5000/api/clients
```

---

## 2. CORS (Cross-Origin Resource Sharing)

### Configuración
- **Biblioteca:** `flask-cors`
- **Modo:** Whitelist explícita de orígenes permitidos

### Variables de Entorno
```bash
# .env
CORS_ORIGINS=https://app.nioxtec.es,http://localhost:5173
```

### Valores por Defecto
Si `CORS_ORIGINS` no está definido, se permite:
- `http://localhost:5173` (desarrollo frontend Vite)
- `http://127.0.0.1:5173`
- `http://localhost:8080` (nginx local)
- `http://127.0.0.1:8080`

### Políticas
- Credentials: `true` (permite envío de cookies)
- Methods: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
- Headers: `Content-Type, Authorization`

---

## 3. Headers de Seguridad HTTP

Implementados en **nginx** (`deploy/nginx.conf`):

### X-Frame-Options
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```
**Propósito:** Previene ataques de clickjacking. Solo permite que la página se muestre en iframes del mismo origen.

### X-Content-Type-Options
```nginx
add_header X-Content-Type-Options "nosniff" always;
```
**Propósito:** Previene MIME type sniffing. Fuerza al navegador a respetar el Content-Type declarado.

### X-XSS-Protection
```nginx
add_header X-XSS-Protection "1; mode=block" always;
```
**Propósito:** Activa el filtro XSS del navegador en modo bloqueo.

### Referrer-Policy
```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```
**Propósito:** Controla qué información de referrer se envía. Solo envía el origen en peticiones cross-origin.

### Cache-Control
```nginx
# Para index.html (nunca cachear)
add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;

# Para assets estáticos (cachear permanentemente)
add_header Cache-Control "public, max-age=31536000, immutable" always;
```
**Propósito:** 
- `index.html` nunca se cachea para evitar versiones obsoletas de la app
- Assets JS/CSS se cachean permanentemente (tienen hash en el nombre)

---

## 4. Exposición de Puertos

### Configuración Docker
```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "127.0.0.1:5000:5000"  # Solo accesible desde localhost
  web:
    ports:
      - "127.0.0.1:8080:8080"  # Solo accesible desde localhost
```

**Propósito:** Los servicios NO son accesibles directamente desde Internet. Solo Cloudflare Tunnel puede acceder a ellos desde localhost.

### Acceso Externo
- **Túnel:** Cloudflare Tunnel (`cloudflared`)
- **Dominio:** `https://app.nioxtec.es`
- **Ventajas:**
  - DDoS protection de Cloudflare
  - SSL/TLS automático
  - No requiere abrir puertos en firewall
  - IP del servidor oculta

---

## 5. Gestión de Archivos

### Permisos de Directorios
```bash
instance/uploads/     # 755 - Documentos de clientes
static/uploads/       # 755 - Imágenes de productos
instance/app.db       # 644 - Base de datos SQLite
```

### Autenticación para Archivos
- **Documentos de clientes:** Requieren JWT válido (`/api/client_documents/<id>`)
- **Imágenes de productos:** Requieren JWT válido (`/static/uploads/products/*`)
- **Implementación:** Frontend usa `fetch()` con header `Authorization: Bearer <token>`

### Límites de Carga
```nginx
client_max_body_size 20m;  # Máximo 20MB por archivo
```

---

## 6. Base de Datos

### Tipo
- **Motor:** SQLite
- **Ubicación:** `instance/app.db`
- **Persistencia:** Volume de Docker

### Seguridad
- ✅ NO expuesta públicamente (solo accesible desde container backend)
- ✅ Backups automáticos antes de migraciones
- ✅ Permisos restrictivos (644)
- ✅ NO versionada en git (en `.gitignore`)

### Migraciones
- **Herramienta:** Alembic
- **Comando seguro:** Siempre hace backup antes de migrar
- **Ubicación backups:** `instance/app.db.backup_*`

---

## 7. Variables de Entorno Sensibles

### Archivo .env
**IMPORTANTE:** Este archivo contiene información sensible y NO debe versionarse en git.

```bash
# Verificar que está en .gitignore
git check-ignore .env
# Debe devolver: .env
```

### Variables Críticas
```bash
JWT_SECRET_KEY=<secreto-fuerte-aleatorio>
SECRET_KEY=<secreto-fuerte-aleatorio>
CORS_ORIGINS=https://app.nioxtec.es
FLASK_ENV=production
```

### Generación de Secretos
```bash
# Generar secreto aleatorio fuerte
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 8. Verificación de Seguridad

### Script Automático
```bash
# Ejecutar verificación completa
bash DEVELOPER/scripts/verify_security.sh
```

### Verificaciones Incluidas
1. ✅ JWT_SECRET_KEY configurado y diferente del valor por defecto
2. ✅ CORS_ORIGINS incluye el dominio de producción
3. ✅ Puertos expuestos solo en localhost
4. ✅ Archivo .env en .gitignore
5. ✅ Headers de seguridad en nginx
6. ✅ Permisos correctos en directorios sensibles
7. ✅ Permisos correctos en base de datos
8. ✅ Servicios Docker corriendo
9. ✅ Endpoints protegidos requieren autenticación
10. ✅ index.html configurado para no cachearse

---

## 9. Checklist de Despliegue

Antes de cada despliegue a producción:

- [ ] Ejecutar `bash DEVELOPER/scripts/verify_security.sh`
- [ ] Verificar que no hay errores (❌)
- [ ] Revisar advertencias (⚠️) según contexto
- [ ] Confirmar que JWT_SECRET_KEY es fuerte y único
- [ ] Verificar que CORS_ORIGINS incluye solo dominios autorizados
- [ ] Confirmar que .env NO está en el repositorio git
- [ ] Purgar caché de Cloudflare después del despliegue
- [ ] Verificar headers de seguridad en navegador (DevTools → Network → Headers)

---

## 10. Respuesta a Incidentes

### Si se compromete JWT_SECRET_KEY
1. Generar nuevo secreto: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Actualizar `.env` con nuevo valor
3. Reiniciar backend: `docker compose restart backend`
4. **Impacto:** Todos los usuarios tendrán que volver a iniciar sesión

### Si se detecta acceso no autorizado
1. Revisar logs: `docker compose logs backend | grep -i error`
2. Verificar IPs en logs de Cloudflare
3. Revisar tabla de usuarios en base de datos
4. Considerar rotación de JWT_SECRET_KEY

### Logs Importantes
```bash
# Ver logs del backend
docker compose logs -f backend

# Ver logs de nginx
docker compose logs -f web

# Ver solo errores
docker compose logs backend | grep -i error
```

---

## 11. Contacto y Soporte

Para consultas de seguridad:
- **Responsable:** Administrador del sistema
- **Documentación adicional:** `/docs/`
- **Scripts de mantenimiento:** `/DEVELOPER/scripts/`

---

## Última Actualización

**Fecha:** 2025-10-06  
**Cambios recientes:**
- ✅ Añadidos headers de seguridad HTTP en nginx
- ✅ Configurado index.html para no cachearse
- ✅ Creado script de verificación automática
- ✅ Documentación completa de seguridad

