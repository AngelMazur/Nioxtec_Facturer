#!/usr/bin/env bash
set -euo pipefail

# generate_env.sh
# Crea o actualiza el archivo .env con claves seguras para producción en Ubuntu.
# Uso:
#   ./DEVELOPER/scripts/generate_env.sh [--rotate] [--cookie-domain=api.nioxtec.es]
#
# Flags:
#   --rotate                Fuerza rotación de JWT_SECRET_KEY y SECRET_KEY aunque existan
#   --cookie-domain=DOMAIN  Establece JWT_COOKIE_DOMAIN=DOMAIN

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT_DIR"

rotate=false
cookie_domain=""
for arg in "$@"; do
  case "$arg" in
    --rotate) rotate=true ;;
    --cookie-domain=*) cookie_domain="${arg#*=}" ;;
    -h|--help)
      echo "Uso: $0 [--rotate] [--cookie-domain=api.nioxtec.es]"
      exit 0
      ;;
    *) echo "Argumento no reconocido: $arg"; exit 1 ;;
  esac
done

if [[ ! -f .env.docker.example ]]; then
  echo "ERROR: No existe .env.docker.example en $ROOT_DIR" >&2
  exit 1
fi

# Crear .env si no existe
if [[ ! -f .env ]]; then
  cp .env.docker.example .env
  echo "Creado .env desde .env.docker.example"
fi

# Generar secreto seguro (prefiere python3; fallback a openssl)
gen_secret() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "import secrets; print(secrets.token_urlsafe(64))"
  elif command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n' | sed 's/\//_/g'
  else
    echo "ERROR: Necesitas python3 u openssl para generar secretos" >&2
    exit 1
  fi
}

update_key() {
  local key_name="$1"; shift
  local new_value="$1"; shift

  if grep -qE "^${key_name}=" .env; then
    if $rotate; then
      sed -i "s|^${key_name}=.*|${key_name}=${new_value}|" .env
      echo "Rotado ${key_name}"
    else
      echo "${key_name} ya existe; se mantiene (usa --rotate para rotar)"
    fi
  else
    echo "${key_name}=${new_value}" >> .env
    echo "Añadido ${key_name}"
  fi
}

# Generar/rotar claves
jwt_secret=$(gen_secret)
app_secret=$(gen_secret)

update_key "JWT_SECRET_KEY" "$jwt_secret"
update_key "SECRET_KEY" "$app_secret"

# Asegurar FLASK_DEBUG=false en prod
if grep -qE '^FLASK_DEBUG=' .env; then
  sed -i 's|^FLASK_DEBUG=.*|FLASK_DEBUG=false|' .env
else
  echo 'FLASK_DEBUG=false' >> .env
fi
echo "Ajustado FLASK_DEBUG=false"

# Cookie domain opcional
if [[ -n "$cookie_domain" ]]; then
  if grep -qE '^JWT_COOKIE_DOMAIN=' .env; then
    sed -i "s|^JWT_COOKIE_DOMAIN=.*|JWT_COOKIE_DOMAIN=${cookie_domain}|" .env
  else
    echo "JWT_COOKIE_DOMAIN=${cookie_domain}" >> .env
  fi
  echo "Establecido JWT_COOKIE_DOMAIN=${cookie_domain}"
fi

echo "Listo: .env actualizado de forma segura (claves no se muestran por consola)."

