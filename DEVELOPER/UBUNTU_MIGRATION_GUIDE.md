# 🐧 GUÍA DE MIGRACIÓN A UBUNTU
## De Windows a Ubuntu - Nioxtec Facturer
**Fecha:** 4 de octubre de 2025

---

## 📋 PREREQUISITOS

### Información necesaria antes de empezar:
- [ ] Acceso SSH al servidor Ubuntu
- [ ] Usuario y contraseña del servidor
- [ ] IP o dominio del servidor
- [ ] Puerto SSH (generalmente 22)
- [ ] Backup de la base de datos de Windows

---

## 🎯 FASE 1: PREPARACIÓN DEL SERVIDOR UBUNTU

### 1.1 Actualizar sistema
```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

### 1.2 Instalar dependencias base
```bash
# Python y herramientas
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Node.js y npm (versión 20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -bash -
sudo apt install -y nodejs

# Git
sudo apt install -y git

# Herramientas adicionales
sudo apt install -y build-essential libssl-dev libffi-dev

# Para generación de PDFs (pdfkit/wkhtmltopdf)
sudo apt install -y wkhtmltopdf

# Nginx (servidor web)
sudo apt install -y nginx

# PostgreSQL (si lo usas) o SQLite ya viene instalado
# sudo apt install -y postgresql postgresql-contrib
```

### 1.3 Verificar versiones instaladas
```bash
python3 --version  # Debería ser 3.10 o superior
node --version     # Debería ser 20.x
npm --version      # Debería ser 9.x o superior
git --version
nginx -v
```

---

## 🎯 FASE 2: CLONAR Y CONFIGURAR PROYECTO

### 2.1 Crear estructura de directorios
```bash
# Crear directorio de trabajo
sudo mkdir -p /var/www/nioxtec
sudo chown -R $USER:$USER /var/www/nioxtec
cd /var/www/nioxtec
```

### 2.2 Clonar repositorio
```bash
git clone https://github.com/AngelMazur/Nioxtec_Facturer.git
cd Nioxtec_Facturer

# Verificar que estás en la rama correcta
git branch
git status
```

### 2.3 Configurar entorno Python
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt
```

### 2.4 Configurar variables de entorno
```bash
# Crear archivo .env
nano .env
```

**Contenido del .env (ajustar según tu configuración):**
```env
# Flask
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=tu-clave-secreta-super-segura-aqui

# Database (si usas PostgreSQL)
# DATABASE_URL=postgresql://usuario:password@localhost/nioxtec_db

# CORS (ajustar al dominio de producción)
CORS_ORIGINS=https://tu-dominio.com

# JWT
JWT_SECRET_KEY=otra-clave-secreta-para-jwt

# Uploads
UPLOAD_FOLDER=/var/www/nioxtec/Nioxtec_Facturer/static/uploads

# Alembic
USE_ALEMBIC=true
SKIP_DB_CREATE_ALL=true
SKIP_RUNTIME_ALTERS=true

# PDF Generation
PDF_GENERATION_PATH=/usr/bin/wkhtmltopdf

# Port
PORT=5000
```

```bash
# Guardar y cerrar (Ctrl+X, Y, Enter)

# Ajustar permisos
chmod 600 .env
```

### 2.5 Inicializar base de datos
```bash
# Si usas Alembic (recomendado)
flask db upgrade

# Crear directorios necesarios
mkdir -p static/uploads
mkdir -p downloads
mkdir -p instance
chmod 755 static/uploads
chmod 755 downloads
```

---

## 🎯 FASE 3: CONFIGURAR FRONTEND

### 3.1 Instalar dependencias y hacer build
```bash
cd /var/www/nioxtec/Nioxtec_Facturer/frontend

# Instalar dependencias
npm install

# Crear build de producción
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/
```

### 3.2 Configurar variables de entorno del frontend (si es necesario)
```bash
# Si tienes un .env para el frontend
nano .env.production
```

```env
VITE_API_URL=https://tu-dominio.com/api
```

---

## 🎯 FASE 4: CONFIGURAR NGINX

### 4.1 Crear configuración de Nginx
```bash
sudo nano /etc/nginx/sites-available/nioxtec
```

**Contenido:**
```nginx
# Redirigir HTTP a HTTPS (opcional, después de configurar SSL)
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/nioxtec/Nioxtec_Facturer/frontend/dist;
    }
    
    # Redirigir todo a HTTPS (activar después de tener SSL)
    # return 301 https://$server_name$request_uri;
    
    # Configuración temporal para HTTP (eliminar después de SSL)
    root /var/www/nioxtec/Nioxtec_Facturer/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/nioxtec/Nioxtec_Facturer/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /downloads {
        alias /var/www/nioxtec/Nioxtec_Facturer/downloads;
        expires 1h;
    }
}

# HTTPS (activar después de configurar SSL)
# server {
#     listen 443 ssl http2;
#     server_name tu-dominio.com www.tu-dominio.com;
#
#     ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
#     
#     # Configuración SSL recomendada
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     root /var/www/nioxtec/Nioxtec_Facturer/frontend/dist;
#     index index.html;
#
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
#
#     location /api {
#         proxy_pass http://127.0.0.1:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
#
#     location /static {
#         alias /var/www/nioxtec/Nioxtec_Facturer/static;
#         expires 30d;
#         add_header Cache-Control "public, immutable";
#     }
#
#     location /downloads {
#         alias /var/www/nioxtec/Nioxtec_Facturer/downloads;
#         expires 1h;
#     }
# }
```

### 4.2 Activar configuración
```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/nioxtec /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si todo está OK, recargar Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## 🎯 FASE 5: CONFIGURAR SERVICIO SYSTEMD PARA BACKEND

### 5.1 Crear servicio systemd
```bash
sudo nano /etc/systemd/system/nioxtec-backend.service
```

**Contenido:**
```ini
[Unit]
Description=Nioxtec Facturer Backend (Flask)
After=network.target

[Service]
Type=simple
User=tu-usuario
Group=tu-usuario
WorkingDirectory=/var/www/nioxtec/Nioxtec_Facturer
Environment="PATH=/var/www/nioxtec/Nioxtec_Facturer/venv/bin"
EnvironmentFile=/var/www/nioxtec/Nioxtec_Facturer/.env
ExecStart=/var/www/nioxtec/Nioxtec_Facturer/venv/bin/python app.py

# Reinicio automático
Restart=always
RestartSec=10

# Seguridad
NoNewPrivileges=true
PrivateTmp=true

# Logs
StandardOutput=append:/var/log/nioxtec/backend.log
StandardError=append:/var/log/nioxtec/backend-error.log

[Install]
WantedBy=multi-user.target
```

### 5.2 Crear directorio de logs
```bash
sudo mkdir -p /var/log/nioxtec
sudo chown -R $USER:$USER /var/log/nioxtec
```

### 5.3 Activar y arrancar servicio
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio (arranque automático)
sudo systemctl enable nioxtec-backend

# Iniciar servicio
sudo systemctl start nioxtec-backend

# Verificar estado
sudo systemctl status nioxtec-backend
```

---

## 🎯 FASE 6: MIGRACIÓN DE DATOS

### 6.1 Exportar datos desde Windows

**En el servidor Windows:**
```bash
# Si usas SQLite
# Simplemente copia el archivo instance/tu-database.db

# Si usas PostgreSQL
pg_dump -U usuario -d nioxtec_db > nioxtec_backup.sql

# Copiar archivos uploads
# Comprime la carpeta static/uploads/
```

### 6.2 Importar datos en Ubuntu

**Transferir archivos al servidor Ubuntu:**
```bash
# Desde tu Mac/Windows, usar SCP
scp tu-database.db usuario@servidor-ubuntu:/var/www/nioxtec/Nioxtec_Facturer/instance/

# O para PostgreSQL
scp nioxtec_backup.sql usuario@servidor-ubuntu:/tmp/

# Archivos uploads
scp -r static/uploads/* usuario@servidor-ubuntu:/var/www/nioxtec/Nioxtec_Facturer/static/uploads/
```

**En el servidor Ubuntu:**
```bash
# Si usas PostgreSQL
psql -U usuario -d nioxtec_db < /tmp/nioxtec_backup.sql

# Ajustar permisos
cd /var/www/nioxtec/Nioxtec_Facturer
chmod 644 instance/*.db  # Si usas SQLite
chmod -R 755 static/uploads/
chown -R $USER:$USER static/uploads/
```

---

## 🎯 FASE 7: CONFIGURAR FIREWALL Y SEGURIDAD

### 7.1 Configurar UFW (firewall)
```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (¡IMPORTANTE! No bloquees SSH)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar reglas
sudo ufw status
```

### 7.2 Configurar SSL con Let's Encrypt (HTTPS)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir instrucciones interactivas
# Certbot configurará automáticamente Nginx para HTTPS

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 7.3 Configurar permisos de archivos
```bash
cd /var/www/nioxtec/Nioxtec_Facturer

# Ajustar permisos generales
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Permisos especiales para uploads y downloads
chmod -R 755 static/uploads
chmod -R 755 downloads

# Archivos ejecutables
chmod +x start_*.sh
chmod +x DEVELOPER/scripts/*.sh

# .env debe ser privado
chmod 600 .env
```

---

## 🎯 FASE 8: VERIFICACIÓN POST-MIGRACIÓN

### 8.1 Verificar servicios
```bash
# Backend
sudo systemctl status nioxtec-backend
curl http://localhost:5000/health

# Nginx
sudo systemctl status nginx
curl http://localhost/

# Logs
sudo journalctl -u nioxtec-backend -n 50
tail -f /var/log/nioxtec/backend.log
```

### 8.2 Verificar desde navegador
```
http://tu-dominio.com
https://tu-dominio.com (después de SSL)
```

### 8.3 Checklist de verificación
- [ ] Backend responde en http://tu-dominio.com/api/health
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Todas las páginas cargan
- [ ] CRUD funciona en todos los módulos
- [ ] Generación de PDFs funciona
- [ ] Archivos se suben/descargan correctamente
- [ ] HTTPS está configurado (candado verde en navegador)

---

## 🎯 FASE 9: MONITOREO Y MANTENIMIENTO

### 9.1 Ver logs en tiempo real
```bash
# Backend
sudo journalctl -u nioxtec-backend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 9.2 Reiniciar servicios
```bash
# Backend
sudo systemctl restart nioxtec-backend

# Nginx
sudo systemctl reload nginx
```

### 9.3 Actualizar código desde Git
```bash
cd /var/www/nioxtec/Nioxtec_Facturer

# Pull últimos cambios
git pull origin main

# Activar entorno virtual
source venv/bin/activate

# Actualizar dependencias Python
pip install -r requirements.txt

# Actualizar frontend
cd frontend
npm install
npm run build

# Aplicar migraciones
cd ..
flask db upgrade

# Reiniciar backend
sudo systemctl restart nioxtec-backend
```

### 9.4 Backups automáticos (opcional)
```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-nioxtec.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/nioxtec"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup base de datos
cp /var/www/nioxtec/Nioxtec_Facturer/instance/*.db $BACKUP_DIR/db_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/nioxtec/Nioxtec_Facturer/static/uploads/

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-nioxtec.sh

# Agregar a crontab (backup diario a las 3 AM)
crontab -e
# Agregar línea:
# 0 3 * * * /usr/local/bin/backup-nioxtec.sh
```

---

## 🆘 TROUBLESHOOTING

### Problema: Backend no arranca
```bash
# Ver logs detallados
sudo journalctl -u nioxtec-backend -n 100 --no-pager
sudo systemctl status nioxtec-backend
tail -50 /var/log/nioxtec/backend-error.log

# Verificar permisos
ls -la /var/www/nioxtec/Nioxtec_Facturer/
ls -la /var/www/nioxtec/Nioxtec_Facturer/.env
```

### Problema: Nginx 502 Bad Gateway
```bash
# Verificar que backend esté corriendo
curl http://localhost:5000/health

# Si no responde, revisar logs del backend
sudo systemctl status nioxtec-backend
```

### Problema: Permisos de archivos
```bash
# Ajustar propietario
sudo chown -R $USER:$USER /var/www/nioxtec/Nioxtec_Facturer

# Ajustar permisos
chmod -R 755 /var/www/nioxtec/Nioxtec_Facturer/static/uploads
```

### Problema: PDFs no se generan
```bash
# Verificar wkhtmltopdf
which wkhtmltopdf
wkhtmltopdf --version

# Si no está instalado
sudo apt install -y wkhtmltopdf
```

---

## 📝 NOTAS FINALES

1. **Diferencias Windows vs Ubuntu:**
   - Rutas: `C:\path\to\file` → `/path/to/file`
   - Line endings: CRLF → LF
   - Permisos: Usuarios y grupos diferentes
   - Servicios: Systemd en lugar de servicios Windows

2. **Buenas prácticas:**
   - Siempre hacer backup antes de cambios importantes
   - Revisar logs regularmente
   - Mantener el sistema actualizado
   - Usar HTTPS en producción
   - Configurar monitoreo (opcional: Sentry, Prometheus, etc.)

3. **GitHub Actions:**
   - Asegúrate de que el Action esté configurado para Ubuntu
   - Actualizar secrets y variables de entorno en GitHub
   - Probar el despliegue automático

---

**¡Migración completada! 🎉**

