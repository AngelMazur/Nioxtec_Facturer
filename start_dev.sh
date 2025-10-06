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

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    pkill -f "python app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ Servidores detenidos"
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT

# Iniciar backend en segundo plano
echo "🔧 Iniciando backend Flask..."
export FLASK_DEBUG=true
export FLASK_ENV=development
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
export PORT=5001
source venv/bin/activate
python app.py &
BACKEND_PID=$!

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
echo "⚛️  Iniciando frontend React..."
cd frontend
npm run dev &
FRONTEND_PID=$!

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
