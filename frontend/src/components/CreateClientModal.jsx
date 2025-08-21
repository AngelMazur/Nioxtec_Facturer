import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CreateClientModal = ({ isOpen, onClose, onSubmit, form, setForm }) => {
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
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
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Crear Nuevo Cliente</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Nombre</span>
                    <input
                      className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
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
                    <span className="text-sm text-gray-500">CIF/NIF</span>
                    <input
                      className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                      name="cif"
                      value={form.cif}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Dirección</span>
                  <input
                    className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </label>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Email</span>
                    <input
                      className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
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
                    <span className="text-sm text-gray-500">Teléfono</span>
                    <input
                      className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">IBAN</span>
                  <input
                    className="w-full border border-gray-600 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                    name="iban"
                    value={form.iban}
                    onChange={handleChange}
                  />
                </label>
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
                  Guardar Cliente
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

export default CreateClientModal
