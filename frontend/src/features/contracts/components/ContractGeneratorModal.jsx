import { useState, useCallback } from 'react'
import { useStore } from '../../../store/store'
import { generateContractPDF, downloadContractPDF } from '../services/contractService'
import { fillCompleteTemplate } from '../utils/contractParser'
import ContractForm from './ContractForm'
import ContractPreview from './ContractPreview'
import toast from 'react-hot-toast'

/**
 * Main contract generator modal component
 */
export default function ContractGeneratorModal({ isOpen, onClose, selectedClient = null }) {
  const { token } = useStore()
  const [template, setTemplate] = useState('')
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'preview'
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // Handle form data changes
  const handleFormDataChange = useCallback((data) => {
    setFormData(data)
  }, [])

  // Handle template loaded
  const handleTemplateLoaded = useCallback((templateContent) => {
    setTemplate(templateContent)
  }, [])

  // Generate and download PDF
  const handleGeneratePDF = async () => {
    if (!template || !formData) {
      toast.error('No hay datos suficientes para generar el contrato')
      return
    }

    try {
      setGeneratingPDF(true)
      
      // Fill the template with form data
      const filledContent = fillCompleteTemplate(template, formData, formData)
      
      // Generate filename
      const clientName = formData['NOMBRE DEL CLIENTE'] || 'Cliente'
      const date = new Date().toISOString().slice(0, 10)
      const filename = `Contrato_${clientName.replace(/\s+/g, '_')}_${date}.pdf`
      
      // Generate PDF
      const pdfBlob = await generateContractPDF(filledContent, filename, token)
      
      // Download PDF
      downloadContractPDF(pdfBlob, filename)
      
      toast.success('Contrato generado y descargado correctamente')
      onClose()
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error al generar el PDF del contrato')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Generador de Contratos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'form'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Formulario
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Vista Previa
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Form Panel */}
            <div className={`w-1/2 p-6 overflow-y-auto ${activeTab === 'form' ? 'block' : 'hidden'}`}>
              <ContractForm
                onFormDataChange={handleFormDataChange}
                onTemplateLoaded={handleTemplateLoaded}
                selectedClient={selectedClient}
              />
            </div>

            {/* Preview Panel */}
            <div className={`w-1/2 p-6 overflow-y-auto ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <ContractPreview
                template={template}
                formData={formData}
                loading={!template}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {activeTab === 'form' ? 'Completa el formulario' : 'Revisa la vista previa'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF || !template || !formData}
              className={`px-6 py-2 rounded transition-all duration-200 ${
                generatingPDF || !template || !formData
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:opacity-90 text-white'
              }`}
            >
              {generatingPDF ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
