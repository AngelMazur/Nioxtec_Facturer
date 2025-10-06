# 🚀 Guía de Desarrollo - Nioxtec Facturer

## � Puertos y Modos

Ver **README_PUERTOS.md** en la raíz del proyecto para información detallada.

### Resumen:
- **Desarrollo:** Backend 5001, Frontend 5173
- **Producción:** Backend 5000 (interno), Web 8080 (Nginx)

## 🖥️ Desarrollo Local (Sin Docker)

### Iniciar Backend:
```bash
./start_backend_dev.sh
```
Puerto: `http://localhost:5001`

### Iniciar Frontend:
```bash
./start_frontend.sh
```
Puerto: `http://localhost:5173`

### Iniciar Ambos:
```bash
./start_dev.sh
```

## 🐳 Producción (Docker)

```bash
# Asegurarse de estar en modo producción
ls docker-compose.override.yml 2>/dev/null && echo "WARN: Modo desarrollo activo"

# Si sale el warning, desactivar desarrollo:
mv docker-compose.override.yml docker-compose.override.yml.dev

# Levantar producción
docker compose up -d
```

## 📝 Ver documentación completa

- **README_PUERTOS.md** - Tabla de puertos y scripts
