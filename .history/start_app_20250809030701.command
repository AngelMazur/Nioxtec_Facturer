#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 1) Levantar Postgres + backend + frontend con Docker Compose si está disponible
if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
  echo "Iniciando con Docker Compose..."
  docker-compose up -d
  echo "Servicios levantados: http://localhost:8080 (frontend) y http://127.0.0.1:5000 (API)"
  open "http://localhost:8080"
  exit 0
fi

echo "Docker Compose no está disponible. Usando modo local (venv + servidor estático)."

# 2) Modo local: iniciar backend Flask y servir frontend build

# Crear venv si no existe
if [ ! -d "$SCRIPT_DIR/venv" ]; then
  echo "Creando entorno virtual..."
  python3 -m venv "$SCRIPT_DIR/venv"
fi

source "$SCRIPT_DIR/venv/bin/activate"

echo "Instalando dependencias backend..."
pip install -r "$SCRIPT_DIR/requirements.txt"

# Detectar Postgres local (127.0.0.1:5432). Si no responde, NO forzar DATABASE_URL y se usará SQLite.
USE_PG=false
if command -v pg_isready >/dev/null 2>&1; then
  if pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then USE_PG=true; fi
elif command -v nc >/dev/null 2>&1; then
  if nc -z 127.0.0.1 5432 >/dev/null 2>&1; then USE_PG=true; fi
fi

if [ "$USE_PG" = "true" ]; then
  export DATABASE_URL="postgresql+psycopg://niox:nioxpass@127.0.0.1:5432/nioxtec"
  echo "Usando Postgres local en 127.0.0.1:5432"
else
  unset DATABASE_URL
  echo "Postgres no detectado. Usando SQLite local (instance/app.db)."
fi
export FLASK_DEBUG=${FLASK_DEBUG:-"true"}

# Si el puerto 5000 está ocupado, matar proceso Flask anterior
if lsof -i tcp:5000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Liberando puerto 5000..."
  lsof -ti tcp:5000 -sTCP:LISTEN | xargs kill -9 || true
fi

echo "Levantando backend (Flask) en background..."
cd "$SCRIPT_DIR" && nohup python app.py >/tmp/nioxtec_backend.log 2>&1 &

# 3) Frontend
echo "Instalando dependencias frontend..."
cd "$SCRIPT_DIR/frontend" && npm install --silent

echo "Construyendo frontend..."
npm run -s build

# Si el puerto 8080 está ocupado, liberar
if lsof -i tcp:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Liberando puerto 8080..."
  lsof -ti tcp:8080 -sTCP:LISTEN | xargs kill -9 || true
fi

echo "Sirviendo frontend (http://localhost:8080)..."
nohup npx -y serve -s dist -l 8080 >/tmp/nioxtec_frontend.log 2>&1 &

sleep 2
open "http://localhost:8080"
echo "Todo listo. Logs: /tmp/nioxtec_backend.log y /tmp/nioxtec_frontend.log"


