#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
  echo "Parando Docker Compose..."
  docker-compose down
  exit 0
fi

# Modo local: matar procesos en puertos 5000 y 8080
if lsof -i tcp:5000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Cerrando puerto 5000..."
  lsof -ti tcp:5000 -sTCP:LISTEN | xargs kill -9 || true
fi
if lsof -i tcp:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Cerrando puerto 8080..."
  lsof -ti tcp:8080 -sTCP:LISTEN | xargs kill -9 || true
fi

echo "Listo. Servicios detenidos."


