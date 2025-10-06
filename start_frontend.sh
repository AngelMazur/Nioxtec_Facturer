#!/bin/bash
# ========================================
# SCRIPT DE DESARROLLO - Frontend
# ========================================
# Puerto: 5173
# Modo: Desarrollo (Vite HMR)
# Hot reload: SÍ
# API: http://localhost:5001
# ========================================

# Script para iniciar el frontend con la versión correcta de Node.js
cd "$(dirname "$0")/frontend"

# Verificar si nvm está disponible
if command -v nvm &> /dev/null; then
    echo "🔧 Configurando Node.js con nvm..."
    nvm use
elif [ -f ~/.nvm/nvm.sh ]; then
    echo "🔧 Cargando nvm..."
    source ~/.nvm/nvm.sh
    nvm use
else
    echo "⚠️  nvm no encontrado. Verificando versión de Node.js..."
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Verificar si la versión es compatible
if [[ "$NODE_VERSION" =~ ^v2[0-9] ]]; then
    echo "✅ Node.js 20+ detectado"
else
    echo "❌ Se requiere Node.js 20+. Versión actual: $NODE_VERSION"
    echo "💡 Instala Node.js 20+ o usa nvm: nvm install 20 && nvm use 20"
    exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar servidor de desarrollo
echo "🚀 Iniciando servidor de desarrollo..."
npm run dev
