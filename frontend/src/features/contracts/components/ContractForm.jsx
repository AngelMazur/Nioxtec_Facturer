import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../store/store'
import { loadContractPlaceholders, loadCompanyConfig } from '../services/contractService'

/**
 * Dynamic contract form component
 * Generates form fields based on template placeholders
 */
export default function ContractForm({ onFormDataChange, onTemplateLoaded, selectedClient, selectedTemplate, onActiveFieldsChange, resetKey = 0 }) {
  const { token } = useStore()
  const [placeholders, setPlaceholders] = useState([])
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)

  
  // Use ref to store the latest onFormDataChange function
  const onFormDataChangeRef = useRef(onFormDataChange)
  onFormDataChangeRef.current = onFormDataChange

  // Load placeholders from selected template
  useEffect(() => {
    async function loadPlaceholders() {
      if (!selectedTemplate) return
      
      try {
        setLoading(true)
        const result = await loadContractPlaceholders(selectedTemplate.id, token)
        
        if (result.error) {
          console.error('Error loading placeholders:', result.error)
          return
        }
        
        setPlaceholders(result.placeholders || [])
        
        // Initialize form data with empty values
        const initialData = {}
        result.placeholders.forEach(placeholder => {
          initialData[placeholder] = ''
        })
        setFormData(initialData)
        
        // Auto-fill client data if selectedClient is provided
        if (selectedClient) {
          const clientData = {
            ...initialData,
            // Mapeo para template de compraventa - usar claves del backend
            'nombre_completo_del_cliente': selectedClient.name,
            'numero': selectedClient.cif,
            'direccion': selectedClient.address,
            'telefono': selectedClient.phone || '',
            'correo': selectedClient.email,
            
            // Mapeo para template de renting
            'nombre_de_la_empresa_o_persona': selectedClient.name,
            'nombre_representante': selectedClient.name,
            'iban': selectedClient.iban || '',
          }
          setFormData(clientData)
        }
        
        // Auto-fill provider data from company config
        try {
          const companyConfig = await loadCompanyConfig(token)
          setFormData(prev => ({
            ...prev,
            'nombre_del_proveedor': companyConfig.name,
            'nif_proveedor': companyConfig.cif,
            'domicilio_proveedor': companyConfig.address,
            'ciudad': companyConfig.city,
            'ciudad_provincia': companyConfig.province
          }))
        } catch (error) {
          console.error('Error loading company config:', error)
        }
        
        onTemplateLoaded?.(result)
      } catch (error) {
        console.error('Error loading placeholders:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPlaceholders()
  }, [selectedTemplate, selectedClient, token, onTemplateLoaded, resetKey])

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChangeRef.current) {
      onFormDataChangeRef.current(formData)
    }
  }, [formData])

  // Notify parent of active fields for validation
  useEffect(() => {
    if (onActiveFieldsChange && placeholders.length > 0) {
      // Get unique placeholders (filter duplicates)
      const uniquePlaceholders = []
      const seenKeys = new Set()
      
      placeholders.forEach(placeholder => {
        if (placeholder && placeholder.trim() !== '') {
          const finalKey = getFormKeyFromPlaceholder(placeholder)
          if (!seenKeys.has(finalKey)) {
            seenKeys.add(finalKey)
            uniquePlaceholders.push(placeholder)
          }
        }
      })
      
      // Map to field keys for validation
      const activeFields = uniquePlaceholders.map(placeholder => getFormKeyFromPlaceholder(placeholder))
      onActiveFieldsChange(activeFields)
    }
  }, [placeholders, onActiveFieldsChange])

  // Function to filter out duplicate fields and show only unique ones
  const getUniquePlaceholders = () => {
    const uniquePlaceholders = []
    const seenKeys = new Set()
    
    placeholders.forEach(placeholder => {
      if (placeholder && placeholder.trim() !== '') {
        // Obtener la clave final del mapeo
        const finalKey = getFormKeyFromPlaceholder(placeholder)
        
        // Si ya hemos visto esta clave final, no agregar el placeholder
        if (!seenKeys.has(finalKey)) {
          seenKeys.add(finalKey)
          uniquePlaceholders.push(placeholder)
        }
      }
    })
    
    return uniquePlaceholders
  }

  // Interest table mapping based on number of installments
  const getInterestText = (numPlazos) => {
    if (numPlazos >= 0 && numPlazos <= 3) {
      return "Sin intereses"
    } else if (numPlazos >= 4 && numPlazos <= 6) {
      return "5% interés mensual"
    } else if (numPlazos >= 7 && numPlazos <= 12) {
      return "10% interés mensual"
    } else if (numPlazos >= 13 && numPlazos <= 18) {
      return "20% interés mensual"
    } else if (numPlazos >= 19 && numPlazos <= 24) {
      return "30% interés mensual"
    } else {
      return "Sin intereses" // Por defecto
    }
  }

  // Auto-calculate interest table when number of installments changes
  useEffect(() => {
    if (selectedTemplate?.id === 'compraventa' && formData.numero_de_plazos) {
      const numPlazos = parseInt(formData.numero_de_plazos)
      const interestText = getInterestText(numPlazos)
      
      setFormData(prev => ({
        ...prev,
        tabla_de_interes: interestText
      }))
    }
  }, [formData.numero_de_plazos, selectedTemplate?.id])

  // Auto-calculate installment amount when total amount or number of installments changes
  useEffect(() => {
    if (selectedTemplate?.id === 'compraventa' && 
        formData.importe_total_en_euros_iva_incluido && 
        formData.numero_de_plazos) {
      
      const importeTotal = parseFloat(formData.importe_total_en_euros_iva_incluido)
      const numPlazos = parseInt(formData.numero_de_plazos)
      
      if (importeTotal > 0 && numPlazos > 0) {
        // Calcular con 4 decimales para mayor precisión
        const cuotaCalculada = importeTotal / numPlazos
        
        // Redondear a 2 decimales para mostrar en frontend
        const cuotaRedondeada = Math.round(cuotaCalculada * 100) / 100
        
        setFormData(prev => ({
          ...prev,
          importe_de_cada_cuota: cuotaRedondeada.toFixed(2)
        }))
      }
    }
  }, [formData.importe_total_en_euros_iva_incluido, formData.numero_de_plazos, selectedTemplate?.id])

  // Mapping from document placeholders to form data keys (static - no need for useCallback)
  const getFormKeyFromPlaceholder = (placeholder) => {
    const mapping = {
      // Compraventa template - usar solo las claves principales
      'Nombre completo del cliente': 'nombre_completo_del_cliente',
      'DNI DEL CLIENTE': 'numero',
      'Dirección del cliente': 'direccion',
      'Teléfono del cliente': 'telefono',
      'Correo del cliente': 'correo',
      'Modelo del producto': 'modelo',
      'Pulgadas del producto': 'pulgadas',
      'Número de serie del producto': 'numero_serie',
      'importe total en euros, IVA incluido': 'importe_total_en_euros_iva_incluido',
      'número de plazos': 'numero_de_plazos',
      'importe de cada cuota': 'importe_de_cada_cuota',
      'Tabla de interes': 'tabla_de_interes',
      
      // Campos duplicados - mapear a las mismas claves principales
      'Nombre del comprador': 'nombre_completo_del_cliente', // = Nombre completo del cliente
      'Dni del comprador': 'numero', // = DNI DEL CLIENTE
      'Modelo': 'modelo', // = Modelo del producto
      'Pulgadas': 'pulgadas', // = Pulgadas del producto
      'Número de Serie': 'numero_serie', // = Número de serie del producto
      
      // Renting template
      'Nombre de la empresa o persona': 'nombre_de_la_empresa_o_persona',
      'Número': 'numero',
      'Dirección': 'direccion',
      'Nombre representante': 'nombre_representante',
      'Cargo': 'cargo',
      'Teléfono': 'telefono',
      'Correo': 'correo',
      'Marca': 'marca',
      'importe en euros': 'importe_en_euros',
      'plataforma de pago': 'plataforma_de_pago',
      'IBAN': 'iban',
      'importe ajustado': 'importe_ajustado',
    }
    
    return mapping[placeholder] || placeholder
  }


  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded mb-2"></div>
          <div className="h-10 bg-gray-700 rounded mb-2"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4 lg:space-y-6">
      {/* Dynamic Form Fields */}
      <div className="bg-gray-800 p-2 lg:p-3 rounded-lg border border-gray-700 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-semibold">Campos del Contrato</h3>
          {selectedTemplate && (
            <span className="text-xs lg:text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded">
              {selectedTemplate.name}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3 flex-1">
          {(() => {
            const uniquePlaceholders = getUniquePlaceholders()
            
            // Ordenar campos para mejor UX
            const sortedPlaceholders = uniquePlaceholders.sort((a, b) => {
              // Prioridad 1: Importe total
              if (a.includes('importe total')) return -1
              if (b.includes('importe total')) return 1
              
              // Prioridad 2: Número de plazos
              if (a.includes('número de plazos')) return -1
              if (b.includes('número de plazos')) return 1
              
              // Prioridad 3: Importe de cada cuota
              if (a.includes('importe de cada cuota')) return -1
              if (b.includes('importe de cada cuota')) return 1
              
              // Prioridad 4: Tabla de interés
              if (a.includes('tabla de interes')) return -1
              if (b.includes('tabla de interes')) return 1
              
              // Resto alfabéticamente
              return a.localeCompare(b)
            })
            
            return sortedPlaceholders.map(placeholder => {
              // Format placeholder for display
              const displayLabel = placeholder
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
              
              // Generate appropriate placeholder text
              const getPlaceholderText = (placeholder) => {
                // Usar el mapeo para obtener la clave correcta
                const formKey = getFormKeyFromPlaceholder(placeholder)
                
                // Mapeo específico para placeholders
                const placeholderTexts = {
                  'nombre_completo_del_cliente': 'Nombre del cliente',
                  'importe_total_en_euros_iva_incluido': 'Ej: 1000.00',
                  'importe_de_cada_cuota': 'Ej: 250.00',
                  'numero_de_plazos': 'Ej: 3, 6, 12, 18, 24',
                  'tabla_de_interes': 'Se calcula automáticamente',
                  'modelo': 'Ej: Digital Screen Pro',
                  'pulgadas': 'Ej: 55 pulgadas',
                  'numero_serie': 'Ej: NIOXTEC-2024-001',
                  'numero': 'Ej: 12345678A',
                  'direccion': 'Ej: Calle Mayor 123',
                  'telefono': 'Ej: 612345678',
                  'correo': 'Ej: cliente@email.com',
                  'nombre_de_la_empresa_o_persona': 'Nombre de la empresa',
                  'nombre_representante': 'Nombre del representante',
                  'cargo': 'Ej: Gerente',
                  'marca': 'Ej: NIOXTEC',
                  'plataforma_de_pago': 'Ej: Transferencia',
                  'iban': 'Ej: ES91 2100 0418 4502 0005 1332',
                  'importe_en_euros': 'Ej: 1000.00',
                  'importe_ajustado': 'Ej: 950.00'
                }
                
                return placeholderTexts[formKey] || `Ingresa ${placeholder.toLowerCase()}`
              }
              
              return (
                <label key={placeholder} className="flex flex-col gap-1">
                  <span className="text-xs lg:text-sm text-gray-500 font-medium">{displayLabel}</span>
                  <input
                    className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                    value={formData[getFormKeyFromPlaceholder(placeholder)] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [getFormKeyFromPlaceholder(placeholder)]: e.target.value
                    }))}
                    placeholder={getPlaceholderText(placeholder)}
                  />
                </label>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
