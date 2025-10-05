# 🐳 Migración a Ubuntu con Docker

Esta guía adapta la `DEVELOPER/UBUNTU_MIGRATION_GUIDE.md` al escenario con contenedores Docker (backend Flask + Nginx que sirve el frontend y proxya `/api`).

## 1) Preparación del servidor Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
# Instalar Docker y Docker Compose Plugin
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Habilitar/usar sin sudo
sudo usermod -aG docker $USER
# (cerrar sesión y volver a entrar para aplicar)
```

## 2) Clonar repo y configurar entorno

```bash
mkdir -p /opt/nioxtec && cd /opt/nioxtec
git clone https://github.com/AngelMazur/Nioxtec_Facturer.git
cd Nioxtec_Facturer

# Copiar plantilla de variables
cp .env.docker.example .env
nano .env  # Ajusta JWT_SECRET_KEY, COMPANY_*, etc.
```

Notas:
- En Docker el backend corre en `PORT=5000` y Nginx expone `80`.
- La variable `WKHTMLTOPDF_PATH` ya apunta al binario dentro del contenedor.
- Deja `FORCE_HTTPS=false` a menos que termines TLS fuera (Cloudflare/traefik).

## 3) Construir e iniciar con Docker Compose

```bash
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f backend
docker compose logs -f web
```

Servicios:
- `web` (Nginx): publicado en `http://127.0.0.1:8080/` del host
- `backend` (Flask+gunicorn): publicado en `http://127.0.0.1:5000`
  (Se ligan a loopback para que SOLO Cloudflared los consuma; no quedan expuestos externamente)

Rutas:
- SPA: `/` (React build)
- API: `/api/*` (proxy a backend)
- Uploads dinámicos: `/static/uploads/*` (proxy a backend)

## 4) Persistencia de datos

Se crean volúmenes nombrados para:
- `app_instance` → `/app/instance` (SQLite y uploads)
- `app_downloads` → `/app/downloads` (PDFs generados)

Comandos útiles:
```bash
docker volume ls
docker volume inspect Nioxtec_Facturer_app_instance
```

Si prefieres rutas del host, puedes editar `docker-compose.yml` y reemplazar volúmenes por bind mounts, por ejemplo:
```yaml
    volumes:
      - ./instance:/app/instance
      - ./downloads:/app/downloads
```

## 5) Migración de datos

- Si vienes de SQLite (Windows): copia tu `instance/app.db` anterior dentro del volumen `app_instance`.
- Si usas PostgreSQL: configura `DATABASE_URL` en `.env` y añade un servicio `db` (opcional) o usa un servidor externo.

## 6) HTTPS y dominio

Opciones:
- Cloudflare Tunnel existente (sin cambiar nada):
  - Mantén el mapeo actual del túnel:
    - `api.nioxtec.es` → `http://localhost:5000`
    - `app.nioxtec.es` → `http://localhost:8080`
  - Nuestro `docker-compose.yml` ya publica esos puertos en el host.
  - Solo tienes que instalar `cloudflared` en Ubuntu y reutilizar el mismo `tunnelId` y `credentials-file`.

- Proxy TLS externo (Traefik/Caddy/Nginx): termina TLS y apunta al servicio `web:8080`.

Si habilitas TLS fuera, mantén `FORCE_HTTPS=false` en el backend para evitar redirecciones internas.

### 6.1 Cloudflared en Ubuntu (reutilizando túnel)

Instalar cloudflared:

```bash
sudo apt update
sudo apt install -y curl gnupg
curl -fsSL https://pkg.cloudflare.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(. /etc/os-release && echo $VERSION_CODENAME) main" | \
  sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
```

```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Ejemplo (usa TU `tunnel` y `credentials-file`):

```yaml
tunnel: 478db0c4-6db4-4094-9896-52622211f7c1
credentials-file: /etc/cloudflared/478db0c4-6db4-4094-9896-52622211f7c1.json
ingress:
  - hostname: api.nioxtec.es
    service: http://localhost:5000
  - hostname: app.nioxtec.es
    service: http://localhost:8080
  - service: http_status:404
```

Copiar el JSON de credenciales desde el servidor anterior (Windows):

```bash
# En Windows estaba en: C:\\ProgramData\\Cloudflare\\cloudflared\\<tunnel>.json
# Cópialo a Ubuntu en /etc/cloudflared/<tunnel>.json y ajusta permisos
sudo chown root:root /etc/cloudflared/*.json
sudo chmod 600 /etc/cloudflared/*.json
```

Instalar como servicio:

```bash
sudo cloudflared service install
# o arrancar manualmente si ya tienes config + credenciales
sudo cloudflared --config /etc/cloudflared/config.yml tunnel run 478db0c4-6db4-4094-9896-52622211f7c1
```

## 7) Actualizaciones y despliegues

```bash
git pull
docker compose build web backend
docker compose up -d
```

Si cambian dependencias del backend, reconstruye su imagen. Para cambios sólo de frontend, basta reconstruir `web`.

## 8) Solución de problemas

```bash
# Verificar que los contenedores están arriba
docker compose ps

# Logs
docker compose logs -f web
docker compose logs -f backend

# Health check básico (desde el host)
curl -I http://localhost/
curl -sS http://localhost/api/health
```

Errores comunes:
- 502/404 en `/static/uploads/*`: asegúrate de usar la config Nginx incluida (proxy a backend en esa ruta).
- PDFs no se generan: revisa logs del backend; `wkhtmltopdf` ya está en la imagen, no debería faltar.
- CORS: ajusta `CORS_ORIGINS`/`EXTRA_ORIGINS` en `.env` si sirves desde dominios distintos.

---

Con esto, la migración a Ubuntu queda simplificada y reproducible usando contenedores Docker. 🚀

---

## 👩‍💻 Desarrollo local (opcional) con override

Para desarrollar con hot-reload sin tocar la configuración de producción:

1) Crear `.env` para dev (puedes reutilizar tu `.env` actual de macOS):

```env
FLASK_ENV=development
FLASK_DEBUG=true
JWT_SECRET_KEY=dev_solo_para_local
PORT=5001
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

2) Arrancar solo backend (5001) y frontend dev (5173):

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d backend frontend-dev

# Verificar
curl http://127.0.0.1:5001/health
open http://localhost:5173
```

Notas:
- El servicio `web` (Nginx) queda sin puertos publicados en el override.
- El frontend dev usa Vite con HMR en 5173 y resuelve el backend en 5001 automáticamente.
- Producción sigue igual (Cloudflare a 5000/8080). Para prod, usa solo `docker compose up -d` (sin el override ni el servicio `frontend-dev`).
