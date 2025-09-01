import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner con gradiente del logo NIOXTEC (versión estable previa) */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent border-r-secondary border-b-brand border-l-secondary animate-spin"
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
