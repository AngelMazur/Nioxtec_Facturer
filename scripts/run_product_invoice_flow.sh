#!/usr/bin/env bash
set -eu
BASE=http://localhost:5001
# login
resp=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}')
if echo "$resp" | grep -q 'access_token'; then
  TOKEN=$(echo "$resp" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
  echo "Token: $TOKEN"
else
  echo "Login failed, response: $resp"
  exit 1
fi
# create client
CLIENT_ID=$(curl -s -X POST "$BASE/api/clients" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Cliente Test","cif":"X123","address":"Calle 1","email":"c@test","phone":"000"}' | python -c "import sys,json; print(json.load(sys.stdin).get('id'))")
echo "Client ID: $CLIENT_ID"
# create product
PRODUCT_ID=$(curl -s -X POST "$BASE/api/products" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"category":"pantallas","model":"ModelX","stock_qty":5,"price_net":100,"tax_rate":21}' | python -c "import sys,json; print(json.load(sys.stdin).get('id'))")
echo "Product ID: $PRODUCT_ID"
# create proforma
INVOICE_ID=$(curl -s -X POST "$BASE/api/invoices" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"type\":\"proforma\",\"date\":\"$(date +%Y-%m-%d)\",\"client_id\": $CLIENT_ID,\"items\":[{\"product_id\": $PRODUCT_ID, \"description\":\"Venta Test\", \"units\":1, \"unit_price\":100.0, \"tax_rate\":21.0}]}" | python -c "import sys,json; print(json.load(sys.stdin).get('id'))")
echo "Proforma ID: $INVOICE_ID"
# convert proforma
curl -s -X PATCH "$BASE/api/invoices/$INVOICE_ID/convert" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" | jq -C '.' || true
