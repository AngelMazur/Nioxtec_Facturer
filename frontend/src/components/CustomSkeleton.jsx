import React from 'react'

const CustomSkeleton = ({ count = 5, height = 30, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-gray-800 rounded"
          style={{ height: `${height}px` }}
        >
          <div className="absolute inset-0 bg-gray-800"></div>
          <div 
            className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(8, 180, 216, 0.3), rgba(11, 60, 93, 0.3), transparent)',
              backgroundSize: '200% 100%'
            }}
          ></div>
          <div 
            className="absolute inset-0 animate-shimmer-delayed"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              backgroundSize: '200% 100%'
            }}
          ></div>
        </div>
      ))}
    </div>
  )
}

// Componente específico para columnas de gráfico con alturas variables
const ChartSkeleton = ({ count = 12, maxHeight = 48, className = "" }) => {
  // Generar alturas aleatorias para simular datos reales
  const generateRandomHeights = (count) => {
    return Array.from({ length: count }, () => {
      // Alturas entre 20% y 100% del máximo, con algunas columnas más altas
      const random = Math.random()
      if (random < 0.3) return Math.floor(maxHeight * 0.2) // Columnas bajas
      if (random < 0.7) return Math.floor(maxHeight * 0.4) // Columnas medias
      if (random < 0.9) return Math.floor(maxHeight * 0.7) // Columnas altas
      return Math.floor(maxHeight * 0.9) // Columnas muy altas
    })
  }

  const heights = generateRandomHeights(count)

  return (
    <div className={`flex items-end justify-between gap-1 ${className}`}>
      {heights.map((height, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-gray-800 rounded-sm flex-1"
          style={{ height: `${height}px` }}
        >
          <div className="absolute inset-0 bg-gray-800"></div>
          <div 
            className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(8, 180, 216, 0.3), rgba(11, 60, 93, 0.3), transparent)',
              backgroundSize: '200% 100%'
            }}
          ></div>
          <div 
            className="absolute inset-0 animate-shimmer-delayed"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              backgroundSize: '200% 100%'
            }}
          ></div>
        </div>
      ))}
    </div>
  )
}

export default CustomSkeleton
export { ChartSkeleton }
