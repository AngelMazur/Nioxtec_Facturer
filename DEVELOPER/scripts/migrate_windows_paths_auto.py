#!/usr/bin/env python3
"""
Script para migrar automáticamente rutas de archivos de Windows (\) a Unix (/).
"""

import sys
import os

# Añadir el directorio raíz al path
sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def migrate_paths_auto():
    with app.app_context():
        print('=' * 60)
        print('MIGRACIÓN AUTOMÁTICA: Windows → Unix')
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
        
        fixed_count = 0
        not_found_count = 0
        
        for doc in docs_to_fix:
            old_path = doc.stored_path
            new_path = old_path.replace('\\', '/')
            
            new_abs = os.path.join(UPLOADS_ROOT, new_path)
            
            print(f'📄 ID {doc.id}: {doc.filename}')
            print(f'   {old_path} → {new_path}')
            
            # Verificar si el archivo existe en la nueva ruta
            if os.path.isfile(new_abs):
                print(f'   ✅ Archivo existe - actualizando BD')
                doc.stored_path = new_path
                fixed_count += 1
            else:
                print(f'   ⚠️  Archivo no encontrado en: {new_abs}')
                not_found_count += 1
            print()
        
        # Guardar cambios
        if fixed_count > 0:
            db.session.commit()
            print('=' * 60)
            print('✅ MIGRACIÓN COMPLETADA')
            print('=' * 60)
            print(f'✅ Rutas corregidas: {fixed_count}')
            print(f'⚠️  Archivos no encontrados: {not_found_count}')
            print()
            
            # Verificar resultados
            print('Verificando archivos corregidos...')
            print()
            for doc in docs_to_fix:
                if '\\' not in doc.stored_path:  # Solo los que se corrigieron
                    abs_path = os.path.join(UPLOADS_ROOT, doc.stored_path)
                    exists = os.path.isfile(abs_path)
                    status = '✅' if exists else '❌'
                    print(f'{status} ID {doc.id}: {doc.filename}')
        else:
            print('❌ No se pudo corregir ningún documento (archivos no encontrados)')

if __name__ == '__main__':
    migrate_paths_auto()
