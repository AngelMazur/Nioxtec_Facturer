import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CreateInvoiceModal = ({ isOpen, onClose, onSubmit, form, setForm, clients }) => {
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Crear Nueva Factura</h3>
              <button
                onClick={onClose}
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
                <h4 className="font-semibold text-white">Líneas de factura</h4>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Descripción</span>
                        <input
                          type="text"
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...form.items]
                            newItems[index].description = e.target.value
                            setForm(prev => ({ ...prev, items: newItems }))
                          }}
                          required
                        />
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">Unidades</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                          value={item.units}
                          onChange={(e) => {
                            const newItems = [...form.items]
                            newItems[index].units = e.target.value
                            setForm(prev => ({ ...prev, items: newItems }))
                          }}
                          required
                        />
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
                  Crear Factura
                </button>
                <button
                  type="button"
                  onClick={onClose}
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
