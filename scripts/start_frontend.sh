#!/bin/bash
# Script para levantar el frontend Vite en desarrollo local (macOS/Linux)

echo "🚀 Iniciando frontend Vite..."
cd "$(dirname "$0")/../frontend"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# Forzar Node 22 para compatibilidad con Vite 7
nvm use 22 >/dev/null 2>&1 || nvm install 22 --latest-npm
npm run dev
