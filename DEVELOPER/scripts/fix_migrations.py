"""
Script para aplicar migraciones faltantes
Maneja el conflicto de tabla 'product' que ya existe
"""
import sqlite3
from pathlib import Path

DB_PATH = Path("instance/app.db")

def fix_product_table():
    """
    Asegurar que la tabla product tiene todas las columnas necesarias
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("🔧 Verificando y corrigiendo tabla 'product'...")
    
    # Obtener columnas actuales
    cursor.execute("PRAGMA table_info(product)")
    columns = cursor.fetchall()
    existing_cols = [col[1] for col in columns]
    
    print(f"  Columnas actuales: {', '.join(existing_cols)}")
    
    # Columnas que deberían existir según migración 0003
    required_cols = {
        'id': 'INTEGER PRIMARY KEY',
        'category': 'VARCHAR(64) NOT NULL',
        'model': 'VARCHAR(128) NOT NULL',
        'sku': 'VARCHAR(64)',
        'stock_qty': 'INTEGER DEFAULT 0 NOT NULL',
        'price_net': 'FLOAT DEFAULT 0 NOT NULL',
        'tax_rate': 'FLOAT DEFAULT 21 NOT NULL',
        'features': 'JSON',
        'created_at': 'DATETIME'
    }
    
    # Columnas de migración 0005 (images)
    image_cols = {
        'images': 'JSON'
    }
    
    missing_cols = []
    
    # Verificar columnas faltantes
    for col, definition in required_cols.items():
        if col not in existing_cols:
            missing_cols.append((col, definition))
    
    # Añadir columnas faltantes
    if missing_cols:
        print(f"  ⚠️  Faltan {len(missing_cols)} columnas:")
        for col, definition in missing_cols:
            print(f"    - {col}")
            try:
                cursor.execute(f"ALTER TABLE product ADD COLUMN {col} {definition}")
                print(f"    ✅ Columna '{col}' añadida")
            except sqlite3.OperationalError as e:
                print(f"    ❌ Error al añadir '{col}': {e}")
    else:
        print("  ✅ Todas las columnas necesarias existen")
    
    # Verificar columna 'images' (migración 0005)
    if 'images' not in existing_cols:
        print("  📸 Añadiendo columna 'images'...")
        try:
            cursor.execute("ALTER TABLE product ADD COLUMN images JSON")
            print("  ✅ Columna 'images' añadida")
        except sqlite3.OperationalError as e:
            print(f"  ❌ Error: {e}")
    else:
        print("  ✅ Columna 'images' ya existe")
    
    conn.commit()
    conn.close()

def create_inventory_table():
    """
    Crear tabla inventory si no existe
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n📦 Verificando tabla 'inventory'...")
    
    # Verificar si existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory'")
    exists = cursor.fetchone()
    
    if not exists:
        print("  ⚠️  Tabla 'inventory' no existe, creándola...")
        cursor.execute("""
            CREATE TABLE inventory (
                id INTEGER PRIMARY KEY,
                product_id INTEGER NOT NULL,
                movement_type VARCHAR(32) NOT NULL,
                quantity INTEGER NOT NULL,
                notes TEXT,
                created_at DATETIME,
                FOREIGN KEY (product_id) REFERENCES product (id)
            )
        """)
        print("  ✅ Tabla 'inventory' creada")
    else:
        print("  ✅ Tabla 'inventory' ya existe")
    
    conn.commit()
    conn.close()

def add_invoice_paid_columns():
    """
    Añadir columnas 'paid', 'paid_date', 'notes' a tabla invoice
    (Migración 0004)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n📄 Verificando columnas de factura (paid, paid_date, notes)...")
    
    # Obtener columnas actuales
    cursor.execute("PRAGMA table_info(invoice)")
    columns = cursor.fetchall()
    existing_cols = [col[1] for col in columns]
    
    # Añadir columnas faltantes
    cols_to_add = {
        'paid': 'BOOLEAN DEFAULT 0',
        'paid_date': 'DATE',
        'notes': 'TEXT'
    }
    
    for col, definition in cols_to_add.items():
        if col not in existing_cols:
            print(f"  ⚠️  Columna 'invoice.{col}' no existe, añadiéndola...")
            try:
                cursor.execute(f"ALTER TABLE invoice ADD COLUMN {col} {definition}")
                print(f"  ✅ Columna '{col}' añadida")
            except sqlite3.OperationalError as e:
                print(f"  ❌ Error: {e}")
        else:
            print(f"  ✅ Columna 'invoice.{col}' ya existe")
    
    conn.commit()
    conn.close()

def add_invoice_item_product_link():
    """
    Añadir columna product_id a invoice_item si no existe
    (Migración 0003)
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n🔗 Verificando link invoice_item.product_id...")
    
    cursor.execute("PRAGMA table_info(invoice_item)")
    columns = cursor.fetchall()
    existing_cols = [col[1] for col in columns]
    
    if 'product_id' not in existing_cols:
        print("  ⚠️  Columna 'invoice_item.product_id' no existe, añadiéndola...")
        try:
            cursor.execute("ALTER TABLE invoice_item ADD COLUMN product_id INTEGER")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_invoice_item_product_id ON invoice_item (product_id)")
            print("  ✅ Columna 'product_id' e índice añadidos")
        except sqlite3.OperationalError as e:
            print(f"  ❌ Error: {e}")
    else:
        print("  ✅ Columna 'invoice_item.product_id' ya existe")
    
    conn.commit()
    conn.close()

def update_alembic_version():
    """
    Actualizar alembic_version a la última migración
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n🔄 Actualizando versión de Alembic...")
    
    # Actualizar a última migración (0005)
    cursor.execute("UPDATE alembic_version SET version_num = '0005_add_product_images'")
    
    conn.commit()
    conn.close()
    
    print("  ✅ Alembic actualizado a: 0005_add_product_images")

def main():
    print("\n🔧 APLICANDO FIX DE MIGRACIONES")
    print("=" * 60)
    
    if not DB_PATH.exists():
        print(f"\n❌ Base de datos no encontrada: {DB_PATH.absolute()}")
        return 1
    
    print(f"📂 Base de datos: {DB_PATH.absolute()}\n")
    
    # Ejecutar fixes en orden
    try:
        fix_product_table()
        create_inventory_table()
        add_invoice_paid_columns()
        add_invoice_item_product_link()
        update_alembic_version()
        
        print("\n" + "=" * 60)
        print("✅ FIX COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        print("\n💡 Ahora puedes:")
        print("   1. Iniciar el backend: python app.py")
        print("   2. Verificar que funciona: curl http://localhost:5001/api/health")
        print("   3. Probar productos en el frontend")
        print("\n")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
