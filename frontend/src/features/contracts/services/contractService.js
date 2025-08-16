/**
 * Contract service for loading templates and generating PDFs
 */

import { apiPost, apiGetBlob, apiGet } from '../../../lib/api'
import { contractTemplate } from '../templates/contractTemplate'

/**
 * Load contract template from file
 * @returns {Promise<string>} Template content
 */
export async function loadContractTemplate() {
  try {
    // Return the imported template directly
    return contractTemplate
  } catch (error) {
    console.error('Error loading template:', error)
    throw new Error('Error al cargar la plantilla del contrato')
  }
}

/**
 * Generate PDF from filled contract template
 * @param {string} contractContent - Filled contract content
 * @param {string} filename - Desired filename
 * @param {string} token - JWT token
 * @returns {Promise<Blob>} PDF blob
 */
export async function generateContractPDF(contractContent, filename, token) {
  try {
    const response = await apiPost('/contracts/generate-pdf', {
      content: contractContent,
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
