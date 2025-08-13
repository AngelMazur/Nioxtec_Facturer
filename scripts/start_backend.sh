#!/bin/bash
# Script para levantar el backend Flask en desarrollo local (macOS/Linux)

echo "🚀 Iniciando backend Flask..."
cd "$(dirname "$0")/.."
source venv/bin/activate
PORT=5001 python app.py
