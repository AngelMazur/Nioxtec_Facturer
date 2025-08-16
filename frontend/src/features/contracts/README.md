# Generador de Contratos

Esta funcionalidad permite generar contratos en PDF a partir de plantillas Markdown con placeholders dinámicos.

## Características

- **Parsing automático de placeholders**: Detecta automáticamente todos los campos `[PLACEHOLDER]` en la plantilla
- **Formulario dinámico**: Genera campos de formulario basados en los placeholders detectados
- **Autorrelleno de datos**: Carga automáticamente datos del cliente y proveedor desde la API existente
- **Preview en tiempo real**: Muestra una vista previa del contrato con los campos rellenados
- **Generación de PDF**: Crea PDFs profesionales con formato adecuado
- **Gestión de hitos y SLA**: Permite configurar hitos del proyecto y niveles de servicio

## Estructura de Archivos

```
contracts/
├── components/
│   ├── ContractGeneratorModal.jsx    # Modal principal
│   ├── ContractForm.jsx              # Formulario dinámico
│   └── ContractPreview.jsx           # Vista previa
├── services/
│   └── contractService.js            # Servicios de API
├── utils/
│   └── contractParser.js             # Utilidades de parsing
├── templates/
│   └── Plantilla_Contrato_Servicios.md # Plantilla base
├── __tests__/
│   └── contractParser.test.js        # Tests unitarios
├── index.js                          # Exports
└── README.md                         # Esta documentación
```

## Uso

### 1. Abrir el Generador

El botón "Crear Contrato" está disponible en la página de Clientes, junto al botón "Subir PDF".

### 2. Completar el Formulario

1. **Seleccionar Cliente**: Elige un cliente de la lista para auto-rellenar sus datos
2. **Auto-rellenar Proveedor**: Usa el botón para cargar datos del proveedor
3. **Completar Campos**: Rellena los campos dinámicos generados automáticamente
4. **Configurar Hitos**: Añade hitos del proyecto con fechas, importes y criterios
5. **Configurar SLA**: Define niveles de servicio y tiempos de respuesta

### 3. Vista Previa

- Cambia a la pestaña "Vista Previa" para ver el contrato renderizado
- Toggle entre vista renderizada y markdown raw
- Verifica que todos los campos estén correctamente rellenados

### 4. Generar PDF

- Haz clic en "Generar PDF" para crear y descargar el documento
- El archivo se nombra automáticamente: `Contrato_[Cliente]_[YYYY-MM-DD].pdf`

## API Endpoints

### POST /api/contracts/generate-pdf
Genera un PDF a partir del contenido del contrato.

**Body:**
```json
{
  "content": "Contenido markdown del contrato",
  "filename": "nombre_del_archivo.pdf"
}
```

**Response:**
```json
{
  "filename": "nombre_del_archivo.pdf"
}
```

### GET /api/contracts/download/<filename>
Descarga el PDF generado.

## Plantillas

Las plantillas usan sintaxis Markdown con placeholders entre corchetes:

```markdown
# CONTRATO DE SERVICIOS

Cliente: [NOMBRE DEL CLIENTE]
NIF: [NIF/NIE CLIENTE]
Domicilio: [DOMICILIO CLIENTE]

## Hitos del Proyecto

| Hito/Entregable | Descripción | Fecha | Precio | Criterio |
|---|---|---|---:|---|
| [HITO 1] | [DESCRIPCION] | [DD/MM/AAAA] | [IMPORTE] | [CRITERIO] |
```

## Validaciones

- Los campos obligatorios se validan antes de generar el PDF
- Los formatos de fecha se validan automáticamente
- Los importes se formatean con 2 decimales
- Los NIF/CIF se validan según el formato español

## Tests

Ejecuta los tests unitarios:

```bash
npm test contracts/__tests__/contractParser.test.js
```

## Dependencias

- **Frontend**: React, Tailwind CSS, react-hot-toast
- **Backend**: Flask, markdown, pdfkit/reportlab
- **No se añaden dependencias nuevas** - usa las existentes del proyecto

## Integración

La funcionalidad se integra perfectamente con:
- Sistema de autenticación JWT existente
- API de clientes existente
- Sistema de generación de PDFs existente
- Estilos y componentes del proyecto
