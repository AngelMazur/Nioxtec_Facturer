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
- [ ] Smoke test manual:
  - [ ] Login
  - [ ] Crear cliente
  - [ ] Crear factura y generar PDF
  - [ ] Reporte mensual
- [ ] Monitoreo/Sentry sin errores críticos
- [ ] Documentar en `PHASES_HISTORY.md`

Rollback
- [ ] `alembic downgrade -1`
- [ ] Reiniciar servicio
- [ ] Verificar `/health`
- [ ] Registrar incidencia y revertir tag si procede
