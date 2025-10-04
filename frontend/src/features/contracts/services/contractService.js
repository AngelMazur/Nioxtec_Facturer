/**
 * Contract service for loading templates and generating PDFs
 */

import { apiPost, apiGetBlob, apiGet } from '../../../lib/api'

/**
 * Load contract placeholders from DOCX template
 * @param {string} templateId - Template ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Placeholders data
 */
export async function loadContractPlaceholders(templateId, token) {
  try {
    const response = await apiGet(`/contracts/templates/${templateId}/placeholders`, token)
    return response
  } catch (error) {
    console.error('Error loading placeholders:', error)
    throw new Error('Error al cargar los campos del contrato')
  }
}

/**
 * Generate PDF from filled contract template
 * @param {string} templateId - Template ID
 * @param {Object} formData - Form data with placeholder values
 * @param {string} filename - Desired filename
 * @param {string} token - JWT token
 * @param {number} clientId - Optional client ID to auto-save as client document
 * @returns {Promise<Object>} Object with pdfBlob and documentSaved flag
 */
export async function generateContractPDF(templateId, formData, filename, token, clientId = null) {
  try {
    const requestData = {
      template_id: templateId,
      form_data: formData,
      filename: filename
    }
    
    // Add client_id if provided for auto-save
    if (clientId) {
      requestData.client_id = clientId
    }
    
    const response = await apiPost('/contracts/generate-pdf', requestData, token)
    
    // Get the PDF blob
    const pdfBlob = await apiGetBlob(`/contracts/download/${response.filename}`, token)
    
    return {
      pdfBlob,
      documentSaved: response.document_saved || false,
      filename: response.filename
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Error al generar el PDF del contrato')
  }
}

/**
 * Save contract PDF as client document
 * @param {string} templateId - Template ID
 * @param {Object} formData - Form data with placeholder values
 * @param {string} filename - Desired filename
 * @param {number} clientId - Client ID to save document to
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Saved document info
 */
export async function saveContractAsClientDocument(templateId, formData, filename, clientId, token) {
  try {
    const response = await apiPost('/contracts/save-as-document', {
      template_id: templateId,
      form_data: formData,
      filename: filename,
      client_id: clientId
    }, token)
    
    return response
  } catch (error) {
    console.error('Error saving contract as document:', error)
    // Preserve the original error message from the backend
    if (error.message && (error.message.includes('Ya existe un documento') || error.message.includes('already exists') || error.message.includes('existe un documento'))) {
      throw error // Keep the original error message
    }
    throw new Error('Error al guardar el contrato como documento del cliente')
  }
}

/**
 * Load company configuration
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Company configuration
 */
export async function loadCompanyConfig(token) {
  try {
    return await apiGet('/company/config', token)
  } catch (error) {
    console.error('Error loading company config:', error)
    throw new Error('Error al cargar la configuración de la empresa')
  }
}

/**
 * Download contract PDF
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - Filename for download
 */
export function downloadContractPDF(pdfBlob, filename) {
  const url = window.URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
