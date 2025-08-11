"""
Dev seeding script (LOCAL ONLY):
 - Creates a user 'dev' with password 'devpass' if not exists
 - Creates a demo client and a factura with one line
This operates directly on the local SQLite/DB configured by app.py.
"""
from datetime import date
from werkzeug.security import generate_password_hash

from app import app, db, User, Client, Invoice, InvoiceItem, calculate_totals


def ensure_user():
    user = User.query.filter_by(username='dev').first()
    if not user:
        user = User(username='dev', password_hash=generate_password_hash('devpass'))
        db.session.add(user)
        db.session.commit()
    return user


def ensure_client():
    client = Client.query.filter_by(name='Cliente Demo').first()
    if not client:
        client = Client(
            name='Cliente Demo',
            cif='X0000000Z',
            address='Dirección demo 123',
            email='demo@example.com',
            phone='600000000',
            iban='ES00 0000 0000 0000 0000 0000'
        )
        db.session.add(client)
        db.session.commit()
    return client


def create_invoice(client_id: int, inv_type: str = 'factura') -> Invoice:
    items = [
        { 'description': 'Servicio demo', 'units': 2, 'unit_price': 50.0, 'tax_rate': 21.0 }
    ]
    subtotal, tax, total = calculate_totals(items)
    inv = Invoice(
        number=f'LOCAL_TEST_{inv_type.upper()}_{date.today().strftime("%Y%m%d")}',
        date=date.today(),
        type=inv_type,
        client_id=client_id,
        notes='Factura de prueba local',
        total=total,
        tax_total=tax,
    )
    db.session.add(inv)
    db.session.flush()
    for it in items:
        line = InvoiceItem(
            invoice_id=inv.id,
            description=it['description'],
            units=it['units'],
            unit_price=it['unit_price'],
            tax_rate=it['tax_rate'],
            subtotal=it['units'] * it['unit_price'],
            total=it['units'] * it['unit_price'] * (1 + it['tax_rate'] / 100),
        )
        db.session.add(line)
    db.session.commit()
    return inv


if __name__ == '__main__':
    with app.app_context():
        u = ensure_user()
        c = ensure_client()
        inv = create_invoice(c.id, 'factura')
        print({'user': u.username, 'client_id': c.id, 'invoice_id': inv.id, 'number': inv.number})


