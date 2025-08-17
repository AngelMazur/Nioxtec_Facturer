import React, { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../../../lib/api'

export default function TemplateSelector({ onTemplateSelected, token }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet('/contracts/templates', token)
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Error al cargar las plantillas')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleTemplateSelect = (template) => {
    onTemplateSelected(template)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-400">Cargando plantillas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6 text-center">Selecciona el tipo de contrato</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 text-left transition-colors"
          >
            <h4 className="text-lg font-semibold mb-2">{template.name}</h4>
            <p className="text-gray-400 text-sm">{template.description}</p>
            <div className="mt-4 text-primary text-sm font-medium">
              Seleccionar →
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
