import { useState, useEffect, useCallback, useRef } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import { useStore } from '../store/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { MOTION } from '../styles/motion'
import CustomSkeleton from "../components/CustomSkeleton"
import CreateExpenseModal from "../components/CreateExpenseModal"
import ImportExpensesCSVModal from "../components/ImportExpensesCSVModal"
import NeoGradientButton from "../components/NeoGradientButton"
import DataCard from "../components/DataCard"
import Pagination from "../components/Pagination"

const ICON_STYLES = {
  cyan: {
    border: 'border-brand/40',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(8,180,216,0.22),rgba(11,60,93,0.12),rgba(11,60,93,0.05))]',
    text: 'text-brand',
    glow: 'bg-brand/18',
  },
  violet: {
    border: 'border-violet-400/40',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(139,92,246,0.22),rgba(88,28,135,0.15),rgba(46,16,78,0.08))]',
    text: 'text-violet-300',
    glow: 'bg-violet-400/20',
  },
  amber: {
    border: 'border-amber-400/40',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(251,191,36,0.25),rgba(120,53,15,0.15),rgba(46,16,4,0.08))]',
    text: 'text-amber-300',
    glow: 'bg-amber-300/25',
  },
  emerald: {
    border: 'border-emerald-400/40',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(16,185,129,0.25),rgba(15,118,110,0.18),rgba(4,47,46,0.08))]',
    text: 'text-emerald-300',
    glow: 'bg-emerald-400/25',
  },
  indigo: {
    border: 'border-indigo-400/40',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(99,102,241,0.24),rgba(55,48,163,0.16),rgba(35,31,104,0.08))]',
    text: 'text-indigo-300',
    glow: 'bg-indigo-400/20',
  },
  slate: {
    border: 'border-slate-400/35',
    bg: 'bg-[radial-gradient(circle_at_35%_35%,rgba(148,163,184,0.18),rgba(71,85,105,0.15),rgba(30,41,59,0.08))]',
    text: 'text-slate-200',
    glow: 'bg-slate-400/20',
  },
}

const ICON_SVGS = {
  monitor: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" ry="2" />
      <path d="M9 17h4" />
      <path d="M12 15v2" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v7H3Z" />
      <path d="M14 10h3l3 3v1H14" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="16" cy="17" r="1.6" />
    </>
  ),
  box: (
    <>
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 8.5v8.5l9 5 9-5V8.5" />
      <path d="M12 12v10" />
    </>
  ),
  wrench: (
    <>
      <path d="M15.5 6.5 9 13l-3-3-4 4 4.5 4.5L17 9.5" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11V7l12-4v18l-12-4v-4" />
      <path d="M14 9a3 3 0 0 1 0 6" />
    </>
  ),
  creditCard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <path d="M6 15h2" />
      <path d="M10 15h2" />
    </>
  ),
  wifi: (
    <>
      <path d="M2 9a20 20 0 0 1 20 0" />
      <path d="M5 12a14 14 0 0 1 14 0" />
      <path d="M8.5 15.5a8 8 0 0 1 7 0" />
      <path d="M12 19h.01" strokeLinecap="round" />
    </>
  ),
  cloud: (
    <>
      <path d="M7.5 18h8a4.5 4.5 0 0 0 0-9 5 5 0 0 0-9.7-1.6A3.5 3.5 0 0 0 7.5 18Z" />
    </>
  ),
  pencil: (
    <>
      <path d="m3 17.25 8.8-8.8a2.5 2.5 0 0 1 3.54 3.54L6.5 20.79 3 21l.25-3.75Z" />
      <path d="m14 7 3 3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M4.5 7h15" />
      <path d="m7 7-3 7h6l-3-7Z" />
      <path d="m20 14-3-7-3 7h6Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M4 21v-1a4 4 0 0 1 4-4h2" />
      <path d="M16 21v-1a4 4 0 0 0-4-4h-1" />
      <circle cx="17" cy="9" r="3" />
    </>
  ),
  cap: (
    <>
      <path d="M12 4 3 8l9 4 9-4-9-4Z" />
      <path d="M12 12v4" />
      <path d="M7 10v4.5a5 5 0 0 0 10 0V10" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  percent: (
    <>
      <line x1="5" y1="19" x2="19" y2="5" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </>
  ),
  arrows: (
    <>
      <path d="m7 7 5-5 5 5" />
      <path d="M12 2v20" />
      <path d="m17 17-5 5-5-5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4" />
      <path d="M12 17h.01" strokeLinecap="round" />
      <path d="M4.5 19h15l-7.5-13Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m8 8 8 8" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M2 12h20" />
      <path d="M12 4a16 16 0 0 1 0 16" />
      <path d="M12 4a16 16 0 0 0 0 16" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M13 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
    </>
  ),
}

