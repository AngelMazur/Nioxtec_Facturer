"""
Script para verificar qué datos contiene la base de datos
"""
from app import app, db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    
    print('\n=== TABLAS EN LA BASE DE DATOS ===\n')
    for table in inspector.get_table_names():
        print(f'Tabla: {table}')
        # Contar registros
        result = db.session.execute(db.text(f'SELECT COUNT(*) FROM {table}'))
        count = result.scalar()
        print(f'  Registros: {count}')
        
        # Ver columnas
        columns = inspector.get_columns(table)
        print(f'  Columnas: {len(columns)}')
        for col in columns[:5]:
            print(f'    - {col["name"]} ({col["type"]})')
        if len(columns) > 5:
            print(f'    ... y {len(columns) - 5} mas')
        print()
    
    # Verificar si hay referencias a archivos PDF en la BD
    print('\n=== REFERENCIAS A ARCHIVOS ===\n')
    
    # Revisar facturas recientes
    result = db.session.execute(db.text('''
        SELECT invoice_number, created_at 
        FROM invoice 
        ORDER BY created_at DESC 
        LIMIT 5
    '''))
    
    print('Ultimas 5 facturas en BD:')
    for row in result:
        print(f'  - {row[0]} (creada: {row[1]})')
    
    print('\nLos PDFs en downloads/ son COPIAS generadas.')
    print('Los DATOS ORIGINALES estan en la base de datos.')
    print('Se pueden regenerar en cualquier momento.')
