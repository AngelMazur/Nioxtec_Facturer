#!/usr/bin/env python3
"""
Script para migrar la tabla expense de la estructura antigua a la nueva.
"""

import sqlite3
import os
from datetime import datetime

def migrate_expense_table():
    """Migra la tabla expense de la estructura antigua a la nueva."""
    
    db_path = 'instance/app.db'
    if not os.path.exists(db_path):
        print(f"❌ Base de datos no encontrada en {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar estructura actual
        cursor.execute('PRAGMA table_info(expense)')
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print(f"📋 Estructura actual: {column_names}")
        
        # Si ya tiene la estructura nueva, no hacer nada
        if 'date' in column_names and 'category' in column_names:
            print("✅ La tabla ya tiene la estructura nueva")
            return True
        
        # Crear tabla temporal con la nueva estructura
        print("🔄 Creando tabla temporal con nueva estructura...")
        cursor.execute('''
            CREATE TABLE expense_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                category VARCHAR(64) NOT NULL,
                description VARCHAR(256) NOT NULL,
                supplier VARCHAR(128) NOT NULL,
                base_amount FLOAT NOT NULL,
                tax_rate FLOAT DEFAULT 21.0,
                total FLOAT NOT NULL,
                paid BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Migrar datos de la estructura antigua a la nueva
        print("📊 Migrando datos...")
        cursor.execute('''
            INSERT INTO expense_new (
                id, date, category, description, supplier, 
                base_amount, tax_rate, total, paid, created_at
            )
            SELECT 
                id,
                fecha,
                categoria,
                concepto,
                proveedor,
                base_amount,
                CASE 
                    WHEN iva_amount > 0 AND base_amount > 0 
                    THEN ROUND((iva_amount / base_amount) * 100, 1)
                    ELSE 21.0
                END as tax_rate,
                total_amount,
                FALSE as paid,
                created_at
            FROM expense
        ''')
        
        # Eliminar tabla antigua y renombrar la nueva
        print("🗑️ Eliminando tabla antigua...")
        cursor.execute('DROP TABLE expense')
        
        print("🔄 Renombrando tabla nueva...")
        cursor.execute('ALTER TABLE expense_new RENAME TO expense')
        
        # Crear índices
        print("📈 Creando índices...")
        cursor.execute('CREATE INDEX idx_expense_date ON expense(date)')
        cursor.execute('CREATE INDEX idx_expense_category ON expense(category)')
        
        conn.commit()
        print("✅ Migración completada exitosamente")
        
        # Verificar resultado
        cursor.execute('PRAGMA table_info(expense)')
        new_columns = cursor.fetchall()
        print(f"📋 Nueva estructura: {[col[1] for col in new_columns]}")
        
        cursor.execute('SELECT COUNT(*) FROM expense')
        count = cursor.fetchone()[0]
        print(f"📊 Registros migrados: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    print("🚀 Iniciando migración de tabla expense...")
    success = migrate_expense_table()
    if success:
        print("🎉 Migración completada. Puedes reiniciar el backend.")
    else:
        print("💥 Error en la migración.")
