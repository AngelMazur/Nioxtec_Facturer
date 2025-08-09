"""
Nioxtec Facturer
=================

This Flask application implements a very small invoice/proforma
management system designed for sole traders and small businesses.
It exposes a REST‑style API for creating clients and invoices as
well as an HTML front‑end that allows you to fill in forms and
generate PDFs.  Everything is kept intentionally simple so that
non‑programmers can understand the overall flow.

The core ideas implemented here follow widely accepted
recommendations for invoice management.  For example, the EU
directive on invoicing requires that each invoice include a unique
sequential number, the date of issue, the supplier’s and customer’s
VAT numbers, the full names and addresses of both parties and the
detailed description of goods or services provided【816995957740757†L97-L115】.  In
addition, the database schema uses one‑to‑many relationships
between invoices and their line items so that each invoice can
contain multiple entries without duplicating client data【816995957740757†L130-L151】.

The application also relies on WeasyPrint to render HTML and CSS
templates as high quality PDFs.  WeasyPrint is a free and open
source library that acts like a headless browser – it supports
modern CSS features such as flexbox and grid and integrates
seamlessly with Jinja templates【239017722105616†L76-L83】.  This makes it ideal
for generating invoices, reports and other documents【239017722105616†L83-L94】.
"""

from datetime import datetime
import os
from flask import Flask, jsonify, request, render_template, send_file, abort, url_for
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()

# Control de motor PDF mediante variable de entorno
# USE_WEASYPRINT=true intentará usar WeasyPrint; de lo contrario se usa pdfkit/wkhtmltopdf
USE_WEASYPRINT_ENV = os.getenv('USE_WEASYPRINT', 'false').lower() in ('1', 'true', 'yes')
use_weasyprint = False
if USE_WEASYPRINT_ENV:
    try:
        # WeasyPrint es preferido por su soporte de CSS moderno
        from weasyprint import HTML  # type: ignore
        use_weasyprint = True
    except Exception:
        # Si WeasyPrint falla al importar, continuamos con pdfkit
        use_weasyprint = False

try:
    import pdfkit  # type: ignore
except Exception:
    pdfkit = None
import io

# -----------------------------------------------------------------------------
# Flask configuration
#
# For a small project like this SQLite is perfectly adequate.  It stores
# all your data in a single file (app.db) and requires no external server.
# When you grow beyond a single user you can switch SQLALCHEMY_DATABASE_URI
# to a PostgreSQL connection string without changing your code.
app = Flask(__name__, instance_relative_config=True)
# Asegurar carpeta de instancia (para SQLite por defecto)
os.makedirs(app.instance_path, exist_ok=True)

# Base de datos configurable vía env; por defecto usa instance/app.db
database_url = os.getenv('DATABASE_URL') or f"sqlite:///{os.path.join(app.instance_path, 'app.db')}"
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Directory where generated PDFs will be saved.  This makes it easy for the
# React front‑end to offer downloadable links.  The folder is created on
# startup if it doesn't exist.
DOWNLOAD_FOLDER = os.path.join(app.root_path, 'downloads')
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


# -----------------------------------------------------------------------------
# Database models
#
# Each class below corresponds to a table in the database.  SQLAlchemy
# automatically creates foreign key relationships for us when we reference
# another model.

class CompanyConfig(db.Model):
    """Stores fixed company information printed on every document."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    cif = db.Column(db.String(32), nullable=False)
    address = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(64), nullable=False)
    iban = db.Column(db.String(64))
    website = db.Column(db.String(128))


class Client(db.Model):
    """Represents a customer or client."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    cif = db.Column(db.String(32), nullable=False)
    address = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(64), nullable=False)
    iban = db.Column(db.String(64))


class Invoice(db.Model):
    """Represents both invoices and proformas."""
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(32), unique=True, nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)  # 'factura' or 'proforma'
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    notes = db.Column(db.Text)
    total = db.Column(db.Float, default=0.0)
    tax_total = db.Column(db.Float, default=0.0)
    client = db.relationship('Client', backref=db.backref('invoices', lazy=True))


class InvoiceItem(db.Model):
    """Line items that belong to an invoice."""
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    description = db.Column(db.String(512), nullable=False)
    units = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float, nullable=False)  # as percentage, e.g. 21 for 21%
    subtotal = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    invoice = db.relationship('Invoice', backref=db.backref('items', lazy=True))


# -----------------------------------------------------------------------------
# Helper functions

def calculate_totals(items):
    """Compute the subtotal, tax amount and total for a list of items."""
    subtotal_sum = sum(item['units'] * item['unit_price'] for item in items)
    tax_sum = sum(item['units'] * item['unit_price'] * (item['tax_rate'] / 100) for item in items)
    total_sum = subtotal_sum + tax_sum
    return subtotal_sum, tax_sum, total_sum


# -----------------------------------------------------------------------------
# Routes
#
# These API endpoints allow you to programmatically interact with the
# application.  You can also build a simple front‑end on top of these by
# submitting forms via fetch/XHR.

# Create database tables once at startup.  The `before_first_request` decorator
# was removed in Flask 3【582101706213846†L169-L173】, so we explicitly initialize
# the database here using the application context.
with app.app_context():
    db.create_all()


@app.route('/')
def index():
    """Home page displaying minimal UI for demonstration."""
    # The React front‑end embedded in index.html fetches clients via API, so
    # there's no need to pass any context here.  Just render the template.
    return render_template('index.html')