function buildIcon(styleKey, svg) {
  const style = ICON_STYLES[styleKey] || ICON_STYLES.cyan
  return function Icon() {
    return (
      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${style.border} ${style.bg} shadow-[0_12px_24px_-16px_rgba(8,180,216,0.45)]`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={style.text}>
          {svg}
        </svg>
        <span className={`pointer-events-none absolute inset-0 rounded-full ${style.glow} blur-[18px]`}></span>
      </div>
    )
  }
}

const CATEGORY_ICON_GROUPS = [
  { codes: ['600', '600.1', '600.2', '600.3'], keywords: ['pantalla', 'mercader', 'tpv', 'perif', 'soporte', 'licencia'], icon: buildIcon('cyan', ICON_SVGS.monitor) },
  { codes: ['601'], keywords: ['variacion', 'exist'], icon: buildIcon('slate', ICON_SVGS.layers) },
  { codes: ['602', '602.1', '602.2', '603'], keywords: ['import', 'aduan', 'flete', 'dua', 'transporte'], icon: buildIcon('indigo', ICON_SVGS.truck) },
  { codes: ['604'], keywords: ['envase', 'embalaje', 'palet', 'caja'], icon: buildIcon('amber', ICON_SVGS.box) },
  { codes: ['62'], keywords: ['logistica', 'courier', 'paqueter', 'subcontr', 'servicio'], icon: buildIcon('emerald', ICON_SVGS.wrench) },
  { codes: ['621', '621.1'], keywords: ['instal', 'manten', 'tecnic'], icon: buildIcon('emerald', ICON_SVGS.wrench) },
  { codes: ['623'], keywords: ['ads', 'publicid', 'propag', 'marketing'], icon: buildIcon('violet', ICON_SVGS.megaphone) },
  { codes: ['626', '626.'], keywords: ['pasarela', 'tpv', 'banco', 'stripe'], icon: buildIcon('indigo', ICON_SVGS.creditCard) },
  { codes: ['627'], keywords: ['telefon', 'internet', 'fibra', 'datos'], icon: buildIcon('cyan', ICON_SVGS.wifi) },
  { codes: ['628', '628.1', '628.2', '628.3'], keywords: ['software', 'saas', 'hosting', 'dominio', 'ia', 'suscrip'], icon: buildIcon('violet', ICON_SVGS.cloud) },
  { codes: ['629', '629.2', '629.3', '629.4', '629.5', '629.6'], keywords: ['diseno', 'impres', 'viaj', 'diet', 'combust', 'limpieza', 'material'], icon: buildIcon('amber', ICON_SVGS.pencil) },
  { codes: ['63', '631'], keywords: ['tribut', 'tasa', 'impuesto'], icon: buildIcon('slate', ICON_SVGS.scale) },
  { codes: ['64', '642'], keywords: ['salario', 'nomina', 'personal', 'seguridad social'], icon: buildIcon('emerald', ICON_SVGS.users) },
  { codes: ['649'], keywords: ['formacion', 'curso', 'epi'], icon: buildIcon('amber', ICON_SVGS.cap) },
  { codes: ['65'], keywords: ['alquiler', 'renta', 'oficina', 'almacen'], icon: buildIcon('cyan', ICON_SVGS.building) },
  { codes: ['66', '662'], keywords: ['comision', 'interes', 'financ'], icon: buildIcon('indigo', ICON_SVGS.percent) },
  { codes: ['668'], keywords: ['cambio', 'divisa', 'diferencia'], icon: buildIcon('violet', ICON_SVGS.arrows) },
  { codes: ['67'], keywords: ['insolv', 'perdida', 'credito'], icon: buildIcon('slate', ICON_SVGS.alert) },
  { codes: ['68', '681'], keywords: ['amortiz', 'equipo', 'herramienta'], icon: buildIcon('slate', ICON_SVGS.layers) },
  { codes: ['69'], keywords: ['provision', 'garantia'], icon: buildIcon('slate', ICON_SVGS.shield) },
  { keywords: ['no ded', 'multa', 'sancion', 'atencion'], icon: buildIcon('slate', ICON_SVGS.ban) },
  { keywords: ['aduan', 'arancel'], icon: buildIcon('indigo', ICON_SVGS.globe) },
]

const DEFAULT_CATEGORY_ICON = buildIcon('cyan', ICON_SVGS.document)

const normalizeCategoryText = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const matchesCode = (code, pattern) => {
  if (!code || !pattern) return false
  if (pattern.endsWith('x')) {
    return code.startsWith(pattern.slice(0, -1))
  }
  return code.startsWith(pattern)
}

function getExpenseCategoryMeta(category = '') {
  const normalized = normalizeCategoryText(category)
  const codeMatch = normalized.match(/^(\d{3}(?:\.\d)?)/)
  const code = codeMatch ? codeMatch[1] : null

  for (const group of CATEGORY_ICON_GROUPS) {
    if (group.codes && code && group.codes.some((pattern) => matchesCode(code, pattern))) {
      return group
    }
    if (group.keywords && group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group
    }
  }

  return { icon: DEFAULT_CATEGORY_ICON }
}

export default function Gastos() {
  const { 
    token, 
    setUserSortedExpenses
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
  const [showImportCSV, setShowImportCSV] = useState(false)
  const [forceHoverBtn, setForceHoverBtn] = useState(true)
  const hoverTimeoutRef = useRef(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [updatingPaidId, setUpdatingPaidId] = useState(null)
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

  useEffect(() => {
    if (!openMenuId) return

    const handlePointerDown = (event) => {
      const menuRoot = event.target.closest('[data-expense-menu-root]')
      if (menuRoot?.dataset?.expenseMenuRoot === String(openMenuId)) return
      setOpenMenuId(null)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpenMenuId(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenuId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert numeric fields to proper types before sending
      const submitData = {
        ...formData,
  base_amount: formData.base_amount === '' ? 0 : parseFloat(String(formData.base_amount).replace(',', '.')),
  tax_rate: formData.tax_rate === '' ? 0 : parseFloat(String(formData.tax_rate).replace(',', '.'))
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

  const handleTogglePaid = async (expense, nextPaid) => {
    const payload = {
      date: expense.date,
      category: expense.category,
      description: expense.description,
      supplier: expense.supplier,
      base_amount: expense.base_amount,
      tax_rate: expense.tax_rate,
      paid: nextPaid,
    }

    setUpdatingPaidId(expense.id)
    setExpenses((prev) => prev.map((item) => (item.id === expense.id ? { ...item, paid: nextPaid } : item)))

    try {
      await apiPut(`/expenses/${expense.id}`, payload, token)
      toast.success(nextPaid ? 'Gasto marcado como pagado' : 'Gasto marcado como pendiente')
    } catch {
      toast.error('No se pudo actualizar el estado de pago')
      setExpenses((prev) => prev.map((item) => (item.id === expense.id ? { ...item, paid: !nextPaid } : item)))
    } finally {
      setUpdatingPaidId(null)
    }
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
  <div className="gap-2 items-center flex max-w-4xl mx-auto">
        <input
          type="text"
          placeholder="Buscar en descripción, proveedor o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Listado */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold mb-3 mx-auto w-full max-w-4xl">Listado</h3>
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
            <div className="mx-auto w-full max-w-4xl">
              <div className={`
                hidden md:grid
                md:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_104px]
                items-center
                gap-2 sm:gap-3 md:gap-4
                mb-2 sm:mb-2.5 md:mb-3
                text-xs text-gray-500 font-medium
              `}>
                <div className="pl-4">Categoría / Proveedor</div>
                <div className='text-center'>Estado</div>
                <div className="text-center">Total</div>
                <div className="text-right pr-4">Acciones</div>
              </div>
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
              <div className="mx-auto w-full max-w-4xl space-y-2">
              {(() => {
                // El backend ya devuelve los gastos ordenados correctamente
                // Solo aplicamos ordenamiento local si el usuario cambia el criterio de orden
                const sorted = expenses.slice().sort((a, b) => {
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
                
                return sorted.map((expense) => {
                  const categoryMeta = getExpenseCategoryMeta(expense.category)
                  const CategoryIcon = categoryMeta.icon || DEFAULT_CATEGORY_ICON
                  const menuOpen = openMenuId === expense.id
                  const supplier = expense.supplier || 'Proveedor no especificado'
                  const totalDisplay = `${expense.total.toFixed(2)} €`

                  return (
                    <DataCard
                      key={expense.id}
                      isClickable={false}
                      columns={1}
                      className={`relative overflow-visible !px-4 !py-3 md:!px-4 md:!py-3 ${menuOpen ? 'z-50' : 'z-0'}`}
                      style={menuOpen ? { isolation: 'isolate' } : undefined}
                    >
                      <div className="grid grid-cols-1 gap-3 text-center md:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_104px] md:items-center md:text-left md:gap-4">
                        <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:text-left md:gap-3 min-w-0">
                          <CategoryIcon />
                          <div className="min-w-0 text-left">
                            <p className="truncate font-semibold leading-tight text-gray-100">
                              {expense.category || 'Gasto sin categoría'}
                            </p>
                            <p className="truncate text-sm text-gray-400">
                              {supplier}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1 text-center md:items-center">
                          <label
                            className={`relative inline-flex h-6 w-11 items-center rounded-full border bg-gray-900/60 transition-colors duration-200 ${expense.paid ? 'border-brand/70 bg-brand/30' : 'border-gray-700/70 hover:border-brand/40'} ${updatingPaidId === expense.id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <span className="sr-only">Cambiar estado de pago</span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={!!expense.paid}
                              disabled={updatingPaidId === expense.id}
                              onChange={(event) => handleTogglePaid(expense, event.target.checked)}
                              aria-label={`Marcar ${expense.description || expense.category} como ${expense.paid ? 'pendiente' : 'pagado'}`}
                            />
                            <span
                              className={`pointer-events-none block h-[1.25rem] w-[1.25rem] rounded-full bg-white shadow-[0_2px_6px_rgba(8,180,216,0.35)] transition-transform duration-200 ease-out ${expense.paid ? 'translate-x-[1.5rem]' : 'translate-x-[0.15rem]'} ${updatingPaidId === expense.id ? 'opacity-70' : ''}`}
                            ></span>
                          </label>
                          <span className={`text-[11px] uppercase tracking-wide ${expense.paid ? 'text-brand' : 'text-gray-500'}`}>
                            {expense.paid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center md:items-end md:text-right">
                          <span className="text-xs text-gray-500 md:hidden">Total</span>
                          <p className="text-sm font-semibold text-gray-100 tabular-nums">
                            {totalDisplay}
                          </p>
                        </div>

                        <div
                          className="relative flex items-center justify-center gap-2 md:justify-end md:justify-self-end"
                          data-expense-menu-root={String(expense.id)}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null)
                              handleEdit(expense)
                            }}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700/70 bg-gray-900/60 text-gray-200 transition-all duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                            aria-label={`Ver detalles de ${expense.description}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7-10.5-7-10.5-7Z" />
                              <circle cx="12" cy="12" r="3.5" />
                            </svg>
                          </button>

                          <div className="relative z-50">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(menuOpen ? null : expense.id)}
                              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700/70 bg-gray-900/60 text-gray-200 transition-all duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 ${menuOpen ? 'border-brand/60 text-brand' : ''}`}
                              aria-haspopup="menu"
                              aria-expanded={menuOpen}
                              aria-label={`Más acciones para ${expense.description}`}
                            >
                              <span className="flex flex-col gap-0.5">
                                <span className="block h-1 w-1 rounded-full bg-current"></span>
                                <span className="block h-1 w-1 rounded-full bg-current"></span>
                                <span className="block h-1 w-1 rounded-full bg-current"></span>
                              </span>
                            </button>
                            {menuOpen && (
                              <div className="absolute right-0 top-10 z-[60] w-44 rounded-lg border border-gray-700/70 bg-gray-900/95 shadow-[0_18px_36px_-12px_rgba(8,180,216,0.45)] backdrop-blur-sm">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    handleEdit(expense)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-gray-800/80 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    handleDelete(expense.id)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DataCard>
                  )
                })
              })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          key={`gastos-pagination-${page}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          <Pagination
            canPrev={page > 0}
            canNext={page < totalPages - 1}
            onPrev={() => setPage(Math.max(0, page - 1))}
            onNext={(nextPage) => setPage(Math.min(totalPages - 1, nextPage - 1))}
            onSelect={(nextPage) => setPage(nextPage - 1)}
            pages={Array.from({ length: totalPages }, (_, idx) => idx + 1)}
            current={page + 1}
          />
        </motion.div>
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
                    value={String(formData.base_amount ?? '')}
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
                    value={String(formData.tax_rate ?? '')}
                    onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                
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
        onOpenCSV={() => setShowImportCSV(true)}
      />

      <ImportExpensesCSVModal
        isOpen={showImportCSV}
        onClose={() => { setShowImportCSV(false); loadExpenses() }}
        onImported={() => { setShowImportCSV(false); loadExpenses() }}
      />
    </main>
  )
}
