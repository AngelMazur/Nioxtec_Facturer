#!/bin/bash
# ========================================
# SCRIPT DE DESARROLLO - Todo
# ========================================
# Inicia Backend (5001) + Frontend (5173)
# Modo: Desarrollo (sin Docker)
# ========================================

# Script para iniciar el proyecto completo en modo desarrollo
# Inicia tanto el backend Flask como el frontend React

echo "🚀 Iniciando Nioxtec Facturer en modo desarrollo..."
echo ""

# Función para limpiar procesos al salir (solo detiene los PIDs que este script arrancó)
cleanup() {
  echo ""
  echo "🛑 Deteniendo servidores..."
  if [ -n "$FRONTEND_PID" ]; then
    echo "Deteniendo frontend (pid=$FRONTEND_PID)"
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    echo "Deteniendo backend (pid=$BACKEND_PID)"
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  echo "✅ Servidores detenidos"
  exit 0
}

# Capturar Ctrl+C/TERM para limpiar procesos
trap cleanup SIGINT SIGTERM

# Iniciar backend en segundo plano
echo "🔧 Iniciando backend Flask..."
# Valores por defecto que el usuario puede sobreescribir en su shell antes de lanzar el script
: "${FLASK_DEBUG:=true}"
: "${FLASK_ENV:=development}"
: "${PORT:=5001}"
: "${CORS_ORIGINS:=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080}"
export FLASK_DEBUG FLASK_ENV CORS_ORIGINS PORT

DEV_DB_FILE="$PWD/instance/app.dev.db"
DEFAULT_DB_FILE="$PWD/instance/app.db"
if [ ! -f "$DEV_DB_FILE" ] && [ -f "$DEFAULT_DB_FILE" ]; then
  echo "📁 Creando copia de base de datos para dev (instance/app.dev.db)..."
  cp "$DEFAULT_DB_FILE" "$DEV_DB_FILE"
fi
if [ -f "$DEV_DB_FILE" ]; then
  export DATABASE_URL="sqlite:///$DEV_DB_FILE"
  echo "🗄️  Usando base de datos de desarrollo: $DEV_DB_FILE"
else
  echo "⚠️  No se encontró instance/app.dev.db; se usará la base por defecto."
fi

HOST_IP=$(hostname -I | awk '{print $1}')
if [ -n "$HOST_IP" ]; then
    export CORS_ORIGINS="$CORS_ORIGINS,http://$HOST_IP:5173,http://$HOST_IP:8080"
fi

# Asegurar logs
mkdir -p logs

# Activar venv si existe
if [ -f venv/bin/activate ]; then
  # shellcheck disable=SC1091
  source venv/bin/activate
fi

# Helper: probar health endpoint
is_backend_healthy() {
  curl -s --max-time 2 "http://localhost:$PORT/health" >/dev/null 2>&1
}

# Si ya hay algo respondiendo al health, no arrancamos otro backend
if is_backend_healthy; then
  echo "ℹ️  Backend ya responde en http://localhost:$PORT - no se arrancará uno nuevo"
  # intentar obtener PID del proceso que escucha el puerto (si existe)
  BACKEND_PID=$(ss -ltnp 2>/dev/null | awk -v port=":$PORT" '$4 ~ port { match($0, /pid=([0-9]+)/, m); if (m[1]) print m[1] }' | head -n1)
  if [ -n "$BACKEND_PID" ]; then
    echo "ℹ️  PID existente del backend: $BACKEND_PID"
  fi
else
  echo "🔧 Iniciando backend Flask (usar scripts/start_backend.sh -> logs/backend.log)..."
  # Usar el script consistente que prepara venv/pip/etc. Redirigir logs a logs/backend.log
  PORT=$PORT CORS_ORIGINS="$CORS_ORIGINS" ./scripts/start_backend.sh > logs/backend.log 2>&1 &
  BACKEND_PID=$!
fi

# Esperar un momento para que el backend se inicie
sleep 3

# Verificar que el backend esté funcionando
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend iniciado en http://localhost:5001"
else
    echo "❌ Error: Backend no se pudo iniciar"
    cleanup
fi

echo ""

# Iniciar frontend
echo "⚛️  Iniciando frontend React... (logs/frontend.log)"
cd frontend || { echo "No se encontró carpeta frontend"; cleanup; }
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd - >/dev/null || true

# Esperar un momento para que el frontend se inicie
sleep 5

# Verificar que el frontend esté funcionando
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend iniciado en http://localhost:5173"
else
    echo "❌ Error: Frontend no se pudo iniciar"
    cleanup
fi

echo ""
echo "🎉 ¡Proyecto iniciado correctamente!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5001"
echo "📊 Health:   http://localhost:5001/health"
echo ""
echo "Presiona Ctrl+C para detener todos los servidores"
echo ""

# Mantener el script ejecutándose
wait
