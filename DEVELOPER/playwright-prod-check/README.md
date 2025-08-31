# Playwright – Comprobación Prod (Documentación Clientes)

Este paquete valida que los enlaces de documentación en Clientes NO incluyan `?token=` y que las descargas funcionen con cookies JWT.

## Requisitos
- Node.js 18+
- Haber iniciado sesión en `https://app.nioxtec.es` para capturar el estado de sesión (cookies)

## Uso rápido

1) Instalar dependencias

```bash
cd Nioxtec_Facturer/DEVELOPER/playwright-prod-check
npm install
```

2) Capturar sesión (login) y guardar `auth.json`

```bash
npx playwright codegen https://app.nioxtec.es --save-storage=auth.json
# Realiza login manual, luego cierra la ventana.
```

3) Ejecutar tests

```bash
npx playwright test --reporter=list
```

Notas
- Puedes cambiar la URL base con `BASE_URL=https://app.nioxtec.es` (valor por defecto).
- Si tu `auth.json` está en otra ruta, ejecuta: `STORAGE=./mi_auth.json npx playwright test`.
- El test abre el modal de un cliente (el primero con documentación) y comprueba que los `<a>` de Documentos no contengan `token=` en el `href`.

