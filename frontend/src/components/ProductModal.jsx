import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

/**
 * ProductModal
 * Modal avanzado para crear/editar productos con características, imágenes y más
 */
export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingProduct = null,
  initialCategory = '',
  initialModel = ''
}) {
  // Detectar si la categoría viene pre-seleccionada (desde tarjeta)
  const categoryLocked = Boolean(initialCategory && !editingProduct)
  
  const [productForm, setProductForm] = useState({
    category: editingProduct?.category || initialCategory || '',
    model: editingProduct?.model || initialModel || '',
    sku: editingProduct?.sku || '',
    stock_qty: editingProduct?.stock_qty || 0,
    price_net: editingProduct?.price_net || 0,
    tax_rate: editingProduct?.tax_rate || 21.0,
    features: editingProduct?.features || {},
    images: editingProduct?.images || []
  })

  const [newFeatureKey, setNewFeatureKey] = useState('')
  const [newFeatureValue, setNewFeatureValue] = useState('')
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'features' | 'images'
  const [uploadingImage, setUploadingImage] = useState(false)

  // Resetear formulario cuando cambian las props (abrir modal con nuevos datos)
  useEffect(() => {
    if (isOpen) {
      setProductForm({
        category: editingProduct?.category || initialCategory || '',
        model: editingProduct?.model || initialModel || '',
        sku: editingProduct?.sku || '',
        stock_qty: editingProduct?.stock_qty || 0,
        price_net: editingProduct?.price_net || 0,
        tax_rate: editingProduct?.tax_rate || 21.0,
        features: editingProduct?.features || {},
        images: editingProduct?.images || []
      })
      setActiveTab('general')
      setNewFeatureKey('')
      setNewFeatureValue('')
    }
  }, [isOpen, editingProduct, initialCategory, initialModel])

  // Características predefinidas comunes
  const COMMON_FEATURES = [
    { key: 'Tamaño Pantalla', placeholder: 'ej: 55", 65"' },
    { key: 'Resolución', placeholder: 'ej: 4K UHD, Full HD' },
    { key: 'Conectividad', placeholder: 'ej: HDMI, USB, WiFi' },
    { key: 'Medidas', placeholder: 'ej: 123cm x 70cm x 5cm' },
    { key: 'Peso', placeholder: 'ej: 15kg' },
    { key: 'Renting Disponible', placeholder: 'Sí / No' },
    { key: 'Precio Renting Mensual', placeholder: 'ej: 50€/mes' },
    { key: 'Sistema Operativo', placeholder: 'ej: Android, Windows' },
  ]

  const handleAddFeature = (key = newFeatureKey, value = newFeatureValue) => {
    if (!key.trim()) {
      toast.error('El nombre de la característica no puede estar vacío')
      return
    }
    setProductForm({
      ...productForm,
      features: { ...productForm.features, [key.trim()]: value.trim() }
    })
    setNewFeatureKey('')
    setNewFeatureValue('')
  }

  const handleRemoveFeature = (key) => {
    const newFeatures = { ...productForm.features }
    delete newFeatures[key]
    setProductForm({ ...productForm, features: newFeatures })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImage(true)
    try {
      // TODO: Implementar subida real al servidor
      // Por ahora simulamos con URLs locales
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file: file // Guardar referencia para subir después
      }))
      
      setProductForm({
        ...productForm,
        images: [...(productForm.images || []), ...newImages]
      })
      toast.success(`${files.length} imagen(es) añadida(s)`)
    } catch {
      toast.error('Error al subir imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = [...productForm.images]
    newImages.splice(index, 1)
    setProductForm({ ...productForm, images: newImages })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validaciones
    if (!productForm.category.trim()) {
      toast.error('La categoría es obligatoria')
      return
    }
    if (!productForm.model.trim()) {
      toast.error('El modelo es obligatorio')
      return
    }
    
    onSubmit(productForm, editingProduct)
  }

  const formatPrice = (price, taxRate) => {
    const gross = price * (1 + taxRate / 100)
    return gross.toFixed(2)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl w-full max-w-4xl 
                     max-h-[90vh] overflow-hidden border border-gray-700/50 shadow-2xl shadow-brand/20"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700/50 bg-gray-900/50">
            <div>
              <h3 className="text-2xl font-bold text-brand flex items-center gap-3">
                {editingProduct ? (
                  <>
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar Producto
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    {initialCategory ? `Nuevo Producto en ${initialCategory}` : 'Crear Producto'}
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {editingProduct 
                  ? 'Modifica los detalles del producto' 
                  : initialCategory
                    ? `Añade un nuevo modelo a la categoría ${initialCategory}`
                    : 'Completa la información del nuevo producto'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-gray-700/30 bg-gray-900/30">
            {[
              { id: 'general', label: 'General', icon: '📋' },
              { id: 'features', label: 'Características', icon: '⚙️' },
              { id: 'images', label: 'Imágenes', icon: '🖼️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-b from-brand/20 to-brand/5 text-brand border-b-2 border-brand' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
            {/* TAB: General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Categoría (TPVs, Pantallas...) <span className="text-red-400">*</span>
                      {categoryLocked && (
                        <span className="ml-2 text-xs text-brand">🔒 Bloqueada</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      disabled={categoryLocked}
                      className={`w-full border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                               placeholder:text-gray-500
                               ${categoryLocked 
                                 ? 'bg-gray-800/30 cursor-not-allowed opacity-70' 
                                 : 'bg-gray-800/50'
                               }`}
                      placeholder="ej: TPVs, Pantallas"
                      required
                    />
                    {categoryLocked && (
                      <p className="text-xs text-gray-500 mt-1">
                        Los productos se crearán en la categoría seleccionada
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Modelo del Producto <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.model}
                      onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                               placeholder:text-gray-500"
                      placeholder="ej: TPV-18, Samsung 55 UHD"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    SKU / Código Interno <span className="text-gray-500 text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 text-white p-3 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                             placeholder:text-gray-500"
                    placeholder="ej: TPV18-001, MITPV18"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código único para identificar esta variante específica
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Stock <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock_qty}
                      onChange={(e) => setProductForm({ ...productForm, stock_qty: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-800/50 border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                               tabular-nums"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Precio (sin IVA) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.price_net}
                        onChange={(e) => setProductForm({ ...productForm, price_net: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-gray-800/50 border border-gray-700 text-white p-3 pr-8 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                                 tabular-nums"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      IVA (%) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={productForm.tax_rate}
                      onChange={(e) => setProductForm({ ...productForm, tax_rate: parseFloat(e.target.value) || 21 })}
                      className="w-full bg-gray-800/50 border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
                               tabular-nums"
                      required
                    />
                  </div>
                </div>

                {productForm.price_net > 0 && (
                  <div className="bg-gradient-to-r from-brand/10 to-purple-500/10 border border-brand/30 
                                rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-400">Precio final con IVA</p>
                      <p className="text-xl font-bold text-white tabular-nums">
                        {formatPrice(productForm.price_net, productForm.tax_rate)} €
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Características */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-brand mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Añadir Nueva Característica
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={newFeatureKey}
                      onChange={(e) => setNewFeatureKey(e.target.value)}
                      placeholder="Nombre (ej: Tamaño Pantalla)"
                      className="bg-gray-900/50 border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 placeholder:text-gray-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    />
                    <input
                      type="text"
                      value={newFeatureValue}
                      onChange={(e) => setNewFeatureValue(e.target.value)}
                      placeholder="Valor (ej: 55 pulgadas)"
                      className="bg-gray-900/50 border border-gray-700 text-white p-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-brand/50 placeholder:text-gray-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleAddFeature()}
                    className="w-full bg-brand/20 hover:bg-brand/30 text-brand border border-brand/50 
                             px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-brand/20"
                  >
                    + Añadir Característica
                  </button>
                </div>

                {/* Características Rápidas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Características Comunes (clic rápido)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_FEATURES.map(feature => (
                      <button
                        key={feature.key}
                        type="button"
                        onClick={() => {
                          setNewFeatureKey(feature.key)
                          setNewFeatureValue('')
                        }}
                        className="text-left bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 
                                 hover:border-brand/50 px-3 py-2 rounded-lg text-sm text-gray-300 
                                 hover:text-brand transition-all"
                      >
                        {feature.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de características actuales */}
                {Object.keys(productForm.features).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">
                      Características Añadidas ({Object.keys(productForm.features).length})
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(productForm.features).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 
                                   rounded-lg p-3 group hover:border-brand/30 transition-colors"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre</span>
                              <p className="text-white font-medium">{key}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Valor</span>
                              <p className="text-gray-300">{value || <span className="text-gray-600 italic">Sin valor</span>}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(key)}
                            className="ml-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 
                                     transition-opacity p-2 hover:bg-red-500/10 rounded"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Imágenes */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-700 hover:border-brand/50 rounded-lg p-8 
                              text-center transition-colors bg-gray-800/20">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p className="text-white font-medium mb-1">
                      {uploadingImage ? 'Subiendo...' : 'Haz clic para subir imágenes'}
                    </p>
                    <p className="text-sm text-gray-400">
                      PNG, JPG, WEBP hasta 10MB
                    </p>
                  </label>
                </div>

                {/* Galería de imágenes */}
                {productForm.images && productForm.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">
                      Imágenes ({productForm.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productForm.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url}
                            alt={img.name || `Imagen ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white 
                                     p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all
                                     shadow-lg"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                          {img.name && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{img.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-700/50 bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg 
                       font-medium transition-all border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-brand to-cyan-500 hover:from-brand/90 hover:to-cyan-500/90 
                       text-white px-6 py-3 rounded-lg font-medium transition-all 
                       shadow-lg shadow-brand/30 hover:shadow-brand/50"
            >
              {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
