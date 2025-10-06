docker ps
curl http://localhost:5000/health
systemctl status nioxtec-facturer# 🐳 Autoarranque Docker - Nioxtec Facturer

## ✅ Estado Actual

El servicio de **producción** está configurado para iniciarse automáticamente al arrancar la Odroid.

### 📊 Configuración

- **Modo:** Docker Compose (Producción)
- **Backend:** http://localhost:5000 (Gunicorn)
- **Frontend:** http://localhost:8080 (Nginx)
- **Servicio systemd:** `nioxtec-facturer.service`
- **Autoarranque:** ✅ Habilitado

### 🔒 Importante

⚠️ **Solo se autoinicia el entorno de PRODUCCIÓN**

- ✅ **Producción** (puertos 5000/8080): Se inicia automáticamente al arrancar
- ❌ **Desarrollo** (puertos 5001/5173): Solo se inicia manualmente con `./start_dev.sh`

---

## 🎛️ Comandos de Gestión

### Control del Servicio

```bash
# Iniciar
sudo systemctl start nioxtec-facturer

# Detener
sudo systemctl stop nioxtec-facturer

# Reiniciar
sudo systemctl restart nioxtec-facturer

# Ver estado
sudo systemctl status nioxtec-facturer

# Ver logs en tiempo real
sudo journalctl -u nioxtec-facturer -f

# Ver logs completos
sudo journalctl -u nioxtec-facturer --no-pager
```

### Gestión del Autoarranque

```bash
# Deshabilitar autoarranque (pero mantener servicio)
sudo systemctl disable nioxtec-facturer

# Habilitar autoarranque de nuevo
sudo systemctl enable nioxtec-facturer

# Verificar si está habilitado
systemctl is-enabled nioxtec-facturer
```

### Gestión de Contenedores Docker

```bash
# Ver contenedores activos
docker ps

# Ver logs del backend
docker logs nioxtec_facturer-backend-1 -f

# Ver logs del frontend
docker logs nioxtec_facturer-web-1 -f

# Entrar al contenedor del backend
docker exec -it nioxtec_facturer-backend-1 /bin/bash

# Entrar al contenedor del frontend
docker exec -it nioxtec_facturer-web-1 /bin/sh

# Ver uso de recursos
docker stats
```

---

## 🔍 Verificación

### Comprobar que todo funciona

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend
curl http://localhost:8080

# Estado del servicio
systemctl status nioxtec-facturer

# Contenedores activos
docker ps
```

### Salida esperada

```json
# Backend health:
{"database":"sqlite:////app/instance/app.db","pdf_engine":"wkhtmltopdf","status":"ok","version":"dev"}

# Servicio systemd:
Active: active (exited)

# Docker:
nioxtec_facturer-backend-1   Up X minutes
nioxtec_facturer-web-1       Up X minutes
```

---

## 🧪 Prueba de Autoarranque

Para probar que el autoarranque funciona correctamente:

```bash
# 1. Verificar estado actual
sudo systemctl status nioxtec-facturer

# 2. Reiniciar el sistema
sudo reboot

# 3. Después del reinicio, verificar que la app arrancó automáticamente
docker ps
curl http://localhost:5000/health
systemctl status nioxtec-facturer
```

---

## 🔧 Troubleshooting

### El servicio no arranca después de reiniciar

```bash
# Ver logs del servicio
sudo journalctl -u nioxtec-facturer -n 100 --no-pager

# Ver estado detallado
sudo systemctl status nioxtec-facturer -l

# Intentar arrancar manualmente para ver errores
cd /opt/nioxtec/Nioxtec_Facturer
sudo docker compose up
```

### Los contenedores no arrancan

```bash
# Ver logs de Docker Compose
cd /opt/nioxtec/Nioxtec_Facturer
sudo docker compose logs

# Verificar archivo .env
cat .env

# Verificar permisos
ls -la instance/
ls -la static/uploads/
```

### Lentitud al arrancar

```bash
# Ver tiempo de arranque del servicio
systemd-analyze blame | grep nioxtec

# El servicio tiene timeout de 5 minutos por defecto
# Esto es normal para build de imágenes Docker
```

---

## 🗑️ Desinstalar Autoarranque

Si necesitas desinstalar el autoarranque:

```bash
# Detener servicio
sudo systemctl stop nioxtec-facturer

# Deshabilitar autoarranque
sudo systemctl disable nioxtec-facturer

# Eliminar archivo de servicio
sudo rm /etc/systemd/system/nioxtec-facturer.service

# Recargar systemd
sudo systemctl daemon-reload

# Los contenedores Docker seguirán corriendo
# Para detenerlos:
cd /opt/nioxtec/Nioxtec_Facturer
docker compose down
```

---

## 🔄 Actualización de Código

Cuando actualices el código:

```bash
# 1. Ir al directorio del proyecto
cd /opt/nioxtec/Nioxtec_Facturer

# 2. Pull de cambios
git pull

# 3. Detener servicio
sudo systemctl stop nioxtec-facturer

# 4. Reconstruir imágenes
docker compose build

# 5. Reiniciar servicio
sudo systemctl start nioxtec-facturer

# 6. Verificar
docker ps
curl http://localhost:5000/health
```

### Actualización rápida (sin cambios en Dockerfile)

```bash
# Si solo cambiaste código Python/JS pero no Dockerfiles
cd /opt/nioxtec/Nioxtec_Facturer
sudo systemctl restart nioxtec-facturer
```

---

## 📁 Archivos del Sistema

```
/opt/nioxtec/Nioxtec_Facturer/
├── docker-compose.yml                    # Configuración Docker (con restart: unless-stopped)
├── deploy/
│   ├── nioxtec-facturer.service         # Archivo de servicio systemd
│   └── install_autostart.sh             # Script de instalación
└── DEVELOPER/
    └── AUTOSTART_DOCKER.md              # Esta documentación

/etc/systemd/system/
└── nioxtec-facturer.service             # Servicio instalado
```

---

## 🔐 Seguridad

- Los contenedores solo exponen puertos en `127.0.0.1` (localhost)
- No son accesibles desde la red externa directamente
- Cloudflare Tunnel maneja el acceso externo de forma segura
- El servicio corre con el usuario `nioxtec`, no root

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y memoria de contenedores
docker stats

# Uso del sistema
htop

# Espacio en disco
df -h
du -sh /opt/nioxtec/Nioxtec_Facturer/instance
```

### Logs persistentes

Los logs se almacenan en systemd journal:

```bash
# Ver logs desde una fecha
sudo journalctl -u nioxtec-facturer --since "2025-10-06"

# Ver logs desde hace 1 hora
sudo journalctl -u nioxtec-facturer --since "1 hour ago"

# Exportar logs a archivo
sudo journalctl -u nioxtec-facturer > ~/nioxtec-logs.txt
```

---

**Fecha de instalación:** 2025-10-06  
**Última actualización:** 2025-10-06  
**Instalado por:** Script `deploy/install_autostart.sh`
