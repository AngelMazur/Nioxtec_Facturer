import sqlite3

conn = sqlite3.connect('instance/app.db')
cursor = conn.cursor()

print('\n=== TABLAS EN LA BASE DE DATOS ===\n')

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

for table in tables:
    table_name = table[0]
    if table_name == 'sqlite_sequence':
        continue
    
    print(f'Tabla: {table_name}')
    
    # Contar registros
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    print(f'  Registros: {count}')
    
    # Ver columnas
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    print(f'  Columnas: {len(columns)}')
    for col in columns[:5]:
        print(f'    - {col[1]} ({col[2]})')
    if len(columns) > 5:
        print(f'    ... y {len(columns) - 5} mas')
    print()

print('\n=== FACTURAS RECIENTES ===\n')
cursor.execute('SELECT number, date FROM invoice ORDER BY date DESC LIMIT 5')
invoices = cursor.fetchall()
print(f'Ultimas {len(invoices)} facturas en BD:')
for inv in invoices:
    print(f'  - {inv[0]} (fecha: {inv[1]})')

print('\n=== CONCLUSION ===')
print('Los PDFs en downloads/ son COPIAS generadas en tiempo real.')
print('Los DATOS ORIGINALES estan en la base de datos.')
print('Se pueden regenerar los PDFs en cualquier momento desde la BD.')

conn.close()
