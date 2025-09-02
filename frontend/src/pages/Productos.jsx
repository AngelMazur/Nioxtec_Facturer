import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import toast from 'react-hot-toast'
import CustomSkeleton from '../components/CustomSkeleton'
import NeoGradientButton from '../components/NeoGradientButton'

// Página de gestión de productos e inventario
export default function Productos() {
  const { token } = useStore()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [products, setProducts] = useState([])
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

  useEffect(() => {
    if (token) {
      loadCategories()
    }
  }, [token])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await apiGet('/products/summary', token)
      setCategories(data.categories || [])
    } catch (error) {
      toast.error('Error al cargar categorías: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

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
      if (editingProduct) {
        await apiPut(`/products/${editingProduct.id}`, productForm, token)
        toast.success('Producto actualizado')
      } else {
        await apiPost('/products', productForm, token)
        toast.success('Producto creado')
      }
      setShowProductModal(false)
      if (selectedCategory && selectedModel) {
        loadProductsByModel(selectedCategory, selectedModel)
      }
      loadCategories()
    } catch (error) {
      toast.error('Error: ' + error.message)
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Productos</h2>
        <NeoGradientButton
          onClick={handleCreateProduct}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          }
        >
          Crear Producto
        </NeoGradientButton>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2 items-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <CustomSkeleton key={i} height={200} className="rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCategories.map((categoryData) => (
              <motion.div
                key={categoryData.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-brand capitalize mb-2">
                    {categoryData.category}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Total: {categoryData.total} productos
                  </p>
                </div>
                
                <div className="space-y-3">
                  {categoryData.models.slice(0, 3).map((modelData) => (
                    <div
                      key={modelData.model}
                      onClick={() => loadProductsByModel(categoryData.category, modelData.model)}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium">{modelData.model}</span>
                      <span className="text-sm bg-brand text-white px-2 py-1 rounded">
                        {modelData.count}
                      </span>
                    </div>
                  ))}
                  
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
              </motion.div>
            ))}
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
                  {categories.find(c => c.category === selectedCategory)?.models.map((modelData) => (
                    <div
                      key={modelData.model}
                      onClick={() => loadProductsByModel(selectedCategory, modelData.model)}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium">{modelData.model}</span>
                      <span className="text-sm bg-brand text-white px-2 py-1 rounded">
                        {modelData.count}
                      </span>
                    </div>
                  ))}
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
