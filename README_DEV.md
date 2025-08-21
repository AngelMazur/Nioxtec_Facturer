# Nioxtec Facturer - Desarrollo Local

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
./start_dev.sh
```

Este script inicia automáticamente:
- Backend Flask en puerto 5001
- Frontend React en puerto 5173
- Configura CORS correctamente
- Verifica que ambos servidores funcionen

### Opción 2: Inicio Manual

#### Backend Flask
```bash
# Activar entorno virtual
source venv/bin/activate

# Configurar variables de entorno
export FLASK_DEBUG=true
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
export PORT=5001

# Iniciar servidor
python app.py
```

#### Frontend React
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuración CORS

El proyecto está configurado para permitir conexiones desde:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- `http://localhost:8080`
- `http://127.0.0.1:8080`

## 📊 Verificación

### Backend
```bash
curl http://localhost:5001/health
```

### Frontend
```bash
curl http://localhost:5173
```

## 🐛 Solución de Problemas

### Error CORS
Si ves errores de CORS, asegúrate de:
1. Que el backend esté ejecutándose en puerto 5001
2. Que las variables de entorno CORS estén configuradas
3. Que el frontend esté en puerto 5173

### Puerto 5000 ocupado
En macOS, el puerto 5000 puede estar ocupado por AirPlay. El proyecto usa puerto 5001 por defecto.

### Dependencias
```bash
# Backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## 📁 Estructura del Proyecto

```
Nioxtec_Facturer/
├── app.py                 # Backend Flask
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (incluye Gastos.jsx)
│   │   ├── components/    # Componentes
│   │   └── lib/          # Utilidades API
│   └── package.json
├── start_dev.sh          # Script de inicio completo
├── start_backend_dev.sh  # Script solo backend
└── requirements.txt      # Dependencias Python
```

## 🔐 Autenticación

El proyecto usa JWT para autenticación. En desarrollo, puedes usar:
- Usuario: `admin`
- Contraseña: `admin`

## 📝 Módulos Disponibles

- **Clientes**: Gestión de clientes
- **Facturas**: Creación y gestión de facturas/proformas
- **Gastos**: Nuevo módulo para gestión de gastos
- **Reportes**: Reportes y estadísticas
- **Contratos**: Generación de contratos PDF
