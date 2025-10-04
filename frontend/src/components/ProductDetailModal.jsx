import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useStore } from '../store/store'

/**
 * ProductDetailModal
 * Modal moderno para visualizar y editar detalles completos de un producto
 * Incluye: Información general, Características (editables), Galería de imágenes (editable) y menú de acciones
 */
const ProductDetailModal = ({ isOpen, onClose, product, onSave, onEdit, onArchive, onDelete }) => {
  const { token } = useStore()
  const [activeTab, setActiveTab] = useState('general')
  const [editedProduct, setEditedProduct] = useState(null)
  const [newFeatureKey, setNewFeatureKey] = useState('')
  const [newFeatureValue, setNewFeatureValue] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null) // Para el lightbox de imágenes

  // Inicializar producto editado cuando se abre el modal
  useEffect(() => {
    if (product) {
      setEditedProduct({
        ...product,
        features: product.features || {},
        images: product.images || []
      })
      setHasChanges(false)
    }
  }, [product])

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedImage])

  if (!isOpen || !product || !editedProduct) return null

  const tabs = [
    { id: 'general', label: 'General', icon: '📋' },
    { id: 'features', label: 'Características', icon: '⚙️' },
    { id: 'images', label: 'Imágenes', icon: '🖼️' }
  ]

  // Calcular precio con IVA
  const priceWithTax = product.price_net * (1 + product.tax_rate / 100)

  // Funciones para manejar características
  const handleAddFeature = () => {
    if (!newFeatureKey.trim() || !newFeatureValue.trim()) {
      toast.error('Completa ambos campos')
      return
    }
    
    setEditedProduct(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [newFeatureKey.trim()]: newFeatureValue.trim()
      }
    }))
    setNewFeatureKey('')
    setNewFeatureValue('')
    setHasChanges(true)
    toast.success('Característica agregada')
  }

  const handleRemoveFeature = (key) => {
    const newFeatures = { ...editedProduct.features }
    delete newFeatures[key]
    setEditedProduct(prev => ({
      ...prev,
      features: newFeatures
    }))
    setHasChanges(true)
    toast.success('Característica eliminada')
  }

  // Funciones para manejar imágenes
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImages(true)
    
    try {
      // Obtener la URL base de la API
      const apiBase = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:5001`).replace(/\/$/, '')
      
      console.log('🔵 Iniciando subida de imágenes...', { fileCount: files.length, productId: product.id, apiBase })
      
      // Subir cada imagen al servidor
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('product_id', product.id)
        
        console.log('🔵 Subiendo archivo:', file.name)
        
        // Usar fetch directamente como en la página de Clientes
        const res = await fetch(`${apiBase}/api/products/upload-image`, {
          method: 'POST',
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          credentials: 'include',
          body: formData,
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('❌ Error en respuesta:', errorData)
          throw new Error(errorData.error || res.statusText)
        }
        
        const result = await res.json()
        console.log('✅ Imagen subida correctamente:', result)
        return result // Debería retornar { url, alt }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      
      console.log('✅ Todas las imágenes subidas:', uploadedImages)
      
      // Actualizar el producto editado con las nuevas imágenes
      setEditedProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages]
      }))
      
      setHasChanges(true)
      toast.success(`${files.length} imagen(es) subida(s) correctamente`)
    } catch (error) {
      console.error('❌ Error al subir imágenes:', error)
      toast.error('Error al subir imágenes: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploadingImages(false)
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    setEditedProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
    toast.success('Imagen eliminada')
  }

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No hay cambios para guardar')
      return
    }

    try {
      // Llamar a la función onSave pasada por el padre
      if (onSave) {
        await onSave(editedProduct)
        toast.success('Producto actualizado correctamente')
        setHasChanges(false)
        onClose()
      }
    } catch (error) {
      toast.error('Error al guardar cambios')
      console.error(error)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('¿Descartar cambios sin guardar?')) {
        onClose()
        setHasChanges(false)
      }
    } else {
      onClose()
    }
  }

  const handleEditProduct = () => {
    if (hasChanges) {
      toast.error('Guarda los cambios antes de editar el producto')
      return
    }
    setShowActionsMenu(false)
    if (onEdit) {
      onEdit(product)
    }
  }

  const handleArchiveProduct = async () => {
    if (hasChanges) {
      toast.error('Guarda los cambios antes de archivar')
      return
    }
    setShowActionsMenu(false)
    if (window.confirm(`¿${product.is_active ? 'Archivar' : 'Restaurar'} este producto?`)) {
      if (onArchive) {
        try {
          await onArchive(product)
          toast.success(product.is_active ? 'Producto archivado' : 'Producto restaurado')
          onClose()
        } catch {
          toast.error('Error al cambiar estado')
        }
      }
    }
  }

  const handleDeleteProduct = async () => {
    if (hasChanges) {
      toast.error('Guarda los cambios antes de eliminar')
      return
    }
    setShowActionsMenu(false)
    if (window.confirm('⚠️ ¿ELIMINAR este producto permanentemente? Esta acción no se puede deshacer.')) {
      if (onDelete) {
        try {
          await onDelete(product.id)
          toast.success('Producto eliminado')
          onClose()
        } catch {
          toast.error('Error al eliminar')
        }
      }
    }
  }

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop oscuro con blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl 
                       bg-gradient-to-br from-[#0C1219] via-[#0F1621] to-[#0A0F1A]
                       border border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="relative px-6 py-5 border-b border-gray-700/50 
                          bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    SKU: <span className="text-cyan-400 font-mono">{product.sku || 'N/A'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Botón Guardar (solo si hay cambios) */}
                  {hasChanges && (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg 
                               font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar
                    </button>
                  )}
                  
                  {/* Menú de Acciones (desplegable) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-500/50 
                               hover:bg-white/5 transition-all flex items-center gap-2 text-gray-300 
                               hover:text-white group"
                    >
                      Acciones
                      <svg className="w-4 h-4 transition-transform group-hover:scale-110" 
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showActionsMenu && (
                        <>
                          {/* Overlay para cerrar al hacer clic fuera */}
                          <div 
                            className="fixed inset-0 z-[9998]" 
                            onClick={() => setShowActionsMenu(false)}
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl 
                                     bg-[#0F1621] border border-gray-700/50 shadow-2xl z-[9999]
                                     backdrop-blur-sm"
                          >
                            {/* Editar */}
                            <button
                              onClick={handleEditProduct}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 
                                       hover:bg-blue-500/10 hover:text-blue-400 transition-colors
                                       flex items-center gap-3 group"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar Producto
                            </button>

                            {/* Archivar/Restaurar */}
                            <button
                              onClick={handleArchiveProduct}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors
                                       flex items-center gap-3 group
                                       ${product.is_active 
                                         ? 'text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400' 
                                         : 'text-gray-300 hover:bg-green-500/10 hover:text-green-400'}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d={product.is_active 
                                        ? "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                        : "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"} />
                              </svg>
                              {product.is_active ? 'Archivar' : 'Restaurar'}
                            </button>

                            {/* Divisor */}
                            <div className="h-px bg-gray-700/50 my-2" />

                            {/* Eliminar */}
                            <button
                              onClick={handleDeleteProduct}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 
                                       hover:bg-red-500/10 hover:text-red-400 transition-colors
                                       flex items-center gap-3 group"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Botón Cerrar */}
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                              ${activeTab === tab.id 
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* TAB: GENERAL */}
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Grid de información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Categoría */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                                    border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <p className="text-xs text-gray-400 mb-1">Categoría</p>
                        <p className="text-lg font-semibold text-white">{product.category || 'Sin categoría'}</p>
                      </div>

                      {/* Modelo */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                                    border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <p className="text-xs text-gray-400 mb-1">Modelo</p>
                        <p className="text-lg font-semibold text-white">{product.model || 'N/A'}</p>
                      </div>

                      {/* Precio Neto */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 
                                    border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                        <p className="text-xs text-cyan-400 mb-1">Precio Neto</p>
                        <p className="text-2xl font-bold text-white">
                          {product.price_net?.toFixed(2)} €
                        </p>
                      </div>

                      {/* Precio con IVA */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 
                                    border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                        <p className="text-xs text-emerald-400 mb-1">
                          Precio con IVA ({product.tax_rate}%)
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {priceWithTax.toFixed(2)} €
                        </p>
                      </div>

                      {/* Stock */}
                      <div className={`p-4 rounded-xl border transition-colors
                                     ${product.stock_qty <= 2 
                                       ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30 hover:border-red-500/50' 
                                       : product.stock_qty <= 5
                                       ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                                       : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-gray-700/50 hover:border-gray-600/50'}`}>
                        <p className={`text-xs mb-1 ${product.stock_qty <= 2 ? 'text-red-400' : product.stock_qty <= 5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                          Stock Disponible
                        </p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                          {product.stock_qty}
                          {product.stock_qty <= 2 && (
                            <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full animate-pulse">
                              ¡Bajo!
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Estado */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                                    border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                        <p className="text-xs text-gray-400 mb-1">Estado</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <p className="text-lg font-semibold text-white">
                            {product.is_active ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    {product.description && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                                    border border-gray-700/50">
                        <p className="text-xs text-gray-400 mb-2">Descripción</p>
                        <p className="text-gray-300 leading-relaxed">{product.description}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB: CARACTERÍSTICAS */}
                {activeTab === 'features' && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Formulario para agregar características */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 
                                  border border-cyan-500/30">
                      <h3 className="text-sm font-semibold text-cyan-400 mb-3">
                        ➕ Agregar Nueva Característica
                      </h3>
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Nombre (ej: RAM, Procesador...)"
                          value={newFeatureKey}
                          onChange={(e) => setNewFeatureKey(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white/5 border border-gray-600 rounded-lg
                                   text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500
                                   transition-colors"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newFeatureValue) {
                              handleAddFeature()
                            }
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Valor (ej: 8GB DDR4...)"
                          value={newFeatureValue}
                          onChange={(e) => setNewFeatureValue(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white/5 border border-gray-600 rounded-lg
                                   text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500
                                   transition-colors"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newFeatureKey) {
                              handleAddFeature()
                            }
                          }}
                        />
                        <button
                          onClick={handleAddFeature}
                          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg
                                   font-medium transition-colors whitespace-nowrap"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    {/* Lista de características */}
                    {editedProduct.features && Object.keys(editedProduct.features).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(editedProduct.features).map(([key, value]) => (
                          <div 
                            key={key}
                            className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                                     border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200
                                     group relative"
                          >
                            <button
                              onClick={() => handleRemoveFeature(key)}
                              className="absolute top-2 right-2 p-1 rounded-md bg-red-500/10 
                                       hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100
                                       transition-all duration-200"
                              title="Eliminar característica"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <p className="text-xs text-gray-400 mb-1 group-hover:text-cyan-400 transition-colors pr-8">
                              {key}
                            </p>
                            <p className="text-base font-medium text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-400">No hay características registradas</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Agrega características usando el formulario arriba
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB: IMÁGENES */}
                {activeTab === 'images' && (
                  <motion.div
                    key="images"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Botón para subir imágenes */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 
                                  border border-cyan-500/30">
                      <label className={`flex flex-col items-center justify-center ${uploadingImages ? 'cursor-wait opacity-70' : 'cursor-pointer'} group`}>
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-colors
                                      ${uploadingImages 
                                        ? 'bg-gray-500 cursor-wait' 
                                        : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}>
                          {uploadingImages ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M12 4v16m8-8H4" />
                              </svg>
                              Subir Imágenes
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImages}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Selecciona una o varias imágenes (PNG, JPG, WEBP...)
                        </p>
                      </label>
                    </div>

                    {/* Galería de imágenes */}
                    {editedProduct.images && editedProduct.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {editedProduct.images.map((image, idx) => {
                          // Obtener apiBase para las imágenes
                          const apiBase = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:5001`).replace(/\/$/, '')
                          const imageUrl = image.url || image
                          // Si la URL es relativa, agregar el apiBase
                          const fullImageUrl = imageUrl.startsWith('/') ? `${apiBase}${imageUrl}` : imageUrl
                          
                          return (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-xl overflow-hidden 
                                     border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-200
                                     bg-gradient-to-br from-white/5 to-white/[0.02] cursor-pointer"
                            onClick={() => setSelectedImage(fullImageUrl)}
                          >
                            <img
                              src={fullImageUrl}
                              alt={image.alt || `Imagen ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                console.error('❌ Error cargando imagen:', fullImageUrl)
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                                          opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation() // Evitar que abra el lightbox
                                  handleRemoveImage(idx)
                                }}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg
                                         font-medium transition-colors flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🖼️</div>
                        <p className="text-gray-400">No hay imágenes adicionales</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Usa el botón de arriba para subir imágenes
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Lightbox para ver imágenes en tamaño completo - Renderizado con Portal para estar por encima de todo */}
    {selectedImage && createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 overflow-auto"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-cyan-400 transition-colors
                         bg-gray-900/50 hover:bg-gray-900/80 rounded-full p-2"
              title="Cerrar (Esc)"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen - max-w y max-h para que se ajuste a la pantalla */}
            <img
              src={selectedImage}
              alt="Vista completa"
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )}
    </>
  )
}

export default ProductDetailModal
