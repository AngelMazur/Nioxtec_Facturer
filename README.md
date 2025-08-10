# NIOXTEC Facturer

A modern invoice and client management system designed for small businesses and freelancers. Built with Flask (backend) and React (frontend), featuring JWT authentication, PDF generation, and comprehensive reporting.

## 🚀 Features

- **Client Management**: Create, edit, and organize client information
- **Invoice & Proforma Management**: Generate professional invoices and proformas with automatic calculations
- **PDF Generation**: Export invoices as high-quality PDFs with custom branding
- **Authentication**: Secure JWT-based authentication system
- **Reporting**: Visual reports with monthly income charts and heatmaps
- **Data Export**: Export client and invoice data to XLSX format
- **Responsive Design**: Mobile-friendly interface with dropdown navigation
- **Multi-platform Support**: Docker Compose for production, local development fallback

## 📋 Requirements

### For Docker Compose (Recommended)
- Docker
- Docker Compose

### For Local Development
- Python 3.8+
- Node.js 16+ (for frontend build)
- wkhtmltopdf or WeasyPrint (for PDF generation)

## 🛠️ Installation & Setup

### Option 1: Docker Compose (Production-Ready)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nioxtec_facturer_updated_project
   ```

2. **Start the application**
   ```bash
   # Using the provided script (macOS/Linux)
   ./start_app.command
   
   # Or manually
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Option 2: Local Development

1. **Set up Python backend**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start Flask server
   python app.py
   ```

2. **Set up React frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   npx serve -s dist -l 8080
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql+psycopg2://niox:nioxpass@db:5432/nioxtec  # For Docker
# DATABASE_URL=sqlite:///instance/app.db  # For local development

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# PDF Engine (optional)
USE_WEASYPRINT=false  # Set to true to use WeasyPrint instead of wkhtmltopdf

# Debug Mode
FLASK_DEBUG=true
```

## 📱 Mobile Access

To access the application from your mobile device:

### Docker Compose Setup
1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. Access from mobile: `http://YOUR_IP:8080`

### Local Development Setup
1. Update CORS origins in `.env`:
   ```env
   CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://YOUR_IP:8080
   ```

2. Restart the backend and access from mobile: `http://YOUR_IP:8080`

## 🎯 Usage

### First Time Setup
1. Open the application in your browser
2. Create your first user account (no authentication required for the first user)
3. Log in with your credentials

### Managing Clients
- Navigate to "Clientes" to add, edit, and view client information
- Use the search and sort functionality to organize your client list
- Export client data to XLSX format

### Creating Invoices
- Go to "Facturas" to create new invoices or proformas
- Select a client, add line items with descriptions, quantities, and prices
- View PDF previews and download invoices
- Duplicate existing invoices for recurring billing
- Convert proformas to invoices with current date

### Reports & Analytics
- Visit "Reportes" for business insights
- View monthly income charts with interactive tooltips
- Analyze daily/weekly income patterns with heatmaps
- Export data for external analysis

## 🏗️ Architecture

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT tokens with 30-day expiry
- **PDF Generation**: WeasyPrint or wkhtmltopdf
- **API**: RESTful endpoints with CORS support

### Frontend (React)
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Notifications**: React Hot Toast for user feedback

### Key Components
- `app.py`: Main Flask application with API endpoints
- `frontend/src/pages/`: React page components (Login, Clientes, Facturas, Reportes)
- `frontend/src/components/Header.jsx`: Navigation with mobile support
- `frontend/src/lib/api.js`: Centralized API client with JWT handling
- `templates/invoice_template.html`: PDF invoice template

## 🚦 Scripts

### Start Application
```bash
./start_app.command    # Automatic detection (Docker Compose or local)
```

### Stop Application
```bash
./stop_app.command     # Stops all services
```

### Manual Commands
```bash
# Docker Compose
docker-compose up -d
docker-compose down

# Local Development
python app.py &
cd frontend && npm run build && npx serve -s dist -l 8080
```

## 🔒 Security Features

- **Password Hashing**: Werkzeug security for password protection
- **JWT Authentication**: Secure API access with token expiration
- **CORS Protection**: Configurable origins for cross-origin requests
- **Input Validation**: Server-side validation for all data inputs

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Clients
- `GET /api/clients` - List clients (paginated)
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `GET /api/clients/export_xlsx` - Export clients to XLSX

### Invoices
- `GET /api/invoices` - List invoices (paginated)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/convert` - Convert proforma to invoice
- `GET /api/invoices/:id/pdf` - Generate PDF
- `GET /api/invoices/export_xlsx` - Export invoices to XLSX

### Reports
- `GET /api/reports/summary` - Monthly income summary
- `GET /api/reports/heatmap` - Daily income heatmap

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Check if backend is running on port 5000
   - Verify CORS origins in `.env` file
   - Ensure JWT token is valid

2. **PDF generation fails**
   - Install wkhtmltopdf: `brew install wkhtmltopdf` (macOS)
   - Or try WeasyPrint: Set `USE_WEASYPRINT=true` in `.env`

3. **Database connection issues**
   - For Docker: Ensure PostgreSQL container is running
   - For local: Check SQLite file permissions in `instance/` folder

4. **Frontend build errors**
   - Update Node.js to version 16 or higher
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and run `npm install`

### Logs and Debugging

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check running processes
ps aux | grep python  # Backend
ps aux | grep serve   # Frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add proper docstrings and comments
4. Test your changes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the browser console for frontend errors
3. Check backend logs for API issues
4. Ensure all environment variables are correctly set

---

**Built with ❤️ for small businesses and freelancers**

<!-- chore(ci): trigger GitHub Actions; nota dev: si el servidor Vite falla en macOS por "crypto.hash is not a function", puedes usar `npm run build && npx serve -s dist -l 8080` para servir el frontend en local. -->
