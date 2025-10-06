# Solución a Errores de JWT y Carga de Página

## Problema Detectado

Los errores que estás viendo son:

```
1. Signature verification failed (JWT inválido)
2. 422 errors en /api/clients, /api/products, /api/invoices
3. Uncaught Error: A listener indicated an asynchronous response...
```

## Causa Raíz

El problema es que **tienes un token JWT inválido guardado en localStorage** de tu navegador. Este token fue generado con una `JWT_SECRET_KEY` diferente a la actual del backend.

## Solución Paso a Paso

### 1. Accede SOLO a través del puerto correcto

✅ **CORRECTO**: `http://localhost:8080`  
❌ **INCORRECTO**: `http://localhost:5000` o `http://localhost:5001`

El frontend está configurado para funcionar a través de Nginx en el puerto 8080, que hace proxy automático al backend en el puerto 5000.

### 2. Limpia el localStorage del navegador

Abre la **Consola del Navegador** (F12) y ejecuta:

```javascript
// Limpia TODO el localStorage
localStorage.clear()

// O solo el token JWT
localStorage.removeItem('token')

// Recarga la página
window.location.reload()
```

### 3. Vuelve a iniciar sesión

1. Ve a `http://localhost:8080`
2. Inicia sesión con tus credenciales
3. El sistema generará un nuevo token JWT válido

## Verificación

Si sigues viendo errores después de estos pasos:

### Verifica que los contenedores están corriendo:

```bash
docker ps
```

Deberías ver:
- `nioxtec_facturer-backend-1` en puerto `127.0.0.1:5000->5000/tcp`
- `nioxtec_facturer-web-1` en puerto `127.0.0.1:8080->8080/tcp`

### Reinicia los contenedores si es necesario:

```bash
cd /opt/nioxtec/Nioxtec_Facturer
docker-compose down
docker-compose up -d
```

### Verifica los logs si hay errores:

```bash
# Backend logs
docker logs nioxtec_facturer-backend-1 --tail 50

# Frontend/Nginx logs
docker logs nioxtec_facturer-web-1 --tail 50
```

## Configuración Técnica

### Frontend (.env.local)

El archivo `frontend/.env.local` ya está configurado correctamente:

```bash
VITE_API_BASE=http://localhost:5000
```

**NOTA**: Esta variable solo se usa cuando ejecutas el frontend localmente con `npm run dev`. En producción (Docker), Nginx hace el proxy automáticamente.

### Nginx Config

El archivo `deploy/nginx.conf` está configurado para:
- Servir el frontend en el puerto 8080
- Hacer proxy de `/api/*` al backend en `http://backend:5000`
- Manejar rutas SPA correctamente

## Preguntas Frecuentes

### ¿Por qué veo "Signature verification failed"?

El token JWT que tienes guardado fue generado con una clave secreta diferente. Limpia el localStorage.

### ¿Por qué obtengo errores 422 en las APIs?

Los errores 422 ocurren cuando el JWT no es válido. El backend rechaza la petición antes de procesar los parámetros.

### ¿Puedo acceder al backend directamente en localhost:5000?

Solo para desarrollo. En producción, **siempre usa localhost:8080** y deja que Nginx maneje el proxy.

---

## 🔐 Credenciales Configuradas

### Usuario de Producción (app.nioxtec.es)

**Usuario**: `nioxtec@gmail.com`  
**Contraseña**: `Nioxtec@2024!!`

✅ Usuario creado y verificado en la base de datos de producción  
✅ Login verificado funcionando correctamente

### Otros Usuarios del Sistema

- `admin` - Usuario administrador

---

## 📊 Base de Datos de Producción Restaurada

**Fecha de restauración**: 5 de octubre de 2025, 23:00

### Estado actual:
- ✅ **9 clientes** reales de producción
- ✅ **17 facturas** reales de producción
- ✅ **5 productos** reales de producción

### Proceso de migración:
1. Se identificó que la BD en `instance/app.db` contenía datos de desarrollo (17 clientes, 115 facturas de prueba)
2. Se copió la BD de producción real desde `app.db` (raíz) a `instance/app.db`
3. Se reinició el contenedor backend
4. Se verificó que los datos correctos están cargados
5. Se actualizó la contraseña del usuario `nioxtec@gmail.com`

### Backup:
- La BD de desarrollo fue respaldada en: `instance/app.db.backup_dev_20251005_230000`

### Clientes en producción (muestra):
- Maribell Veronica Jaramillo Olaya
- O Muiño dos Leons S.L.
- ASOCIACIÓN ESTUDIANTIL JUNIOR EMPRESA RIVIA
- Cristopher Poveda Arce
- Roxana Saavedra
- Y 4 más...

---

**Fecha**: 5 de octubre de 2025  
**Versión**: 2.0
