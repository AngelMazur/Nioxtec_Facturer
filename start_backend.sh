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

# Instalar dependencias si no existen
if [ ! -f "venv/pyvenv.cfg" ]; then
    echo "📦 Instalando dependencias Python..."
    pip install -r requirements.txt
fi

# Configurar variables de entorno para desarrollo
export PORT=5001
export FLASK_DEBUG=1

# Iniciar servidor Flask
echo "🚀 Iniciando servidor Flask en puerto $PORT..."
python app.py
