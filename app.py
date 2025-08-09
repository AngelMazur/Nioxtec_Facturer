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

from datetime import datetime, timedelta
import os
from flask import Flask, jsonify, request, render_template, send_file, abort, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

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
# CORS configurable (por defecto permite localhost dev y nginx)
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080')
CORS(app, resources={r"/*": {"origins": [o.strip() for o in cors_origins.split(',') if o.strip()]}})

# JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-secret')
jwt = JWTManager(app)
# Ampliar la vida del token para mantener sesión hasta cerrar (30 días)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
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

# Asegurar carpeta static para logo PDF
STATIC_FOLDER = os.path.join(app.root_path, 'static')
os.makedirs(STATIC_FOLDER, exist_ok=True)


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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


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


class User(db.Model):
    """Basic user for authentication."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


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
    # Ensure Client.created_at column exists (SQLite quick migration)
    try:
        inspector = inspect(db.engine)
        cols = [c['name'] for c in inspector.get_columns('client')]
        if 'created_at' not in cols:
            if database_url.startswith('sqlite'):
                db.session.execute(text("ALTER TABLE client ADD COLUMN created_at DATETIME"))
                db.session.execute(text("UPDATE client SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
                db.session.commit()
            else:
                db.session.execute(text("ALTER TABLE client ADD COLUMN created_at TIMESTAMP DEFAULT NOW()"))
                db.session.commit()
    except Exception:
        pass
    # Crear usuario admin inicial si hay variables de entorno definidas y no existe
    admin_user = os.getenv('ADMIN_USERNAME')
    admin_pass = os.getenv('ADMIN_PASSWORD')
    if admin_user and admin_pass:
        if not User.query.filter_by(username=admin_user).first():
            db.session.add(User(username=admin_user, password_hash=generate_password_hash(admin_pass)))
            db.session.commit()


@app.route('/')
def index():
    """Home page displaying minimal UI for demonstration."""
    # The React front‑end embedded in index.html fetches clients via API, so
    # there's no need to pass any context here.  Just render the template.
    return render_template('index.html')


@app.route('/api/clients', methods=['POST'])
@jwt_required()
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


@app.route('/api/clients', methods=['GET'])
@jwt_required()
def list_clients():
    """Return clients with optional pagination: limit, offset."""
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int, default=0)
    query = Client.query
    total = query.count()
    if limit:
        query = query.offset(offset or 0).limit(limit)
    clients = query.all()
    items = []
    for c in clients:
        items.append({
            'id': c.id,
            'name': c.name,
            'cif': c.cif,
            'address': c.address,
            'email': c.email,
            'phone': c.phone,
            'iban': c.iban,
            'created_at': c.created_at.isoformat() if hasattr(c, 'created_at') and c.created_at else None,
        })
    return jsonify({'items': items, 'total': total})


@app.route('/api/invoices', methods=['POST'])
@jwt_required()
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
    try:
    db.session.flush()  # flush to obtain invoice.id
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'El número de factura ya existe'}), 409
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
    return jsonify({
        'id': invoice.id,
        'number': invoice.number,
        'date': invoice.date.isoformat(),
        'type': invoice.type,
        'client_id': invoice.client_id,
        'notes': invoice.notes,
        'total': invoice.total,
        'tax_total': invoice.tax_total,
        'items': [
            {
                'description': it.description,
                'units': it.units,
                'unit_price': it.unit_price,
                'tax_rate': it.tax_rate,
                'subtotal': it.subtotal,
                'total': it.total,
            }
            for it in invoice.items
        ],
    }), 201


@app.route('/api/invoices', methods=['GET'])
@jwt_required()
def list_invoices():
    """List invoices, optionally filtered by month and year, with pagination."""
    month = request.args.get('month')
    year = request.args.get('year')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int, default=0)
    query = Invoice.query
    if month and year:
        try:
            month = int(month)
            year = int(year)
            query = query.filter(db.extract('month', Invoice.date) == month)
            query = query.filter(db.extract('year', Invoice.date) == year)
        except ValueError:
            return jsonify({'error': 'Month and year must be integers'}), 400
    total = query.count()
    if limit:
        query = query.offset(offset or 0).limit(limit)
    invoices = query.all()
    items = []
    for inv in invoices:
        items.append({
            'id': inv.id,
            'number': inv.number,
            'date': inv.date.isoformat(),
            'client_id': inv.client_id,
            'type': inv.type,
            'total': inv.total,
            'tax_total': inv.tax_total
        })
    return jsonify({'items': items, 'total': total})


@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    inv = Invoice.query.get_or_404(invoice_id)
    return jsonify({
        'id': inv.id,
        'number': inv.number,
        'date': inv.date.isoformat(),
        'client_id': inv.client_id,
        'type': inv.type,
        'notes': inv.notes,
        'total': inv.total,
        'tax_total': inv.tax_total,
        'items': [
            {
                'description': it.description,
                'units': it.units,
                'unit_price': it.unit_price,
                'tax_rate': it.tax_rate,
                'subtotal': it.subtotal,
                'total': it.total,
            }
            for it in inv.items
        ],
    })


@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    inv = Invoice.query.get_or_404(invoice_id)
    for it in list(inv.items):
        db.session.delete(it)
    db.session.delete(inv)
    db.session.commit()
    return jsonify({'status': 'deleted'})


@app.route('/api/clients/<int:client_id>', methods=['PUT'])
@jwt_required()
def update_client(client_id):
    client = Client.query.get_or_404(client_id)
    data = request.get_json(force=True)
    for field in ['name', 'cif', 'address', 'email', 'phone', 'iban']:
        if field in data:
            setattr(client, field, data[field])
    db.session.commit()
    return jsonify({'status': 'ok'})


@app.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    inv = Invoice.query.get_or_404(invoice_id)
    data = request.get_json(force=True)
    # Basic fields
    if 'number' in data:
        inv.number = data['number']
    if 'date' in data:
        inv.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    if 'type' in data:
        inv.type = data['type']
    if 'client_id' in data:
        inv.client_id = int(data['client_id'])
    inv.notes = data.get('notes', inv.notes)
    # Replace items if provided
    items_data = data.get('items')
    if items_data is not None:
        for it in list(inv.items):
            db.session.delete(it)
        subtotal, tax_amount, total = calculate_totals(items_data)
        inv.total = total
        inv.tax_total = tax_amount
        db.session.flush()
        for item in items_data:
            line = InvoiceItem(
                invoice_id=inv.id,
                description=item['description'],
                units=item['units'],
                unit_price=item['unit_price'],
                tax_rate=item['tax_rate'],
                subtotal=item['units'] * item['unit_price'],
                total=item['units'] * item['unit_price'] * (1 + item['tax_rate'] / 100)
            )
            db.session.add(line)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'El número de factura ya existe'}), 409
    return jsonify({'status': 'ok'})


@app.route('/api/invoices/<int:invoice_id>/convert', methods=['PATCH'])
@jwt_required()
def convert_proforma(invoice_id):
    inv = Invoice.query.get_or_404(invoice_id)
    data = request.get_json(force=True)
    new_number = data.get('number')
    if not new_number:
        return jsonify({'error': 'Debe proporcionar el nuevo número de factura'}), 400
    inv.type = 'factura'
    inv.number = new_number
    inv.date = datetime.utcnow().date()
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'El número de factura ya existe'}), 409
    return jsonify({'status': 'ok'})


@app.route('/api/reports/summary')
@jwt_required()
def reports_summary():
    year = request.args.get('year', type=int, default=datetime.utcnow().year)
    # Sum totals by month for invoices type 'factura'
    rows = (
        db.session.query(db.extract('month', Invoice.date).label('month'), db.func.sum(Invoice.total))
        .filter(db.extract('year', Invoice.date) == year)
        .filter(Invoice.type == 'factura')
        .group_by('month')
        .order_by('month')
        .all()
    )
    by_month = {int(m): float(t or 0) for m, t in rows}
    total_year = sum(by_month.values())
    return jsonify({'year': year, 'by_month': by_month, 'total_year': total_year})


@app.route('/api/reports/heatmap')
@jwt_required()
def reports_heatmap():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    if not year or not month:
        return jsonify({'error': 'Parámetros year y month requeridos'}), 400
    rows = (
        db.session.query(Invoice.date, db.func.sum(Invoice.total))
        .filter(db.extract('year', Invoice.date) == year)
        .filter(db.extract('month', Invoice.date) == month)
        .filter(Invoice.type == 'factura')
        .group_by(Invoice.date)
        .all()
    )
    by_day = {d.strftime('%Y-%m-%d'): float(t or 0) for d, t in rows}
    return jsonify({'year': year, 'month': month, 'by_day': by_day})


def _csv_response(filename: str, content: str) -> Response:
    return Response(
        content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}
    )


@app.route('/api/clients/export')
@jwt_required()
def export_clients():
    clients = Client.query.order_by(Client.id).all()
    lines = ['id,name,cif,address,email,phone,iban,created_at']
    for c in clients:
        lines.append(
            f'{c.id},"{c.name}",{c.cif},"{c.address}",{c.email},{c.phone},{c.iban or ""},{(c.created_at or "")}'
        )
    return _csv_response('clientes.csv', '\n'.join(lines))


@app.route('/api/invoices/export')
@jwt_required()
def export_invoices():
    invoices = Invoice.query.order_by(Invoice.id).all()
    lines = ['id,number,date,type,client_id,total,tax_total']
    for inv in invoices:
        lines.append(
            f'{inv.id},{inv.number},{inv.date.isoformat()},{inv.type},{inv.client_id},{inv.total},{inv.tax_total}'
        )
    return _csv_response('facturas.csv', '\n'.join(lines))


@app.route('/api/clients/export_xlsx')
@jwt_required()
def export_clients_xlsx():
    # Lazy import to avoid hard dependency if not used
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    ws.title = 'Clientes'
    ws.append(['id','name','cif','address','email','phone','iban','created_at'])
    for c in Client.query.order_by(Client.id).all():
        ws.append([c.id, c.name, c.cif, c.address, c.email, c.phone, c.iban or '', c.created_at])
    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)
    return send_file(bio, as_attachment=True, download_name='clientes.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/api/invoices/export_xlsx')
@jwt_required()
def export_invoices_xlsx():
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    ws.title = 'Facturas'
    ws.append(['id','number','date','type','client_id','total','tax_total'])
    for inv in Invoice.query.order_by(Invoice.id).all():
        ws.append([inv.id, inv.number, inv.date.isoformat(), inv.type, inv.client_id, inv.total, inv.tax_total])
    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)
    return send_file(bio, as_attachment=True, download_name='facturas.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/api/invoices/<int:invoice_id>/pdf', methods=['GET'])
@jwt_required()
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
    # Build absolute file URI for logo to avoid network issues in wkhtmltopdf
    logo_path = os.path.join(STATIC_FOLDER, 'logo_invoice.png')
    logo_uri = f"file://{logo_path}"
    rendered = render_template('invoice_template.html', invoice=invoice, client=client,
                               company=company, items=items, logo_uri=logo_uri)
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
        options = {
            'enable-local-file-access': None,
        }
        # Provide base URL to resolve relative CSS/images if needed
        pdf_bytes = pdfkit.from_string(rendered, False, options=options)
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


# -------------------------------------
# Auth
# -------------------------------------

@app.post('/api/auth/register')
@jwt_required(optional=True)
def register():
    """Crea el primer usuario sin token; posteriores requieren token."""
    identity = get_jwt_identity()
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username y password requeridos'}), 400
    existing_count = User.query.count()
    if existing_count > 0 and not identity:
        return jsonify({'error': 'No autorizado'}), 401
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Usuario ya existe'}), 409
    user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify({'status': 'ok'}), 201


@app.post('/api/auth/login')
def login():
    """
    Authenticate user and return JWT access token.
    
    Validates username/password combination and returns JWT token for API access.
    Token expires after 30 days.
    
    Returns:
        JSON: Access token on success or error message on failure
    """
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username y password requeridos'}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    token = create_access_token(identity=username)
    return jsonify({'access_token': token})


if __name__ == '__main__':
    debug_env = os.getenv('FLASK_DEBUG', 'true').lower() in ('1', 'true', 'yes')
    app.run(debug=debug_env)