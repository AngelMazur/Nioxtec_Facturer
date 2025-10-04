import React from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const CreateInvoiceModal = ({ isOpen, onClose, onSubmit, form, setForm, clients, products = [], mode = 'create', onDelete }) => {
  const [searchTerms, setSearchTerms] = React.useState({})
  const dialogRef = React.useRef(null)
  const lastActiveRef = React.useRef(null)
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Keep searchTerms in sync when items are removed/added
  React.useEffect(() => {
    const keys = Object.keys(searchTerms).map(k => Number(k))
    const maxIndex = form.items.length - 1
    const next = { ...searchTerms }
    for (const k of keys) {
      if (k > maxIndex) delete next[k]
    }
    if (Object.keys(next).length !== Object.keys(searchTerms).length) setSearchTerms(next)
  }, [form.items.length, searchTerms])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  // Focus trap + Escape key + restore focus
  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => { onCloseRef.current = onClose }, [onClose])
  React.useEffect(() => {
    if (!isOpen) return
    lastActiveRef.current = document.activeElement
    const dialogEl = dialogRef.current
    if (!dialogEl) return
    const selectors = ['a[href]','button:not([disabled])','textarea:not([disabled])','input:not([disabled])','select:not([disabled])','[tabindex]:not([tabindex="-1"])']
    const q = () => Array.from(dialogEl.querySelectorAll(selectors.join(',')))
    const focusFirst = () => { const f = q(); if (f.length) f[0].focus() }
    focusFirst()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current?.(); return }
      if (e.key === 'Tab') {
        const f = q(); if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (lastActiveRef.current?.focus) lastActiveRef.current.focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onCloseRef.current?.()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-invoice-title"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 id="create-invoice-title" className="text-xl font-semibold text-white">{mode === 'edit' ? 'Editar Documento' : 'Crear Nueva Factura'}</h3>
              <button
                onClick={() => onCloseRef.current?.()}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario original */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Número</span>
                    <input
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                      name="number"
                      value={form.number}
                      readOnly
                      required
                    />
                  </label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Fecha</span>
                    <input
                      type="date"
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Tipo</span>
                    <select
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="factura">Factura</option>
                      <option value="proforma">Proforma</option>
                    </select>
                  </label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Cliente</span>
                    <select
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                      name="client_id"
                      value={form.client_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </label>
                </motion.div>

                {form.type === 'factura' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Método de pago</span>
                      <select
                        className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                        name="payment_method"
                        value={form.payment_method}
                        onChange={handleChange}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                      </select>
                    </label>
                  </motion.div>
                )}
              </div>

              {/* Items section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h4 className="font-semibold text-white">Líneas de {form.type === 'proforma' ? 'proforma' : 'factura'}</h4>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Producto</span>
                        <select
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                          value={item.product_id || ''}
                          onChange={(e) => {
                            const pid = e.target.value ? Number(e.target.value) : ''
                            const newItems = [...form.items]
                            newItems[index].product_id = pid
                            if (pid) {
                              const prod = (products || []).find(p => p.id === pid)
                              if (prod) {
                                const gross = (prod.price_net || 0) * (1 + (prod.tax_rate || 0) / 100)
                                newItems[index].description = prod.model ? `${prod.model}${prod.sku ? ' - ' + prod.sku : ''}` : (prod.sku || '')
                                newItems[index].unit_price = Number(gross.toFixed(2))
                                newItems[index].tax_rate = prod.tax_rate || 21
                                const stock = Number(prod.stock_qty || 0)
                                if (stock <= 5) {
                                  toast(stock <= 0 ? 'Producto sin stock' : `Stock bajo (${stock}) — considerar reponer`)
                                }
                              }
                            }
                            setForm(prev => ({ ...prev, items: newItems }))
                          }}
                        >
                          <option value="">Seleccionar producto (opcional)</option>
                          {Array.isArray(products) ? (
                            products.map(prod => (
                              <option key={prod.id} value={prod.id} disabled={Number(prod.stock_qty || 0) <= 0}>
                                {prod.model ? `${prod.model}${prod.sku ? ' - ' + prod.sku : ''}` : (prod.sku || prod.id)}{typeof prod.stock_qty !== 'undefined' ? ` — stock: ${prod.stock_qty}` : ''}
                              </option>
                            ))
                          ) : (
                            (console && console.warn && console.warn('CreateInvoiceModal: products is not an array', products), null)
                          )}
                        </select>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-sm text-gray-500">Descripción</span>
                          <textarea
                            rows={3}
                            className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand resize-y"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...form.items]
                              newItems[index].description = e.target.value
                              setForm(prev => ({ ...prev, items: newItems }))
                            }}
                            required
                          />
                        </div>
                        {/* badge removed from here; it will be shown next to 'Unidades' to avoid duplicate visual elements */}
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Unidades</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                            value={item.units}
                            onChange={(e) => {
                              const newItems = [...form.items]
                              newItems[index].units = e.target.value
                              setForm(prev => ({ ...prev, items: newItems }))
                            }}
                            required
                          />
                          {/* stock badge removed from modal per request; Productos.jsx tendrá el badge */}
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Precio unitario (€)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                          value={item.unit_price}
                          onChange={(e) => {
                            const newItems = [...form.items]
                            newItems[index].unit_price = e.target.value
                            setForm(prev => ({ ...prev, items: newItems }))
                          }}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">IVA (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                          value={item.tax_rate}
                          onChange={(e) => {
                            const newItems = [...form.items]
                            newItems[index].tax_rate = e.target.value
                            setForm(prev => ({ ...prev, items: newItems }))
                          }}
                          required
                        />
                      </label>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        items: [...prev.items, { description: '', units: '', unit_price: '', tax_rate: 21 }]
                      }))
                    }}
                    className="bg-secondary hover:opacity-90 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-brand focus:ring-opacity-50"
                  >
                    + Agregar línea
                  </button>
                  {form.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          items: prev.items.slice(0, -1)
                        }))
                      }}
                      className="bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      - Quitar línea
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 pt-4"
              >
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 active:scale-95 focus:scale-105 transition-all duration-200 text-white px-6 py-3 rounded-lg font-medium focus:ring-2 focus:ring-brand focus:ring-opacity-50"
                >
                  {mode === 'edit' ? 'Guardar cambios' : 'Crear Factura'}
                </button>
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-6 py-3 border border-red-600 text-red-400 hover:text-white hover:bg-red-600/20 active:scale-95 transition-all duration-200 rounded-lg font-medium"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onCloseRef.current?.()}
                  className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 active:scale-95 transition-all duration-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CreateInvoiceModal
