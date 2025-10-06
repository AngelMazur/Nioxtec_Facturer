# Solución a los Errores de Carga de la Página

## Problema Diagnosticado

Los errores que estabas viendo eran:

1. ❌ **"Signature verification failed"** - Token JWT inválido
2. ❌ **422 errors en API** - Backend no recibía las peticiones correctamente  
3. ❌ **"message channel closed"** - Error genérico de extensión del navegador (no crítico)

## Causa Raíz

El problema principal era que **el frontend estaba intentando conectarse al puerto 5001, pero el backend está corriendo en el puerto 5000**.

Adicionalmente, el token JWT guardado en el navegador podría ser inválido si el `JWT_SECRET_KEY` cambió recientemente.

## Solución Aplicada

### 1. Corrección del Puerto en el Frontend ✅

He corregido el archivo `frontend/src/lib/api.js` para usar el puerto **5000** en lugar de 5001:

```javascript
// ANTES (incorrecto):
? `${window.location.protocol}//${window.location.hostname}:5001`

// AHORA (correcto):
? `${window.location.protocol}//${window.location.hostname}:5000`
```

### 2. Limpiar el Token JWT del Navegador

Debes limpiar el token JWT viejo del navegador. Hay 2 formas:

#### Opción A: Desde la Consola del Navegador (Recomendado)

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Consola" (Console)
3. Ejecuta este comando:

```javascript
localStorage.clear()
location.reload()
```

#### Opción B: Desde DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
3. Expande "Local Storage" en el panel izquierdo
4. Selecciona tu dominio (https://app.nioxtec.es)
5. Busca la clave `token` y bórrala
6. Recarga la página (F5)

### 3. Reiniciar el Frontend

Ejecuta estos comandos para reconstruir el frontend con los cambios:

```bash
cd /opt/nioxtec/Nioxtec_Facturer/frontend
npm run build
```

Si estás usando el servidor de desarrollo:

```bash
cd /opt/nioxtec/Nioxtec_Facturer/frontend
npm run dev
```

## Verificación del Backend

Tu backend está configurado correctamente:

- ✅ **Puerto:** 5000
- ✅ **JWT_SECRET_KEY:** Configurado (largo seguro: 96 caracteres)
- ✅ **CORS:** Permite origen `https://app.nioxtec.es`
- ✅ **Proceso:** Gunicorn con 3 workers

## Pasos Finales

1. ✅ Archivo `api.js` corregido (puerto 5000)
2. ⚠️  **PENDIENTE:** Limpiar localStorage del navegador
3. ⚠️  **PENDIENTE:** Reconstruir frontend (`npm run build`)
4. ⚠️  **PENDIENTE:** Hacer login de nuevo

## Prevención Futura

Para evitar este problema en el futuro:

1. **Usa variables de entorno** para la URL del backend
2. **No cambies el JWT_SECRET_KEY** en producción sin invalidar tokens
3. **Documenta el puerto correcto** en la configuración

### Configuración Recomendada

Crea un archivo `.env` en `frontend/` con:

```env
VITE_API_BASE=http://localhost:5000
```

O para producción (si usas proxy inverso):

```env
VITE_API_BASE=https://app.nioxtec.es
```

## Notas Adicionales

- El error "message channel closed" es de extensiones del navegador (ej: extensiones de Chrome), no afecta tu aplicación
- Si persisten los 422 errors después de limpiar localStorage, verifica que el usuario admin existe en la base de datos

---

**Última actualización:** 5 de octubre de 2025
**Estado:** ✅ Solución aplicada - Pendiente rebuild del frontend
