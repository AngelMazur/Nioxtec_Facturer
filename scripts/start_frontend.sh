#!/bin/bash
# Script para levantar el frontend Vite en desarrollo local (macOS/Linux)

echo "🚀 Iniciando frontend Vite..."
cd "$(dirname "$0")/../frontend"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use node
npm run dev
