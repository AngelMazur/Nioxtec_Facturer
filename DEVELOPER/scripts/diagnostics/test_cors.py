import os
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuración CORS simple para test
cors_origins_str = os.getenv('CORS_ORIGINS', 'https://app.nioxtec.es')
allowed_origins = [o.strip() for o in cors_origins_str.split(',') if o.strip()]
print(f"Allowed origins: {allowed_origins}")

CORS(
    app,
    resources={r"/*": {"origins": allowed_origins}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    max_age=86400,
)

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'test': 'cors working'})

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting test CORS server...")
    app.run(debug=True, host='0.0.0.0', port=5001)
