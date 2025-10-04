import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import toast from 'react-hot-toast'
import CustomSkeleton from '../components/CustomSkeleton'
import NeoGradientButton from '../components/NeoGradientButton'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import ProductDetailModal from '../components/ProductDetailModal'
import { MOTION } from '../styles/motion'

// Página de gestión de productos e inventario
export default function Productos() {
  const { token } = useStore()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('activos') // 'activos' | 'archivados'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [products, setProducts] = useState([])
  const [variantStockMap, setVariantStockMap] = useState({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [forceHoverBtn, setForceHoverBtn] = useState(true)
  const hoverTimeoutRef = useRef(null)
  
  // Estados para dropdowns del hero
  const [openDropdown, setOpenDropdown] = useState(null) // 'productos' | 'categorias' | 'stock' | null

  // Default categories and images mapping
  // Tarjetas por defecto con imágenes (Pantallas, TPVs)
  const DEFAULT_CATEGORIES = useMemo(() => ([
    { category: 'Pantallas', total: 0, models: [] },
    { category: 'TPVs', total: 0, models: [] },
  ]), [])
  const CATEGORY_IMAGES = useMemo(() => ({
    pantallas: { src: '/PantallasLogo.png', alt: 'Pantallas' },
    tpvs: { src: '/TPV-15-con-logo.png', alt: 'TPVs' },
  }), [])
  
  const CATEGORY_ICONS = useMemo(() => ({
    pantallas: (
      <svg className="w-10 h-10 text-brand/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    tpvs: (
      <svg className="w-10 h-10 text-brand/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M7 20h10M12 16v4" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    )
  }), [])
  
  const imageForCategory = useCallback((name) => {
    if (!name) return null
    const key = String(name).trim().toLowerCase()
    return CATEGORY_IMAGES[key] || null
  }, [CATEGORY_IMAGES])
  
  const iconForCategory = useCallback((name) => {
    if (!name) return null
    const key = String(name).trim().toLowerCase()
    return CATEGORY_ICONS[key] || null
  }, [CATEGORY_ICONS])



  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const activeParam = activeTab === 'archivados' ? '0' : '1'
      const data = await apiGet(`/products/summary?active=${activeParam}`, token)
      const incoming = Array.isArray(data?.categories) ? data.categories : []
      const existingLower = new Set(incoming.map(c => String(c.category).toLowerCase()))
      // Asegurar que categorías por defecto existen solo si backend no las provee
      const merged = [...incoming]
      DEFAULT_CATEGORIES.forEach(def => {
        if (!existingLower.has(def.category.toLowerCase())) {
          merged.unshift(def)
        }
      })
      setCategories(merged)
    } catch (error) {
      toast.error('Error al cargar categorías: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [token, DEFAULT_CATEGORIES, activeTab])

  const loadProductsByModel = async (category, model) => {
    try {
      const activeParam = activeTab === 'archivados' ? '0' : '1'
      const data = await apiGet(`/products?category=${encodeURIComponent(category)}&model=${encodeURIComponent(model)}&limit=50&active=${activeParam}`, token)
      const productsList = data.items || []
      setProducts(productsList)
      setSelectedCategory(category)
      setSelectedModel(model)
      
      // Si solo hay 1 producto, abrir ProductDetailModal directamente
      if (productsList.length === 1) {
        setViewingProduct(productsList[0])
        setShowDetailModal(true)
      } else if (productsList.length > 1) {
        // Si hay varios, mostrar modal con lista
        setShowProductsModal(true)
      } else {
        toast.info('No hay productos en este modelo')
      }
    } catch (error) {
      toast.error('Error al cargar productos: ' + error.message)
    }
  }

  // Helper: try to infer a variant/key (e.g. screen size like 55 or 65) from a product or model string
  const inferVariant = (obj) => {
    if (!obj) return 'default'
    // check features object for common keys (case-insensitive)
    const features = obj.features || {}
    const featureKeys = Object.keys(features || {})
    for (const k of featureKeys) {
      const lk = String(k).toLowerCase()
      if (['size', 'screen_size', 'screen', 'pulgadas', 'pulgada', 'inch', 'inches', 'tamaño', 'tamano'].includes(lk)) {
        const val = features[k]
  if (val !== undefined && val !== null) return String(val).replace(/\s+|"|inches|inch|pulgadas|pulgada/gi, '').trim()
      }
    }

    // If there is a top-level explicit size-like field
    for (const key of ['size', 'screen_size', 'pulgadas', 'stock_size', 'variant']) {
      if (obj[key]) return String(obj[key]).replace(/\s+|"/g, '').trim()
    }

    // SKU may include the size (e.g. "TV-55", "55IN-TX")
    if (obj.sku && typeof obj.sku === 'string') {
      const m = obj.sku.match(/(\d{2,3})(?=\D|$)/)
      if (m) return m[1]
    }

    // model string may contain the size (e.g. "Model X 55\"" or "Model-55" or "55in")
    if (obj.model && typeof obj.model === 'string') {
  const m = obj.model.match(/(?:^|\D)(\d{2,3})(?:"|inches|inch|in|pulgadas)?(?:\b|$)/i)
      if (m) return m[1]
    }

    // fallback
    return 'default'
  }

  // Load products for each category (once) to compute aggregate stock per model+variant.
  // This is a client-side fallback when backend does not provide aggregated per-variant stock.
  const loadVariantStocks = useCallback(async () => {
    if (!token || !Array.isArray(categories) || categories.length === 0) return
    const map = {}
  await Promise.all(categories.map(async (cat) => {
      try {
        // fetch products for category (no model filter) - increase limit if needed
    const activeParam = activeTab === 'archivados' ? '0' : '1'
    const res = await apiGet(`/products?category=${encodeURIComponent(cat.category)}&limit=1000&active=${activeParam}`, token)
        const items = res.items || []
  items.forEach(p => {
          const model = p.model || 'unknown'
          const variant = inferVariant(p)
          const key = `${model}::${variant}`
          const qty = Number(p.stock_qty || p.stock_total || p.stock || 0)
          map[key] = (map[key] || 0) + (Number.isFinite(qty) ? qty : 0)
        })
      } catch {
        // ignore per-category errors
      }
    }))
    setVariantStockMap(map)
  }, [categories, token, activeTab])

  // Recompute variant stocks whenever categories or token change
  useEffect(() => {
    if (token && categories.length > 0) {
      loadVariantStocks()
    }
  }, [token, categories, loadVariantStocks])

  useEffect(() => {
    if (token) loadCategories()
  }, [token, loadCategories])

  // Limpieza del timeout del botón
  useEffect(() => () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current) }, [])

  

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setSelectedCategory(null) // Limpiar categoría para permitir selección libre
    setSelectedModel(null)
    setShowProductModal(true)
  }

  // Crear producto directamente para una categoría (sin modelo aún)
  const handleCreateForCategory = (category) => {
    if (!category) return
    setSelectedCategory(category)
    setSelectedModel(null)
    setEditingProduct(null)
    setShowProductModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductModal(true)
    setShowDetailModal(false) // Cerrar modal de detalle si está abierto
  }

  const handleArchiveProduct = async (product) => {
    await apiPut(`/products/${product.id}`, { is_active: !product.is_active }, token)
    // Actualizar listas
    if (selectedCategory && selectedModel) {
      await loadProductsByModel(selectedCategory, selectedModel)
    }
    await loadCategories()
    return true
  }

  const handleDeleteProduct = async (productId) => {
    await apiDelete(`/products/${productId}`, token)
    // Actualizar listas
    if (selectedCategory && selectedModel) {
      await loadProductsByModel(selectedCategory, selectedModel)
    }
    await loadCategories()
    return true
  }

  const handleSubmitProduct = async (productForm, editingProd) => {
    try {
      // Coerce numeric fields to proper types to avoid backend errors
      const payload = {
        ...productForm,
        stock_qty: Number(productForm.stock_qty) || 0,
        price_net: Number(productForm.price_net) || 0,
        tax_rate: Number(productForm.tax_rate) || 0,
        // TODO: Manejar subida de imágenes al servidor
        images: productForm.images || []
      }
      
      if (editingProd) {
        await apiPut(`/products/${editingProd.id}`, payload, token)
        toast.success('Producto actualizado')
        // Refresh current model list if context present
        if (selectedCategory && selectedModel) {
          loadProductsByModel(selectedCategory, selectedModel)
        }
      } else {
        await apiPost('/products', payload, token)
        toast.success('Producto creado')
        // If we came from an empty category card (no selectedModel yet), show the new model list
        if (selectedCategory && !selectedModel && payload.model) {
          try {
            await loadProductsByModel(selectedCategory, payload.model)
          } catch {
            // If model doesn't exist yet, refresh categories
            loadCategories()
          }
        }
      }
      loadCategories()
      setShowProductModal(false)
      setEditingProduct(null)
      // No limpiar categoría/modelo aquí, se limpia en el onClose del modal
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar producto')
    }
  }

  // Guardar cambios desde el modal de detalle (características e imágenes)
  const handleSaveProductDetails = async (updatedProduct) => {
    try {
      const payload = {
        features: updatedProduct.features || {},
        images: updatedProduct.images || [],
        // Mantener otros campos sin cambios
        name: updatedProduct.name,
        category: updatedProduct.category,
        model: updatedProduct.model,
        sku: updatedProduct.sku,
        price_net: Number(updatedProduct.price_net),
        tax_rate: Number(updatedProduct.tax_rate),
        stock_qty: Number(updatedProduct.stock_qty),
        is_active: updatedProduct.is_active,
        description: updatedProduct.description
      }

      await apiPut(`/products/${updatedProduct.id}`, payload, token)
      
      // Actualizar la lista de productos si estamos en vista de modelo
      if (selectedCategory && selectedModel) {
        await loadProductsByModel(selectedCategory, selectedModel)
      }
      
      // Actualizar categorías para reflejar cambios
      await loadCategories()
      
      return true
    } catch (error) {
      console.error('Error al guardar detalles del producto:', error)
      throw error
    }
  }

  const filteredCategories = categories.filter(cat => 
    cat.category.toLowerCase().includes(search.toLowerCase()) ||
    cat.models.some(m => m.model.toLowerCase().includes(search.toLowerCase()))
  )

  // Estadísticas para Hero
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.total || 0), 0)
  const lowStockProducts = categories.reduce((sum, cat) => {
    return sum + (cat.models || []).filter(m => {
      const stockVal = typeof m.stock_total !== 'undefined' ? Number(m.stock_total) : 
                       (typeof m.stock_qty !== 'undefined' ? Number(m.stock_qty) : 0)
      return stockVal <= 2
    }).length
  }, 0)
  
  // Obtener modelos con stock bajo para el dropdown
  const lowStockModels = categories.flatMap(cat => 
    (cat.models || [])
      .filter(m => {
        const stockVal = typeof m.stock_total !== 'undefined' ? Number(m.stock_total) : 
                         (typeof m.stock_qty !== 'undefined' ? Number(m.stock_qty) : 0)
        return stockVal <= 2
      })
      .map(m => ({ ...m, category: cat.category }))
  )

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Productos</h2>
        
        {/* Hero con Estadísticas Interactivas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-4">
          {/* Card 1: Total Productos */}
          <div 
            className="niox-data-card bg-gradient-to-br from-gray-900/90 to-gray-800/70 
                      border border-gray-700/50 rounded-xl backdrop-blur-sm
                      hover:border-brand/50 hover:shadow-lg hover:shadow-brand/20 
                      transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => setOpenDropdown(openDropdown === 'productos' ? null : 'productos')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-brand tabular-nums">{totalProducts}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Productos</div>
                </div>
                <div className="bg-brand/10 p-3 rounded-lg hover:bg-brand/20 transition-colors">
                  <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-9M14 17H5M5 7h5l4 10 4-10h5" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Dropdown de Productos */}
            <AnimatePresence>
              {openDropdown === 'productos' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-700/50 overflow-hidden"
                >
                  <div className="p-4 bg-gray-800/30">
                    <div className="text-xs font-semibold text-brand mb-3 uppercase tracking-wide">Productos con Stock</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {categories.length > 0 ? (
                        categories.flatMap(cat => 
                          (cat.models || [])
                            .filter(m => {
                              const stockVal = typeof m.stock_total !== 'undefined' ? Number(m.stock_total) : 
                                               (typeof m.stock_qty !== 'undefined' ? Number(m.stock_qty) : 0)
                              return stockVal > 0
                            })
                            .map((model, idx) => {
                              const stockVal = typeof model.stock_total !== 'undefined' ? Number(model.stock_total) : 
                                               (typeof model.stock_qty !== 'undefined' ? Number(model.stock_qty) : 0)
                              return (
                                <div 
                                  key={`${cat.category}-${model.model}-${idx}`}
                                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="text-gray-300 text-sm font-medium">{model.model}</div>
                                    <div className="text-xs text-gray-500">{cat.category}</div>
                                  </div>
                                  <span className="text-brand font-bold tabular-nums text-sm ml-2">{stockVal}</span>
                                </div>
                              )
                            })
                        )
                      ) : (
                        <div className="py-2 text-gray-500 text-sm text-center">No hay productos con stock</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Card 2: Categorías */}
          <div 
            className="niox-data-card bg-gradient-to-br from-gray-900/90 to-gray-800/70 
                      border border-gray-700/50 rounded-xl backdrop-blur-sm
                      hover:border-brand/50 hover:shadow-lg hover:shadow-brand/20 
                      transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => setOpenDropdown(openDropdown === 'categorias' ? null : 'categorias')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-brand tabular-nums">{categories.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Categorías</div>
                </div>
                <div className="bg-brand/10 p-3 rounded-lg hover:bg-brand/20 transition-colors">
                  <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Dropdown de Categorías */}
            <AnimatePresence>
              {openDropdown === 'categorias' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-700/50 overflow-hidden"
                >
                  <div className="p-4 bg-gray-800/30">
                    <div className="text-xs font-semibold text-brand mb-3 uppercase tracking-wide">Categorías Disponibles</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {categories.length > 0 ? (
                        categories.map((cat, idx) => (
                          <div 
                            key={idx}
                            className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                          >
                            <span className="text-gray-300 text-sm font-medium">{cat.category}</span>
                            <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">{cat.models?.length || 0} modelos</span>
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-gray-500 text-sm text-center">No hay categorías</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Card 3: Stock Bajo */}
          <div 
            className="niox-data-card bg-gradient-to-br from-red-900/20 to-gray-800/70 
                      border border-red-700/50 rounded-xl backdrop-blur-sm
                      hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/20 
                      transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => setOpenDropdown(openDropdown === 'stock' ? null : 'stock')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-400 tabular-nums">{lowStockProducts}</div>
                  <div className="text-sm text-gray-400 mt-1">Stock Bajo (≤2)</div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg hover:bg-red-500/20 transition-colors">
                  <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Dropdown de Stock Bajo */}
            <AnimatePresence>
              {openDropdown === 'stock' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-red-700/30 overflow-hidden"
                >
                  <div className="p-4 bg-red-900/10">
                    <div className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wide">Modelos con Stock Bajo</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {lowStockModels.length > 0 ? (
                        lowStockModels.map((model, idx) => {
                          const stockVal = typeof model.stock_total !== 'undefined' ? Number(model.stock_total) : 
                                           (typeof model.stock_qty !== 'undefined' ? Number(model.stock_qty) : 0)
                          return (
                            <div 
                              key={idx}
                              className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="text-gray-300 text-sm font-medium">{model.model}</div>
                                <div className="text-xs text-gray-500">{model.category}</div>
                              </div>
                              <span className="text-red-400 font-bold tabular-nums text-sm px-2 py-1 bg-red-500/20 rounded ml-2">
                                {stockVal}
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-2 text-gray-500 text-sm text-center">No hay productos con stock bajo</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <NeoGradientButton
            onClick={handleCreateProduct}
            forceHover={forceHoverBtn}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            }
          >
            Crear Producto
          </NeoGradientButton>
        </div>
      </div>

      {/* Tabs Activos/Archivados */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm ${activeTab === 'activos' ? 'bg-brand text-white' : 'bg-transparent text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('activos')}
          >
            Activos
          </button>
          <button
            className={`px-4 py-2 text-sm ${activeTab === 'archivados' ? 'bg-brand text-white' : 'bg-transparent text-gray-300 hover:bg-gray-800'}`}
            onClick={() => setActiveTab('archivados')}
          >
            Archivados
          </button>
        </div>
      </div>

      {/* Búsqueda oculta para igualar layout con otras páginas */}
      <div className="hidden gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar categorías o modelos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Tarjetas de categorías */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Inventario por Categorías</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {[1,2,3].map(i => (
              <CustomSkeleton key={i} height={200} className="rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-fr"
            onAnimationStart={() => {
              const itemsCount = filteredCategories.length
              const staggerChildren = 0.08
              const delayChildren = 0.04
              const childDuration = MOTION?.duration?.base ?? 0.35
              const totalMs = Math.max(200, Math.round((delayChildren + Math.max(0, itemsCount - 1) * staggerChildren + childDuration) * 1000))
              try { window.dispatchEvent(new CustomEvent('route-stagger', { detail: { totalMs } })) } catch { /* noop */ }
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
              hoverTimeoutRef.current = setTimeout(() => setForceHoverBtn(false), totalMs)
            }}
          >
            {filteredCategories.map((categoryData) => (
              <motion.div
                key={categoryData.category}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              >
                {(() => {
                  const isEmpty = !categoryData.models || categoryData.models.length === 0
                  
                  return (
                    <ProductCard
                      className={`group h-full cursor-pointer ring-offset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60`}
                      onClick={() => handleCreateForCategory(categoryData.category)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCreateForCategory(categoryData.category) } }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Crear nuevo producto en ${categoryData.category}`}
                    >
                      
                      {(() => {
                        const img = imageForCategory(categoryData.category)
                        if (!img) return null
                        
                        return (
                          <div className="relative w-full mb-4 rounded-xl overflow-hidden border border-gray-700/60 
                                        aspect-[16/9] bg-gray-900">
                            {/* Imagen de fondo borrosa para rellenar laterales */}
                            <img
                              src={img.src}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
                              draggable={false}
                              aria-hidden="true"
                            />
                            
                            {/* Imagen principal nítida */}
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="relative w-full h-full object-contain object-center
                                       select-none pointer-events-none transition-all duration-500 
                                       group-hover:scale-105 group-hover:brightness-110 z-10"
                              draggable={false}
                            />
                            
                            {/* Overlay sutil para integrar mejor */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent 
                                          to-transparent pointer-events-none z-20" />
                          </div>
                        )
                      })()}
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {iconForCategory(categoryData.category)}
                          <div>
                            <h4 className="text-lg font-semibold text-brand capitalize mb-1">
                              {categoryData.category}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Total: {categoryData.total} productos
                            </p>
                          </div>
                        </div>
                      </div>
                      {isEmpty ? (
                        <div className="p-6 rounded-lg border border-dashed border-brand/40 
                                      text-center bg-gradient-to-br from-brand/5 to-transparent
                                      backdrop-blur-sm group-hover:border-brand/70 transition-colors">
                          <div className="text-4xl mb-3 opacity-60">📦</div>
                          <p className="text-sm text-gray-400 mb-2">No hay productos en esta categoría</p>
                          <p className="text-xs text-brand">Haz clic para crear el primer producto</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {categoryData.models.slice(0, 3).map((modelData) => {
                            const stockVal = typeof modelData.stock_total !== 'undefined'
                              ? Number(modelData.stock_total)
                              : (typeof modelData.stock_qty !== 'undefined' ? Number(modelData.stock_qty) : (typeof modelData.stock !== 'undefined' ? Number(modelData.stock) : (typeof modelData.count !== 'undefined' ? Number(modelData.count) : 0)))
                            const displayFromModel = Number.isFinite(stockVal) ? stockVal : (modelData.count || 0)
                            const variantKey = `${modelData.model}::${inferVariant(modelData)}`
                            const override = typeof variantStockMap[variantKey] !== 'undefined' ? variantStockMap[variantKey] : null
                            const display = override !== null ? override : displayFromModel
                            return (
                              <div
                                key={modelData.model}
                                onClick={async (e) => { 
                                  e.stopPropagation()
                                  await loadProductsByModel(categoryData.category, modelData.model)
                                }}
                                className="niox-model-row flex items-center justify-between p-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-medium">{modelData.model}</span>
                                  {display <= 2 && (
                                    <span className="px-2 py-0.5 text-[10px] bg-red-500/95 text-white rounded-full font-semibold animate-pulse flex items-center gap-1">
                                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 22h20L12 2zm0 6l6 12H6l6-12z" opacity="0.4"/>
                                        <path d="M11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/>
                                      </svg>
                                      Stock Bajo
                                    </span>
                                  )}
                                </div>
                                {(() => {
                                  const bg = display <= 2 ? '#FF512E' : (display <= 4 ? '#FFA500' : null)
                                  const style = bg ? { backgroundColor: bg } : undefined
                                  return (
                                    <span className="text-sm px-2 py-1 rounded bg-brand" style={style}>
                                      <span className={`tabular-nums text-white font-semibold`}>{display}</span>
                                    </span>
                                  )
                                })()}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </ProductCard>
                  )
                })()}
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false)
          setEditingProduct(null)
          // Limpiar contexto de categoría/modelo cuando se cierra sin guardar
          if (!editingProduct) {
            setSelectedCategory(null)
            setSelectedModel(null)
          }
        }}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        initialCategory={selectedCategory}
        initialModel={selectedModel}
      />

      {/* Modal para ver detalles del producto */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setViewingProduct(null)
        }}
        product={viewingProduct}
        onSave={handleSaveProductDetails}
        onEdit={handleEditProduct}
        onArchive={handleArchiveProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Modal para mostrar lista de productos del modelo seleccionado */}
      <AnimatePresence>
        {showProductsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowProductsModal(false)
              setSelectedModel(null)
              setProducts([])
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedModel}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedCategory} • {products.length} producto{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowProductsModal(false)
                    setSelectedModel(null)
                    setProducts([])
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body - Lista de productos */}
              <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(80vh - 88px)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      onClick={() => {
                        setViewingProduct(product)
                        setShowDetailModal(true)
                        setShowProductsModal(false)
                      }}
                      className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50
                               border border-gray-200 dark:border-gray-700 hover:border-brand dark:hover:border-brand 
                               transition-all duration-200 cursor-pointer group"
                    >
                      {/* Imagen del producto */}
                      {product.images && product.images.length > 0 ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-white dark:bg-gray-900">
                          <img
                            src={product.images[0].url}
                            alt={product.model}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-white dark:bg-gray-900 flex items-center justify-center">
                          <span className="text-4xl opacity-30">📦</span>
                        </div>
                      )}

                      {/* Info del producto */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">SKU</p>
                            <p className="text-sm font-mono text-brand font-semibold">
                              {product.sku || '-'}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {product.is_active ? 'Activo' : 'Archivado'}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
                            <p className={`text-lg font-bold ${
                              product.stock_qty <= 2 
                                ? 'text-red-500' 
                                : product.stock_qty <= 5 
                                  ? 'text-yellow-500' 
                                  : 'text-green-500'
                            }`}>
                              {product.stock_qty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Precio</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {product.price_base ? `€${product.price_base}` : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
