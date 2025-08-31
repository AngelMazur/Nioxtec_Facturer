#!/usr/bin/env python3
"""
Seed or update CompanyConfig from environment variables.

Reads COMPANY_* variables (NAME, CIF, ADDRESS, CITY, PROVINCE, EMAIL, PHONE, IBAN, WEBSITE)
and ensures a single row exists in the database with those values.

Usage (Windows PowerShell):
    # Define variables in .env or ENV and then run (example using forward slashes to avoid
    # accidental escape sequences in docstrings):
    C:/Nioxtec/Nioxtec_Facturer/.venv310/Scripts/python.exe C:/Nioxtec/Nioxtec_Facturer/DEVELOPER/scripts/seed_company.py

Safe to run multiple times (idempotent).
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Ensure repo root is in sys.path so top-level modules (app.py) can be imported
import sys
import os
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from app import app, db, CompanyConfig  # type: ignore


def env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def main():
    data = {
        'name': env('COMPANY_NAME'),
        'cif': env('COMPANY_CIF'),
        'address': env('COMPANY_ADDRESS'),
        'city': env('COMPANY_CITY'),
        'province': env('COMPANY_PROVINCE'),
        'email': env('COMPANY_EMAIL'),
        'phone': env('COMPANY_PHONE'),
        'iban': env('COMPANY_IBAN'),
        'website': env('COMPANY_WEBSITE'),
    }
    missing = [k for k, v in data.items() if k in {'name','cif','address','email','phone'} and not v]
    if missing:
        print("❌ Faltan variables obligatorias:", ', '.join(missing))
        print("Define COMPANY_* en .env o ENV y reintenta.")
        return 1
    with app.app_context():
        row = CompanyConfig.query.first()
        if not row:
            row = CompanyConfig(**data)
            db.session.add(row)
        else:
            for k, v in data.items():
                setattr(row, k, v)
        db.session.commit()
        print("✅ CompanyConfig actualizado:")
        print(f"  - name: {row.name}")
        print(f"  - cif: {row.cif}")
        print(f"  - address: {row.address}")
        print(f"  - city/province: {row.city}/{row.province}")
        print(f"  - email: {row.email}")
        print(f"  - phone: {row.phone}")
        print(f"  - iban: {row.iban}")
        print(f"  - website: {row.website}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

