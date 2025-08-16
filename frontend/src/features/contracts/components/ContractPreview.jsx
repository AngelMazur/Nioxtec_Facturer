import { useState, useEffect } from 'react'
import { fillCompleteTemplate } from '../utils/contractParser'

/**
 * Contract preview component
 * Shows rendered markdown with filled placeholders
 */
export default function ContractPreview({ template, formData, loading = false }) {
  const [renderedContent, setRenderedContent] = useState('')
  const [showRaw, setShowRaw] = useState(false)

  // Update rendered content when template or form data changes
  useEffect(() => {
    if (template && formData) {
      try {
        const filled = fillCompleteTemplate(template, formData, formData)
        setRenderedContent(filled)
      } catch (error) {
        console.error('Error filling template:', error)
        setRenderedContent('Error al procesar el contrato')
      }
    }
  }, [template, formData])

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (markdown) => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc ml-4 mb-4">$1</ul>')
      
      // Tables
      .replace(/\| (.*) \|/g, '<td class="border border-gray-600 px-3 py-2">$1</td>')
      .replace(/(<td.*<\/td>)/s, '<tr>$1</tr>')
      .replace(/(<tr.*<\/tr>)/s, '<table class="w-full border-collapse border border-gray-600 mb-4">$1</table>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Remove table header separators
      .replace(/\|.*\|.*\|.*\|.*\|/g, '')
  }

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

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vista Previa del Contrato</h3>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-brand hover:underline"
        >
          {showRaw ? 'Ver Renderizado' : 'Ver Markdown'}
        </button>
      </div>
      
      <div className="bg-gray-900 p-4 rounded border border-gray-700 max-h-96 overflow-y-auto">
        {showRaw ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {renderedContent}
          </pre>
        ) : (
          <div 
            className="text-gray-100 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(renderedContent) }}
          />
        )}
      </div>
    </div>
  )
}
