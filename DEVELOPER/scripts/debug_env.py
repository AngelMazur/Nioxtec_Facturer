import os
from dotenv import load_dotenv

load_dotenv()

print("=== VARIABLES DE ENTORNO ===")
print(f"CORS_ORIGINS: {os.getenv('CORS_ORIGINS')}")
print(f"APP_ORIGIN: {os.getenv('APP_ORIGIN')}")
print(f"EXTRA_ORIGINS: {os.getenv('EXTRA_ORIGINS')}")
print(f"FLASK_DEBUG: {os.getenv('FLASK_DEBUG')}")
print(f"ENABLE_TALISMAN: {os.getenv('ENABLE_TALISMAN')}")
print(f"FORCE_HTTPS: {os.getenv('FORCE_HTTPS')}")

# Simular la lógica del app.py
cors_origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080')
allowed_origins = [o.strip() for o in cors_origins_str.split(',') if o.strip()]
extra_origins_str = os.getenv('EXTRA_ORIGINS') or os.getenv('APP_ORIGIN') or os.getenv('PUBLIC_APP_ORIGIN')
if extra_origins_str:
    for o in [x.strip() for x in extra_origins_str.split(',') if x.strip()]:
        if o not in allowed_origins:
            allowed_origins.append(o)

print(f"allowed_origins final: {allowed_origins}")
