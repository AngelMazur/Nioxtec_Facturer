import { useState, useEffect, useCallback, useRef } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import { useStore } from '../store/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { MOTION } from '../styles/motion'
import CustomSkeleton from "../components/CustomSkeleton"
import CreateExpenseModal from "../components/CreateExpenseModal"
import NeoGradientButton from "../components/NeoGradientButton"
import DataCard from "../components/DataCard"

export default function Gastos() {
  const { 
    token, 
    addExpenseToEnd, 
    setUserSortedExpenses, 
    getOrderedExpenses,
    userHasSortedExpenses
  } = useStore()
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
  const [forceHoverBtn, setForceHoverBtn] = useState(true)
  const hoverTimeoutRef = useRef(null)
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

  // Limpieza del timeout del botón
  useEffect(() => () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current) }, [])

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
        const response = await apiPost('/expenses', submitData, token)
        toast.success('Gasto creado correctamente')
        // Añadir el nuevo gasto al final del orden personalizado
        addExpenseToEnd(response)
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
    // Marcar que el usuario ha ordenado manualmente
    setUserSortedExpenses(true)
    
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
        <NeoGradientButton
          onClick={() => setShowCreateModal(true)}
      forceHover={forceHoverBtn}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          }
        >
          Crear Gasto
        </NeoGradientButton>
      </div>

  {/* Filtros */}
  <div className="gap-2 items-center flex">
        <input
          type="text"
          placeholder="Buscar en descripción, proveedor o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Listado */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <CustomSkeleton count={5} height={30} className="mb-2" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {/* Desktop table - mantenido oculto, se usa DataCard unificado */}
            <div className="hidden">
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
                    <tr key={expense.id} className="group">
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

            {/* Labels externos solo en desktop */}
            <div className={`
              hidden md:grid md:grid-cols-9
              gap-2 sm:gap-3 md:gap-4
              mb-2 sm:mb-2.5 md:mb-3
              text-xs text-gray-500 font-medium
            `}>
              <div>
                <button 
                  className="hover:underline cursor-pointer" 
                  onClick={() => handleSort('date')}
                >
                  Fecha {sort === 'date' && (dir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div>
                <button 
                  className="hover:underline cursor-pointer" 
                  onClick={() => handleSort('category')}
                >
                  Categoría {sort === 'category' && (dir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div>
                <button 
                  className="hover:underline cursor-pointer" 
                  onClick={() => handleSort('description')}
                >
                  Concepto {sort === 'description' && (dir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div>
                <button 
                  className="hover:underline cursor-pointer" 
                  onClick={() => handleSort('supplier')}
                >
                  Proveedor {sort === 'supplier' && (dir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div>Base</div>
              <div>IVA</div>
              <div>
                <button 
                  className="hover:underline cursor-pointer" 
                  onClick={() => handleSort('total')}
                >
                  Total {sort === 'total' && (dir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div>Pagado</div>
              <div>Acciones</div>
            </div>

            {/* Cards responsive con stagger */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
              className="space-y-2"
              onAnimationStart={() => {
                const staggerChildren = 0.08
                const delayChildren = 0.04
                const childDuration = MOTION?.duration?.base ?? 0.35
                const itemsCount = expenses.length
                const totalMs = Math.max(200, Math.round((delayChildren + Math.max(0, itemsCount - 1) * staggerChildren + childDuration) * 1000))
                try { window.dispatchEvent(new CustomEvent('route-stagger', { detail: { totalMs } })) } catch { /* noop */ }
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = setTimeout(() => setForceHoverBtn(false), totalMs)
              }}
            >
              {(() => {
                // Obtener gastos en orden personalizado o aplicar ordenamiento manual
                let sorted;
                if (userHasSortedExpenses) {
                  // Si el usuario ha ordenado manualmente, aplicar ese ordenamiento con desempate estable por ID
                  sorted = expenses.slice().sort((a, b) => {
                    const dirFactor = dir === 'asc' ? 1 : -1
                    const aId = a?.id || 0
                    const bId = b?.id || 0
                    const fallback = (aId - bId) * dirFactor
                    if (sort === 'date') {
                      const cmp = String(a.date || '').localeCompare(String(b.date || ''))
                      return cmp !== 0 ? cmp * dirFactor : fallback
                    }
                    if (sort === 'total') {
                      const diff = ((a.total ?? 0) - (b.total ?? 0))
                      return diff !== 0 ? diff * dirFactor : fallback
                    }
                    if (sort === 'category') {
                      const cmp = String(a.category || '').localeCompare(String(b.category || ''), 'es', { numeric: true })
                      return cmp !== 0 ? cmp * dirFactor : fallback
                    }
                    if (sort === 'description') {
                      const cmp = String(a.description || '').localeCompare(String(b.description || ''), 'es', { numeric: true })
                      return cmp !== 0 ? cmp * dirFactor : fallback
                    }
                    if (sort === 'supplier') {
                      const cmp = String(a.supplier || '').localeCompare(String(b.supplier || ''), 'es', { numeric: true })
                      return cmp !== 0 ? cmp * dirFactor : fallback
                    }
                    const av = a[sort]
                    const bv = b[sort]
                    const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'es', { numeric: true })
                    return cmp !== 0 ? cmp * dirFactor : fallback
                  })
                } else {
                  // Usar orden personalizado del store (nuevos gastos al final)
                  sorted = getOrderedExpenses(expenses);
                }
                
                return sorted.map((expense) => (
                                <DataCard
                  key={expense.id}
                  isClickable={false}
                  actions={[
                    {
                      label: 'Editar',
                      className: 'text-brand focus:ring-brand',
                      onClick: () => handleEdit(expense)
                    },
                    {
                      label: 'Eliminar',
                      className: 'text-red-600 focus:ring-red-500',
                      onClick: () => handleDelete(expense.id)
                    }
                  ]}
                  columns={8}
                  >
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Fecha</div>
                      <div className="font-medium">{new Date(expense.date).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Categoría</div>
                      <div className="text-gray-300">{expense.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Concepto</div>
                      <div className="text-gray-300">{expense.description}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Proveedor</div>
                      <div className="text-gray-300">{expense.supplier}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Base</div>
                      <div className="font-medium tabular-nums">{expense.base_amount.toFixed(2)} €</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">IVA</div>
                      <div className="text-gray-300">{expense.tax_rate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Total</div>
                      <div className="font-semibold text-gray-100 tabular-nums">{expense.total.toFixed(2)} €</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 md:hidden">Pagado</div>
                      <div className="text-gray-300">
                        {expense.paid ? (
                          <span className="text-green-400">✓ Pagado</span>
                        ) : (
                          <span className="text-red-400">✗ Pendiente</span>
                        )}
                      </div>
                    </div>
                  </DataCard>
        ))
              })()}
      </motion.div>
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
