#!/bin/bash
# ============================================================================
# Script de Instalación de Autoarranque - Nioxtec Facturer
# ============================================================================
# Este script configura la aplicación para que se inicie automáticamente
# al arrancar el sistema (después de un reinicio de la Odroid)
#
# Uso: sudo bash deploy/install_autostart.sh
# ============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script debe ejecutarse con sudo${NC}"
    echo "Uso: sudo bash deploy/install_autostart.sh"
    exit 1
fi

# Modo de instalación (siempre Docker)
MODE="docker"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 INSTALACIÓN DE AUTOARRANQUE - NIOXTEC FACTURER${NC}"
echo -e "${BLUE}🐳 Usando Docker Compose${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Directorio del proyecto
PROJECT_DIR="/opt/nioxtec/Nioxtec_Facturer"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio del proyecto${NC}"
    echo "   Esperado: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# ============================================================================
# INSTALACIÓN DOCKER
# ============================================================================
if [ "$MODE" = "docker" ]; then
    echo -e "${BLUE}🐳 Configurando autoarranque con Docker Compose...${NC}"
    echo ""
    
    # Verificar que Docker esté instalado
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        echo "   Instala Docker primero: https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    # Verificar que Docker Compose esté instalado
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está instalado${NC}"
        echo "   Instala Docker Compose primero"
        exit 1
    fi
    
    # Habilitar Docker para arrancar con el sistema
    echo -e "  📌 Habilitando Docker para iniciar con el sistema..."
    systemctl enable docker
    
    # Copiar archivo de servicio
    echo -e "  📋 Copiando archivo de servicio systemd..."
    cp deploy/nioxtec-facturer.service /etc/systemd/system/
    
    # Recargar systemd
    echo -e "  🔄 Recargando systemd..."
    systemctl daemon-reload
    
    # Habilitar servicio
    echo -e "  ✅ Habilitando servicio nioxtec-facturer..."
    systemctl enable nioxtec-facturer.service
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ INSTALACIÓN COMPLETADA (Docker)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "📝 El servicio está configurado y se iniciará automáticamente al reiniciar."
    echo ""
    echo -e "🔧 Comandos útiles:"
    echo -e "   Iniciar ahora:       ${YELLOW}sudo systemctl start nioxtec-facturer${NC}"
    echo -e "   Detener:             ${YELLOW}sudo systemctl stop nioxtec-facturer${NC}"
    echo -e "   Reiniciar:           ${YELLOW}sudo systemctl restart nioxtec-facturer${NC}"
    echo -e "   Ver estado:          ${YELLOW}sudo systemctl status nioxtec-facturer${NC}"
    echo -e "   Ver logs:            ${YELLOW}sudo journalctl -u nioxtec-facturer -f${NC}"
    echo -e "   Deshabilitar:        ${YELLOW}sudo systemctl disable nioxtec-facturer${NC}"
    echo ""
    echo -e "🧪 Para probar el autoarranque:"
    echo -e "   ${YELLOW}sudo reboot${NC}"
    echo ""
    
    # Preguntar si quiere iniciar ahora
    read -p "¿Quieres iniciar el servicio ahora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo -e "${BLUE}🚀 Iniciando servicio...${NC}"
        systemctl start nioxtec-facturer
        sleep 3
        systemctl status nioxtec-facturer --no-pager
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
