from typing import Dict, Any


def get_openapi_spec(base_url: str = "") -> Dict[str, Any]:
    spec: Dict[str, Any] = {
        "openapi": "3.0.3",
        "info": {
            "title": "Nioxtec Facturer API",
            "version": "v1",
            "description": "API para autenticación, clientes e invoices (endpoints clave)",
        },
        "servers": [{"url": base_url or "/"}],
        "paths": {
            "/api/auth/login": {
                "post": {
                    "summary": "Autenticación y obtención de JWT",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/LoginRequest"}
                            }
                        },
                    },
                    "responses": {
                        "200": {
                            "description": "Token emitido",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {"access_token": {"type": "string"}},
                                        "required": ["access_token"],
                                    }
                                }
                            },
                        },
                        "400": {"$ref": "#/components/responses/BadRequest"},
                        "401": {"$ref": "#/components/responses/Unauthorized"},
                    },
                }
            },
            "/api/clients": {
                "post": {
                    "summary": "Crear cliente",
                    "security": [{"bearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/ClientCreateRequest"}
                            }
                        },
                    },
                    "responses": {
                        "201": {
                            "description": "Cliente creado",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {"id": {"type": "integer"}},
                                        "required": ["id"],
                                    }
                                }
                            },
                        },
                        "400": {"$ref": "#/components/responses/BadRequest"},
                        "401": {"$ref": "#/components/responses/Unauthorized"},
                        "409": {"description": "Conflicto"},
                    },
                }
            },
            "/api/invoices": {
                "get": {
                    "summary": "Listar facturas",
                    "security": [{"bearerAuth": []}],
                    "parameters": [
                        {"in": "query", "name": "month", "schema": {"type": "integer"}},
                        {"in": "query", "name": "year", "schema": {"type": "integer"}},
                        {"in": "query", "name": "limit", "schema": {"type": "integer"}},
                        {"in": "query", "name": "offset", "schema": {"type": "integer"}},
                        {"in": "query", "name": "sort", "schema": {"type": "string", "enum": ["id", "date", "total", "number"]}},
                        {"in": "query", "name": "dir", "schema": {"type": "string", "enum": ["asc", "desc"]}},
                    ],
                    "responses": {"200": {"description": "OK"}, "401": {"$ref": "#/components/responses/Unauthorized"}}
                },
                "post": 
                    "summary": "Crear factura/proforma",
                    "security": [{"bearerAuth": []}],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/InvoiceCreateRequest"}
                            }
                        },
                    },
                    "responses": {
                        "201": {"description": "Creado"},
                        "400": {"$ref": "#/components/responses/BadRequest"},
                        "401": {"$ref": "#/components/responses/Unauthorized"},
                    },
                }
            },
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                }
            },
            "responses": {
                "BadRequest": {
                    "description": "Solicitud inválida",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string"},
                                    "code": {"type": "integer", "example": 400},
                                },
                                "required": ["error", "code"],
                            }
                        }
                    },
                },
                "Unauthorized": {
                    "description": "No autorizado",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string"},
                                    "code": {"type": "integer", "example": 401},
                                },
                                "required": ["error", "code"],
                            }
                        }
                    },
                },
            },
            "schemas": {
                "LoginRequest": {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string"},
                        "password": {"type": "string"},
                    },
                    "required": ["username", "password"],
                },
                "ClientCreateRequest": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "cif": {"type": "string"},
                        "address": {"type": "string"},
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                        "iban": {"type": "string"},
                    },
                    "required": ["name", "cif", "address", "email", "phone"],
                },
                "InvoiceItem": {
                    "type": "object",
                    "properties": {
                        "description": {"type": "string"},
                        "units": {"type": "number"},
                        "unit_price": {"type": "number"},
                        "tax_rate": {"type": "number", "minimum": 0, "maximum": 100},
                    },
                    "required": ["description", "units", "unit_price", "tax_rate"],
                },
                "InvoiceCreateRequest": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "format": "date"},
                        "type": {"type": "string", "enum": ["factura", "proforma"]},
                        "client_id": {"type": "integer"},
                        "notes": {"type": "string"},
                        "payment_method": {"type": "string", "enum": ["efectivo", "bizum", "transferencia"]},
                        "items": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/InvoiceItem"},
                            "minItems": 1,
                        },
                    },
                    "required": ["date", "client_id", "items"],
                },
            },
        },
    }
    return spec

