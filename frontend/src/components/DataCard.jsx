import React from 'react'

const DataCard = ({
  children,
  onClick,
  className = "",
  actions = [],
  isClickable = true,
  columns = 5 // Número de columnas para desktop (por defecto 5)
}) => {
  // Mapear número de columnas a clases de Tailwind
  const getGridCols = (cols) => {
    const gridMap = {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2', 
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
      7: 'md:grid-cols-7',
      8: 'md:grid-cols-8'
    }
    return gridMap[cols] || 'md:grid-cols-5'
  }

  return (
    <div
      className={`
        bg-gray-800 border border-gray-700 rounded
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:bg-gray-800/80 active:scale-95 active:bg-gray-700' : ''}
        ${className}
        
        /* Responsive padding */
        p-2 sm:p-3 md:p-4
      `}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Contenido principal con layout responsive */}
      <div className={`
        /* Grid responsive: móvil 1 col, tablet 2 cols, desktop dinámico */
        grid grid-cols-1 sm:grid-cols-2 ${getGridCols(columns)}
        gap-2 sm:gap-3 md:gap-4
        items-start md:items-center
        mb-2 sm:mb-2.5 md:mb-0
      `}>
        {children}
      </div>

      {/* Sección de acciones */}
      {actions.length > 0 && (
        <div 
          className="
            mt-2 sm:mt-2.5 md:mt-0 
            flex items-center gap-2 sm:gap-3 md:gap-4
            md:justify-end
          " 
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
