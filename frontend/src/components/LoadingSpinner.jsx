import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner con gradiente del logo NIOXTEC (versión estable previa) */}
        <div className="relative w-16 h-16">
          {/* Aro base (gris), tamaño fijo cuadrado, 100% circular */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-800 animate-[spin-clockwise_0.8s_linear_infinite] niox-animate-spin" />
          {/* Aro superior con segmentos en colores de marca */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-[spin-clockwise_0.6s_linear_infinite] niox-animate-spin"
            style={{
              borderTopColor: '#08b4d8',
              borderRightColor: '#0b3c5d',
              borderBottomColor: '#08b4d8',
              borderLeftColor: '#0b3c5d',
            }}
          />
        </div>
        
        {/* Texto de carga con gradiente */}
        <div className="text-xl font-semibold">
          <span 
            className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(90deg, #08b4d8, #0b3c5d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Cargando...
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
