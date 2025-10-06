#!/bin/bash
#
# Script de restauración automática de archivos desde backup de Windows
# Migra archivos de instance/uploads y corrige rutas en la base de datos
#

set -e  # Salir si hay algún error

echo "============================================================"
echo "🔄 RESTAURACIÓN DE ARCHIVOS - Windows → Ubuntu"
echo "============================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKUP_FILE="/tmp/instance_backup.tar.gz"
TEMP_DIR="/tmp/instance_restore"
PROJECT_DIR="/opt/nioxtec/Nioxtec_Facturer"
CONTAINER_NAME="nioxtec_facturer-backend-1"

# Verificar que el archivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ ERROR: No se encontró el archivo de backup en $BACKUP_FILE${NC}"
    echo ""
    echo "Por favor, copia primero el archivo desde tu Mac:"
    echo "  scp instance_backup.tar.gz nioxtec@app.nioxtec.es:/tmp/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Backup encontrado: $BACKUP_FILE${NC}"
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${BLUE}📦 Tamaño: $FILE_SIZE${NC}"
echo ""

# Limpiar directorio temporal si existe
if [ -d "$TEMP_DIR" ]; then
    echo -e "${YELLOW}🧹 Limpiando directorio temporal...${NC}"
    rm -rf "$TEMP_DIR"
fi

# Crear directorio temporal
echo -e "${BLUE}📁 Creando directorio temporal...${NC}"
mkdir -p "$TEMP_DIR"

# Extraer backup
echo -e "${BLUE}📦 Extrayendo backup...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
echo -e "${GREEN}✅ Backup extraído${NC}"
echo ""

# Verificar estructura
if [ ! -d "$TEMP_DIR/instance/uploads" ]; then
    echo -e "${RED}❌ ERROR: La estructura del backup no es correcta${NC}"
    echo "Se esperaba: instance/uploads/"
    echo "Contenido encontrado:"
    ls -la "$TEMP_DIR"
    exit 1
fi

# Mostrar estadísticas del backup
echo -e "${BLUE}📊 Contenido del backup:${NC}"
TOTAL_FILES=$(find "$TEMP_DIR/instance/uploads" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$TEMP_DIR/instance/uploads" | cut -f1)
echo -e "  Archivos: ${GREEN}$TOTAL_FILES${NC}"
echo -e "  Tamaño total: ${GREEN}$TOTAL_SIZE${NC}"
echo ""

# Detener backend temporalmente
echo -e "${YELLOW}⏸️  Deteniendo backend...${NC}"
cd "$PROJECT_DIR"
docker compose stop backend
echo ""

# Backup de la carpeta actual (por seguridad)
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
if [ -d "$PROJECT_DIR/instance/uploads" ]; then
    echo -e "${BLUE}💾 Creando backup de seguridad de uploads actuales...${NC}"
    mv "$PROJECT_DIR/instance/uploads" "$PROJECT_DIR/instance/uploads.backup_$BACKUP_DATE"
    echo -e "${GREEN}✅ Backup guardado en: instance/uploads.backup_$BACKUP_DATE${NC}"
    echo ""
fi

# Copiar archivos restaurados
echo -e "${BLUE}📋 Copiando archivos restaurados...${NC}"
cp -r "$TEMP_DIR/instance/uploads" "$PROJECT_DIR/instance/"
echo -e "${GREEN}✅ Archivos copiados${NC}"
echo ""

# Ajustar permisos
echo -e "${BLUE}🔐 Ajustando permisos...${NC}"
chown -R nioxtec:nioxtec "$PROJECT_DIR/instance/uploads"
chmod -R 755 "$PROJECT_DIR/instance/uploads"
echo -e "${GREEN}✅ Permisos ajustados${NC}"
echo ""

# Iniciar backend
echo -e "${BLUE}▶️  Iniciando backend...${NC}"
docker compose up -d backend
sleep 5
echo -e "${GREEN}✅ Backend iniciado${NC}"
echo ""

# Migrar rutas en la base de datos
echo -e "${BLUE}🔄 Migrando rutas Windows → Unix...${NC}"
echo ""

# Crear script Python de migración temporal
cat > /tmp/migrate_paths.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def migrate_paths():
    with app.app_context():
        all_docs = ClientDocument.query.all()
        docs_to_fix = [doc for doc in all_docs if '\\' in doc.stored_path]
        
        if not docs_to_fix:
            print('✅ No hay rutas con backslashes - la migración no es necesaria')
            return
        
        print(f'📊 Documentos con backslashes: {len(docs_to_fix)}')
        print()
        
        fixed = 0
        not_found = 0
        
        for doc in docs_to_fix:
            old_path = doc.stored_path
            new_path = old_path.replace('\\', '/')
            new_abs = os.path.join(UPLOADS_ROOT, new_path)
            
            if os.path.isfile(new_abs):
                doc.stored_path = new_path
                fixed += 1
                print(f'✅ ID {doc.id}: {doc.filename}')
            else:
                not_found += 1
                print(f'⚠️  ID {doc.id}: Archivo no encontrado - {doc.filename}')
        
        if fixed > 0:
            db.session.commit()
            print()
            print(f'✅ Migración completada: {fixed} rutas corregidas')
            if not_found > 0:
                print(f'⚠️  {not_found} archivos no encontrados (permanecerán con rutas antiguas)')
        else:
            print('❌ No se pudo migrar ninguna ruta')

if __name__ == '__main__':
    migrate_paths()
PYTHON_SCRIPT

# Copiar script al contenedor y ejecutar
docker cp /tmp/migrate_paths.py "$CONTAINER_NAME":/tmp/migrate.py
docker compose exec backend python3 /tmp/migrate.py

echo ""
echo "============================================================"
echo -e "${GREEN}🎉 RESTAURACIÓN COMPLETADA${NC}"
echo "============================================================"
echo ""
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "  ✅ Archivos restaurados: ${GREEN}$TOTAL_FILES${NC}"
echo -e "  ✅ Tamaño total: ${GREEN}$TOTAL_SIZE${NC}"
echo -e "  ✅ Rutas migradas a formato Unix"
echo -e "  ✅ Backend reiniciado"
echo ""
echo -e "${YELLOW}💡 Verificación:${NC}"
echo "  1. Accede a la aplicación"
echo "  2. Navega a un cliente con documentos/imágenes"
echo "  3. Verifica que los archivos se visualizan correctamente"
echo ""

# Limpiar archivos temporales
echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
rm -rf "$TEMP_DIR"
rm -f /tmp/migrate_paths.py
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""
