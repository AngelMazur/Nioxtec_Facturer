/**
 * Contract service for loading templates and generating PDFs
 */

import { apiPost, apiGetBlob } from '../../../lib/api'

/**
 * Load contract template from file
 * @returns {Promise<string>} Template content
 */
export async function loadContractTemplate() {
  try {
    // In a real implementation, this would be an API call
    // For now, we'll import the template directly
    const response = await fetch('/src/features/contracts/templates/Plantilla_Contrato_Servicios.md')
    if (!response.ok) {
      throw new Error('No se pudo cargar la plantilla del contrato')
    }
    return await response.text()
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
