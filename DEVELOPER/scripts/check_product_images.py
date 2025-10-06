#!/usr/bin/env python3
"""
Script para verificar imágenes de productos faltantes.
"""

import sys
import os

sys.path.insert(0, '/app')

from app import app, db, Product

def check_product_images():
    with app.app_context():
        print('=' * 60)
        print('VERIFICACIÓN DE IMÁGENES DE PRODUCTOS')
        print('=' * 60)
        print()

        products = Product.query.all()
        
        missing_images = []
        existing_images = []

        for product in products:
            if product.image_url:
                # Las URLs son relativas tipo: /static/uploads/products/3_1759709755_medidas_65.png
                # Convertir a ruta absoluta
                if product.image_url.startswith('/static/'):
                    rel_path = product.image_url[len('/static/'):]
                    abs_path = os.path.join('/app/static', rel_path)
                elif product.image_url.startswith('static/'):
                    abs_path = os.path.join('/app', product.image_url)
                else:
                    abs_path = os.path.join('/app/static', product.image_url)
                
                exists = os.path.isfile(abs_path)
                
                if exists:
                    existing_images.append(product)
                else:
                    missing_images.append(product)
                    print(f'❌ ID {product.id}: {product.name}')
                    print(f'   Imagen: {product.image_url}')
                    print(f'   Ruta esperada: {abs_path}')
                    print()

        print('=' * 60)
        print('RESUMEN')
        print('=' * 60)
        print(f'Total productos: {len(products)}')
        print(f'Productos con imagen: {len([p for p in products if p.image_url])}')
        print(f'Imágenes existentes: {len(existing_images)}')
        print(f'Imágenes faltantes: {len(missing_images)}')
        print()

        if missing_images:
            print('⚠️  PRODUCTOS SIN IMAGEN:')
            for p in missing_images:
                print(f'  - ID {p.id}: {p.name}')
        else:
            print('✅ Todas las imágenes de productos están disponibles')

if __name__ == '__main__':
    check_product_images()
