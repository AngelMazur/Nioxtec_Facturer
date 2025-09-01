#!/usr/bin/env bash
set -euo pipefail

# Verificaciones locales de Fase 3 (auth, CORS, listados homogéneos, política de token en query)
#
# Uso:
#   BASE_URL=http://localhost:8000 \
#   ORIGIN=http://localhost:8080 \
#   TEST_USERNAME=admin TEST_PASSWORD=secret \
#   EXPECT_QUERY_TOKEN=1 ./DEVELOPER/scripts/check_phase3_local.sh
#
# EXPECT_QUERY_TOKEN: 1 si esperas que ?token funcione (dev), 0 si debe fallar (prod)

BASE_URL=${BASE_URL:-http://localhost:8000}
ORIGIN=${ORIGIN:-http://localhost:8080}
USER=${TEST_USERNAME:-admin}
PASS=${TEST_PASSWORD:-admin}
TOKEN=${TOKEN:-}
EXPECT_QUERY_TOKEN=${EXPECT_QUERY_TOKEN:-1}

echo "[info] Usuario de prueba: $USER"

echo "[1/7] Health check: $BASE_URL/health"
code=$(curl -s -o /tmp/health.json -w "%{http_code}" "$BASE_URL/health")
if [[ "$code" != "200" ]]; then
  echo "[FAIL] /health -> HTTP $code"; exit 1
fi
grep -q '"status"\s*:\s*"ok"' /tmp/health.json || { echo "[FAIL] /health payload inesperado"; cat /tmp/health.json; exit 1; }
echo "[OK] /health"

echo "[2/7] Preflight CORS a /api/auth/login"
curl -s -o /dev/null -w "%{http_code}\n" -X OPTIONS \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  "$BASE_URL/api/auth/login" | grep -qE '^(200|204)$' || { echo "[WARN] Preflight no devolvió 200/204 (posible proxy)"; }

if [[ -z "$TOKEN" ]]; then
  echo "[3/7] Login"
  login_code=$(curl -s -o /tmp/login.json -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" -H "Origin: $ORIGIN" \
    -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" \
    "$BASE_URL/api/auth/login")
  if [[ "$login_code" != "200" ]]; then
    echo "[FAIL] Login -> HTTP $login_code"; cat /tmp/login.json; exit 1
  fi
  TOKEN=$(python3 - <<'PY'
import json,sys
data=json.load(open('/tmp/login.json'))
print(data.get('access_token',''))
PY
  )
  if [[ -z "$TOKEN" ]]; then echo "[FAIL] Token ausente en respuesta de login"; cat /tmp/login.json; exit 1; fi
  echo "[OK] Token recibido"
else
  echo "[3/7] Token inyectado por entorno (saltando login)"
fi

echo "[4/7] OpenAPI"
oa_code=$(curl -s -o /tmp/openapi.json -w "%{http_code}" "$BASE_URL/openapi.json")
[[ "$oa_code" == "200" ]] || { echo "[FAIL] /openapi.json -> $oa_code"; exit 1; }
grep -q '"openapi"' /tmp/openapi.json || { echo "[FAIL] /openapi.json sin campo 'openapi'"; exit 1; }
echo "[OK] OpenAPI disponible"

echo "[5/7] Listado de clientes (paginación/orden/búsqueda)"
cli_code=$(curl -s -o /tmp/clients.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/clients?limit=5&offset=0&sort=created_at&dir=desc&q=")
[[ "$cli_code" == "200" ]] || { echo "[FAIL] /api/clients -> $cli_code"; cat /tmp/clients.json; exit 1; }
grep -q '"items"' /tmp/clients.json && grep -q '"total"' /tmp/clients.json || { echo "[FAIL] Estructura inválida de /api/clients"; cat /tmp/clients.json; exit 1; }
echo "[OK] Clientes OK"

echo "[6/7] Listado de facturas (filtros/orden/búsqueda)"
inv_code=$(curl -s -o /tmp/invoices.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/invoices?limit=5&sort=id&dir=desc")
[[ "$inv_code" == "200" ]] || { echo "[FAIL] /api/invoices -> $inv_code"; cat /tmp/invoices.json; exit 1; }
grep -q '"items"' /tmp/invoices.json && grep -q '"total"' /tmp/invoices.json || { echo "[FAIL] Estructura inválida de /api/invoices"; cat /tmp/invoices.json; exit 1; }
echo "[OK] Invoices OK"

echo "[7/7] Política ?token (EXPECT_QUERY_TOKEN=$EXPECT_QUERY_TOKEN)"
# Petición SIN cookies ni Authorization, usando solo ?token
qt_code=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/clients?limit=1&token=$TOKEN")
if [[ "$EXPECT_QUERY_TOKEN" == "1" ]]; then
  if [[ "$qt_code" != "200" ]]; then echo "[FAIL] ?token esperado OK pero respondió $qt_code"; exit 1; fi
  echo "[OK] ?token aceptado (modo dev)"
else
  if [[ "$qt_code" == "200" ]]; then echo "[FAIL] ?token debería estar deshabilitado en prod"; exit 1; fi
  echo "[OK] ?token rechazado (modo prod)"
fi

echo "[SUCCESS] Checks Fase 3 locales completados"
