import React from 'react'

const ChartColumnSkeleton = ({ className = "" }) => {
  // Generar altura aleatoria para simular datos reales
  const generateRandomHeight = () => {
    const random = Math.random()
    if (random < 0.3) return 0.2 // Columnas bajas (20%)
    if (random < 0.7) return 0.4 // Columnas medias (40%)
    if (random < 0.9) return 0.7 // Columnas altas (70%)
    return 0.9 // Columnas muy altas (90%)
  }

  const heightPercentage = generateRandomHeight()

  return (
    <div className={`flex items-end w-full h-full ${className}`}>
      <div 
        className="relative overflow-hidden bg-gray-800 rounded-sm w-full"
        style={{ height: `${heightPercentage * 100}%` }}
      >
        <div className="absolute inset-0 bg-gray-800"></div>
        <div 
          className="absolute inset-0 animate-shimmer-bottom-up"
          style={{
            background: 'linear-gradient(0deg, transparent, rgba(8, 180, 216, 0.3), rgba(11, 60, 93, 0.3), transparent)',
            backgroundSize: '100% 200%'
          }}
        ></div>
        <div 
          className="absolute inset-0 animate-shimmer-bottom-up-delayed"
          style={{
            background: 'linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            backgroundSize: '100% 200%'
          }}
        ></div>
      </div>
    </div>
  )
}

export default ChartColumnSkeleton
