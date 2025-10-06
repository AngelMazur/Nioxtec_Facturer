#!/bin/bash
#
# Script de restauración de imágenes de productos
#

set -e

echo "============================================================"
echo "🔄 RESTAURACIÓN DE IMÁGENES DE PRODUCTOS"
echo "============================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_FILE="/tmp/products_backup.tar.gz"
TEMP_DIR="/tmp/products_restore"
PROJECT_DIR="/opt/nioxtec/Nioxtec_Facturer"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ ERROR: No se encontró el archivo de backup en $BACKUP_FILE${NC}"
    echo ""
    echo "Por favor, copia primero el archivo desde tu Mac:"
    echo "  scp products_backup.tar.gz nioxtec@app.nioxtec.es:/tmp/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Backup encontrado: $BACKUP_FILE${NC}"
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${BLUE}📦 Tamaño: $FILE_SIZE${NC}"
echo ""

# Limpiar directorio temporal
if [ -d "$TEMP_DIR" ]; then
    echo -e "${YELLOW}🧹 Limpiando directorio temporal...${NC}"
    rm -rf "$TEMP_DIR"
fi

# Crear directorio temporal
echo -e "${BLUE}📁 Creando directorio temporal...${NC}"
mkdir -p "$TEMP_DIR"

# Extraer backup
echo -e "${BLUE}📦 Extrayendo backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR" 2>&1 | grep -v "Ignoring unknown extended header" || true
echo -e "${GREEN}✅ Backup extraído${NC}"
echo ""

# Verificar estructura
if [ -d "$TEMP_DIR/products" ]; then
    # Estructura: products/ directamente
    echo -e "${GREEN}✅ Carpeta products encontrada directamente${NC}"
    mkdir -p "$TEMP_DIR/static/uploads"
    mv "$TEMP_DIR/products" "$TEMP_DIR/static/uploads/"
elif [ ! -d "$TEMP_DIR/static/uploads/products" ]; then
    echo -e "${YELLOW}⚠️  Estructura no estándar, buscando carpeta products...${NC}"
    
    # Buscar carpeta products
    PRODUCTS_DIR=$(find "$TEMP_DIR" -type d -name "products" | head -1)
    
    if [ -z "$PRODUCTS_DIR" ]; then
        echo -e "${RED}❌ ERROR: No se encontró la carpeta 'products'${NC}"
        echo "Contenido del backup:"
        ls -la "$TEMP_DIR"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Carpeta products encontrada en: $PRODUCTS_DIR${NC}"
    
    # Crear estructura correcta
    mkdir -p "$TEMP_DIR/static/uploads"
    cp -r "$PRODUCTS_DIR" "$TEMP_DIR/static/uploads/"
fi

# Contar archivos
TOTAL_FILES=$(find "$TEMP_DIR/static/uploads/products" -type f ! -name "._*" | wc -l)
TOTAL_SIZE=$(du -sh "$TEMP_DIR/static/uploads/products" | cut -f1)

echo -e "${BLUE}📊 Contenido del backup:${NC}"
echo -e "  Imágenes: ${GREEN}$TOTAL_FILES${NC}"
echo -e "  Tamaño total: ${GREEN}$TOTAL_SIZE${NC}"
echo ""

# Detener backend temporalmente
echo -e "${YELLOW}⏸️  Deteniendo backend...${NC}"
cd "$PROJECT_DIR"
docker compose stop backend
echo ""

# Backup de la carpeta actual
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
if [ -d "$PROJECT_DIR/static/uploads/products" ]; then
    echo -e "${BLUE}💾 Creando backup de productos actuales...${NC}"
    mkdir -p "$PROJECT_DIR/static/uploads"
    mv "$PROJECT_DIR/static/uploads/products" "$PROJECT_DIR/static/uploads/products.backup_$BACKUP_DATE"
    echo -e "${GREEN}✅ Backup guardado en: static/uploads/products.backup_$BACKUP_DATE${NC}"
    echo ""
fi

# Crear directorio si no existe
mkdir -p "$PROJECT_DIR/static/uploads"

# Copiar archivos restaurados
echo -e "${BLUE}📋 Copiando imágenes de productos...${NC}"
cp -r "$TEMP_DIR/static/uploads/products" "$PROJECT_DIR/static/uploads/"
echo -e "${GREEN}✅ Imágenes copiadas${NC}"
echo ""

# Eliminar archivos de metadata de macOS
echo -e "${BLUE}🧹 Limpiando archivos de metadata de macOS...${NC}"
find "$PROJECT_DIR/static/uploads/products" -name "._*" -type f -delete
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

# Ajustar permisos
echo -e "${BLUE}🔐 Ajustando permisos...${NC}"
chown -R nioxtec:nioxtec "$PROJECT_DIR/static/uploads/products"
chmod -R 755 "$PROJECT_DIR/static/uploads/products"
echo -e "${GREEN}✅ Permisos ajustados${NC}"
echo ""

# Iniciar backend
echo -e "${BLUE}▶️  Iniciando backend...${NC}"
docker compose up -d backend
sleep 3
echo -e "${GREEN}✅ Backend iniciado${NC}"
echo ""

echo "============================================================"
echo -e "${GREEN}🎉 RESTAURACIÓN COMPLETADA${NC}"
echo "============================================================"
echo ""
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "  ✅ Imágenes restauradas: ${GREEN}$TOTAL_FILES${NC}"
echo -e "  ✅ Tamaño total: ${GREEN}$TOTAL_SIZE${NC}"
echo ""
echo -e "${YELLOW}💡 Verificación:${NC}"
echo "  1. Recarga la página de Productos"
echo "  2. Verifica que las imágenes se muestran correctamente"
echo ""

# Limpiar temporal
echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""
