from pydantic import BaseModel, Field, ValidationError, constr, conint, conlist, confloat
from typing import List, Optional, Literal


class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=1)


class ClientCreateRequest(BaseModel):
    name: constr(min_length=1)
    cif: constr(min_length=1)
    address: constr(min_length=1)
    email: constr(min_length=3)
    phone: constr(min_length=3)
    iban: Optional[str] = None


class InvoiceItem(BaseModel):
    description: constr(min_length=1)
    units: confloat(gt=0)
    unit_price: confloat(ge=0)
    tax_rate: confloat(ge=0, le=100)
    product_id: Optional[int] = None


class InvoiceCreateRequest(BaseModel):
    # En Pydantic v2 se usa 'pattern' en lugar de 'regex'
    date: constr(pattern=r"^\d{4}-\d{2}-\d{2}$")
    type: Literal['factura', 'proforma'] = 'factura'
    client_id: conint(gt=0)
    notes: Optional[str] = ''
    payment_method: Optional[Literal['efectivo', 'bizum', 'transferencia']] = None
    items: conlist(InvoiceItem, min_length=1)


__all__ = [
    'LoginRequest',
    'ClientCreateRequest',
    'InvoiceItem',
    'InvoiceCreateRequest',
    'ValidationError',
]
