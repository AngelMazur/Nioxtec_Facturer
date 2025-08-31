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
export FLASK_DEBUG=1
export FLASK_ENV=development
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"

# Iniciar servidor Flask
echo "🚀 Iniciando servidor Flask en puerto $PORT..."
python app.py
