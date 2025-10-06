#!/usr/bin/env python3
"""
Script para diagnosticar documentos de clientes y verificar si los archivos existen.
"""

import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def check_client_documents(client_id):
    with app.app_context():
        print('=' * 60)
        print(f'DIAGNÓSTICO DE DOCUMENTOS - CLIENTE {client_id}')
        print('=' * 60)
        print(f'UPLOADS_ROOT: {UPLOADS_ROOT}')
        print()

        # Buscar documentos del cliente
        docs = ClientDocument.query.filter_by(client_id=client_id).order_by(ClientDocument.id).all()
        print(f'📊 Total documentos: {len(docs)}')
        print()

        missing_files = []
        existing_files = []

        for doc in docs:
            abs_path = os.path.join(UPLOADS_ROOT, doc.stored_path)
            exists = os.path.isfile(abs_path)
            
            print(f'📄 ID: {doc.id} | Category: {doc.category}')
            print(f'   Filename: {doc.filename}')
            print(f'   Stored Path: {doc.stored_path}')
            print(f'   Absolute Path: {abs_path}')
            print(f'   File Exists: {"✅ YES" if exists else "❌ NO"}')
            
            if exists:
                size = os.path.getsize(abs_path)
                print(f'   Size: {size:,} bytes ({size / 1024:.1f} KB)')
                existing_files.append(doc)
            else:
                print(f'   ⚠️  ARCHIVO NO ENCONTRADO!')
                missing_files.append(doc)
            
            print()

        print('=' * 60)
        print('RESUMEN')
        print('=' * 60)
        print(f'✅ Archivos existentes: {len(existing_files)}')
        print(f'❌ Archivos faltantes: {len(missing_files)}')
        
        if missing_files:
            print()
            print('⚠️  ARCHIVOS FALTANTES:')
            for doc in missing_files:
                print(f'   - ID {doc.id}: {doc.filename}')
                print(f'     Path esperado: {os.path.join(UPLOADS_ROOT, doc.stored_path)}')

        # Verificar qué archivos existen físicamente en el directorio del cliente
        print()
        print('=' * 60)
        print('ARCHIVOS FÍSICOS EN EL SERVIDOR')
        print('=' * 60)
        
        client_dir = os.path.join(UPLOADS_ROOT, str(client_id))
        if os.path.exists(client_dir):
            print(f'📁 Directorio cliente: {client_dir}')
            for root, dirs, files in os.walk(client_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, UPLOADS_ROOT)
                    size = os.path.getsize(file_path)
                    
                    # Verificar si está en la BD
                    in_db = any(doc.stored_path == rel_path for doc in docs)
                    print(f'   {"✅" if in_db else "⚠️ "} {rel_path} ({size:,} bytes)')
        else:
            print(f'❌ El directorio del cliente no existe: {client_dir}')

if __name__ == '__main__':
    client_id = int(sys.argv[1]) if len(sys.argv) > 1 else 9
    check_client_documents(client_id)
