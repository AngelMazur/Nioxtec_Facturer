# Generador de Contratos

Esta funcionalidad permite generar contratos en PDF a partir de plantillas DOCX con placeholders dinámicos.

## Características

- **Plantillas DOCX**: Soporte para plantillas de Word con placeholders
- **Formulario dinámico**: Generación automática de campos basada en placeholders
- **Auto-relleno**: Datos del cliente y proveedor se rellenan automáticamente
- **Vista previa**: Visualización del contrato antes de generar PDF
- **Generación PDF**: Creación de PDFs con formato profesional

## Estructura de Archivos

```
contracts/
├── components/
│   ├── ContractGeneratorModal.jsx    # Modal principal
│   ├── ContractForm.jsx              # Formulario dinámico
│   ├── ContractPreview.jsx           # Vista previa
│   └── TemplateSelector.jsx          # Selector de plantillas
├── services/
│   └── contractService.js            # Servicios de API
├── templates/
│   ├── Contrato_Compraventa_Plazos_NIOXTEC_v5.docx
│   └── Plantilla_Contrato_Renting_Firma_Datos_v2.docx
├── index.js                          # Exports
└── README.md                         # Esta documentación
```

## Uso

### 1. Abrir el Generador

El botón "Crear Contrato" está disponible en la página de Clientes, junto al botón "Subir PDF".

### 2. Seleccionar Plantilla

1. **Elegir Tipo**: Selecciona entre "Contrato de Compraventa" o "Contrato de Renting"
2. **Cargar Campos**: Los placeholders se extraen automáticamente del DOCX

### 3. Completar el Formulario

1. **Datos del Cliente**: Se auto-rellenan desde el cliente seleccionado
2. **Datos del Proveedor**: Se auto-rellenan desde la configuración de la empresa
3. **Campos Dinámicos**: Rellena los campos generados automáticamente

### 4. Vista Previa

- Cambia a la pestaña "Vista Previa" para ver el contrato
- Verifica que todos los campos estén correctamente rellenados

### 5. Generar PDF

- Haz clic en "Generar PDF" para crear y descargar el documento
- El archivo se nombra automáticamente: `Contrato_[Cliente]_[YYYY-MM-DD].pdf`

## API Endpoints

### GET /api/contracts/templates
Lista las plantillas disponibles.

**Response:**
```json
[
  {
    "id": "compraventa",
    "name": "Contrato de Compraventa",
    "filename": "Contrato_Compraventa_Plazos_NIOXTEC_v5.docx",
    "description": "Contrato de compraventa con plazos"
  }
]
```

### GET /api/contracts/templates/{id}/placeholders
Extrae placeholders de una plantilla DOCX.

**Response:**
```json
{
  "placeholders": ["nombre_completo_del_cliente", "importe_total"],
  "original_tokens": {
    "nombre_completo_del_cliente": "[Nombre completo del cliente]",
    "importe_total": "[Importe total]"
  }
}
```

### POST /api/contracts/generate-pdf
Genera un PDF a partir de una plantilla DOCX rellenada.

**Body:**
```json
{
  "template_id": "compraventa",
  "form_data": {
    "nombre_completo_del_cliente": "Juan Pérez",
    "importe_total": "1000"
  },
  "filename": "Contrato_Juan_Perez_2024-01-15.pdf"
}
```

### GET /api/contracts/download/<filename>
Descarga el PDF generado.

## Plantillas

Las plantillas usan archivos DOCX con placeholders entre corchetes:

```
[Nombre completo del cliente]
[Importe total en euros, IVA incluido]
[Fecha de firma]
```

## Validaciones

- Los campos obligatorios se validan antes de generar el PDF
- Los formatos de fecha se validan automáticamente
- Los importes se formatean con 2 decimales
- Los NIF/CIF se validan según el formato español

## Dependencias

- **Frontend**: React, Tailwind CSS, react-hot-toast
- **Backend**: Flask, python-docx, pdfkit/reportlab
- **No se añaden dependencias nuevas** - usa las existentes del proyecto

## Integración

La funcionalidad se integra perfectamente con:
- Sistema de autenticación JWT existente
- API de clientes existente
- Sistema de generación de PDFs existente
- Estilos y componentes del proyecto
