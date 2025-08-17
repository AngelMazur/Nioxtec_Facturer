import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../store/store'
import { loadContractPlaceholders, loadCompanyConfig } from '../services/contractService'

/**
 * Dynamic contract form component
 * Generates form fields based on template placeholders
 */
export default function ContractForm({ onFormDataChange, onTemplateLoaded, selectedClient, selectedTemplate }) {
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
            // Mapeo para template de compraventa
            'nombre_completo_del_cliente': selectedClient.name,
            'DNI DEL CLIENTE': selectedClient.cif,
            'Dirección del cliente': selectedClient.address,
            'Teléfono del cliente': selectedClient.phone || '',
            'Correo del cliente': selectedClient.email,
            'Nombre del comprador': selectedClient.name,
            'Dni del comprador': selectedClient.cif,
            
            // Mapeo para template de renting
            'nombre_de_la_empresa_o_persona': selectedClient.name,
            'numero': selectedClient.cif,
            'direccion': selectedClient.address,
            'telefono': selectedClient.phone || '',
            'correo': selectedClient.email,
            'iban': selectedClient.iban || '',
            
            // Campos adicionales que pueden estar en el cliente
            'nombre_representante': selectedClient.name, // Por defecto usa el nombre del cliente
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
  }, [selectedTemplate, selectedClient, token, onTemplateLoaded])

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChangeRef.current) {
      onFormDataChangeRef.current(formData)
    }
  }, [formData])

  // Function to filter out duplicate fields and show only unique ones
  const getUniquePlaceholders = () => {
    const uniquePlaceholders = []
    const seen = new Set()
    
    placeholders.forEach(placeholder => {
      if (placeholder && placeholder.trim() !== '') {
        // Normalize placeholder for comparison
        const normalized = placeholder.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        if (!seen.has(normalized)) {
          seen.add(normalized)
          uniquePlaceholders.push(placeholder)
        }
      }
    })
    
    return uniquePlaceholders
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
          {getUniquePlaceholders()
            .map(placeholder => {
              // Format placeholder for display
              const displayLabel = placeholder
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
              
              // Generate appropriate placeholder text
              const getPlaceholderText = (key) => {
                if (key.includes('nombre') && key.includes('cliente')) return 'Nombre del cliente'
                if (key.includes('importe') && key.includes('total')) return 'Ej: 1000.00'
                if (key.includes('importe') && key.includes('cuota')) return 'Ej: 250.00'
                if (key.includes('marca')) return 'Ej: Toyota'
                if (key.includes('modelo')) return 'Ej: Corolla'
                if (key.includes('plataforma')) return 'Ej: PayPal'
                if (key.includes('iban')) return 'Ej: ES91 2100 0418 4502 0005 1332'
                if (key.includes('numero') && key.includes('plazos')) return 'Ej: 3, 6, 12, 18, 24'
                if (key.includes('pulgadas')) return 'Ej: 55 pulgadas'
                if (key.includes('numero') && key.includes('serie')) return 'Ej: NIOXTEC-2024-001'
                if (key.includes('tabla') && key.includes('interes')) return 'Se calcula automáticamente'
                return `Ingresa ${displayLabel.toLowerCase()}`
              }
              
              return (
                <label key={placeholder} className="flex flex-col gap-1">
                  <span className="text-xs lg:text-sm text-gray-500 font-medium">{displayLabel}</span>
                  <input
                    className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                    value={formData[placeholder] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [placeholder]: e.target.value
                    }))}
                    placeholder={getPlaceholderText(placeholder)}
                  />
                </label>
              )
            })}
          
          {/* Additional fields for compraventa template */}
          {selectedTemplate?.id === 'compraventa' && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-xs lg:text-sm text-gray-500 font-medium">Modelo</span>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                  value={formData['modelo'] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    'modelo': e.target.value
                  }))}
                  placeholder="Ej: Digital Screen Pro"
                />
              </label>
              
              <label className="flex flex-col gap-1">
                <span className="text-xs lg:text-sm text-gray-500 font-medium">Pulgadas</span>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                  value={formData['pulgadas'] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    'pulgadas': e.target.value
                  }))}
                  placeholder="Ej: 55 pulgadas"
                />
              </label>
              
              <label className="flex flex-col gap-1">
                <span className="text-xs lg:text-sm text-gray-500 font-medium">Número de Serie</span>
                <input
                  className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                  value={formData['numero_serie'] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    'numero_serie': e.target.value
                  }))}
                  placeholder="Ej: NIOXTEC-2024-001"
                />
              </label>
            </>
          )}
        </div>
      </div>


    </div>
  )
}
