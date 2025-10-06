import { useState, useEffect } from 'react'

/**
 * Componente para mostrar imágenes que requieren autenticación JWT
 * Carga la imagen usando fetch con el token y la muestra usando blob URL
 */
export default function AuthenticatedImage({ src, alt, className, token, onClick, onError }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    let objectUrl = null

    async function loadImage() {
      if (!src || !token) {
        setLoading(false)
        setError(true)
        return
      }

      try {
        setLoading(true)
        setError(false)

        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)

        if (mounted) {
          setBlobUrl(objectUrl)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading authenticated image:', err)
        if (mounted) {
          setError(true)
          setLoading(false)
          if (onError) onError(err)
        }
      }
    }

    loadImage()

    // Cleanup: revocar el blob URL cuando el componente se desmonte
    return () => {
      mounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src, token, onError])

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800/50 animate-pulse`}>
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error || !blobUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-700`}>
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  }

  return (
    <img 
      src={blobUrl} 
      alt={alt} 
      className={className}
      onClick={onClick}
    />
  )
}
