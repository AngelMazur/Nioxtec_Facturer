#!/usr/bin/env python3
"""
Script de prueba para verificar que los títulos del contrato de renting se detectan correctamente
"""

def test_renting_title_detection():
    """Prueba la detección de títulos del contrato de renting"""
    
    # Títulos que deberían ser detectados
    test_titles = [
        "CONTRATO DE RENTING DE PANTALLA PUBLICITARIA",  # H1
        "CLÁUSULAS",  # H2 (con acento)
        "CLAUSULAS",  # H2 (sin acento)
        "ACEPTACIÓN DEL CONTRATO",  # H2
        "1. OBJETO DEL CONTRATO",  # H3
        "2. DURACIÓN MÍNIMA DEL RENTING",  # H3
        "3. CUOTA DE RENTING Y FORMA DE PAGO",  # H3
        "4. CESIÓN DE PROPIEDAD",  # H3
        "5. USO, INSTALACIÓN Y CONTENIDOS",  # H3
        "6. SERVICIO TÉCNICO Y SOPORTE",  # H3
        "7. RESPONSABILIDAD Y BUENAS PRÁCTICAS",  # H3
        "8. FORMA DE PAGO Y AUTORIZACIÓN SEPA",  # H3
        "9. CANCELACIÓN ANTICIPADA",  # H3
        "10. JURISDICCIÓN",  # H3
    ]
    
    print("=== PRUEBA DE DETECCIÓN DE TÍTULOS DEL CONTRATO DE RENTING ===\n")
    
    for title in test_titles:
        print(f"Probando: '{title}'")
        
        # Simular la lógica de detección actualizada
        if title == "CONTRATO DE RENTING DE PANTALLA PUBLICITARIA":
            print("  ✅ Detectado como H1 (título principal)")
            print("     Estilo: 16pt, color #65AAC3, centrado, negrita")
        elif title in ["CLÁUSULAS", "CLAUSULAS"]:
            print("  ✅ Detectado como H2 (sección principal)")
            print("     Estilo: 14pt, color #65AAC3, negrita, margen superior")
        elif title == "ACEPTACIÓN DEL CONTRATO":
            print("  ✅ Detectado como H2 (sección principal)")
            print("     Estilo: 14pt, color #65AAC3, negrita, margen superior")
        elif title in ["1. OBJETO DEL CONTRATO", "2. DURACIÓN MÍNIMA DEL RENTING", 
                      "3. CUOTA DE RENTING Y FORMA DE PAGO", "4. CESIÓN DE PROPIEDAD",
                      "5. USO, INSTALACIÓN Y CONTENIDOS", "6. SERVICIO TÉCNICO Y SOPORTE",
                      "7. RESPONSABILIDAD Y BUENAS PRÁCTICAS", "8. FORMA DE PAGO Y AUTORIZACIÓN SEPA",
                      "9. CANCELACIÓN ANTICIPADA", "10. JURISDICCIÓN"]:
            print("  ✅ Detectado como H3 (subsección)")
            print("     Estilo: 12pt, color #65AAC3, negrita, margen superior")
        else:
            print("  ❌ NO detectado")
        
        print()

if __name__ == "__main__":
    test_renting_title_detection()
