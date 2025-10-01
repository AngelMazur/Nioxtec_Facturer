import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExpenseAutocomplete from './ExpenseAutocomplete'

const CreateExpenseModal = ({ isOpen, onClose, onSubmit, form, setForm, onOpenCSV }) => {
  const dialogRef = React.useRef(null)
  const lastActiveRef = React.useRef(null)
  // Keep a stable reference to onClose to avoid re-running effects on each render
  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => { onCloseRef.current = onClose }, [onClose])
  // Debounced change handler to prevent rapid re-renders that can steal focus
  const changeTimeout = React.useRef(null)
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    const newVal = type === 'checkbox' ? checked : value
    if (changeTimeout.current) clearTimeout(changeTimeout.current)
    changeTimeout.current = setTimeout(() => {
      setForm(prev => ({ ...prev, [name]: newVal }))
    }, 0)
  }
  React.useEffect(() => () => { if (changeTimeout.current) clearTimeout(changeTimeout.current) }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  // Focus management and Escape key
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
          // Do not close on backdrop click to avoid accidental input blur/close while typing
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-expense-title"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 id="create-expense-title" className="text-xl font-semibold text-white">Crear Nuevo Gasto</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Fecha *</span>
                    <input
                      type="date"
                      required
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Categoría *</span>
                    <ExpenseAutocomplete
                      value={form.category}
                      onChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                      type="categories"
                      placeholder="Escribe o selecciona una categoría..."
                      required
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sm:col-span-2"
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Concepto *</span>
                    <input
                      type="text"
                      required
                      maxLength={256}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Proveedor *</span>
                    <ExpenseAutocomplete
                      value={form.supplier}
                      onChange={(value) => setForm(prev => ({ ...prev, supplier: value }))}
                      type="suppliers"
                      placeholder="Escribe o selecciona un proveedor..."
                      required
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Base (€) *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      name="base_amount"
                      value={String(form.base_amount ?? '')}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">IVA (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      name="tax_rate"
                      value={String(form.tax_rate ?? '')}
                      onChange={handleChange}
                      className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </label>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id="paid-modal"
                    name="paid"
                    checked={form.paid}
                    onChange={(e) => setForm(prev => ({ ...prev, paid: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="paid-modal" className="text-sm font-medium">Pagado</label>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-2 pt-4 flex-wrap"
              >
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-brand focus:ring-opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ date: '', category: '', description: '', supplier: '', base_amount: '', tax_rate: 21.0, paid: false })}
                  className="bg-secondary hover:opacity-90 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-brand focus:ring-opacity-50"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCSV && onOpenCSV()}
                  className="bg-amber-600 hover:bg-amber-500 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
                >
                  Subir CSV
                </button>
                <button
                  type="button"
                  onClick={() => onCloseRef.current?.()}
                  className="bg-gray-600 hover:bg-gray-700 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
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

export default CreateExpenseModal
