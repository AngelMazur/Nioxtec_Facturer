#!/bin/bash

# Script para iniciar el backend Flask
cd "$(dirname "$0")"

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "🔧 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar/actualizar dependencias siempre (idempotente)
echo "📦 Instalando dependencias Python (requirements.txt)..."
pip install -r requirements.txt >/dev/null

# Configurar variables de entorno para desarrollo
export PORT=5001

DEV_DB_FILE="$PWD/instance/app.dev.db"
DEFAULT_DB_FILE="$PWD/instance/app.db"
if [ ! -f "$DEV_DB_FILE" ] && [ -f "$DEFAULT_DB_FILE" ]; then
  echo "📁 Creando copia de base de datos para dev (instance/app.dev.db)..."
  cp "$DEFAULT_DB_FILE" "$DEV_DB_FILE"
fi
if [ -f "$DEV_DB_FILE" ]; then
  export DATABASE_URL="sqlite:///$DEV_DB_FILE"
  echo "🗄️  Usando base de datos de desarrollo: $DEV_DB_FILE"
else
  echo "⚠️  No se encontró instance/app.dev.db; se usará la base por defecto."
fi

export FLASK_DEBUG=1
export FLASK_ENV=development
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
HOST_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -n "$HOST_IP" ]; then
  export CORS_ORIGINS="$CORS_ORIGINS,http://$HOST_IP:5173,http://$HOST_IP:8080"
fi

# Iniciar servidor Flask
echo "🚀 Iniciando servidor Flask en puerto $PORT..."
python app.py
