#!/usr/bin/env python3
import requests
import json

def create_sample_products():
    base = 'http://localhost:5001'
    
    # Login
    print("🔐 Haciendo login...")
    r = requests.post(base + '/api/auth/login', json={'username': 'admin', 'password': 'admin'})
    if not r.ok:
        print(f"❌ Error en login: {r.status_code}")
        return
    
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Login exitoso")
    
    # Productos de ejemplo
    productos = [
        {'category': 'pantallas', 'model': 'Modelo1', 'sku': 'PAN001', 'stock_qty': 5, 'price_net': 200.0, 'tax_rate': 21.0},
        {'category': 'pantallas', 'model': 'Modelo1', 'sku': 'PAN002', 'stock_qty': 3, 'price_net': 220.0, 'tax_rate': 21.0},
        {'category': 'pantallas', 'model': 'Modelo2', 'sku': 'PAN003', 'stock_qty': 7, 'price_net': 180.0, 'tax_rate': 21.0},
        {'category': 'pantallas', 'model': 'Modelo2', 'sku': 'PAN004', 'stock_qty': 2, 'price_net': 250.0, 'tax_rate': 21.0},
        {'category': 'tpvs', 'model': 'Modelo1', 'sku': 'TPV001', 'stock_qty': 4, 'price_net': 150.0, 'tax_rate': 21.0},
        {'category': 'tpvs', 'model': 'Modelo1', 'sku': 'TPV002', 'stock_qty': 6, 'price_net': 170.0, 'tax_rate': 21.0},
        {'category': 'tpvs', 'model': 'Modelo2', 'sku': 'TPV003', 'stock_qty': 1, 'price_net': 300.0, 'tax_rate': 21.0},
    ]
    
    print(f"📦 Creando {len(productos)} productos de ejemplo...")
    created = 0
    for producto in productos:
        r = requests.post(base + '/api/products', json=producto, headers=headers)
        if r.status_code == 201:
            print(f"✅ Creado: {producto['sku']}")
            created += 1
        elif r.status_code == 400 and 'already exists' in r.text:
            print(f"⚠️  Ya existe: {producto['sku']}")
        else:
            print(f"❌ Error creando {producto['sku']}: {r.status_code}")
    
    print(f"\n📊 Productos creados: {created}")
    
    # Verificar resumen
    r = requests.get(base + '/api/products/summary', headers=headers)
    if r.ok:
        summary = r.json()
        print(f"\n📈 Resumen de inventario:")
        for category, data in summary.items():
            print(f"  • {category}: {data['total_products']} productos, {data['total_stock']} en stock")
    
    print("\n🎉 ¡Productos de ejemplo creados!")

if __name__ == '__main__':
    create_sample_products()
