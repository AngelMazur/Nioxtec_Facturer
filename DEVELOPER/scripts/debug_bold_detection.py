#!/usr/bin/env python3
"""
Script de debug para analizar la detección de negritas en el DOCX
"""

from docx import Document
import os

# Ruta al documento
docx_path = os.path.join('static', 'contracts', 'templates', 'Plantilla_Contrato_Renting_Firma_Datos_v2.docx')

print(f"Analizando documento: {docx_path}")
print("=" * 80)

doc = Document(docx_path)

# Buscar el párrafo específico
target_text = "EL ARRENDATARIO"

for i, paragraph in enumerate(doc.paragraphs):
    if target_text in paragraph.text:
        print(f"\n📄 Párrafo #{i} encontrado:")
        print(f"   Texto completo: {paragraph.text[:100]}...")
        print(f"   Estilo: {paragraph.style.name}")
        print(f"\n   🔍 Análisis de RUNS:")
        print(f"   Total de runs: {len(paragraph.runs)}")
        
        for j, run in enumerate(paragraph.runs):
            print(f"\n   Run #{j}:")
            print(f"      Texto: '{run.text}'")
            print(f"      Bold: {run.bold} (type: {type(run.bold)})")
            print(f"      Font name: {run.font.name}")
            print(f"      Font size: {run.font.size}")
            
            # Verificar si tiene negrita
            if run.bold is True:
                print(f"      ✅ Negrita EXPLÍCITA")
            elif run.bold is False:
                print(f"      ❌ Sin negrita EXPLÍCITA")
            elif run.bold is None:
                print(f"      ⚠️  Negrita HEREDADA (None)")
                # Verificar si el estilo del párrafo tiene negrita
                if paragraph.style.font.bold:
                    print(f"      → El estilo '{paragraph.style.name}' SÍ tiene negrita")
                else:
                    print(f"      → El estilo '{paragraph.style.name}' NO tiene negrita")

print("\n" + "=" * 80)
print("Análisis completado")
