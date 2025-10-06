#!/usr/bin/env python3
"""
Script para recrear registros de documentos basándose en archivos físicos existentes.
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, '/app')

from app import app, db, ClientDocument, UPLOADS_ROOT

def recreate_document_records():
    with app.app_context():
        print('=' * 60)
        print('RECREACIÓN DE REGISTROS DE DOCUMENTOS')
        print('=' * 60)
        print()

        created_count = 0
        skipped_count = 0

        # Buscar todos los archivos en uploads
        for root, dirs, files in os.walk(UPLOADS_ROOT):
            for filename in files:
                # Ignorar archivos de metadata de macOS
                if filename.startswith('._'):
                    continue
                
                # Ignorar archivos ocultos
                if filename.startswith('.'):
                    continue
                
                abs_path = os.path.join(root, filename)
                rel_path = os.path.relpath(abs_path, UPLOADS_ROOT)
                
                # Determinar client_id de la ruta (e.g., "9/documents/file.pdf" -> 9)
                parts = rel_path.split(os.sep)
                if len(parts) < 3:
                    continue
                
                try:
                    client_id = int(parts[0])
                    category_dir = parts[1]  # 'documents' o 'images'
                except (ValueError, IndexError):
                    continue
                
                # Determinar categoría
                if category_dir == 'documents':
                    category = 'document'
                elif category_dir == 'images':
                    category = 'image'
                else:
                    continue
                
                # Verificar si ya existe en la BD
                existing = ClientDocument.query.filter_by(stored_path=rel_path).first()
                if existing:
                    skipped_count += 1
                    continue
                
                # Obtener información del archivo
                size_bytes = os.path.getsize(abs_path)
                
                # Determinar content_type
                ext = filename.lower().split('.')[-1]
                content_type_map = {
                    'pdf': 'application/pdf',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'webp': 'image/webp',
                    'gif': 'image/gif'
                }
                content_type = content_type_map.get(ext, 'application/octet-stream')
                
                # Extraer filename original (quitar UUID al inicio)
                # Formato: uuid_filename.ext -> filename.ext
                if '_' in filename:
                    original_filename = '_'.join(filename.split('_')[1:])
                else:
                    original_filename = filename
                
                # Crear registro
                doc = ClientDocument(
                    client_id=client_id,
                    category=category,
                    filename=original_filename,
                    stored_path=rel_path,
                    content_type=content_type,
                    size_bytes=size_bytes,
                    uploaded_at=datetime.utcnow()
                )
                
                db.session.add(doc)
                created_count += 1
                
                print(f'✅ Cliente {client_id}: {original_filename} ({size_bytes:,} bytes)')
        
        # Guardar cambios
        if created_count > 0:
            db.session.commit()
            print()
            print('=' * 60)
            print(f'✅ Registros creados: {created_count}')
            print(f'⏭️  Registros existentes (omitidos): {skipped_count}')
        else:
            print('ℹ️  No se encontraron archivos nuevos para crear registros')

if __name__ == '__main__':
    recreate_document_records()
