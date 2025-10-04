#!/usr/bin/env python3
"""
Script de diagnóstico para el frontend en servidor remoto
Simula las peticiones que hace el frontend para identificar el problema
"""

import requests
import json
import os
from pathlib import Path

def test_backend_connection():
    """Probar la conexión al backend"""
    print("🔍 Probando conexión al backend...")
    
    # URLs a probar
    urls_to_test = [
        "http://localhost:5001/api/contracts/templates",
        "http://127.0.0.1:5001/api/contracts/templates",
        "http://localhost:5000/api/contracts/templates",
        "http://127.0.0.1:5000/api/contracts/templates"
    ]
    
    for url in urls_to_test:
        try:
            print(f"  Probando: {url}")
            response = requests.get(url, timeout=5)
            print(f"    Status: {response.status_code}")
            if response.status_code == 401:
                print("    ✅ Backend responde (requiere autenticación)")
                return True
            elif response.status_code == 200:
                print("    ✅ Backend responde correctamente")
                return True
            else:
                print(f"    ⚠️  Respuesta inesperada: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print("    ❌ No se puede conectar")
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    return False

def check_frontend_config():
    """Verificar configuración del frontend"""
    print("\n🔍 Verificando configuración del frontend...")
    
    # Verificar archivo de configuración de Vite
    vite_config = Path("frontend/vite.config.js")
    if vite_config.exists():
        print("✅ vite.config.js encontrado")
        with open(vite_config, 'r') as f:
            content = f.read()
            if "proxy" in content:
                print("✅ Configuración de proxy encontrada")
            else:
                print("⚠️  No se encontró configuración de proxy")
    else:
        print("❌ vite.config.js no encontrado")
    
    # Verificar variables de entorno
    env_file = Path("frontend/.env")
    if env_file.exists():
        print("✅ .env encontrado")
        with open(env_file, 'r') as f:
            content = f.read()
            if "VITE_API_BASE" in content:
                print("✅ VITE_API_BASE configurado")
            else:
                print("⚠️  VITE_API_BASE no configurado")
    else:
        print("⚠️  .env no encontrado")

def check_static_serving():
    """Verificar que los archivos estáticos se sirvan correctamente"""
    print("\n🔍 Verificando archivos estáticos...")
    
    # Verificar que el directorio static esté en el lugar correcto
    static_dir = Path("static")
    if static_dir.exists():
        print("✅ Directorio static existe")
        
        # Verificar que las plantillas estén accesibles
        templates_dir = static_dir / "contracts" / "templates"
        if templates_dir.exists():
            print("✅ Directorio de plantillas existe")
            
            # Contar archivos
            docx_files = list(templates_dir.glob("*.docx"))
            print(f"✅ {len(docx_files)} plantillas DOCX encontradas")
            
            for docx_file in docx_files:
                print(f"  - {docx_file.name}")
        else:
            print("❌ Directorio de plantillas no existe")
    else:
        print("❌ Directorio static no existe")

def check_flask_config():
    """Verificar configuración de Flask"""
    print("\n🔍 Verificando configuración de Flask...")
    
    # Verificar que app.py tenga la configuración correcta
    app_py = Path("app.py")
    if app_py.exists():
        with open(app_py, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Verificar configuración de archivos estáticos
            if "STATIC_FOLDER" in content:
                print("✅ STATIC_FOLDER configurado")
            else:
                print("❌ STATIC_FOLDER no configurado")
            
            # Verificar rutas de contratos
            if "/api/contracts/templates" in content:
                print("✅ Ruta de plantillas configurada")
            else:
                print("❌ Ruta de plantillas no configurada")
            
            # Verificar configuración de CORS
            if "CORS" in content:
                print("✅ CORS configurado")
            else:
                print("❌ CORS no configurado")

def main():
    """Función principal"""
    print("🚀 Diagnóstico del Frontend en Servidor Remoto")
    print("=" * 60)
    
    checks = [
        test_backend_connection,
        check_frontend_config,
        check_static_serving,
        check_flask_config
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ DIAGNÓSTICO COMPLETADO - Revisar resultados arriba")
    else:
        print("❌ PROBLEMAS DETECTADOS - Revisar errores arriba")
    
    print("\n💡 POSIBLES SOLUCIONES:")
    print("1. Verificar que el backend esté corriendo en el puerto correcto")
    print("2. Verificar configuración de CORS en el backend")
    print("3. Verificar variables de entorno del frontend")
    print("4. Verificar que los archivos estáticos se sirvan correctamente")

if __name__ == "__main__":
    main()
