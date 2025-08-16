/**
 * Contract template parser utilities
 * Extracts placeholders from markdown templates and handles template filling
 */

/**
 * Extract all placeholders from markdown content
 * @param {string} markdown - The markdown content
 * @returns {Array<string>} Array of unique placeholder keys
 */
export function extractPlaceholders(markdown) {
  const placeholderRegex = /\[([^\]]+)\]/g
  const placeholders = new Set()
  let match

  // Split markdown into lines to exclude table content
  const lines = markdown.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip table header separators (lines with |---|)
    if (line.trim().match(/^\|[\s\-:|]+\|$/)) {
      continue
    }
    
    // Skip table content (lines that start with | and contain values like [15 min], [4 h], etc.)
    if (line.trim().startsWith('|') && line.includes('[') && line.includes(']')) {
      // Check if this line contains table values that shouldn't be treated as placeholders
      const tableValueRegex = /\|[\s]*\[([^\]]+)\][\s]*\|/g
      let tableMatch
      while ((tableMatch = tableValueRegex.exec(line)) !== null) {
        const value = tableMatch[1].trim()
        // Skip common table values that shouldn't be form fields
        if (!['15 min', '4 h', '1 h', '8 h', '2 dias', '1 dia', '5 dias'].includes(value)) {
          placeholders.add(value)
        }
      }
      continue
    }
    
    // Process regular placeholders in non-table lines
    while ((match = placeholderRegex.exec(line)) !== null) {
      const placeholder = match[1].trim()
      // Skip empty placeholders and common non-field patterns
      if (placeholder && placeholder.length > 0 && 
          !placeholder.includes('Plantilla editable') &&
          !placeholder.includes('Rellena los campos') &&
          !placeholder.includes('elimina las notas')) {
        placeholders.add(placeholder)
      }
    }
  }

  return Array.from(placeholders).sort()
}

/**
 * Fill template with provided values
 * @param {string} markdown - The markdown template
 * @param {Object} values - Object with placeholder keys and their values
 * @returns {string} Filled template
 */
export function fillTemplate(markdown, values) {
  let filled = markdown

  // Replace all placeholders with their values
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `[${key}]`
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    filled = filled.replace(regex, value || '')
  })

  return filled
}

/**
 * Generate table rows for milestones from form data
 * @param {Array} milestones - Array of milestone objects
 * @returns {string} Markdown table rows
 */
export function generateMilestonesTable(milestones) {
  if (!milestones || milestones.length === 0) {
    return '| [HITO 1] | [DESCRIPCION] | [DD/MM/AAAA] | [IMPORTE] | [CRITERIO] |'
  }

  return milestones
    .map(milestone => {
      const date = milestone.date ? new Date(milestone.date).toLocaleDateString('es-ES') : '[DD/MM/AAAA]'
      const amount = milestone.amount ? `${milestone.amount.toFixed(2)}` : '[IMPORTE]'
      
      return `| ${milestone.name || '[HITO]'} | ${milestone.description || '[DESCRIPCION]'} | ${date} | ${amount} | ${milestone.criteria || '[CRITERIO]'} |`
    })
    .join('\n')
}

/**
 * Generate SLA table from form data
 * @param {Object} sla - SLA configuration object
 * @returns {string} Markdown SLA table
 */
export function generateSLATable(sla) {
  const defaultSLA = {
    critical: { response: '15 min', resolution: '4 h' },
    high: { response: '1 h', resolution: '8 h' },
    medium: { response: '4 h', resolution: '2 dias' },
    low: { response: '1 dia', resolution: '5 dias' }
  }

  const config = { ...defaultSLA, ...sla }

  return `| Critica (S1) | Caida total del sistema | ${config.critical.response} | ${config.critical.resolution} |
| Alta (S2) | Funcion clave degradada | ${config.high.response} | ${config.high.resolution} |
| Media (S3) | Incidencia no bloqueante | ${config.medium.response} | ${config.medium.resolution} |
| Baja (S4) | Consulta o mejora | ${config.low.response} | ${config.low.resolution} |`
}

/**
 * Replace table placeholders with generated content
 * @param {string} markdown - The markdown content
 * @param {Object} formData - Form data including milestones and SLA
 * @returns {string} Markdown with tables filled
 */
export function fillTables(markdown, formData) {
  let filled = markdown

  // Replace milestones table
  if (formData.milestones) {
    const milestonesTable = generateMilestonesTable(formData.milestones)
    filled = filled.replace(/\| \[HITO 1\].*\| \[CRITERIO\] \|/s, milestonesTable)
  }

  // Replace SLA table
  if (formData.sla) {
    const slaTable = generateSLATable(formData.sla)
    filled = filled.replace(/\| Critica \(S1\).*\| \[5 dias\] \|/s, slaTable)
  }

  return filled
}

/**
 * Complete template filling with all replacements
 * @param {string} markdown - The markdown template
 * @param {Object} values - Placeholder values
 * @param {Object} formData - Additional form data for tables
 * @returns {string} Completely filled template
 */
export function fillCompleteTemplate(markdown, values, formData = {}) {
  // First fill regular placeholders
  let filled = fillTemplate(markdown, values)
  
  // Then fill tables
  filled = fillTables(filled, formData)
  
  return filled
}