@app.route('/clients', methods=['POST'])
def create_client():
    """Create a new client via JSON request."""
    data = request.get_json(force=True)
    client = Client(
        name=data.get('name'),
        cif=data.get('cif'),
        address=data.get('address'),
        email=data.get('email'),
        phone=data.get('phone'),
        iban=data.get('iban')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify({'id': client.id}), 201


@app.route('/clients', methods=['GET'])
def list_clients():
    """Return all clients in JSON format."""
    clients = Client.query.all()
    result = []
    for c in clients:
        result.append({
            'id': c.id,
            'name': c.name,
            'cif': c.cif,
            'address': c.address,
            'email': c.email,
            'phone': c.phone,
            'iban': c.iban
        })
    return jsonify(result)


@app.route('/invoices', methods=['POST'])
def create_invoice():
    """Create a new invoice or proforma and its items."""
    data = request.get_json(force=True)
    number = data.get('number')
    date_str = data.get('date')
    invoice_type = data.get('type', 'factura')
    client_id = data.get('client_id')
    notes = data.get('notes', '')
    items_data = data.get('items', [])
    if not (number and date_str and client_id and items_data):
        return jsonify({'error': 'Missing required fields'}), 400
    # Convert date string to date object
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    # Compute totals
    subtotal, tax_amount, total = calculate_totals(items_data)
    invoice = Invoice(
        number=number,
        date=date_obj,
        type=invoice_type,
        client_id=client_id,
        notes=notes,
        total=total,
        tax_total=tax_amount
    )
    db.session.add(invoice)
    db.session.flush()  # flush to obtain invoice.id
    for item in items_data:
        line = InvoiceItem(
            invoice_id=invoice.id,
            description=item['description'],
            units=item['units'],
            unit_price=item['unit_price'],
            tax_rate=item['tax_rate'],
            subtotal=item['units'] * item['unit_price'],
            total=item['units'] * item['unit_price'] * (1 + item['tax_rate'] / 100)
        )
        db.session.add(line)
    db.session.commit()
    return jsonify({'id': invoice.id}), 201


@app.route('/invoices', methods=['GET'])
def list_invoices():
    """List invoices, optionally filtered by month and year."""
    month = request.args.get('month')
    year = request.args.get('year')
    query = Invoice.query
    if month and year:
        try:
            month = int(month)
            year = int(year)
            query = query.filter(db.extract('month', Invoice.date) == month)
            query = query.filter(db.extract('year', Invoice.date) == year)
        except ValueError:
            return jsonify({'error': 'Month and year must be integers'}), 400
    invoices = query.all()
    result = []
    for inv in invoices:
        result.append({
            'id': inv.id,
            'number': inv.number,
            'date': inv.date.isoformat(),
            'client_id': inv.client_id,
            'type': inv.type,
            'total': inv.total,
            'tax_total': inv.tax_total
        })
    return jsonify(result)


@app.route('/invoices/<int:invoice_id>/pdf', methods=['GET'])
def invoice_pdf(invoice_id):
    """Generate a PDF for a given invoice."""
    invoice = Invoice.query.get_or_404(invoice_id)
    client = invoice.client
    company = CompanyConfig.query.first()
    # Ensure we have company data; otherwise create default dummy
    if not company:
        company = CompanyConfig(
            name='Mi Empresa',
            cif='A00000000',
            address='Dirección de ejemplo',
            email='info@example.com',
            phone='000 000 000',
            iban='',
            website=''
        )
    items = invoice.items
    rendered = render_template('invoice_template.html', invoice=invoice, client=client,
                               company=company, items=items)
    filename = f"{invoice.type}_{invoice.number}.pdf"
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)
    if use_weasyprint:
        try:
            pdf_io = io.BytesIO()
            HTML(string=rendered).write_pdf(target=pdf_io)
            pdf_bytes = pdf_io.getvalue()
        except Exception as e:
            # Fall back to pdfkit if any error occurs in WeasyPrint.
            if pdfkit is None:
                abort(500, description='No hay motor PDF disponible. Instale wkhtmltopdf o desactive USE_WEASYPRINT.')
            pdf_bytes = pdfkit.from_string(rendered, False)
    else:
        # pdfkit.from_string returns PDF binary when output_path=False
        # Ensure wkhtmltopdf binary is available in your system PATH.
        if pdfkit is None:
            abort(500, description='wkhtmltopdf no disponible. Instale wkhtmltopdf o active USE_WEASYPRINT=true con dependencias de WeasyPrint.')
        pdf_bytes = pdfkit.from_string(rendered, False)
    # Save the PDF to the downloads folder
    with open(file_path, 'wb') as f:
        f.write(pdf_bytes)
    pdf_io = io.BytesIO(pdf_bytes)
    return send_file(pdf_io, mimetype='application/pdf', as_attachment=True,
                     download_name=filename)


@app.route('/health', methods=['GET'])
def health():
    """Sonda de salud simple para monitoreo/compose."""
    return jsonify({
        'status': 'ok',
        'use_weasyprint': use_weasyprint,
        'database': app.config.get('SQLALCHEMY_DATABASE_URI', '')
    })


if __name__ == '__main__':
    debug_env = os.getenv('FLASK_DEBUG', 'true').lower() in ('1', 'true', 'yes')
    app.run(debug=debug_env)