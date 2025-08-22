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
        bg-gray-800 border border-gray-700 rounded
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:bg-gray-800/80 active:scale-95 active:bg-gray-700' : ''}
        ${className}
        
        /* Responsive padding */
        p-2 sm:p-3 md:p-4
        
        /* Responsive min-height */
        min-h-[7em] sm:min-h-[8em] md:min-h-[8.5em]
      `}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Contenido principal */}
      <div className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-2 sm:mb-2.5 md:mb-3">
        {children}
      </div>

      {/* Sección de acciones */}
      {actions.length > 0 && (
        <div 
          className="mt-2 sm:mt-2.5 md:mt-3 flex items-center gap-2 sm:gap-3 md:gap-4" 
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              className={`
                underline active:scale-95 transition-transform duration-200
                inline-block focus:ring-2 focus:ring-opacity-50 rounded
                text-xs sm:text-sm md:text-base
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
