#!/usr/bin/env python3
"""
Script de diagnóstico para el sistema de contratos
Verifica que todos los componentes estén funcionando correctamente
"""

import os
import sys
from pathlib import Path

def check_static_files():
    """Verificar que los archivos estáticos estén en su lugar"""
    print("🔍 Verificando archivos estáticos...")
    
    # Verificar plantillas DOCX
    templates_dir = Path("static/contracts/templates")
    if not templates_dir.exists():
        print("❌ Directorio de plantillas no existe:", templates_dir)
        return False
    
    expected_templates = [
        "Contrato_Compraventa_Plazos_NIOXTEC_v5.docx",
        "Plantilla_Contrato_Renting_Firma_Datos_v2.docx"
    ]
    
    for template in expected_templates:
        template_path = templates_dir / template
        if not template_path.exists():
            print(f"❌ Plantilla faltante: {template}")
            return False
        else:
            print(f"✅ Plantilla encontrada: {template}")
    
    # Verificar imágenes
    images_dir = Path("static/contracts/images")
    if not images_dir.exists():
        print("❌ Directorio de imágenes no existe:", images_dir)
        return False
    
    expected_images = [
        "header-left.png",
        "header-right.png"
    ]
    
    for image in expected_images:
        image_path = images_dir / image
        if not image_path.exists():
            print(f"❌ Imagen faltante: {image}")
            return False
        else:
            print(f"✅ Imagen encontrada: {image}")
    
    return True

def check_directories():
    """Verificar que los directorios necesarios existan"""
    print("\n🔍 Verificando directorios...")
    
    required_dirs = [
        "downloads",
        "static/contracts",
        "static/contracts/templates",
        "static/contracts/images"
    ]
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f"❌ Directorio faltante: {dir_path}")
            return False
        else:
            print(f"✅ Directorio existe: {dir_path}")
    
    return True

def check_python_dependencies():
    """Verificar dependencias de Python"""
    print("\n🔍 Verificando dependencias de Python...")
    
    try:
        from docx import Document
        print("✅ python-docx disponible")
    except ImportError:
        print("❌ python-docx no disponible")
        return False
    
    try:
        import pdfkit
        print("✅ pdfkit disponible")
    except ImportError:
        print("❌ pdfkit no disponible")
        return False
    
    return True

def check_app_config():
    """Verificar configuración de la aplicación"""
    print("\n🔍 Verificando configuración de la aplicación...")
    
    # Verificar que app.py existe y tiene las rutas necesarias
    if not os.path.exists("app.py"):
        print("❌ app.py no encontrado")
        return False
    
    with open("app.py", "r", encoding="utf-8") as f:
        content = f.read()
        
        required_routes = [
            "/api/contracts/templates",
            "extract_placeholders_from_docx",
            "generate_contract_pdf"
        ]
        
        for route in required_routes:
            if route in content:
                print(f"✅ Ruta encontrada: {route}")
            else:
                print(f"❌ Ruta faltante: {route}")
                return False
    
    return True

def main():
    """Función principal de diagnóstico"""
    print("🚀 Diagnóstico del Sistema de Contratos")
    print("=" * 50)
    
    checks = [
        check_static_files,
        check_directories,
        check_python_dependencies,
        check_app_config
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ TODOS LOS CHECKS PASARON - El sistema está listo")
    else:
        print("❌ ALGUNOS CHECKS FALLARON - Revisar problemas arriba")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
