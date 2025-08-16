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

  while ((match = placeholderRegex.exec(markdown)) !== null) {
    placeholders.add(match[1].trim())
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
