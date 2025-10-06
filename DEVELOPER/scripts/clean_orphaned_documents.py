#!/usr/bin/env python3
"""
Script para eliminar registros de documentos cuyos archivos no existen.
"""

import sys
import os

sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def clean_orphaned_records():
    with app.app_context():
        print('=' * 60)
        print('LIMPIEZA DE REGISTROS HUÉRFANOS')
        print('=' * 60)
        print()

        all_docs = ClientDocument.query.all()
        orphaned = []

        for doc in all_docs:
            # Convertir backslashes a forward slashes para la verificación
            path = doc.stored_path.replace('\\', '/')
            abs_path = os.path.join(UPLOADS_ROOT, path)
            
            if not os.path.isfile(abs_path):
                orphaned.append(doc)

        print(f'📊 Total documentos: {len(all_docs)}')
        print(f'❌ Archivos faltantes: {len(orphaned)}')
        print()

        if not orphaned:
            print('✅ Todos los documentos tienen archivos válidos')
            return

        print('Registros huérfanos que serán eliminados:')
        print()

        for doc in orphaned:
            print(f'  - ID {doc.id}: {doc.filename} (Cliente ID: {doc.client_id})')

        print()
        print('=' * 60)
        
        for doc in orphaned:
            db.session.delete(doc)
        
        db.session.commit()
        
        print(f'✅ Se eliminaron {len(orphaned)} registros huérfanos')

if __name__ == '__main__':
    clean_orphaned_records()
