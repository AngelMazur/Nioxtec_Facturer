#!/bin/bash
# Script para arrancar Nioxtec Facturer en macOS de forma automática.
# Puede ejecutarse haciendo doble clic desde Finder o lanzándolo desde la terminal.

cd "$(dirname "$0")"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
  python3 -m venv venv || { echo "Error al crear el entorno virtual"; exit 1; }
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias si es la primera vez
pip install -r requirements.txt

# Iniciar la aplicación Flask
python app.py