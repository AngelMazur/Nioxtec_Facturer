"""Script para verificar qué datos hay en la base de datos"""
import sys
import os
from datetime import datetime

# Agregar el path del proyecto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app import app, db, Invoice, Expense, Client

def main():
    with app.app_context():
        print("=" * 60)
        print("VERIFICACIÓN DE DATOS EN LA BASE DE DATOS")
        print("=" * 60)
        print()
        
        # Clientes
        clients = Client.query.all()
        print(f"📋 CLIENTES: {len(clients)} registros")
        if clients:
            for c in clients[:5]:
                print(f"   - {c.name} (CIF: {c.cif})")
            if len(clients) > 5:
                print(f"   ... y {len(clients) - 5} más")
        print()
        
        # Facturas
        invoices = Invoice.query.all()
        print(f"📄 FACTURAS: {len(invoices)} registros")
        
        # Agrupar por año
        years = {}
        for inv in invoices:
            year = inv.date.year if inv.date else 0
            if year not in years:
                years[year] = {'total': 0, 'factura': 0, 'proforma': 0, 'paid': 0, 'unpaid': 0}
            years[year]['total'] += 1
            if inv.type == 'factura':
                years[year]['factura'] += 1
            else:
                years[year]['proforma'] += 1
            if inv.paid:
                years[year]['paid'] += 1
            else:
                years[year]['unpaid'] += 1
        
        for year in sorted(years.keys(), reverse=True):
            data = years[year]
            print(f"\n   Año {year}:")
            print(f"      Total: {data['total']}")
            print(f"      Facturas: {data['factura']} (Pagadas: {data['paid']}, Pendientes: {data['unpaid']})")
            print(f"      Proformas: {data['proforma']}")
        
        # Mostrar algunas facturas recientes
        recent = Invoice.query.order_by(Invoice.date.desc()).limit(5).all()
        if recent:
            print(f"\n   Últimas 5 facturas:")
            for inv in recent:
                status = "✅ Pagada" if inv.paid else "⏳ Pendiente"
                print(f"      {inv.number} - {inv.date} - {inv.type} - {inv.total}€ - {status}")
        print()
        
        # Gastos
        expenses = Expense.query.all()
        print(f"💰 GASTOS: {len(expenses)} registros")
        
        # Agrupar por año
        years_exp = {}
        for exp in expenses:
            year = exp.date.year if exp.date else 0
            if year not in years_exp:
                years_exp[year] = {'count': 0, 'total': 0}
            years_exp[year]['count'] += 1
            years_exp[year]['total'] += float(exp.total or 0)
        
        for year in sorted(years_exp.keys(), reverse=True):
            data = years_exp[year]
            print(f"\n   Año {year}:")
            print(f"      Cantidad: {data['count']}")
            print(f"      Total: {data['total']:.2f}€")
        
        # Mostrar algunos gastos recientes
        recent_exp = Expense.query.order_by(Expense.date.desc()).limit(5).all()
        if recent_exp:
            print(f"\n   Últimos 5 gastos:")
            for exp in recent_exp:
                print(f"      {exp.date} - {exp.description[:30]} - {exp.total}€")
        print()
        
        # Diagnóstico para reportes
        print("=" * 60)
        print("DIAGNÓSTICO PARA REPORTES 2025")
        print("=" * 60)
        
        # Facturas pagadas en 2025
        invoices_2025_paid = Invoice.query.filter(
            db.extract('year', Invoice.date) == 2025,
            Invoice.type == 'factura',
            Invoice.paid == True
        ).all()
        
        print(f"\n📊 Facturas pagadas en 2025: {len(invoices_2025_paid)}")
        if invoices_2025_paid:
            total_income = sum(float(inv.total or 0) for inv in invoices_2025_paid)
            print(f"   Total ingresos: {total_income:.2f}€")
            for inv in invoices_2025_paid[:5]:
                print(f"      {inv.number} - {inv.date} - {inv.total}€")
        else:
            print("   ⚠️  NO HAY FACTURAS PAGADAS EN 2025")
            print("   Esto explica por qué los reportes muestran 0.00€ en ingresos")
        
        # Gastos en 2025
        expenses_2025 = Expense.query.filter(
            db.extract('year', Expense.date) == 2025
        ).all()
        
        print(f"\n💸 Gastos en 2025: {len(expenses_2025)}")
        if expenses_2025:
            total_expenses = sum(float(exp.total or 0) for exp in expenses_2025)
            print(f"   Total gastos: {total_expenses:.2f}€")
            for exp in expenses_2025[:5]:
                print(f"      {exp.date} - {exp.description[:30]} - {exp.total}€")
        
        print()
        print("=" * 60)
        print("SOLUCIÓN")
        print("=" * 60)
        
        if not invoices_2025_paid:
            print("\n💡 Para ver datos en los reportes de 2025:")
            print("   1. Crea facturas (no proformas) en el año 2025")
            print("   2. Marca las facturas como PAGADAS")
            print("   3. O cambia el año en el selector a un año con datos")
            
            # Verificar si hay facturas en otros años
            other_years = [y for y in years.keys() if y != 2025 and years[y]['paid'] > 0]
            if other_years:
                print(f"\n   ℹ️  Hay facturas pagadas en: {', '.join(map(str, sorted(other_years, reverse=True)))}")
                print(f"      Prueba a cambiar el año en el selector a uno de estos años")
        
        print()

if __name__ == '__main__':
    main()
