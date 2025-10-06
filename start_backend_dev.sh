#!/bin/bash
# ========================================
# SCRIPT DE DESARROLLO - Backend
# ========================================
# Puerto: 5001
# Modo: Desarrollo (Flask debug)
# Hot reload: SÍ
# ========================================

# Script para iniciar el backend Flask en modo desarrollo
# Configura automáticamente CORS para desarrollo local

echo "🚀 Iniciando backend Flask en modo desarrollo..."

# Configurar variables de entorno para desarrollo
export FLASK_DEBUG=true
export FLASK_ENV=development
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
export PORT=5001

# Activar entorno virtual
source venv/bin/activate

# Verificar que las dependencias estén instaladas
echo "📦 Verificando dependencias..."
pip install -r requirements.txt > /dev/null 2>&1

# Iniciar servidor
echo "🌐 Servidor iniciado en http://localhost:5001"
echo "📋 Configuración CORS: $CORS_ORIGINS"
echo "🔧 Modo debug: $FLASK_DEBUG"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

python app.py
