# 🖼️ Solución: Imágenes con Autenticación JWT

## 🔍 Problema

Después de la migración a Ubuntu, las imágenes de clientes y productos no se visualizaban en el frontend.

### Causa Raíz

Las imágenes de **clientes** requieren autenticación JWT y se sirven mediante:
```
GET /api/clients/{client_id}/documents/{doc_id}
```

El problema es que el tag HTML `<img src="...">` **NO puede enviar headers de autenticación** (como `Authorization: Bearer <token>`), por lo que las peticiones fallaban con error 401 Unauthorized.

### Diferencia con las Facturas

Las facturas SÍ funcionaban porque se descargan mediante JavaScript con `fetch()`, que sí permite enviar headers:

```javascript
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
})
```

## ✅ Solución Implementada

### 1. Componente `AuthenticatedImage`

Se creó un componente React que:
1. Descarga la imagen usando `fetch()` con el token JWT
2. Convierte la respuesta a un Blob
3. Crea un Object URL temporal
4. Muestra la imagen usando ese URL
5. Limpia el Object URL al desmontar el componente

**Ubicación:** `/frontend/src/components/AuthenticatedImage.jsx`

**Uso:**
```jsx
<AuthenticatedImage 
  src={`/api/clients/${clientId}/documents/${docId}`}
  alt="Imagen del cliente"
  className="w-full h-32 object-cover"
  token={jwtToken}
/>
```

### 2. Estados del Componente

El componente maneja tres estados:
- **Loading:** Muestra un spinner mientras descarga
- **Error:** Muestra un icono de error si falla
- **Success:** Muestra la imagen cuando carga correctamente

### 3. Ventajas de esta Solución

✅ **Seguridad mantenida:** Las imágenes siguen requiriendo autenticación
✅ **Compatible con CORS:** Funciona con diferentes orígenes
✅ **Gestión de memoria:** Los blob URLs se limpian automáticamente
✅ **UX mejorada:** Feedback visual durante la carga
✅ **Reutilizable:** Se puede usar en cualquier parte de la aplicación

## 🔐 Seguridad

### Imágenes de Clientes
- ✅ **Protegidas:** Requieren JWT token
- ✅ **Privadas:** Solo accesibles con autenticación
- ✅ **Endpoint:** `/api/clients/{id}/documents/{doc_id}`

### Imágenes de Productos
- ⚠️ **Públicas:** Sin autenticación
- 📂 **Endpoint:** `/static/uploads/products/{filename}`
- 💡 **Razón:** Las imágenes de productos se muestran en catálogos públicos

## 📝 Implementación en Clientes.jsx

```jsx
// Importar el componente
import AuthenticatedImage from "../components/AuthenticatedImage"

// Reemplazar <img> por <AuthenticatedImage>
<AuthenticatedImage 
  src={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`}
  alt={d.filename}
  className="w-full h-32 object-cover rounded border border-gray-700"
  token={token}
/>
```

## 🚀 Próximos Pasos (Opcional)

Para mejorar el rendimiento, se podría implementar:

1. **Caché de Blob URLs:** Evitar recargar la misma imagen múltiples veces
2. **Lazy Loading:** Cargar imágenes solo cuando sean visibles
3. **Thumbnails:** Generar miniaturas en el backend para listas
4. **CDN:** Usar un CDN con autenticación para imágenes frecuentes

## 🧪 Testing

Para verificar que funciona:

1. Iniciar el backend en desarrollo
2. Iniciar el frontend en desarrollo  
3. Abrir la consola del navegador (F12)
4. Navegar a un cliente con imágenes
5. Verificar que las imágenes cargan sin errores 401

## 📊 Comparación: Antes vs Después

### ❌ Antes (No funcionaba)
```jsx
<img src={`/api/clients/1/documents/5`} />
// ❌ Error 401: No puede enviar Authorization header
```

### ✅ Después (Funciona)
```jsx
<AuthenticatedImage 
  src={`/api/clients/1/documents/5`}
  token={jwtToken}
/>
// ✅ Usa fetch() con Authorization: Bearer <token>
```

## 🔧 Troubleshooting

### La imagen no carga
1. Verificar que el token JWT es válido
2. Verificar en Network tab (F12) el status de la petición
3. Verificar que el archivo existe en `instance/uploads/{client_id}/images/`

### Error de CORS
1. Verificar que `CORS_ORIGINS` incluye el origen del frontend
2. En desarrollo: `http://localhost:5173`
3. En producción: Tu dominio de Cloudflare

### La imagen se ve pero está corrupta
1. Verificar que el `content_type` en la base de datos es correcto
2. Verificar que el archivo no está corrupto en el servidor
