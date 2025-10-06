#!/bin/bash
# =========================================
# Script de Verificación de Seguridad
# =========================================
# Verifica que todas las configuraciones de seguridad estén correctas
# Autor: Sistema
# Fecha: 2025-10-06
# =========================================

set -e

# Cambiar al directorio raíz del proyecto
cd "$(dirname "$0")/../.."

echo "🔒 VERIFICACIÓN DE SEGURIDAD"
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar que JWT_SECRET_KEY esté configurado
echo "1. Verificando JWT_SECRET_KEY..."
if [ -f .env ]; then
    if grep -q "JWT_SECRET_KEY=" .env; then
        SECRET=$(grep "JWT_SECRET_KEY=" .env | cut -d'=' -f2)
        if [ "$SECRET" != "change-this-secret" ] && [ ! -z "$SECRET" ]; then
            check_pass "JWT_SECRET_KEY está configurado y no es el valor por defecto"
        else
            check_fail "JWT_SECRET_KEY usa el valor por defecto - CAMBIAR INMEDIATAMENTE"
        fi
    else
        check_fail "JWT_SECRET_KEY no está definido en .env"
    fi
else
    check_fail "Archivo .env no existe"
fi
echo ""

# 2. Verificar que CORS esté configurado para producción
echo "2. Verificando CORS_ORIGINS..."
if [ -f .env ] && grep -q "CORS_ORIGINS=" .env; then
    CORS=$(grep "CORS_ORIGINS=" .env | cut -d'=' -f2)
    if echo "$CORS" | grep -q "app.nioxtec.es"; then
        check_pass "CORS incluye el dominio de producción"
    else
        check_warn "CORS no incluye app.nioxtec.es - verificar si es intencional"
    fi
else
    check_warn "CORS_ORIGINS no está definido (usará valores por defecto)"
fi
echo ""

# 3. Verificar que los puertos estén solo en localhost
echo "3. Verificando exposición de puertos..."
if grep -q "127.0.0.1:5000" docker-compose.yml && grep -q "127.0.0.1:8080" docker-compose.yml; then
    check_pass "Puertos expuestos solo en localhost (seguro detrás de Cloudflare)"
else
    check_fail "Puertos pueden estar expuestos públicamente - REVISAR docker-compose.yml"
fi
echo ""

# 4. Verificar que no haya archivos .env versionados
echo "4. Verificando que .env no esté en git..."
if git check-ignore .env >/dev/null 2>&1; then
    check_pass "Archivo .env está en .gitignore (no se versionará)"
else
    check_warn ".env podría versionarse - verificar .gitignore"
fi
echo ""

# 5. Verificar headers de seguridad en nginx
echo "5. Verificando headers de seguridad en nginx..."
if grep -q "X-Frame-Options" deploy/nginx.conf && \
   grep -q "X-Content-Type-Options" deploy/nginx.conf && \
   grep -q "X-XSS-Protection" deploy/nginx.conf; then
    check_pass "Headers de seguridad configurados en nginx"
else
    check_warn "Algunos headers de seguridad faltan en nginx.conf"
fi
echo ""

# 6. Verificar que instance/uploads tenga los permisos correctos
echo "6. Verificando permisos de directorios sensibles..."
if [ -d instance/uploads ]; then
    PERMS=$(stat -c "%a" instance/uploads)
    if [ "$PERMS" = "755" ] || [ "$PERMS" = "750" ]; then
        check_pass "Permisos de instance/uploads son apropiados ($PERMS)"
    else
        check_warn "Permisos de instance/uploads: $PERMS - verificar si es apropiado"
    fi
else
    check_warn "Directorio instance/uploads no existe"
fi
echo ""

# 7. Verificar que la base de datos no sea accesible públicamente
echo "7. Verificando base de datos..."
if [ -f instance/app.db ]; then
    DB_PERMS=$(stat -c "%a" instance/app.db)
    if [ "$DB_PERMS" = "644" ] || [ "$DB_PERMS" = "640" ] || [ "$DB_PERMS" = "600" ]; then
        check_pass "Permisos de base de datos: $DB_PERMS"
    else
        check_warn "Permisos de base de datos: $DB_PERMS - verificar"
    fi
else
    check_warn "Base de datos no encontrada en instance/app.db"
fi
echo ""

# 8. Verificar que los servicios estén corriendo
echo "8. Verificando servicios Docker..."
cd "$(dirname "$0")/../.."
if docker compose ps | grep -q "backend.*Up" && docker compose ps | grep -q "web.*Up"; then
    check_pass "Servicios backend y web están corriendo"
else
    check_fail "Algunos servicios no están corriendo"
fi
echo ""

# 9. Probar autenticación JWT
echo "9. Probando autenticación JWT..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/clients)
if [ "$RESPONSE" = "401" ]; then
    check_pass "Endpoint protegido requiere autenticación (401)"
else
    check_warn "Endpoint /api/clients devolvió código: $RESPONSE (esperado: 401)"
fi
echo ""

# 10. Verificar que index.html no se cachee
echo "10. Verificando configuración de caché..."
if grep -q "no-cache.*index.html" deploy/nginx.conf || grep -q "no-store" deploy/nginx.conf; then
    check_pass "index.html configurado para no cachearse"
else
    check_warn "index.html podría cachearse - verificar deploy/nginx.conf"
fi
echo ""

# Resumen
echo "========================================"
echo "✨ Verificación completada"
echo ""
echo "📋 Acciones recomendadas:"
echo "   - Si hay errores (❌), corregirlos INMEDIATAMENTE"
echo "   - Si hay advertencias (⚠️), revisarlas según contexto"
echo "   - Ejecutar este script después de cada despliegue"
echo ""
