import { useState } from 'react'

/**
 * Contract preview component
 * Shows a preview of the form data that will be used in the contract
 */
export default function ContractPreview({ formData, loading = false }) {
  const [showRaw, setShowRaw] = useState(false)

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        </div>
      </div>
    )
  }

  // Format form data for display
  const formatFormData = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return 'No hay datos para mostrar'
    }

    return Object.entries(data)
      .filter(([key, value]) => value && value.toString().trim() !== '')
      .map(([key, value]) => {
        // Format key for display
        const displayKey = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        return `${displayKey}: ${value}`
      })
      .join('\n')
  }

  const formattedData = formatFormData(formData)

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vista Previa de Datos</h3>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-brand hover:underline"
        >
          {showRaw ? 'Ver Formateado' : 'Ver Raw'}
        </button>
      </div>
      
      <div className="bg-gray-900 p-4 rounded border border-gray-700 max-h-96 overflow-y-auto">
        {showRaw ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {JSON.stringify(formData, null, 2)}
          </pre>
        ) : (
          <div className="text-gray-100 space-y-2">
            {formattedData.split('\n').map((line, index) => (
              <div key={index} className="py-1 border-b border-gray-700 last:border-b-0">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded text-sm text-blue-300">
        <strong>Nota:</strong> Esta es una vista previa de los datos que se usarán para rellenar la plantilla DOCX. 
        El PDF final mantendrá el formato original de la plantilla.
      </div>
    </div>
  )
}
