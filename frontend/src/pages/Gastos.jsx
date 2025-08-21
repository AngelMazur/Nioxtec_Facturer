import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiGetBlob } from '../lib/api'
import { useStore } from '../store/store'
import toast from 'react-hot-toast'

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
      if (editingExpense) {
        await apiPut(`/expenses/${editingExpense.id}`, formData, token)
        toast.success('Gasto actualizado correctamente')
      } else {
        await apiPost('/expenses', formData, token)
        toast.success('Gasto creado correctamente')
      }
      setShowForm(false)
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

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Exportar
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingExpense(null)
              resetForm()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Nuevo Gasto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar en descripción, proveedor o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-600">
          <thead>
            <tr className="bg-gray-800">
              <th 
                className="border border-gray-600 px-4 py-2 text-left cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('date')}
              >
                Fecha {sort === 'date' && (dir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="border border-gray-600 px-4 py-2 text-left">Categoría</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Concepto</th>
              <th className="border border-gray-600 px-4 py-2 text-left">Proveedor</th>
              <th className="border border-gray-600 px-4 py-2 text-right">Base</th>
              <th className="border border-gray-600 px-4 py-2 text-right">IVA %</th>
              <th 
                className="border border-gray-600 px-4 py-2 text-right cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('total')}
              >
                Total {sort === 'total' && (dir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="border border-gray-600 px-4 py-2 text-center">Pagado</th>
              <th className="border border-gray-600 px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-800">
                <td className="border border-gray-600 px-4 py-2">
                  {new Date(expense.date).toLocaleDateString('es-ES')}
                </td>
                <td className="border border-gray-600 px-4 py-2">{expense.category}</td>
                <td className="border border-gray-600 px-4 py-2">{expense.description}</td>
                <td className="border border-gray-600 px-4 py-2">{expense.supplier}</td>
                <td className="border border-gray-600 px-4 py-2 text-right">
                  {expense.base_amount.toFixed(2)} €
                </td>
                <td className="border border-gray-600 px-4 py-2 text-right">
                  {expense.tax_rate}%
                </td>
                <td className="border border-gray-600 px-4 py-2 text-right font-semibold">
                  {expense.total.toFixed(2)} €
                </td>
                <td className="border border-gray-600 px-4 py-2 text-center">
                  {expense.paid ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </td>
                <td className="border border-gray-600 px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <input
                  type="text"
                  required
                  maxLength={64}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  maxLength={256}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor *</label>
                <input
                  type="text"
                  required
                  maxLength={128}
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Base (€) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.base_amount}
                  onChange={(e) => setFormData({...formData, base_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">IVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paid"
                  checked={formData.paid}
                  onChange={(e) => setFormData({...formData, paid: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="paid" className="text-sm font-medium">Pagado</label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
