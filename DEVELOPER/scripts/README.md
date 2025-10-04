# Scripts de Desarrollo y Deployment

Carpeta con utilidades para desarrollo, diagnóstico y deployment manual.

## 🚀 Deploy Manual

**Archivo:** `manual_deploy.ps1`

Script para hacer deploy manual cuando GitHub Actions falle o para deploys locales urgentes.

### Cuándo usar:
- GitHub Actions falló o no se ejecutó
- Necesitas deploy urgente sin esperar al CI/CD
- Estás probando cambios localmente antes de push

### Cómo usar:
```powershell
# Desde PowerShell con permisos de administrador:
cd C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts
.\manual_deploy.ps1
```

### Qué hace:
1. ✅ Actualiza código desde GitHub (`git pull`)
2. ✅ Detiene todos los servicios (Backend, Frontend, Cloudflare)
3. ✅ Mata procesos Python para limpiar código cacheado
4. ✅ **Limpia caché de Python** (`__pycache__` y `.pyc`)
5. ✅ **Recompila frontend** con `npm ci` + `npm run build`
6. ✅ Reinicia todos los servicios
7. ✅ Verifica que todo esté funcionando

### Tiempo estimado:
- **2-3 minutos** (dependiendo de `npm ci`)

---

## 📋 Otros Scripts de Desarrollo

## Inventario
- `create_sample_products.py` — Crea productos de ejemplo vía API (login admin/admin en dev).
- `debug_bold_detection.py` — Analiza negritas en plantillas DOCX (contratos).
- `debug_env.py` — Imprime variables relevantes y el cálculo de CORS.
- `debug_frontend.py` — Diagnóstico de conexión frontend↔backend y estáticos.
- `diagnostics/debug_contracts.py` — Comprobaciones extendidas del módulo de contratos.
- `legacy/migrate_expense_table.py` — Migración ad‑hoc de la tabla `expense` (solo si aún no usas Alembic 0002+).

## Uso
Ejecuta estos scripts solo en entornos de desarrollo o en servidores de pruebas bajo tu control.

