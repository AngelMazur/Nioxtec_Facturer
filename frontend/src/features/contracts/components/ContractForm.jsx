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
            'nombre_del_cliente': selectedClient.name,
            'nif_nie_cliente': selectedClient.cif,
            'domicilio_cliente': selectedClient.address,
            'email_s': selectedClient.email
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
        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Campos del Contrato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-3 flex-1">
          {placeholders.map(placeholder => (
            <label key={placeholder} className="flex flex-col gap-1">
              <span className="text-xs lg:text-sm text-gray-500 font-medium">{placeholder}</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-2 lg:p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full text-sm lg:text-base"
                value={formData[placeholder] || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [placeholder]: e.target.value
                }))}
                placeholder={`Ingresa ${placeholder.toLowerCase()}`}
              />
            </label>
          ))}
        </div>
      </div>


    </div>
  )
}
