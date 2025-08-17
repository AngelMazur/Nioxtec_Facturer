import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../store/store'
import { extractPlaceholders } from '../utils/contractParser'
import { loadContractTemplate, loadCompanyConfig } from '../services/contractService'

/**
 * Dynamic contract form component
 * Generates form fields based on template placeholders
 */
export default function ContractForm({ onFormDataChange, onTemplateLoaded, selectedClient }) {
  const { token } = useStore()
  const [_template, setTemplate] = useState('')
  const [placeholders, setPlaceholders] = useState([])
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [milestones, setMilestones] = useState([])
  const [sla, setSla] = useState({
    critical: { response: '15 min', resolution: '4 h' },
    high: { response: '1 h', resolution: '8 h' },
    medium: { response: '4 h', resolution: '2 dias' },
    low: { response: '1 dia', resolution: '5 dias' }
  })
  
  // Use ref to store the latest onFormDataChange function
  const onFormDataChangeRef = useRef(onFormDataChange)
  onFormDataChangeRef.current = onFormDataChange

  // Load template and extract placeholders
  useEffect(() => {
    async function loadTemplate() {
      try {
        setLoading(true)
        const templateContent = await loadContractTemplate()
        setTemplate(templateContent)
        
        const extractedPlaceholders = extractPlaceholders(templateContent)
        setPlaceholders(extractedPlaceholders)
        
        // Initialize form data with empty values
        const initialData = {}
        extractedPlaceholders.forEach(placeholder => {
          initialData[placeholder] = ''
        })
        setFormData(initialData)
        
        // Auto-fill client data if selectedClient is provided
        if (selectedClient) {
          const clientData = {
            ...initialData,
            'NOMBRE DEL CLIENTE': selectedClient.name,
            'NIF/NIE CLIENTE': selectedClient.cif,
            'DOMICILIO CLIENTE': selectedClient.address,
            'EMAIL/S': selectedClient.email
          }
          setFormData(clientData)
        }
        
        // Auto-fill provider data from company config
        try {
          const companyConfig = await loadCompanyConfig(token)
          setFormData(prev => ({
            ...prev,
            'NOMBRE DEL PROVEEDOR': companyConfig.name,
            'NIF PROVEEDOR': companyConfig.cif,
            'DOMICILIO PROVEEDOR': companyConfig.address
          }))
        } catch (error) {
          console.error('Error loading company config:', error)
        }
        
        onTemplateLoaded?.(templateContent)
      } catch (error) {
        console.error('Error loading template:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTemplate()
  }, [onTemplateLoaded, selectedClient, token])

  // Notify parent of form data changes
  useEffect(() => {
    if (onFormDataChangeRef.current) {
      onFormDataChangeRef.current({
        ...formData,
        milestones,
        sla
      })
    }
  }, [formData, milestones, sla])



  // Add milestone
  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      id: Date.now(),
      name: '',
      description: '',
      date: '',
      amount: 0,
      criteria: ''
    }])
  }

  // Remove milestone
  const removeMilestone = (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  // Update milestone
  const updateMilestone = (id, field, value) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  // Update SLA
  const updateSLA = (level, field, value) => {
    setSla(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value }
    }))
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
    <div className="space-y-6">
      {/* Dynamic Form Fields */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Campos del Contrato</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {placeholders.map(placeholder => (
            <label key={placeholder} className="flex flex-col gap-1">
              <span className="text-sm text-gray-500 font-medium">{placeholder}</span>
              <input
                className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
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

      {/* Milestones Section */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hitos del Proyecto</h3>
          <button
            type="button"
            onClick={addMilestone}
            className="bg-primary hover:opacity-90 transition text-white px-3 py-1.5 rounded text-sm"
          >
            Añadir Hito
          </button>
        </div>
        
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 border border-gray-700 p-4 rounded">
              <input
                className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                placeholder="Nombre del hito"
                value={milestone.name}
                onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
              />
              <input
                className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                placeholder="Descripción"
                value={milestone.description}
                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
              />
              <input
                type="date"
                className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                value={milestone.date}
                onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                placeholder="Importe"
                value={milestone.amount}
                onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)}
              />
              <div className="flex gap-2">
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand flex-1"
                  placeholder="Criterio"
                  value={milestone.criteria}
                  onChange={(e) => updateMilestone(milestone.id, 'criteria', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Section */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Niveles de Servicio (SLA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sla).map(([level, config]) => (
            <div key={level} className="border border-gray-700 p-4 rounded">
              <h4 className="font-medium mb-3 capitalize text-base">{level}</h4>
              <div className="space-y-3">
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                  placeholder="Tiempo respuesta"
                  value={config.response}
                  onChange={(e) => updateSLA(level, 'response', e.target.value)}
                />
                <input
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand w-full"
                  placeholder="Tiempo resolución"
                  value={config.resolution}
                  onChange={(e) => updateSLA(level, 'resolution', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
