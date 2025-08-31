# Checklist de Release (usar en cada despliegue)

- [ ] PR en `main` con CI verde (lint, tests, build frontend)
- [ ] Revisado CHANGELOG o notas de versión
- [ ] Tag creado: `vX.Y.Z`
- [ ] Variables de entorno correctas en runner (Windows):
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET_KEY
  - [ ] WKHTMLTOPDF_PATH
  - [ ] APP_ENV=production
  - [ ] REDIS_URL (si aplica)
- [ ] Backup de la base de datos completado
- [ ] `alembic upgrade head` sin errores
- [ ] Servicio reiniciado (NSSM/IIS/Waitress)
- [ ] `/health` = 200 y versión esperada
- [ ] 401 uniforme `{error, code}` (JWT faltante/inválido/expirado)
- [ ] 429 `{error, code}` al exceder límites
- [ ] Listados aceptan `limit, offset, sort, dir` (clientes/facturas)
- [ ] `LIMITER_STORAGE_URI` usa Redis en prod (fallback mem)
- [ ] (Opcional) Sentry recibe eventos si `SENTRY_DSN` está configurado
- [ ] Smoke test manual:
  - [ ] Login
  - [ ] Crear cliente
  - [ ] Crear factura y generar PDF
  - [ ] Reporte mensual
- [ ] OpenAPI `/apidocs` carga y lista endpoints
- [ ] Validación: peticiones inválidas devuelven 400 con `{error, code}`
- [ ] `/openapi.json` responde 200 y contiene campo `openapi`
- [ ] Preflight CORS sobre endpoints clave (ej. `/api/auth/login`) devuelve cabeceras esperadas (`access-control-allow-origin`, métodos y headers)
- [ ] (Opcional) `DEVELOPER/scripts/check_phase2_local.sh` pasa contra la URL local de backend
- [ ] Monitoreo/Sentry sin errores críticos
- [ ] Documentar en `PHASES_HISTORY.md`

Rollback
- [ ] `alembic downgrade -1`
- [ ] Reiniciar servicio
- [ ] Verificar `/health`
- [ ] Registrar incidencia y revertir tag si procede
