import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner con gradiente del logo NIOXTEC y brillo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 shadow-[0_0_20px_rgba(8,180,216,0.25)] animate-[spin_0.9s_linear_infinite]" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-[spin_0.8s_linear_infinite]"
            style={{
              borderTopColor: '#08b4d8',
              borderRightColor: '#0b3c5d',
              borderBottomColor: '#08b4d8',
              borderLeftColor: '#0b3c5d'
            }}
          />
        </div>

        {/* Texto de carga con gradiente marca */}
        <div className="text-xl font-semibold">
          <span
            className="bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(90deg, #08b4d8, #0b3c5d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
