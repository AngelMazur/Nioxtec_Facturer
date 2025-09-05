import React, { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MOTION } from '../styles/motion'

const DataCard = ({
  children,
  onClick,
  className = "",
  actions = [],
  isClickable = true,
  columns = 5 // Número de columnas para desktop
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
      8: 'md:grid-cols-8',
      9: 'md:grid-cols-9'
    }
    return gridMap[cols] || 'md:grid-cols-6'
  }

  // Mapear número de columnas a col-span
  const getColSpan = (cols) => {
    const spanMap = {
      1: 'md:col-span-1',
      2: 'md:col-span-2', 
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      5: 'md:col-span-5',
      6: 'md:col-span-6',
      7: 'md:col-span-7',
      8: 'md:col-span-8',
      9: 'md:col-span-9'
    }
    return spanMap[cols] || 'md:col-span-6'
  }

  const reduceMotion = useReducedMotion()
  const ref = useRef(null)

  const handlePointerMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    el.style.setProperty('--mx', `${mx}px`)
    el.style.setProperty('--my', `${my}px`)
    if (!reduceMotion) {
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rx = ((my - cy) / cy) * -3 // rotateX
      const ry = ((mx - cx) / cx) * 3  // rotateY
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
  }
  const handlePointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
    el.style.transform = ''
  }

  return (
    <motion.div
      ref={ref}
      variants={reduceMotion ? {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
      } : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
      className={`
  niox-data-card bg-gray-800 border border-gray-700 rounded shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]
  transition-all duration-200 will-change-transform
  ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(24,180,216,0.25),_0_8px_24px_-10px_rgba(0,0,0,0.6)] hover:bg-gray-800/80 active:scale-95 active:bg-gray-700' : ''}
        ${className}
        
        /* Responsive padding */
        p-2 sm:p-3 md:p-4
      `}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Grid principal: contenido + acciones */}
      <div className={`
        /* Móvil: 1 columna */
        /* Tablet: 2 columnas */
        /* Desktop: contenido + 1 columna para acciones */
        grid grid-cols-1 sm:grid-cols-2 ${getGridCols(columns + 1)}
        gap-2 sm:gap-3 md:gap-4
        items-start md:items-center
      `}>
        {/* Contenido principal - se expande en todas las columnas excepto la última en desktop */}
        <div className={`
          /* Móvil: 1 columna */
          /* Tablet: 2 columnas */
          /* Desktop: todas las columnas excepto la última */
          grid grid-cols-1 sm:grid-cols-2 ${getGridCols(columns)}
          gap-2 sm:gap-3 md:gap-4
          items-start md:items-center
          col-span-1 sm:col-span-2 ${getColSpan(columns)}
        `}>
          {children}
        </div>

        {/* Sección de acciones */}
        {actions.length > 0 && (
          <div 
            className={`
              /* Móvil/tablet: debajo del contenido en fila horizontal */
              /* Desktop: última columna en fila vertical */
              col-span-1 sm:col-span-2 md:col-span-1
              flex flex-row md:flex-col items-center md:items-start gap-2 sm:gap-3 md:gap-1.5
              justify-center md:justify-center
              mt-2 sm:mt-2.5 md:mt-0
            `} 
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                className={`
                  flex-1 md:w-full text-center md:text-left px-2 py-0.5 sm:px-3 sm:py-1
                  rounded transition-all duration-200
                  text-xs sm:text-sm
                  hover:bg-gray-700/50 hover:scale-[1.02]
                  active:scale-95 focus:ring-2 focus:ring-opacity-50
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
  </motion.div>
  )
}

export default DataCard
