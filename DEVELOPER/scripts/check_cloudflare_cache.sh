#!/bin/bash
# =========================================
# Script de Verificación de Caché de Cloudflare
# =========================================
# Compara qué archivos sirve el servidor local vs Cloudflare
# =========================================

set -e

echo "🔍 VERIFICACIÓN DE CACHÉ DE CLOUDFLARE"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Ver qué archivos tiene el servidor local
echo -e "${BLUE}📦 Archivos en servidor local (Docker):${NC}"
LOCAL_INDEX=$(curl -s http://127.0.0.1:8080/ | grep -o 'index-[^"]*\.js' | head -1)
LOCAL_CSS=$(curl -s http://127.0.0.1:8080/ | grep -o 'index-[^"]*\.css' | head -1)
echo "  index.js: $LOCAL_INDEX"
echo "  index.css: $LOCAL_CSS"
echo ""

# 2. Ver qué archivos sirve Cloudflare
echo -e "${BLUE}☁️  Archivos servidos por Cloudflare:${NC}"
CF_INDEX=$(curl -s https://app.nioxtec.es/ | grep -o 'index-[^"]*\.js' | head -1)
CF_CSS=$(curl -s https://app.nioxtec.es/ | grep -o 'index-[^"]*\.css' | head -1)
echo "  index.js: $CF_INDEX"
echo "  index.css: $CF_CSS"
echo ""

# 3. Comparar
echo "========================================"
if [ "$LOCAL_INDEX" = "$CF_INDEX" ]; then
    echo -e "${GREEN}✅ index.js COINCIDE - Caché actualizada${NC}"
else
    echo -e "${RED}❌ index.js NO COINCIDE - Caché obsoleta${NC}"
    echo -e "   Local:      $LOCAL_INDEX"
    echo -e "   Cloudflare: $CF_INDEX"
    echo ""
    echo -e "${YELLOW}🔧 SOLUCIÓN:${NC}"
    echo "   1. Ve al panel de Cloudflare"
    echo "   2. Caching → Configuration"
    echo "   3. Purge Everything"
    echo "   4. Espera 30-60 segundos"
    echo "   5. Vuelve a ejecutar este script"
fi
echo ""

# 4. Ver headers de caché
echo "📋 Headers de caché de Cloudflare:"
curl -s -I https://app.nioxtec.es/ | grep -i "cache\|age\|cf-" | while read line; do
    echo "  $line"
done
echo ""

# 5. Ver si los archivos JS existen
echo "🔍 Verificando si archivos JS existen:"
if [ ! -z "$CF_INDEX" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://app.nioxtec.es/assets/$CF_INDEX")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✅ $CF_INDEX existe (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "  ${RED}❌ $CF_INDEX NO EXISTE (HTTP $HTTP_CODE)${NC}"
        echo -e "     ${YELLOW}Cloudflare está sirviendo un index.html que referencia archivos inexistentes${NC}"
    fi
fi
echo ""

echo "========================================"
echo "✨ Verificación completada"
echo ""
