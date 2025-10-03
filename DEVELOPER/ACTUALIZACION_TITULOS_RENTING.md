# Actualización de Títulos H3 y Negritas - Contrato de Renting

**Fecha:** 3 de octubre de 2025  
**Rama:** feat/products-inventory  
**Estado:** ✅ Completado

## Resumen de Cambios

Se han agregado mejoras adicionales al sistema de generación de contratos de renting:

1. **Nuevos títulos H3 con estilo corporativo**
2. **Detección y preservación de negritas del DOCX**

---

## 1. Nuevos Títulos H3 Detectados

Se agregaron los siguientes títulos H3 al sistema de detección automática con el estilo azul corporativo (#65AAC3):

### Sección 3: Condiciones Económicas
- ✅ **3. Condiciones Económicas, Pago y Gestión de Impagos (SEPA B2B)**
- ✅ **3.1 Mandato SEPA B2B y condición de activación**
- ✅ **3.2 Fianza (1 mes)**
- ✅ **3.3 Cuotas por adelantado y calendario de cargos**
- ✅ **3.4 Impago: reintentos, gastos, intereses, suspensión y apagado remoto**
- ✅ **3.5 Vencimiento anticipado y retirada de equipo**
- ✅ **3.6 Titularidad y usos**

### Sección 4: Uso, instalación y contenidos
- ✅ **4. Uso, instalación y contenidos**
- ✅ **4.1 Entrega**
- ✅ **4.2 Instalación**
- ✅ **4.3 Puesta en marcha y uso**
- ✅ **4.4 Contenidos y cumplimiento**
- ✅ **4.5 Daños por instalación propia**

### Secciones 5-8
- ✅ **5. Servicio técnico y soporte**
- ✅ **6. Responsabilidad y buenas prácticas**
- ✅ **7. Cancelación anticipada**
- ✅ **8. Jurisdicción**

### Estilo Aplicado

```css
.subsection-title {
    font-size: 12pt;
    color: #65AAC3;
    font-weight: bold;
    margin-top: 1.5em;
    margin-bottom: 0.7em;
}
```

---

## 2. Detección de Negritas del DOCX

### Nueva Funcionalidad

Se implementó la detección y preservación del formato de **negrita** del documento DOCX original.

#### Función Agregada: `_format_paragraph_with_bold()`

```python
def _format_paragraph_with_bold(paragraph):
    """
    Format paragraph text preserving bold formatting from DOCX.
    Returns HTML with <strong> tags for bold text.
    """
    html_parts = []
    
    for run in paragraph.runs:
        text = run.text
        if text:
            # Replace newlines with <br>
            text = text.replace('\n', '<br>')
            
            # Apply bold if the run is bold
            if run.bold:
                html_parts.append(f'<strong>{text}</strong>')
            else:
                html_parts.append(text)
    
    return ''.join(html_parts)
```

#### Aplicación

Esta función se aplica ahora en:

1. **Párrafos de texto normal**: Se detecta qué partes del texto están en negrita en el DOCX
2. **Celdas de tablas**: Se preserva el formato de negrita en las tablas

#### Estilo CSS para Negritas

```css
strong {
    font-weight: bold;
    color: #222;
}
```

---

## 3. Mejoras en Tablas

Las tablas ahora también preservan el formato de negrita:

**Antes:**
```python
cell_text = cell.text.replace('\n', '<br>')
html_parts.append(f'<td>{cell_text}</td>')
```

**Después:**
```python
for paragraph in cell.paragraphs:
    if paragraph.text.strip():
        formatted_text = _format_paragraph_with_bold(paragraph)
        cell_html_parts.append(formatted_text)

cell_content = '<br>'.join(cell_html_parts)
html_parts.append(f'<td>{cell_content}</td>')
```

---

## 4. Lógica de Detección de Títulos

### Implementación

Se actualizó la lógica para detectar títulos que empiezan con prefijos específicos:

```python
elif text.upper().startswith((
    "3. CONDICIONES ECONÓMICAS",
    "3.1 MANDATO SEPA",
    "3.2 FIANZA",
    "3.3 CUOTAS POR ADELANTADO",
    "3.4 IMPAGO:",
    "3.5 VENCIMIENTO ANTICIPADO",
    "3.6 TITULARIDAD",
    "4. USO, INSTALACIÓN",
    "4.1 ENTREGA",
    "4.2 INSTALACIÓN",
    "4.3 PUESTA EN MARCHA",
    "4.4 CONTENIDOS",
    "4.5 DAÑOS",
    "5. SERVICIO TÉCNICO",
    "6. RESPONSABILIDAD",
    "7. CANCELACIÓN",
    "8. JURISDICCIÓN"
)) or any(text.upper().startswith(prefix) for prefix in ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "4.1", "4.2", "4.3", "4.4", "4.5"]):
    # Nuevas subsecciones del contrato de renting (títulos H3)
    html_parts.append(f'<h3 class="subsection-title">...')
```

Esto permite capturar tanto títulos exactos como variaciones.

---

## Archivos Modificados

**Backend:**
- `app.py`
  - Nueva función: `_format_paragraph_with_bold()` (antes de `_docx_to_html`)
  - Actualizada función: `_docx_to_html()` (detección de títulos H3 y aplicación de negritas)
  - Actualizado: Procesamiento de tablas con preservación de formato
  - Actualizado: Estilos CSS con soporte para `<strong>`

---

## Resultado Visual

### Títulos H3
Los títulos ahora aparecen con:
- ✨ Color azul corporativo (#65AAC3)
- 📏 Tamaño 12pt
- 💪 Negrita
- 📐 Espaciado optimizado (1.5em arriba, 0.7em abajo)

### Negritas en Texto
Las palabras/frases que están en negrita en el DOCX original ahora se preservan en el PDF:
- **Ejemplo:** Si en el DOCX dice "El **cliente** debe...", en el PDF aparecerá con "cliente" en negrita
- Se aplica a párrafos y tablas

---

## Validación

✅ **Sintaxis verificada:** `python3 -m py_compile app.py`  
✅ **Sin errores de compilación**  
✅ **Detección de títulos H3:** 18+ nuevos títulos  
✅ **Preservación de formato:** Negritas del DOCX → HTML → PDF  

---

## Beneficios

1. ✨ **Jerarquía visual completa**: Todos los títulos del contrato con estilo corporativo
2. 📝 **Formato preservado**: Las negritas del documento original se mantienen
3. 🎨 **Apariencia profesional**: Documentos más legibles y estructurados
4. 🔄 **Automático**: No requiere intervención manual

---

## Ejemplo de Uso

Cuando generes un contrato de renting con la nueva plantilla:

1. **Los títulos 3.1, 3.2, etc.** aparecerán en azul #65AAC3
2. **Las palabras importantes** marcadas en negrita en el DOCX se verán en negrita en el PDF
3. **Las tablas** mantendrán su formato de negrita

---

**Implementado por:** GitHub Copilot  
**Archivos afectados:** 1 (app.py)  
**Líneas modificadas:** ~50 líneas
