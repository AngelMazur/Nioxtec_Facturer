"""
Script de diagnóstico de base de datos
Verifica estado de migraciones y tablas existentes
"""
import sqlite3
from pathlib import Path
import sys

DB_PATH = Path("instance/app.db")

def check_tables():
    """Verificar qué tablas existen"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    
    print("=" * 60)
    print("📋 TABLAS EXISTENTES EN LA BASE DE DATOS")
    print("=" * 60)
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  ✓ {table:<30} ({count} registros)")
    
    conn.close()
    return tables

def check_alembic_version():
    """Ver qué migración está aplicada según Alembic"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n" + "=" * 60)
    print("🔍 ESTADO DE MIGRACIONES (Alembic)")
    print("=" * 60)
    
    try:
        cursor.execute("SELECT version_num FROM alembic_version")
        version = cursor.fetchone()
        
        if version:
            print(f"  ✅ Migración actual: {version[0]}")
        else:
            print("  ⚠️  No hay migración registrada")
    except sqlite3.OperationalError:
        print("  ❌ Tabla alembic_version no existe")
    
    conn.close()

def check_product_structure():
    """Verificar estructura de tabla product si existe"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n" + "=" * 60)
    print("🏗️  ESTRUCTURA DE TABLA 'product'")
    print("=" * 60)
    
    try:
        cursor.execute("PRAGMA table_info(product)")
        columns = cursor.fetchall()
        
        if columns:
            for col in columns:
                null_str = "NOT NULL" if col[3] == 1 else "NULL"
                default = f"DEFAULT {col[4]}" if col[4] else ""
                print(f"  • {col[1]:<20} {col[2]:<15} {null_str:<10} {default}")
        else:
            print("  ⚠️  Tabla existe pero sin columnas")
    except sqlite3.OperationalError as e:
        print(f"  ❌ Tabla 'product' no existe o error: {e}")
    
    conn.close()

def check_inventory_structure():
    """Verificar estructura de tabla inventory si existe"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n" + "=" * 60)
    print("📦 ESTRUCTURA DE TABLA 'inventory'")
    print("=" * 60)
    
    try:
        cursor.execute("PRAGMA table_info(inventory)")
        columns = cursor.fetchall()
        
        if columns:
            for col in columns:
                null_str = "NOT NULL" if col[3] == 1 else "NULL"
                default = f"DEFAULT {col[4]}" if col[4] else ""
                print(f"  • {col[1]:<20} {col[2]:<15} {null_str:<10} {default}")
        else:
            print("  ⚠️  Tabla existe pero sin columnas")
    except sqlite3.OperationalError:
        print("  ❌ Tabla 'inventory' no existe")
    
    conn.close()

def check_invoice_columns():
    """Verificar si la tabla invoice tiene la columna 'paid'"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n" + "=" * 60)
    print("📄 COLUMNAS DE TABLA 'invoice'")
    print("=" * 60)
    
    try:
        cursor.execute("PRAGMA table_info(invoice)")
        columns = cursor.fetchall()
        
        if columns:
            col_names = [col[1] for col in columns]
            
            # Verificar columnas importantes
            important_cols = ['id', 'paid', 'paid_date', 'payment_method']
            for col_name in important_cols:
                if col_name in col_names:
                    print(f"  ✅ {col_name}")
                else:
                    print(f"  ❌ {col_name} (NO EXISTE)")
            
            print(f"\n  Total columnas: {len(col_names)}")
        else:
            print("  ⚠️  Tabla existe pero sin columnas")
    except sqlite3.OperationalError:
        print("  ❌ Tabla 'invoice' no existe")
    
    conn.close()

def main():
    print("\n🔬 DIAGNÓSTICO COMPLETO DE BASE DE DATOS")
    print("=" * 60)
    
    if not DB_PATH.exists():
        print(f"\n❌ ERROR: Base de datos no encontrada en: {DB_PATH.absolute()}")
        print(f"\n💡 Asegúrate de estar en el directorio correcto:")
        print(f"   cd C:\\Nioxtec\\Nioxtec_Facturer")
        sys.exit(1)
    
    print(f"📂 Base de datos: {DB_PATH.absolute()}")
    print(f"📊 Tamaño: {DB_PATH.stat().st_size / 1024:.2f} KB\n")
    
    # Ejecutar diagnósticos
    tables = check_tables()
    check_alembic_version()
    
    if "product" in tables:
        check_product_structure()
    
    if "inventory" in tables:
        check_inventory_structure()
    
    if "invoice" in tables:
        check_invoice_columns()
    
    # Recomendaciones
    print("\n" + "=" * 60)
    print("💡 RECOMENDACIONES")
    print("=" * 60)
    
    if "product" in tables and "inventory" in tables:
        print("  ✅ Tablas de productos ya existen")
        print("  📝 Acción recomendada:")
        print("     alembic stamp 0003_products_inventory")
        print("     alembic stamp 0004_invoice_paid_flag") 
        print("     alembic stamp 0005_add_product_images")
        print("     alembic upgrade head")
    elif "product" in tables:
        print("  ⚠️  Tabla 'product' existe pero 'inventory' no")
        print("  📝 Revisar estado de migración manualmente")
    else:
        print("  ✅ Tablas de productos no existen")
        print("  📝 Acción recomendada:")
        print("     alembic upgrade head")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
