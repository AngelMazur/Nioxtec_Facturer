/**
 * Unit tests for contract parser utilities
 */

import { 
  extractPlaceholders, 
  fillTemplate, 
  generateMilestonesTable, 
  generateSLATable,
  fillCompleteTemplate 
} from '../utils/contractParser'

describe('Contract Parser Utils', () => {
  describe('extractPlaceholders', () => {
    it('should extract all placeholders from markdown content', () => {
      const markdown = `
        # CONTRATO
        Cliente: [NOMBRE DEL CLIENTE]
        NIF: [NIF/NIE CLIENTE]
        Domicilio: [DOMICILIO CLIENTE]
        Proveedor: [NOMBRE DEL PROVEEDOR]
      `
      
      const placeholders = extractPlaceholders(markdown)
      
      expect(placeholders).toEqual([
        'DOMICILIO CLIENTE',
        'NIF/NIE CLIENTE', 
        'NOMBRE DEL CLIENTE',
        'NOMBRE DEL PROVEEDOR'
      ])
    })

    it('should handle duplicate placeholders', () => {
      const markdown = `
        [NOMBRE DEL CLIENTE] aparece aquí
        Y también aquí: [NOMBRE DEL CLIENTE]
      `
      
      const placeholders = extractPlaceholders(markdown)
      
      expect(placeholders).toEqual(['NOMBRE DEL CLIENTE'])
    })

    it('should return empty array for no placeholders', () => {
      const markdown = 'Texto sin placeholders'
      
      const placeholders = extractPlaceholders(markdown)
      
      expect(placeholders).toEqual([])
    })
  })

  describe('fillTemplate', () => {
    it('should replace all placeholders with values', () => {
      const template = 'Cliente: [NOMBRE] con NIF [NIF]'
      const values = {
        'NOMBRE': 'Juan Pérez',
        'NIF': '12345678A'
      }
      
      const result = fillTemplate(template, values)
      
      expect(result).toBe('Cliente: Juan Pérez con NIF 12345678A')
    })

    it('should handle empty values', () => {
      const template = 'Cliente: [NOMBRE] con NIF [NIF]'
      const values = {
        'NOMBRE': '',
        'NIF': '12345678A'
      }
      
      const result = fillTemplate(template, values)
      
      expect(result).toBe('Cliente:  con NIF 12345678A')
    })

    it('should handle missing values', () => {
      const template = 'Cliente: [NOMBRE] con NIF [NIF]'
      const values = {
        'NOMBRE': 'Juan Pérez'
        // NIF missing
      }
      
      const result = fillTemplate(template, values)
      
      expect(result).toBe('Cliente: Juan Pérez con NIF ')
    })
  })

  describe('generateMilestonesTable', () => {
    it('should generate table rows from milestones', () => {
      const milestones = [
        {
          name: 'Análisis',
          description: 'Análisis de requisitos',
          date: '2024-01-15',
          amount: 1000,
          criteria: 'Documento aprobado'
        }
      ]
      
      const result = generateMilestonesTable(milestones)
      
      expect(result).toContain('| Análisis | Análisis de requisitos | 15/01/2024 | 1000.00 | Documento aprobado |')
    })

    it('should handle empty milestones', () => {
      const result = generateMilestonesTable([])
      
      expect(result).toBe('| [HITO 1] | [DESCRIPCION] | [DD/MM/AAAA] | [IMPORTE] | [CRITERIO] |')
    })
  })

  describe('generateSLATable', () => {
    it('should generate SLA table with default values', () => {
      const result = generateSLATable({})
      
      expect(result).toContain('| Critica (S1) | Caida total del sistema | 15 min | 4 h |')
      expect(result).toContain('| Alta (S2) | Funcion clave degradada | 1 h | 8 h |')
    })

    it('should generate SLA table with custom values', () => {
      const sla = {
        critical: { response: '30 min', resolution: '2 h' },
        high: { response: '2 h', resolution: '1 dia' }
      }
      
      const result = generateSLATable(sla)
      
      expect(result).toContain('| Critica (S1) | Caida total del sistema | 30 min | 2 h |')
      expect(result).toContain('| Alta (S2) | Funcion clave degradada | 2 h | 1 dia |')
    })
  })

  describe('fillCompleteTemplate', () => {
    it('should fill template with placeholders and tables', () => {
      const template = `
        Cliente: [NOMBRE]
        | [HITO 1] | [DESCRIPCION] | [DD/MM/AAAA] | [IMPORTE] | [CRITERIO] |
        | Critica (S1) | Caida total del sistema | [15 min] | [4 h] |
      `
      
      const values = { 'NOMBRE': 'Juan Pérez' }
      const formData = {
        milestones: [
          {
            name: 'Análisis',
            description: 'Análisis de requisitos',
            date: '2024-01-15',
            amount: 1000,
            criteria: 'Documento aprobado'
          }
        ],
        sla: {
          critical: { response: '30 min', resolution: '2 h' }
        }
      }
      
      const result = fillCompleteTemplate(template, values, formData)
      
      expect(result).toContain('Cliente: Juan Pérez')
      expect(result).toContain('| Análisis | Análisis de requisitos | 15/01/2024 | 1000.00 | Documento aprobado |')
      expect(result).toContain('| Critica (S1) | Caida total del sistema | 30 min | 2 h |')
    })
  })
})
