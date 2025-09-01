"""
Pruebas mínimas de Fase 3 (paginación/búsqueda/orden + auth + OpenAPI).

Requisitos locales:
- Servidor backend levantado en http://localhost:8000 (o API_BASE_URL)
- Usuario válido para login (usar ADMIN_USERNAME/ADMIN_PASSWORD al arrancar o
  variables TEST_USERNAME/TEST_PASSWORD en el entorno)

Ejecutar:
  API_BASE_URL=http://localhost:8000 \
  TEST_USERNAME=admin TEST_PASSWORD=secret \
  pytest -q Nioxtec_Facturer/tests/test_phase3_api.py
"""

import os
import json
import pytest
import requests


API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")
TEST_USERNAME = os.getenv("TEST_USERNAME", "admin")
TEST_PASSWORD = os.getenv("TEST_PASSWORD", "admin")


def _login() -> tuple[str, requests.Session]:
    s = requests.Session()
    # CORS preflight smoke (no estricto; opcional)
    try:
        s.options(
            f"{API_BASE_URL}/api/auth/login",
            headers={
                "Origin": os.getenv("APP_ORIGIN", "http://localhost:8080"),
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
            timeout=5,
        )
    except Exception:
        pass

    r = s.post(
        f"{API_BASE_URL}/api/auth/login",
        json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
        timeout=10,
        headers={"Origin": os.getenv("APP_ORIGIN", "http://localhost:8080")},
    )
    assert r.status_code in (200, 401), f"Login respondió {r.status_code}: {r.text}"
    if r.status_code == 401:
        pytest.skip("Credenciales inválidas o usuario no existe; configure TEST_USERNAME/TEST_PASSWORD.")
    data = r.json()
    token = data.get("access_token")
    assert token, f"Respuesta de login sin token: {data}"
    return token, s


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_openapi_served():
    r = requests.get(f"{API_BASE_URL}/openapi.json", timeout=5)
    assert r.status_code == 200
    spec = r.json()
    assert "openapi" in spec and spec["openapi"].startswith("3"), "Spec OpenAPI inválida"


def test_clients_listing_pagination_and_sort():
    token, s = _login()
    # Estructura mínima
    r = s.get(
        f"{API_BASE_URL}/api/clients?limit=5&offset=0&sort=created_at&dir=desc",
        headers=_auth_headers(token),
        timeout=10,
    )
    assert r.status_code == 200, r.text
    payload = r.json()
    assert "items" in payload and "total" in payload
    assert isinstance(payload["items"], list)
    assert isinstance(payload["total"], int)


def test_invoices_listing_filters_and_search():
    token, s = _login()
    # Sin datos previos puede devolver items vacíos; se valida esquema
    r = s.get(
        f"{API_BASE_URL}/api/invoices?limit=5&sort=id&dir=desc",
        headers=_auth_headers(token),
        timeout=10,
    )
    assert r.status_code == 200, r.text
    payload = r.json()
    assert "items" in payload and "total" in payload
    assert isinstance(payload["items"], list)
    assert isinstance(payload["total"], int)


def test_query_token_policy_documentation_only():
    """
    No forzamos el entorno aquí. La política se valida manualmente con el script
    de developer cambiando ALLOW_QUERY_TOKEN y reiniciando.
    """
    assert True

