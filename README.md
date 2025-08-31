# Nioxtec Facturer

Sistema de gestión de facturas y contratos con backend Flask y frontend React.

## 🌍 Entornos del Proyecto

### 🖥️ Desarrollo
- **Sistema**: macOS (desarrollo remoto)
- **Backend**: Puerto 5001 (evita conflicto con AirPlay)
- **Frontend**: Puerto 5173 (Vite dev server)
- **Base de datos**: SQLite local

### 🖥️ Producción
- **Sistema**: Windows Server (servidor local)
- **Backend**: Puerto 5000
- **Frontend**: Puerto 8080 (archivos estáticos)
- **Base de datos**: PostgreSQL
- **Acceso**: Túneles Cloudflare (api.nioxtec.es, app.nioxtec.es)

## 🚀 Inicio Rápido

### Desarrollo Local (macOS/Linux)

```bash
# 1. Clonar repositorio
git clone git@github.com:AngelMazur/Nioxtec_Facturer.git
cd Nioxtec_Facturer

# 2. Configurar backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configurar frontend
cd frontend
npm install

# 4. Iniciar todo (recomendado)
cd ..
./start_all.sh
```

**O iniciar por separado:**
```bash
# Backend (puerto 5001)
./start_backend.sh

# Frontend (puerto 5173)
./start_frontend.sh
```

### Producción (Windows Server)

```powershell
# Despliegue automático
.\DEVELOPER\scripts\deploy_prod.ps1
```

## 📋 Requisitos

- **Python**: 3.11+
- **Node.js**: 20+ (recomendado usar nvm)
- **Sistema**: macOS/Linux (desarrollo), Windows Server (producción)

## 🏗️ Arquitectura

### Desarrollo (macOS)
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   React + Vite  │◄──►│   Flask         │
│   Puerto 5173   │    │   Puerto 5001   │
│   (Vite dev)    │    │   (SQLite)      │
└─────────────────┘    └─────────────────┘
```

### Producción (Windows Server)
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   Archivos      │◄──►│   Flask         │
│   Estáticos     │    │   Gunicorn      │
│   Puerto 8080   │    │   Puerto 5000   │
└─────────────────┘    └─────────────────┘
         │                       │
         └─── Cloudflare ────────┘
         │                       │
    https://app.nioxtec.es  https://api.nioxtec.es
```

### Tecnologías

- **Backend**: Flask, SQLAlchemy, Flask-Talisman, Flask-Limiter
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **Base de datos**: SQLite (dev) / PostgreSQL (prod)
- **Generación PDF**: wkhtmltopdf

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Desarrollo
FLASK_ENV=development
JWT_SECRET_KEY=tu_clave_secreta_aqui
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
PORT=5001

# Producción
FORCE_HTTPS=true
DATABASE_URL=postgresql+psycopg://usuario:pass@host:5432/basedatos

