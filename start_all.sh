#!/bin/bash

# Script para iniciar tanto el backend como el frontend
echo "🚀 Iniciando Nioxtec Facturer..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    pkill -f "python app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar backend en background
echo "🔧 Iniciando backend Flask..."
./start_backend.sh &
BACKEND_PID=$!

# Esperar un momento para que el backend se inicie
sleep 3

# Verificar que el backend esté funcionando
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend iniciado correctamente"
else
    echo "❌ Error iniciando backend"
    exit 1
fi

# Iniciar frontend en background
echo "🔧 Iniciando frontend React..."
./start_frontend.sh &
FRONTEND_PID=$!

echo "🎉 Servicios iniciados correctamente!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Mantener el script ejecutándose
wait
