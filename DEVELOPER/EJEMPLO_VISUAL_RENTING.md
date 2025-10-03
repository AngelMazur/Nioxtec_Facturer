# Ejemplo Visual: Contrato de Renting con Nuevos Estilos

## Antes vs Después

### ANTES (Solo títulos principales)

```
CONTRATO DE RENTING DE PANTALLA PUBLICITARIA

[Texto del contrato...]

CLÁUSULAS

1. OBJETO DEL CONTRATO
[Texto...]

2. DURACIÓN MÍNIMA DEL RENTING
[Texto...]

3. CUOTA DE RENTING Y FORMA DE PAGO
[Texto normal sin subsecciones...]
[Texto normal sin subsecciones...]
[Texto normal sin subsecciones...]
```

---

### DESPUÉS (Con todos los títulos H3 y negritas)

```
═══════════════════════════════════════════════════════════
        CONTRATO DE RENTING DE PANTALLA PUBLICITARIA
                    (18pt, azul #65AAC3)
═══════════════════════════════════════════════════════════

[Texto del contrato...]

═══════════════════════════════════════════════════════════
                         CLÁUSULAS
              (15pt, azul #65AAC3, con bordes)
═══════════════════════════════════════════════════════════

1. OBJETO DEL CONTRATO (12pt, azul #65AAC3)
────────────────────────

[Texto...]

2. DURACIÓN MÍNIMA DEL RENTING (12pt, azul #65AAC3)
────────────────────────────────

[Texto...]

3. Condiciones Económicas, Pago y Gestión de Impagos (SEPA B2B)
────────────────────────────────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO

  3.1 Mandato SEPA B2B y condición de activación:
  ───────────────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  El cliente autoriza mediante **mandato SEPA B2B** el cargo...
                            ^^^^^^^^^^^^^^^^^^^
                         (en negrita) ← NUEVO

  3.2 Fianza (1 mes):
  ───────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  Se abonarán **90,00 €** en concepto de fianza...
              ^^^^^^^^^^
           (en negrita) ← NUEVO

  3.3 Cuotas por adelantado y calendario de cargos:
  ──────────────────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  Las cuotas se cobrarán **por adelantado** el día 1...
                          ^^^^^^^^^^^^^^^^
                         (en negrita) ← NUEVO

  3.4 Impago: reintentos, gastos, intereses, suspensión y apagado remoto:
  ────────────────────────────────────────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  Si no hay fondos, se realizarán **hasta 3 reintentos**...
                                   ^^^^^^^^^^^^^^^^^^^^^
                                      (en negrita) ← NUEVO

  Calendario de recobro (Sub-subsección sin estilo especial)
  
  [Tabla con negritas preservadas]
  ┌─────────────────┬────────────────────────┐
  │ **Día**         │ **Acción**             │ ← Negritas en tabla
  ├─────────────────┼────────────────────────┤
  │ Día 1           │ Cargo automático       │
  │ Día 5           │ 1er reintento          │
  └─────────────────┴────────────────────────┘

  3.5 Vencimiento anticipado y retirada de equipo:
  ─────────────────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  En caso de **impago**, el contrato se dará por vencido...
                ^^^^^^^^^
             (en negrita) ← NUEVO

  3.6 Titularidad y usos:
  ───────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  [Texto...]

4. Uso, instalación y contenidos
─────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO

  4.1 Entrega.
  ────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  La **pantalla** será entregada en...
       ^^^^^^^^^^
    (en negrita) ← NUEVO

  4.2 Instalación.
  ────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  [Texto...]

  4.3 Puesta en marcha y uso.
  ───────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  [Texto...]

  4.4 Contenidos y cumplimiento.
  ──────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  [Texto...]

  4.5 Daños por instalación propia.
  ─────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO
  
  [Texto...]

5. Servicio técnico y soporte
──────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO

[Texto...]

6. Responsabilidad y buenas prácticas
──────────────────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO

[Texto...]

7. Cancelación anticipada
─────────────────────────
                    (12pt, azul #65AAC3) ← NUEVO

[Texto...]

8. Jurisdicción
───────────────
                    (12pt, azul #65AAC3) ← NUEVO

[Texto...]
```

---

## Elementos Visuales Mejorados

### 1. Títulos H3 con Estilo Corporativo

```css
/* Todos los títulos numerados ahora tienen: */
- Color: #65AAC3 (azul corporativo)
- Tamaño: 12pt
- Negrita: bold
- Margen superior: 1.5em
- Margen inferior: 0.7em
```

**Títulos detectados:** 18+ títulos con estilo corporativo

### 2. Negritas Preservadas

```html
<!-- Ejemplo de texto con negrita -->
<p>
  El cliente autoriza mediante <strong>mandato SEPA B2B</strong> el cargo...
</p>

<!-- Las negritas del DOCX original se convierten automáticamente en <strong> -->
```

**Aplicado en:**
- ✅ Párrafos de texto
- ✅ Celdas de tablas
- ✅ Listas

### 3. Jerarquía Visual Completa

```
Nivel 1 (H1): CONTRATO DE RENTING... (18pt, centrado, mayúsculas)
    ↓
Nivel 2 (H2): CLÁUSULAS (15pt, bordes decorativos)
    ↓
Nivel 3 (H3): 1. OBJETO DEL CONTRATO (12pt)
    ↓
Nivel 3 (H3): 3. Condiciones Económicas... (12pt)
    ↓
Nivel 3 (H3): 3.1 Mandato SEPA... (12pt)
    ↓
Nivel 3 (H3): 3.2 Fianza... (12pt)
    ↓
[... y así sucesivamente ...]
```

---

## Comparación de Código

### Detección de Títulos (ANTES)

```python
# Solo 10 títulos principales
elif text.upper() in [
    "1. OBJETO DEL CONTRATO",
    "2. DURACIÓN MÍNIMA DEL RENTING",
    # ... etc (10 títulos)
]:
    html_parts.append(f'<h3>...') 
```

### Detección de Títulos (DESPUÉS)

```python
# 10 títulos antiguos + 18+ títulos nuevos
elif text.upper() in [
    "1. OBJETO DEL CONTRATO",
    # ... títulos antiguos ...
]:
    html_parts.append(f'<h3>...')
elif text.upper().startswith((
    "3. CONDICIONES ECONÓMICAS",
    "3.1 MANDATO SEPA",
    "3.2 FIANZA",
    # ... 18+ títulos nuevos ...
)):
    html_parts.append(f'<h3>...')
```

### Formato de Texto (ANTES)

```python
# Sin preservar negritas
text = text.replace('\n', '<br>')
html_parts.append(f'<p>{text}</p>')
```

### Formato de Texto (DESPUÉS)

```python
# Preservando negritas del DOCX
formatted_text = _format_paragraph_with_bold(paragraph)
html_parts.append(f'<p>{formatted_text}</p>')

# Función que detecta runs en negrita:
def _format_paragraph_with_bold(paragraph):
    for run in paragraph.runs:
        if run.bold:
            html_parts.append(f'<strong>{text}</strong>')
        else:
            html_parts.append(text)
```

---

## Resultado Final en PDF

Al generar el PDF del contrato de renting, verás:

✅ **Todos los títulos** en azul corporativo #65AAC3  
✅ **Jerarquía visual clara** con diferentes tamaños  
✅ **Negritas preservadas** del documento original  
✅ **Tablas formateadas** con negritas en headers  
✅ **Separación visual** entre secciones con bordes  
✅ **Aspecto profesional** y coherente  

---

**¡El contrato de renting ahora tiene una apariencia completamente profesional y estructurada!** 🎨✨
