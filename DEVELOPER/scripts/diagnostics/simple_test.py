import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# CORS muy simple
CORS(app, origins=["https://app.nioxtec.es"])

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    return jsonify({'test': 'simple cors'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