# Datos de empresa (usados si no hay registro en DB)
COMPANY_NAME=Mi Empresa S.L.
COMPANY_CIF=B12345678
COMPANY_ADDRESS=Calle Ejemplo 123, Madrid
COMPANY_CITY=Madrid
COMPANY_PROVINCE=Madrid
COMPANY_EMAIL=facturas@miempresa.com
COMPANY_PHONE=600 000 000
COMPANY_IBAN=ES21 1234 5678 9012 3456 7890
COMPANY_WEBSITE=https://miempresa.com
```

### Puertos

- **Desarrollo**: Backend 5001, Frontend 5173
- **Producción**: Backend 5000, Frontend 8080

## 📁 Estructura del Proyecto

```
Nioxtec_Facturer/
├── app.py                    # Backend Flask
├── requirements.txt          # Dependencias Python
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── features/        # Módulos de funcionalidad
│   │   ├── pages/           # Páginas principales
│   │   ├── store/           # Estado global (Zustand)
│   │   └── lib/             # Utilidades y API
│   ├── package.json
│   └── vite.config.js
├── templates/               # Plantillas HTML (facturas)
├── static/                  # Archivos estáticos
└── DEVELOPER/scripts/       # Scripts de despliegue
```

## 🎯 Funcionalidades

### ✅ Gestión de Facturas
- Generación automática de PDFs
- Numeración automática (FAAMM###)
- Plantillas HTML personalizables
- Conversión de proformas a facturas

### ✅ Gestión de Contratos
- Plantillas Word (compraventa, renting)
- Preview en tiempo real
- Descarga en formato Word
- Múltiples tipos de contratos

### ✅ Gestión de Clientes
- CRUD completo
- Información de contacto
- Datos fiscales

### ✅ Reportes
- Análisis de ventas
- Estadísticas de facturación
- Heatmaps de actividad

## 🛠️ Scripts Útiles

### Desarrollo
```bash
./start_all.sh              # Iniciar backend + frontend
./start_backend.sh          # Solo backend
./start_frontend.sh         # Solo frontend
```

### Producción (Windows)
```powershell
.\DEVELOPER\scripts\deploy_prod.ps1      # Despliegue completo
.\DEVELOPER\scripts\start_all.ps1        # Iniciar servicios
.\DEVELOPER\scripts\stop_all.ps1         # Detener servicios
```

## 🔒 Seguridad

- **Autenticación**: JWT con secretos por variables de entorno
- **CORS**: Lista blanca configurada por entorno
- **Rate Limiting**: Flask-Limiter por IP/clave
- **HTTPS**: Flask-Talisman con HSTS y CSP
- **Secretos**: Solo variables de entorno, nunca hardcodeados

## 🚀 Despliegue

### Desarrollo Local (macOS)
```bash
# Backend con gunicorn (producción local)
gunicorn -w 2 -b 0.0.0.0:5000 app:app

# Frontend estático
cd frontend
npm run build
npx serve -s dist -l 8080
```

### Producción (Windows Server)
```powershell
# Despliegue automático con backup y tareas programadas
.\DEVELOPER\scripts\deploy_prod.ps1

# Scripts de gestión de servicios
.\DEVELOPER\scripts\start_all.ps1    # Iniciar servicios
.\DEVELOPER\scripts\stop_all.ps1     # Detener servicios
```

**Nota**: El servidor de producción es Windows Server local con túneles Cloudflare para acceso externo.

## 🔧 Troubleshooting

### Problemas Comunes

**Backend no inicia en macOS:**
```bash
# Puerto 5000 ocupado por AirPlay
PORT=5001 python app.py
```

**Frontend no se conecta:**
```bash
# Verificar configuración API
cat frontend/src/lib/api.js
```

**Errores de dependencias:**
```bash
# Actualizar Node.js
nvm install 20
nvm use 20

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Verificación de Servicios

```bash
# Verificar puertos
netstat -ano | findstr ":5000\|:8080"  # Windows
lsof -i :5001                          # macOS/Linux

# Health check
curl http://localhost:5001/health
curl http://localhost:5173
```

## 📝 Convenciones

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`)
- **Código**: Comentado y con docstrings
- **Estilos**: Exclusivamente Tailwind CSS
- **Precisión**: Máximo 2 decimales
- **Idioma**: Respuestas en español

## 🤝 Contribución

1. Crear rama feature: `git checkout -b feat/nueva-funcionalidad`
2. Hacer cambios y commitear: `git commit -m "feat: nueva funcionalidad"`
3. Ejecutar linter: `npm run lint` (frontend)
4. Push y crear PR

## 📞 Soporte

- **Issues**: GitHub Issues
- **Documentación**: Ver `DEVELOPER/README_DEVELOPER.md`
- **Scripts**: Ver `DEVELOPER/scripts/`

---

**Nioxtec Facturer** - Sistema de gestión empresarial completo y moderno.
