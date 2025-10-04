#!/bin/bash

# Script de verificación pre-merge
# Verifica que los servicios principales estén funcionando

echo "🔍 Iniciando verificación pre-merge..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Función para verificar endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Verificando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_code" ] || [ "$response" == "200" ] || [ "$response" == "302" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
        ((FAILED++))
        return 1
    fi
}

# Verificar que los servicios estén corriendo
echo "📡 Verificando servicios..."
echo ""

# Backend
check_endpoint "Backend Health" "http://localhost:5001/health"
sleep 1

# Frontend
check_endpoint "Frontend" "http://localhost:5173"
sleep 1

# API Endpoints
echo ""
echo "🔌 Verificando API endpoints..."
echo ""

check_endpoint "API Clientes" "http://localhost:5001/api/clientes"
sleep 1

check_endpoint "API Facturas" "http://localhost:5001/api/facturas"
sleep 1

check_endpoint "API Productos" "http://localhost:5001/api/productos"
sleep 1

check_endpoint "API Gastos" "http://localhost:5001/api/gastos"
sleep 1

check_endpoint "API Stats" "http://localhost:5001/api/stats"
sleep 1

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Pruebas pasadas:  ${GREEN}$PASSED${NC}"
echo -e "Pruebas fallidas: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS VERIFICACIONES PASARON${NC}"
    echo ""
    echo "👉 Ahora realiza las pruebas manuales:"
    echo "   1. Navega por todas las páginas"
    echo "   2. Crea/edita/elimina registros"
    echo "   3. Genera PDFs"
    echo "   4. Verifica la consola del navegador"
    echo ""
    echo "Si todo funciona correctamente, estás listo para merge a main."
    exit 0
else
    echo -e "${RED}❌ HAY ERRORES QUE CORREGIR${NC}"
    echo ""
    echo "Por favor, revisa los servicios que fallaron y corrígelos."
    echo "NO hagas merge a main hasta que todas las verificaciones pasen."
    exit 1
fi
