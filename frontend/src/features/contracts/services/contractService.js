/**
 * Contract service for loading templates and generating PDFs
 */

import { apiPost, apiGetBlob, apiGet } from '../../../lib/api'
import { contractTemplate } from '../templates/contractTemplate'

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
 * @returns {Promise<Blob>} PDF blob
 */
export async function generateContractPDF(templateId, formData, filename, token) {
  try {
    const response = await apiPost('/contracts/generate-pdf', {
      template_id: templateId,
      form_data: formData,
      filename: filename
    }, token)
    
    // Get the PDF blob
    const pdfBlob = await apiGetBlob(`/contracts/download/${response.filename}`, token)
    return pdfBlob
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Error al generar el PDF del contrato')
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
