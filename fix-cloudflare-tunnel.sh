#!/bin/bash

# Script para corregir la configuración de Cloudflare Tunnel
# Elimina api.nioxtec.es del túnel para evitar problemas de CORS
# El backend será accesible vía app.nioxtec.es/api (proxy de Nginx)

echo "🔧 Corrección de Cloudflare Tunnel - Eliminar api.nioxtec.es"
echo "============================================================"
echo ""

# Verificar que existe el archivo de configuración
if [ ! -f "/etc/cloudflared/config.yml" ]; then
    echo "❌ Error: No se encontró /etc/cloudflared/config.yml"
    exit 1
fi

# Hacer backup
echo "📦 Creando backup de la configuración actual..."
sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.backup_$(date +%Y%m%d_%H%M%S)

# Copiar nueva configuración
echo "📝 Aplicando nueva configuración..."
sudo cp cloudflared-config-fixed.yml /etc/cloudflared/config.yml

# Mostrar la nueva configuración
echo ""
echo "✅ Nueva configuración:"
echo "---"
cat /etc/cloudflared/config.yml
echo "---"
echo ""

# Reiniciar cloudflared
echo "🔄 Reiniciando cloudflared..."
sudo systemctl restart cloudflared

# Verificar estado
echo ""
echo "📊 Estado del servicio:"
sudo systemctl status cloudflared --no-pager -l | head -20

echo ""
echo "✅ Configuración aplicada correctamente"
echo ""
echo "📝 IMPORTANTE:"
echo "   - app.nioxtec.es → acceso completo (frontend + API vía /api)"
echo "   - api.nioxtec.es → ELIMINADO (ya no es necesario)"
echo ""
echo "🔧 Si quieres mantener api.nioxtec.es, necesitarás:"
echo "   1. Agregar CORS en el backend para ambos dominios"
echo "   2. O usar solo app.nioxtec.es (recomendado)"
echo ""
