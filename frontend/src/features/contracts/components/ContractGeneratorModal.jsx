import { useState, useCallback, useEffect } from 'react'
// STYLE: Añadimos animaciones de apertura/cierre accesibles
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useStore } from '../../../store/store'
import { generateContractPDF, downloadContractPDF, saveContractAsClientDocument } from '../services/contractService'
import ContractForm from './ContractForm'
import ContractPreview from './ContractPreview'
import TemplateSelector from './TemplateSelector'
import toast from 'react-hot-toast'

/**
 * Main contract generator modal component
 */
export default function ContractGeneratorModal({ isOpen, onClose, selectedClient = null, onDocumentSaved = null }) {
  const { token } = useStore()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({})
  const [activeFields, setActiveFields] = useState([])
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'preview'
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [savingDocument, setSavingDocument] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [customFilename, setCustomFilename] = useState('')

  // Reset modal state when it opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setSelectedTemplate(null)
      setFormData({})
      setActiveFields([])
      setActiveTab('form')
      setGeneratingPDF(false)
      setSavingDocument(false)
      setResetKey(0)
      setCustomFilename('')
    }
  }, [isOpen])

  // Handle form data changes
  const handleFormDataChange = useCallback((data) => {
    setFormData(data)
  }, [])

  // Handle template selection
  const handleTemplateSelected = useCallback((template) => {
    setSelectedTemplate(template)
    setActiveTab('form')
  }, [])

  // Handle back to template selection
  const handleBackToTemplates = useCallback(() => {
    setSelectedTemplate(null)
    setFormData({})
    setActiveTab('form')
  }, [])



  // Handle modal close with reset
  const handleClose = useCallback(() => {
    setSelectedTemplate(null)
    setFormData({})
    setActiveFields([])
    setActiveTab('form')
    setGeneratingPDF(false)
    setSavingDocument(false)
    onClose()
  }, [onClose])

  // Generate filename
  const generateFilename = useCallback(() => {
    // If custom filename is provided, use it
    if (customFilename && customFilename.trim()) {
      const filename = customFilename.trim()
      return filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    }
    
    // Otherwise generate automatic filename
    const clientName = formData['nombre_completo_del_cliente'] || formData['nombre_de_la_empresa_o_persona'] || 'Cliente'
    const date = new Date().toISOString().slice(0, 10)
    
    // Clean template name by removing "Plantilla_" prefix and file extension
    let templateName = selectedTemplate.name
    if (selectedTemplate.filename && selectedTemplate.filename.startsWith('Plantilla_')) {
      templateName = selectedTemplate.filename.replace('Plantilla_', '').replace('.docx', '')
    }
    
    return `${templateName}_${clientName.replace(/\s+/g, '_')}_${date}.pdf`
  }, [formData, selectedTemplate, customFilename])

  // Validate form data - check only active fields
  const validateFormData = useCallback(() => {
    if (!formData || Object.keys(formData).length === 0) {
      toast.error('Completa el formulario antes de guardar o generar el PDF')
      return { isValid: false, missingFields: [] }
    }

    if (activeFields.length === 0) {
      toast.error('No se han cargado los campos del formulario')
      return { isValid: false, missingFields: [] }
    }

    const missingFields = []
    
    // Only validate the active fields that are actually shown in the form
    activeFields.forEach(fieldKey => {
      const value = formData[fieldKey]
      if (!value || value.toString().trim() === '') {
        // Map field keys to user-friendly names
        const fieldNames = {
          'nombre_completo_del_cliente': 'Nombre completo del cliente',
          'nombre_de_la_empresa_o_persona': 'Nombre de la empresa o persona',
          'nombre_representante': 'Nombre del representante',
          'numero': 'Número/DNI',
          'direccion': 'Dirección',
          'telefono': 'Teléfono',
          'correo': 'Correo electrónico',
          'modelo': 'Modelo del producto',
          'pulgadas': 'Pulgadas del producto',
          'numero_serie': 'Número de serie',
          'importe_total_en_euros_iva_incluido': 'Importe total en euros (IVA incluido)',
          'importe_en_euros': 'Importe en euros',
          'numero_de_plazos': 'Número de plazos',
          'importe_de_cada_cuota': 'Importe de cada cuota',
          'tabla_de_interes': 'Tabla de interés',
          'cargo': 'Cargo',
          'marca': 'Marca',
          'plataforma_de_pago': 'Plataforma de pago',
          'iban': 'IBAN',
          'importe_ajustado': 'Importe ajustado',
          'nombre_del_proveedor': 'Nombre del proveedor',
          'nif_proveedor': 'NIF del proveedor',
          'domicilio_proveedor': 'Domicilio del proveedor',
          'ciudad': 'Ciudad',
          'ciudad_provincia': 'Ciudad/Provincia'
        }
        
        missingFields.push(fieldNames[fieldKey] || fieldKey)
      }
    })

    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.join(', ')
      toast.error(`Faltan campos obligatorios: ${missingFieldsText}`)
      return { isValid: false, missingFields }
    }

    return { isValid: true, missingFields: [] }
  }, [formData, activeFields])

  // Save contract as client document
  const handleSaveDocument = async () => {
    if (!selectedTemplate) {
      toast.error('No hay plantilla seleccionada')
      return
    }

    if (!selectedClient) {
      toast.error('No hay cliente seleccionado para guardar el documento')
      return
    }

    // Validate form data
    const validation = validateFormData()
    if (!validation.isValid) {
      return
    }

    try {
      setSavingDocument(true)
      
      const filename = generateFilename()
      
      // Save contract as client document
      await saveContractAsClientDocument(selectedTemplate.id, formData, filename, selectedClient.id, token)
      
      // Call callback to refresh client documents if provided
      if (onDocumentSaved && selectedClient) {
        onDocumentSaved(selectedClient.id)
      }
      
      // Keep form data after saving - user can generate PDF or create another contract
      setActiveTab('form')
      toast.success('Contrato guardado. Puedes generar el PDF o crear otro contrato.')
    } catch (error) {
      console.error('Error saving document:', error)
      // Show the original error message from the backend
      toast.error(error.message || 'Error al guardar el contrato como documento')
    } finally {
      setSavingDocument(false)
    }
  }

  // Generate and download PDF
  const handleGeneratePDF = async () => {
    if (!selectedTemplate) {
      toast.error('No hay plantilla seleccionada')
      return
    }

    // Validate form data
    const validation = validateFormData()
    if (!validation.isValid) {
      return
    }

    try {
      setGeneratingPDF(true)
      
      const filename = generateFilename()
      
      // Generate PDF using template ID and form data
      // Pass client ID if available for auto-save
      const result = await generateContractPDF(
        selectedTemplate.id, 
        formData, 
        filename, 
        token,
        selectedClient?.id || null
      )
      
      // Download PDF
      downloadContractPDF(result.pdfBlob, filename)
      
      // Show success message
      if (result.documentSaved && selectedClient) {
        toast.success('Contrato generado, descargado y guardado automáticamente')
        // Call callback to refresh client documents if provided
        if (onDocumentSaved) {
          onDocumentSaved(selectedClient.id)
        }
      } else {
        toast.success('Contrato generado y descargado correctamente')
      }
      
      // Close modal when generating PDF
      handleClose()
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error al generar el PDF del contrato')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // Overlay fade
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50"
          onClick={handleClose}
        >
          <motion.div
            // STYLE: Panel entra con zoom suave; en reduceMotion solo fade
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0, y: 12 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.96, opacity: 0, y: 12 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', damping: 26, stiffness: 320 }}
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-labelledby="contract-generator-title"
          >
        {/* Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <button
                onClick={handleBackToTemplates}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="Volver a selección de plantillas"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 id="contract-generator-title" className="text-lg lg:text-xl font-semibold">Generador de Contratos</h2>
              {selectedTemplate && (
                <p className="text-sm text-gray-400 mt-1">{selectedTemplate.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {selectedTemplate && (
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'form'
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Formulario
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Vista Previa
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Template Selector */}
            {!selectedTemplate && (
              <div className="w-full overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                <TemplateSelector
                  onTemplateSelected={handleTemplateSelected}
                  token={token}
                />
              </div>
            )}

            {/* Animated Panels: Form / Preview */}
            {selectedTemplate && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full p-3 lg:p-4 overflow-y-auto pb-32 md:pb-24 lg:pb-10"
                  style={{ maxHeight: 'calc(90vh - 220px)' }}
                >
                  {activeTab === 'form' ? (
                    <>
                      {/* Custom Filename Input */}
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre del archivo
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            placeholder={generateFilename()}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomFilename('')}
                            className="px-2 py-2 text-gray-400 hover:text-white transition-colors"
                            title="Usar nombre automático"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Deja vacío para usar el nombre automático: {generateFilename()}
                        </p>
                      </div>

                      <ContractForm
                        onFormDataChange={handleFormDataChange}
                        onActiveFieldsChange={setActiveFields}
                        selectedClient={selectedClient}
                        selectedTemplate={selectedTemplate}
                        resetKey={resetKey}
                      />
                    </>
                  ) : (
                    <ContractPreview
                      formData={formData}
                      loading={!formData || Object.keys(formData).length === 0}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 lg:p-4 border-t border-gray-700 bg-gray-800 gap-3 sticky bottom-0">
            <div className="text-xs lg:text-sm text-gray-400 order-2 lg:order-1">
              {activeTab === 'form' ? 'Completa todos los campos obligatorios' : 'Revisa la vista previa'}
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 order-1 lg:order-2">
              <button
                onClick={handleClose}
                className="px-3 lg:px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm lg:text-base border border-gray-600 hover:border-gray-500 rounded"
              >
                Cancelar
              </button>
              {selectedClient && (
                <button
                  onClick={handleSaveDocument}
                  disabled={savingDocument || generatingPDF}
                  className={`px-3 lg:px-4 py-2 rounded transition-all duration-200 text-sm lg:text-base ${
                    savingDocument || generatingPDF
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-secondary text-white hover:scale-105'
                  }`}
                >
                  {savingDocument ? 'Guardando...' : 'Guardar'}
                </button>
              )}
              <button
                onClick={handleGeneratePDF}
                disabled={generatingPDF || savingDocument}
                className={`px-3 lg:px-4 py-2 rounded transition-all duration-200 text-sm lg:text-base ${
                  generatingPDF || savingDocument
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 text-white'
                }`}
              >
                {generatingPDF ? 'Generando...' : 'Generar PDF'}
              </button>
            </div>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
