#!/bin/bash

# ============================================================================
# Script de Verificación de Estado de Producción
# ============================================================================
# Este script verifica el estado del despliegue en producción después del merge
# Uso: ./check_production_status.sh [PRODUCTION_URL]
#
# Ejemplo:
#   ./check_production_status.sh https://mi-servidor-produccion.com
#
# Si no se proporciona URL, usa localhost:5001 (para testing local)
# ============================================================================

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL base de producción
PROD_URL="${1:-http://localhost:5001}"
API_URL="${PROD_URL}/api"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 VERIFICACIÓN DE ESTADO DE PRODUCCIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📡 URL Base: ${YELLOW}${PROD_URL}${NC}"
echo -e "📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Contador de tests
total=0
passed=0
failed=0

# Función para tests
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local token="$4"
    
    total=$((total + 1))
    
    echo -n "  Testing: ${name}... "
    
    if [ -z "$token" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${token}" "${url}" || echo "000")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP ${response})"
        passed=$((passed + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: ${expected_status}, Got: ${response})"
        failed=$((failed + 1))
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 TESTS BÁSICOS (Sin autenticación)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Health Check
test_endpoint "Backend Health Check" "${API_URL}/health" "200"

# Test 2: Frontend (si existe)
if curl -s "${PROD_URL}" > /dev/null 2>&1; then
    test_endpoint "Frontend Root" "${PROD_URL}" "200"
else
    echo -e "  Testing: Frontend Root... ${YELLOW}⚠️  SKIP${NC} (Puede no estar en esta URL)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 TESTS DE AUTENTICACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 3: Endpoints protegidos sin token (deben dar 401)
test_endpoint "Clientes (sin token)" "${API_URL}/clients" "401"
test_endpoint "Facturas (sin token)" "${API_URL}/invoices" "401"
test_endpoint "Productos (sin token)" "${API_URL}/products" "401"
test_endpoint "Gastos (sin token)" "${API_URL}/expenses" "401"

echo ""
echo -e "${YELLOW}⚠️  NOTA: Para tests completos con autenticación, necesitas un JWT token válido.${NC}"
echo -e "${YELLOW}   Puedes obtenerlo haciendo login y luego ejecutar:${NC}"
echo -e "${YELLOW}   TOKEN='tu_token_jwt' ./check_production_status.sh${NC}"

# Si hay un token en variable de entorno, hacer tests autenticados
if [ -n "$TOKEN" ]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔓 TESTS AUTENTICADOS (con JWT)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    test_endpoint "Clientes (con token)" "${API_URL}/clients" "200" "$TOKEN"
    test_endpoint "Facturas (con token)" "${API_URL}/invoices" "200" "$TOKEN"
    test_endpoint "Productos (con token)" "${API_URL}/products" "200" "$TOKEN"
    test_endpoint "Gastos (con token)" "${API_URL}/expenses" "200" "$TOKEN"
    test_endpoint "Contratos (con token)" "${API_URL}/contracts" "200" "$TOKEN"
fi

# Test de GitHub Action
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🤖 ESTADO DE GITHUB ACTIONS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Para verificar el despliegue automático, visita:"
echo -e "  ${YELLOW}https://github.com/AngelMazur/Nioxtec_Facturer/actions${NC}"
echo ""

# Resumen
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMEN DE TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total:    ${total}"
echo -e "  Pasados:  ${GREEN}${passed}${NC}"
echo -e "  Fallados: ${RED}${failed}${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
