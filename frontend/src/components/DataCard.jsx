import React from 'react'

const DataCard = ({ 
  children, 
  onClick, 
  className = "", 
  actions = [],
  isClickable = true 
}) => {
  return (
    <div 
      className={`
        p-3 bg-gray-800 border border-gray-700 rounded 
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:bg-gray-800/80 active:scale-95 active:bg-gray-700' : ''}
        ${className}
      `}
      onClick={isClickable ? onClick : undefined}
      style={{ minHeight: '8.5em' }} // Altura mínima fija para consistencia
    >
      {/* Contenido principal */}
      <div className="space-y-1 mb-3">
        {children}
      </div>
      
      {/* Sección de acciones */}
      {actions.length > 0 && (
        <div className="mt-3 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`
                underline active:scale-95 transition-transform duration-200 
                inline-block focus:ring-2 focus:ring-opacity-50 rounded
                ${action.className || ''}
              `}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataCard
