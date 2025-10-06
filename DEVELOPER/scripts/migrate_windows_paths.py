#!/usr/bin/env python3
"""
Script para migrar rutas de archivos de Windows (\) a Unix (/).
"""

import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def migrate_paths():
    with app.app_context():
        print('=' * 60)
        print('MIGRACIÓN DE RUTAS: Windows → Unix')
        print('=' * 60)
        print()

        # Buscar todos los documentos con backslashes
        all_docs = ClientDocument.query.all()
        
        docs_to_fix = []
        for doc in all_docs:
            if '\\' in doc.stored_path:
                docs_to_fix.append(doc)
        
        print(f'📊 Total documentos: {len(all_docs)}')
        print(f'⚠️  Documentos con backslashes: {len(docs_to_fix)}')
        print()
        
        if not docs_to_fix:
            print('✅ No hay documentos que necesiten corrección')
            return
        
        print('Documentos a corregir:')
        print()
        
        for doc in docs_to_fix:
            old_path = doc.stored_path
            new_path = old_path.replace('\\', '/')
            
            old_abs = os.path.join(UPLOADS_ROOT, old_path)
            new_abs = os.path.join(UPLOADS_ROOT, new_path)
            
            print(f'📄 ID {doc.id}: {doc.filename}')
            print(f'   Antigua: {old_path}')
            print(f'   Nueva:   {new_path}')
            
            # Verificar si el archivo existe en la nueva ruta
            if os.path.isfile(new_abs):
                print(f'   ✅ Archivo existe en la nueva ruta')
                doc.stored_path = new_path
            else:
                print(f'   ❌ ADVERTENCIA: Archivo no existe en {new_abs}')
            print()
        
        # Confirmar antes de guardar
        print('=' * 60)
        confirm = input('¿Desea aplicar estos cambios? (s/N): ').strip().lower()
        
        if confirm == 's':
            db.session.commit()
            print('✅ Cambios aplicados correctamente')
            print()
            
            # Verificar resultados
            print('Verificando resultados...')
            for doc in docs_to_fix:
                abs_path = os.path.join(UPLOADS_ROOT, doc.stored_path)
                exists = os.path.isfile(abs_path)
                status = '✅' if exists else '❌'
                print(f'{status} ID {doc.id}: {doc.filename}')
        else:
            print('❌ Operación cancelada')

if __name__ == '__main__':
    migrate_paths()
