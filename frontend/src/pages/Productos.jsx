import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import toast from 'react-hot-toast'
import CustomSkeleton from '../components/CustomSkeleton'
import NeoGradientButton from '../components/NeoGradientButton'
import ProductCard from '../components/ProductCard'
import { MOTION } from '../styles/motion'

// Página de gestión de productos e inventario
export default function Productos() {
  const { token } = useStore()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [products, setProducts] = useState([])
  const [variantStockMap, setVariantStockMap] = useState({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [productForm, setProductForm] = useState({
    category: '',
    model: '',
    sku: '',
    stock_qty: 0,
    price_net: 0,
    tax_rate: 21.0,
    features: {}
  })
  const [forceHoverBtn, setForceHoverBtn] = useState(true)
  const hoverTimeoutRef = useRef(null)

  // Default categories and images mapping
  const DEFAULT_CATEGORIES = useMemo(() => ([
    { category: 'Pantallas', total: 0, models: [] },
    { category: 'TPVs', total: 0, models: [] },
  ]), [])
  const CATEGORY_IMAGES = useMemo(() => ({
    pantallas: { src: '/PantallasLogo.jpg', alt: 'Pantallas' },
    tpvs: { src: '/TPV-15-con-logo.png', alt: 'TPVs' },
    tpv: { src: '/TPV-15-con-logo.png', alt: 'TPV' },
  }), [])
  const imageForCategory = useCallback((name) => {
    if (!name) return null
    const key = String(name).trim().toLowerCase()
    return CATEGORY_IMAGES[key] || null
  }, [CATEGORY_IMAGES])



  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet('/products/summary', token)
      const incoming = Array.isArray(data?.categories) ? data.categories : []
      // Ensure default categories exist (Pantallas, TPVs)
      const hasCat = (arr, name) => arr.some(c => String(c.category || '').toLowerCase() === String(name).toLowerCase())
      const merged = [...incoming]
      DEFAULT_CATEGORIES.forEach(def => {
        if (!hasCat(merged, def.category)) {
          // Add missing default category at the beginning to highlight it
          merged.unshift({ ...def })
        }
      })
      setCategories(merged)
    } catch (error) {
      toast.error('Error al cargar categorías: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [token, DEFAULT_CATEGORIES])

  const loadProductsByModel = async (category, model) => {
    try {
      const data = await apiGet(`/products?category=${encodeURIComponent(category)}&model=${encodeURIComponent(model)}&limit=50`, token)
      setProducts(data.items || [])
      setSelectedCategory(category)
      setSelectedModel(model)
      setShowCategoryModal(true)
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
        const res = await apiGet(`/products?category=${encodeURIComponent(cat.category)}&limit=1000`, token)
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
  }, [categories, token])

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
    setProductForm({
      category: selectedCategory || '',
      model: selectedModel || '',
      sku: '',
      stock_qty: 0,
      price_net: 0,
      tax_rate: 21.0,
      features: {}
    })
    setShowProductModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      category: product.category,
      model: product.model,
      sku: product.sku || '',
      stock_qty: product.stock_qty,
      price_net: product.price_net,
      tax_rate: product.tax_rate,
      features: product.features || {}
    })
    setShowProductModal(true)
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    try {
      // Coerce numeric fields to proper types to avoid backend errors
      const payload = {
        ...productForm,
        stock_qty: Number(productForm.stock_qty) || 0,
        price_net: Number(productForm.price_net) || 0,
        tax_rate: Number(productForm.tax_rate) || 0,
      }
  // debug logging removed
      if (editingProduct) {
        await apiPut(`/products/${editingProduct.id}`, payload, token)
        toast.success('Producto actualizado')
      } else {
        await apiPost('/products', payload, token)
        toast.success('Producto creado')
      }
      setShowProductModal(false)
      if (selectedCategory && selectedModel) {
        loadProductsByModel(selectedCategory, selectedModel)
      }
      loadCategories()
    } catch (error) {
  // errors will be surfaced to user via toast; no console logging
  const userMsg = error && error.message ? error.message : 'Error desconocido'
  const status = error && error.status ? ` (status ${error.status})` : ''
  toast.error('Error: ' + userMsg + status)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await apiDelete(`/products/${productId}`, token)
      toast.success('Producto eliminado')
      if (selectedCategory && selectedModel) {
        loadProductsByModel(selectedCategory, selectedModel)
      }
      loadCategories()
    } catch (error) {
      toast.error('Error al eliminar: ' + error.message)
    }
  }

  const formatPrice = (price, taxRate) => {
    const gross = price * (1 + taxRate / 100)
    return gross.toFixed(2)
  }

  const filteredCategories = categories.filter(cat => 
    cat.category.toLowerCase().includes(search.toLowerCase()) ||
    cat.models.some(m => m.model.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Productos</h2>
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
              className="contents"
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
                <ProductCard className="group h-full">
                {/* Category image banner (if defined) */}
                {(() => {
                  const img = imageForCategory(categoryData.category)
                  if (!img) return null
                  return (
                    <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-700/60">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-40 object-cover select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        draggable={false}
                      />
                      {/* Top vignette */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_60%)]" />
                      {/* Bottom gradient for contrast, similar to the reference */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                    </div>
                  )
                })()}

                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-brand capitalize mb-2">
                    {categoryData.category}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Total: {categoryData.total} productos
                  </p>
                </div>
                
                <div className="space-y-3">
                  {categoryData.models.slice(0, 3).map((modelData) => {
                    // Prefer aggregated stock fields if available, otherwise fall back to count
                    const stockVal = typeof modelData.stock_total !== 'undefined'
                      ? Number(modelData.stock_total)
                      : (typeof modelData.stock_qty !== 'undefined' ? Number(modelData.stock_qty) : (typeof modelData.stock !== 'undefined' ? Number(modelData.stock) : (typeof modelData.count !== 'undefined' ? Number(modelData.count) : 0)))
                    const displayFromModel = Number.isFinite(stockVal) ? stockVal : (modelData.count || 0)
                    // try variant override
                    const variantKey = `${modelData.model}::${inferVariant(modelData)}`
                    const override = typeof variantStockMap[variantKey] !== 'undefined' ? variantStockMap[variantKey] : null
                    const display = override !== null ? override : displayFromModel
                    return (
                      <div
                        key={modelData.model}
                        onClick={() => loadProductsByModel(categoryData.category, modelData.model)}
                        className="niox-model-row flex items-center justify-between p-3 cursor-pointer"
                      >
                        <span className="font-medium">{modelData.model}</span>
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
                  
                  {categoryData.models.length > 3 && (
                    <div className="text-center">
                      <button 
                        onClick={() => {
                          // Mostrar todos los modelos de esta categoría
                          setSelectedCategory(categoryData.category)
                          setSelectedModel(null)
                          setProducts([])
                          setShowCategoryModal(true)
                        }}
                        className="text-brand text-sm hover:underline"
                      >
                        Ver todos los modelos ({categoryData.models.length})
                      </button>
                    </div>
                  )}
                </div>
                </ProductCard>
              </motion.div>
            ))}
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Modal para mostrar productos de una categoría/modelo */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">
                {selectedModel ? `${selectedCategory} - ${selectedModel}` : selectedCategory}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProduct}
                  className="bg-brand text-white px-3 py-1 rounded text-sm hover:opacity-90"
                >
                  Añadir
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {selectedModel ? (
                // Mostrar productos del modelo específico
                products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">SKU</th>
                          <th className="text-right p-2">Precio (con IVA)</th>
                          <th className="text-right p-2">Stock</th>
                          <th className="text-center p-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2">{product.sku || '-'}</td>
                            <td className="p-2 text-right tabular-nums">
                              {formatPrice(product.price_net, product.tax_rate)} €
                            </td>
                            <td className="p-2 text-right tabular-nums">{product.stock_qty}</td>
                            <td className="p-2 text-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay productos para este modelo
                  </div>
                )
              ) : (
                // Mostrar todos los modelos de la categoría
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.find(c => c.category === selectedCategory)?.models.map((modelData) => {
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
                        onClick={() => loadProductsByModel(selectedCategory, modelData.model)}
                        className="niox-model-row flex items-center justify-between p-3 cursor-pointer"
                      >
                        <span className="font-medium">{modelData.model}</span>
                        {(() => {
                          const bg = display <= 2 ? '#FF512E' : (display <= 5 ? '#FFF58A' : null)
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
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">SKU (opcional)</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, stock_qty: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">IVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={productForm.tax_rate}
                    onChange={(e) => setProductForm({ ...productForm, tax_rate: parseFloat(e.target.value) || 21 })}
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Precio (sin IVA)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price_net}
                  onChange={(e) => setProductForm({ ...productForm, price_net: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
                {productForm.price_net > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Precio con IVA: {formatPrice(productForm.price_net, productForm.tax_rate)} €
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand text-white px-4 py-2 rounded hover:opacity-90"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
