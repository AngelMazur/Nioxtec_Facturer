# 🚀 Guía de Puertos y Scripts - Nioxtec Facturer

## 📊 Tabla de Puertos

| Servicio | Desarrollo | Producción | Acceso Externo |
|----------|------------|------------|----------------|
| **Backend API** | 5001 | 5000 | - |
| **Frontend Dev** | 5173 | - | - |
| **Frontend Build** | - | 8080 (Nginx) | https://app.nioxtec.es |
| **Cloudflare Tunnel** | - | - | Puerto 8080 → app.nioxtec.es |

## 🔧 DESARROLLO (Local)

### Puertos:
- **Backend:** `http://localhost:5001`
- **Frontend:** `http://localhost:5173`

### Scripts:

#### Iniciar Backend (desarrollo)
```bash
./start_backend_dev.sh
```
- Puerto: **5001**
- Debug: **ON**
- Hot reload: **SÍ**

#### Iniciar Frontend (desarrollo)
```bash
./start_frontend.sh
```
- Puerto: **5173**
- Hot reload: **SÍ**
- Proxy API: → localhost:5001

#### Iniciar Todo (desarrollo)
```bash
./start_dev.sh
```
Inicia backend (5001) + frontend (5173)

### Activar Modo Desarrollo con Docker:
```bash
# Renombrar archivo override
mv docker-compose.override.yml.dev docker-compose.override.yml

# Levantar contenedores
docker compose up -d
```

---

## 🌐 PRODUCCIÓN (Docker)

### Puertos:
- **Backend:** `http://localhost:5000` (interno)
- **Frontend:** `http://localhost:8080` (Nginx)
- **Acceso externo:** `https://app.nioxtec.es` (Cloudflare)

### Scripts:

#### Levantar Producción
```bash
# Asegúrate de NO tener docker-compose.override.yml activo
# Si existe, renómbralo:
mv docker-compose.override.yml docker-compose.override.yml.dev

# Reconstruir y levantar
docker compose down
docker compose build
docker compose up -d
```

#### Ver Logs
```bash
# Backend
docker compose logs backend -f

# Frontend (Nginx)
docker compose logs web -f

# Todo
docker compose logs -f
```

#### Reiniciar Servicios
```bash
# Reiniciar todo
docker compose restart

# Solo backend
docker compose restart backend

# Solo web
docker compose restart web
```

#### Detener Producción
```bash
docker compose down
```

---

## 📁 Archivos de Configuración

### Desarrollo:
- `docker-compose.override.yml.dev` → Configuración de desarrollo
- `frontend/.env.local` → Variables frontend desarrollo
- `.env` → Variables backend

### Producción:
- `docker-compose.yml` → Configuración base producción
- `deploy/nginx.conf` → Configuración Nginx
- **NO usar** `docker-compose.override.yml` en producción

---

## 🔀 Cambiar Entre Desarrollo y Producción

### Activar DESARROLLO:
```bash
cd /opt/nioxtec/Nioxtec_Facturer

# Activar override de desarrollo
mv docker-compose.override.yml.dev docker-compose.override.yml

# Levantar
docker compose up -d
```
**Resultado:**
- Backend: puerto 5001 (Flask debug)
- Frontend dev: puerto 5173 (Vite HMR)
- Web: puerto 8080 (deshabilitado en override)

### Activar PRODUCCIÓN:
```bash
cd /opt/nioxtec/Nioxtec_Facturer

# Desactivar override
mv docker-compose.override.yml docker-compose.override.yml.dev

# Reconstruir y levantar
docker compose down
docker compose build
docker compose up -d
```
**Resultado:**
- Backend: puerto 5000 (Gunicorn)
- Web: puerto 8080 (Nginx con React build)

---

## 🌍 Acceso Remoto

### Desarrollo (desde tu PC en la red local):
```bash
# Obtener IP de la Odroid
hostname -I | awk '{print $1}'

# Ejemplo: 192.168.1.100
```

**URLs:**
- Frontend: `http://192.168.1.100:5173`
- Backend: `http://192.168.1.100:5001`

### Producción (desde Internet):
- Frontend: `https://app.nioxtec.es`
- Backend: `https://app.nioxtec.es/api/*`

---

## 🔍 Verificar Qué Está Corriendo

```bash
# Ver contenedores activos
docker compose ps

# Ver puertos en uso
lsof -i :5000    # Backend producción
lsof -i :5001    # Backend desarrollo
lsof -i :5173    # Frontend desarrollo
lsof -i :8080    # Frontend producción

# Ver logs en tiempo real
docker compose logs -f
```

---

## 📝 Variables de Entorno Importantes

### Backend (.env):
```bash
# Producción
FLASK_ENV=production
PORT=5000

# Desarrollo (override)
FLASK_ENV=development
PORT=5001
FLASK_DEBUG=true
```

### Frontend:
**Desarrollo** (`frontend/.env.local`):
```bash
VITE_API_BASE=http://localhost:5001
```

**Producción** (sin .env.local):
- Usa rutas relativas (proxy de Nginx)
- NO definir VITE_API_BASE

---

## 🚨 Troubleshooting

### Puerto ocupado:
```bash
# Liberar puerto
lsof -ti :5000 | xargs kill -9
lsof -ti :5001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
lsof -ti :8080 | xargs kill -9
```

### Reconstruir desde cero:
```bash
# Detener y limpiar
docker compose down -v
docker system prune -a

# Reconstruir
docker compose build --no-cache
docker compose up -d
```

### Ver qué modo está activo:
```bash
# Si existe docker-compose.override.yml → DESARROLLO
# Si NO existe → PRODUCCIÓN
ls -la docker-compose.override.yml 2>/dev/null && echo "DESARROLLO" || echo "PRODUCCIÓN"
```

---

## 📚 Resumen Rápido

| Necesito... | Comando |
|-------------|---------|
| Desarrollo local | `./start_dev.sh` |
| Producción Docker | `docker compose up -d` |
| Ver logs | `docker compose logs -f` |
| Reiniciar | `docker compose restart` |
| Detener | `docker compose down` |
| Verificar puertos | `lsof -i :5000 -i :5173 -i :8080` |
