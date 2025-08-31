#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-"http://localhost:5001"}
ORIGIN=${2:-"http://localhost:5173"}

pass() { echo -e "✅ $1"; }
fail() { echo -e "❌ $1"; exit 1; }

echo "== Comprobaciones Fase 2 en ${BASE_URL} =="

# 1) /apidocs debe estar accesible
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/apidocs") || true
[[ "$status" == "200" ]] && pass "/apidocs responde 200" || fail "/apidocs devolvió ${status}"

# 2) /openapi.json debe contener campo 'openapi'
body=$(curl -s "${BASE_URL}/openapi.json" || true)
echo "$body" | grep -q '"openapi"' && pass "/openapi.json contiene 'openapi'" || fail "/openapi.json no contiene 'openapi'"

# 3) Login inválido -> 400 con {error, code}
status=$(curl -s -o /dev/null -w "%{http_code}" -H 'Content-Type: application/json' -d '{}' "${BASE_URL}/api/auth/login") || true
[[ "$status" == "400" ]] && pass "login inválido devuelve 400" || fail "login inválido devolvió ${status} (esperado 400)"

# 4) /api/clients sin token -> 401 con {error, code}
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/clients") || true
[[ "$status" == "401" ]] && pass "/api/clients sin token devuelve 401" || fail "/api/clients sin token devolvió ${status} (esperado 401)"

# 5) Preflight CORS sobre /api/auth/login
hdrs=$(curl -s -i -X OPTIONS "${BASE_URL}/api/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" || true)
echo "$hdrs" | grep -qi "200" && echo "$hdrs" | grep -qi "access-control-allow-origin" \
  && pass "Preflight CORS OK para /api/auth/login" \
  || fail "Preflight CORS no contiene cabeceras esperadas"

echo "== Completado =="

