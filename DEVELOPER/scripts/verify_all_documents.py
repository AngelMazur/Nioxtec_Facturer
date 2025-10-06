#!/usr/bin/env python3
"""
Script de verificación final de todos los documentos.
"""

import sys
import os

sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def verify_all_documents():
    with app.app_context():
        print('=' * 60)
        print('VERIFICACIÓN FINAL DE DOCUMENTOS')
        print('=' * 60)
        print()

        all_docs = ClientDocument.query.all()
        
        by_client = {}
        total_size = 0
        all_ok = True

        for doc in all_docs:
            abs_path = os.path.join(UPLOADS_ROOT, doc.stored_path)
            exists = os.path.isfile(abs_path)
            
            if doc.client_id not in by_client:
                by_client[doc.client_id] = {'docs': 0, 'images': 0, 'ok': 0, 'missing': 0}
            
            if doc.category == 'document':
                by_client[doc.client_id]['docs'] += 1
            else:
                by_client[doc.client_id]['images'] += 1
            
            if exists:
                by_client[doc.client_id]['ok'] += 1
                total_size += doc.size_bytes
            else:
                by_client[doc.client_id]['missing'] += 1
                all_ok = False
                print(f'❌ FALTA: Cliente {doc.client_id} - {doc.filename}')

        print('📊 RESUMEN POR CLIENTE:')
        print()
        
        for client_id in sorted(by_client.keys()):
            stats = by_client[client_id]
            status = '✅' if stats['missing'] == 0 else '⚠️ '
            print(f'{status} Cliente {client_id}:')
            print(f'     Documentos: {stats["docs"]}')
            print(f'     Imágenes: {stats["images"]}')
            print(f'     OK: {stats["ok"]} | Faltantes: {stats["missing"]}')
            print()

        print('=' * 60)
        print('ESTADÍSTICAS GLOBALES')
        print('=' * 60)
        print(f'Total documentos en BD: {len(all_docs)}')
        print(f'Total archivos válidos: {sum(c["ok"] for c in by_client.values())}')
        print(f'Archivos faltantes: {sum(c["missing"] for c in by_client.values())}')
        print(f'Tamaño total: {total_size / 1024 / 1024:.1f} MB')
        print()
        
        if all_ok:
            print('✅ ¡TODOS LOS ARCHIVOS ESTÁN DISPONIBLES!')
        else:
            print('⚠️  Algunos archivos están faltantes (ver arriba)')

if __name__ == '__main__':
    verify_all_documents()
