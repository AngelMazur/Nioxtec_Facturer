import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiGetBlob } from '../lib/api'
import { useStore } from '../store/store'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import CustomSkeleton from "../components/CustomSkeleton"
import CreateExpenseModal from "../components/CreateExpenseModal"
import 'react-loading-skeleton/dist/skeleton.css'

export default function Gastos() {
  const { token } = useStore()
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')
  const [dir, setDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [limit] = useState(10)
  const [showForm, setShowForm] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    supplier: '',
    base_amount: '',
    tax_rate: 21.0,
    paid: false
  })

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        sort,
        dir
      })
      if (search) params.append('q', search)
      
      const response = await apiGet(`/expenses?${params}`, token)
      setExpenses(response.items)
      setTotal(response.total)
    } catch (error) {
      toast.error('Error al cargar gastos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, sort, dir, limit, token])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert numeric fields to proper types before sending
      const submitData = {
        ...formData,
        base_amount: parseFloat(formData.base_amount),
        tax_rate: parseFloat(formData.tax_rate)
      }
      
      if (editingExpense) {
        await apiPut(`/expenses/${editingExpense.id}`, submitData, token)
        toast.success('Gasto actualizado correctamente')
      } else {
        await apiPost('/expenses', submitData, token)
        toast.success('Gasto creado correctamente')
      }
      setShowForm(false)
      setShowCreateModal(false)
      setEditingExpense(null)
      resetForm()
      loadExpenses()
    } catch (error) {
      toast.error('Error: ' + error.message)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      supplier: expense.supplier,
      base_amount: expense.base_amount.toString(),
      tax_rate: expense.tax_rate,
      paid: expense.paid
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) return
    
    try {
      await apiDelete(`/expenses/${id}`, token)
      toast.success('Gasto eliminado correctamente')
      loadExpenses()
    } catch (error) {
      toast.error('Error al eliminar: ' + error.message)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await apiGetBlob('/expenses/export_xlsx', token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'gastos.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Exportación completada')
    } catch (error) {
      toast.error('Error al exportar: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      category: '',
      description: '',
      supplier: '',
      base_amount: '',
      tax_rate: 21.0,
      paid: false
    })
  }

  const handleSort = (field) => {
    if (sort === field) {
      setDir(dir === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setDir('desc')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h2 className="text-2xl font-bold">Gastos</h2>
      
      {/* Botón Crear Gasto */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="relative overflow-hidden active:scale-95 focus:scale-105 transition-all duration-300 text-white px-10 py-5 rounded-3xl font-bold focus:ring-4 focus:ring-[#0F9BC3]/50 shadow-2xl hover:shadow-[#0F9BC3]/40 flex items-center gap-4 group transform hover:scale-95 hover:px-8 hover:py-4"
          style={{
            background: 'linear-gradient(135deg, #195569 0%, #197391 25%, #197D9B 50%, #1987A5 75%, #0F9BC3 100%)',
            boxShadow: '0 25px 50px -12px rgba(15, 155, 195, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #1E6B7F 0%, #1E8AA7 25%, #1E94B1 50%, #1E9EBB 75%, #15B2D9 100%)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #195569 0%, #197391 25%, #197D9B 50%, #1987A5 75%, #0F9BC3 100%)'
          }}
        >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          {/* Burbujitas decorativas */}
          <div className="absolute top-2 right-4 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/15 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/30 rounded-full animate-ping delay-500"></div>
          
          {/* Icono espectacular */}
          <div className="relative z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:rotate-180 transition-transform duration-500">
            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          {/* Texto con efecto */}
          <span className="relative z-10 tracking-wide drop-shadow-lg">Crear Gasto</span>
          
          {/* Borde interno brillante */}
          <div className="absolute inset-1 rounded-3xl border border-white/20 pointer-events-none"></div>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar en descripción, proveedor o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Exportar
        </button>
      </div>

      {/* Listado */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <CustomSkeleton count={5} height={30} className="mb-2" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full table-fixed border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left px-2 w-[12%]">
                      <button 
                        className="hover:underline" 
                        onClick={() => handleSort('date')}
                      >
                        Fecha {sort === 'date' && (dir === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="text-left px-2 w-[15%]">Categoría</th>
                    <th className="text-left px-2 w-[25%]">Concepto</th>
                    <th className="text-left px-2 w-[20%]">Proveedor</th>
                    <th className="text-right px-2 w-[10%]">Base</th>
                    <th className="text-right px-2 w-[8%]">IVA %</th>
                    <th className="text-right px-2 w-[10%]">
                      <button 
                        className="hover:underline" 
                        onClick={() => handleSort('total')}
                      >
                        Total {sort === 'total' && (dir === 'asc' ? '↑' : '↓')}
                      </button>
                    </th>
                    <th className="text-center px-2 w-[8%]">Pagado</th>
                    <th className="text-right px-2 w-[12%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="cursor-pointer group hover:scale-[1.02] transition-all duration-200">
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors rounded-l-lg whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors truncate">
                        {expense.category}
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors truncate">
                        {expense.description}
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors truncate">
                        {expense.supplier}
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-right font-medium tabular-nums whitespace-nowrap">
                        {expense.base_amount.toFixed(2)} €
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-right text-sm">
                        {expense.tax_rate}%
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-right font-semibold tabular-nums whitespace-nowrap">
                        {expense.total.toFixed(2)} €
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors text-center">
                        {expense.paid ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )}
                      </td>
                      <td className="px-2 py-2 bg-gray-800 group-hover:bg-gray-800/80 transition-colors rounded-r-lg">
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(expense)
                            }}
                            className="text-brand underline hover:scale-105 transition-transform duration-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(expense.id)
                            }}
                            className="text-red-600 underline hover:scale-105 transition-transform duration-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-3 bg-gray-800 border border-gray-700 rounded active:scale-95 active:bg-gray-700 transition-all duration-200">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Fecha</div>
                    <div className="font-medium">{new Date(expense.date).toLocaleDateString('es-ES')}</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Categoría</div>
                    <div className="text-gray-300">{expense.category}</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Concepto</div>
                    <div className="text-gray-300">{expense.description}</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Proveedor</div>
                    <div className="text-gray-300">{expense.supplier}</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Base</div>
                    <div className="font-medium tabular-nums">{expense.base_amount.toFixed(2)} €</div>
                    
                    <div className="text-xs text-gray-500 mt-2">IVA</div>
                    <div className="text-gray-300">{expense.tax_rate}%</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Total</div>
                    <div className="font-semibold text-gray-100 tabular-nums">{expense.total.toFixed(2)} €</div>
                    
                    <div className="text-xs text-gray-500 mt-2">Pagado</div>
                    <div className="text-gray-300">
                      {expense.paid ? (
                        <span className="text-green-400">✓ Pagado</span>
                      ) : (
                        <span className="text-red-400">✗ Pendiente</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="text-brand underline active:scale-95 transition-transform duration-200 inline-block focus:ring-2 focus:ring-brand focus:ring-opacity-50 rounded"
                      onClick={() => handleEdit(expense)}
                    >
                      Editar
                    </button>
                    <button 
                      className="text-red-600 underline active:scale-95 transition-transform duration-200 inline-block focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3">
          {page > 0 ? (
            <button 
              className="bg-secondary text-white px-3 py-1 rounded hover:scale-105 transition-transform duration-200" 
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              Anterior
            </button>
          ) : <span />}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const currentPage = i
              const isActive = currentPage === page
              return (
                <button
                  key={currentPage}
                  onClick={() => setPage(currentPage)}
                  className={isActive ? 'bg-primary text-white px-3 py-1 rounded' : 'px-3 py-1 rounded border border-gray-700 text-gray-300 hover:text-brand hover:scale-105 transition-transform duration-200'}
                >
                  {currentPage + 1}
                </button>
              )
            })}
          </div>
          {page < totalPages - 1 ? (
            <button 
              className="bg-primary text-white px-3 py-1 rounded hover:scale-105 transition-transform duration-200" 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            >
              Siguiente
            </button>
          ) : <span />}
        </div>
      )}

      {/* Form Modal para edición */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {
          setShowForm(false)
          setEditingExpense(null)
          resetForm()
        }}>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h4 className="text-xl font-semibold">
                {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h4>
              <button 
                className="text-gray-400 hover:text-white" 
                onClick={() => {
                  setShowForm(false)
                  setEditingExpense(null)
                  resetForm()
                }}
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Fecha *</span>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Categoría *</span>
                  <input
                    type="text"
                    required
                    maxLength={64}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Concepto *</span>
                  <input
                    type="text"
                    required
                    maxLength={256}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Proveedor *</span>
                  <input
                    type="text"
                    required
                    maxLength={128}
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Base (€) *</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.base_amount}
                    onChange={(e) => setFormData({...formData, base_amount: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">IVA (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="modal-paid"
                    checked={formData.paid}
                    onChange={(e) => setFormData({...formData, paid: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="modal-paid" className="text-sm font-medium">Pagado</label>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:opacity-90 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-brand focus:ring-opacity-50"
                >
                  {editingExpense ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingExpense(null)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear gasto */}
      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmit}
        form={formData}
        setForm={setFormData}
      />
    </main>
  )
}
