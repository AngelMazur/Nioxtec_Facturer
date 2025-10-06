import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MOTION } from '../styles/motion'
import { formatDateES } from '../lib/format'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiDelete, apiGetBlob, apiPut } from '../lib/api'
import toast from 'react-hot-toast'
import ContractGeneratorModal from '../features/contracts/components/ContractGeneratorModal'
import CustomSkeleton from "../components/CustomSkeleton"
import CreateClientModal from "../components/CreateClientModal"
import NeoGradientButton from "../components/NeoGradientButton"
import DataCard from "../components/DataCard"
import Pagination from "../components/Pagination"
import AuthenticatedImage from "../components/AuthenticatedImage"

export default function Clientes() {
  const { 
    clients, 
    setClients, 
    token, 
    addClientToEnd, 
    setUserSortedClients, 
    getOrderedClients,
    userHasSortedClients
  } = useStore()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [tab, setTab] = useState('facturas') // 'facturas' | 'documentos'
  const [clientInvoices, setClientInvoices] = useState({ loading: false, items: [], total: 0 })
  const [clientDocs, setClientDocs] = useState({ loading: false, items: [] })
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewType, setPreviewType] = useState(null) // 'image'|'pdf'
  const [previewUrl, setPreviewUrl] = useState(null)
  const [invoicesPage, setInvoicesPage] = useState(1)
  const [imagesPage, setImagesPage] = useState(1)
  const [docsPage, setDocsPage] = useState(1)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClientForContract, setSelectedClientForContract] = useState(null)
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const invoicesPageSize = 10
  const imagesPageSize = 6
  const docsPageSize = 5
  // Obtener URL base API (solo usa puerto en desarrollo local)
  const apiBase = (import.meta.env.VITE_API_BASE || 
    (location.hostname === 'localhost' && location.port === '5173' 
      ? `${location.protocol}//${location.hostname}:5001` 
      : '')).replace(/\/$/, '')
  const [forceHoverBtn, setForceHoverBtn] = useState(true)
  const hoverTimeoutRef = useRef(null)
  const reduceMotion = useReducedMotion()

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    // Marcar que el usuario ha ordenado manualmente
    setUserSortedClients(true)
    
    setSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }))
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await apiGet('/clients?limit=50&offset=0', token)
      setClients(data.items || data)
      setLoading(false)
    }
    if (token) load()
  }, [setClients, token])

  // Limpieza del timeout del botón
  useEffect(() => () => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current) }, [])

  // Cerrar menú contextual al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!openMenuId) return
    const handlePointerDown = (event) => {
      const menuRoot = event.target.closest('[data-client-menu-root]')
      if (menuRoot?.dataset?.clientMenuRoot === String(openMenuId)) return
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

  async function openClientModal(client) {
    setSelectedClient(client)
    setTab('facturas')
    setInvoicesPage(1)
    setImagesPage(1)
    setDocsPage(1)
    await loadClientInvoices(client.id)
  }

  function openContractModal(client) {
    setSelectedClientForContract(client)
    setShowContractModal(true)
  }

  function openEditModal(client) {
    setSelectedClientForEdit(client)
    setForm({
      name: client.name || '',
      cif: client.cif || '',
      address: client.address || '',
      email: client.email || '',
      phone: client.phone || '',
      iban: client.iban || ''
    })
    setShowCreateModal(true)
  }

  async function loadClientInvoices(clientId) {
    setClientInvoices(s => ({ ...s, loading: true }))
    try {
      const data = await apiGet(`/clients/${clientId}/invoices?limit=50&offset=0`, token)
      setClientInvoices({ loading: false, items: data.items || [], total: data.total || 0 })
    } catch (e) {
      setClientInvoices({ loading: false, items: [], total: 0 })
      toast.error(e?.message || 'No se pudieron cargar las facturas')
    }
  }

  async function loadClientDocs(clientId) {
    setClientDocs(s => ({ ...s, loading: true }))
    try {
      const data = await apiGet(`/clients/${clientId}/documents`, token)
      setClientDocs({ loading: false, items: data })
    } catch (e) {
      setClientDocs({ loading: false, items: [] })
      toast.error(e?.message || 'No se pudieron cargar los documentos')
    }
  }

  async function onTabChange(newTab) {
    if (!selectedClient) return
    setTab(newTab)
    if (newTab === 'facturas') await loadClientInvoices(selectedClient.id)
    if (newTab === 'documentos') await loadClientDocs(selectedClient.id)
  }

  async function downloadClientInvoice(inv) {
    try {
      const blob = await apiGetBlob(`/invoices/${inv.id}/pdf`, token)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${inv.number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Error al descargar PDF')
    }
  }

  // (Comportamiento anterior preservado) Abrimos con enlaces directos gestionados por el navegador

  async function handleUpload(e, kind) { // kind: 'document'|'image'
    if (!selectedClient) return
    const file = e.target.files?.[0]
    if (!file) return
    if (kind === 'document' && file.type !== 'application/pdf') {
      toast.error('Sube un PDF')
      return
    }
    if (kind === 'image' && !file.type.startsWith('image/')) {
      toast.error('Sube una imagen')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      toast.success('Archivo subido')
      await loadClientDocs(selectedClient.id)
    } catch (err) {
      toast.error(err?.message || 'Error subiendo archivo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Función para descargar/abrir documentos con autenticación
  async function handleDocumentClick(docId, filename) {
    try {
      const res = await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${docId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Error al descargar el documento')
      
      const blob = await res.blob()
      // By default behavior: download file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      toast.error(err?.message || 'Error al abrir el documento')
    }
  }

  // Preview handlers: image or pdf
  async function previewDocument(doc) {
    if (!selectedClient) return
    try {
      const res = await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${doc.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Error al obtener documento')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      if (doc.mime_type && doc.mime_type.startsWith('image/')) {
        setPreviewType('image')
      } else {
        setPreviewType('pdf')
      }
      setPreviewUrl(url)
      setPreviewOpen(true)
    } catch (err) {
      toast.error(err?.message || 'Error al previsualizar documento')
    }
  }

  function closePreview() {
    setPreviewOpen(false)
    if (previewUrl) {
      try { window.URL.revokeObjectURL(previewUrl) } catch (e) { /* noop */ }
    }
    setPreviewUrl(null)
    setPreviewType(null)
  }



  const handleSubmit = async (formData) => {
    try {
      if (selectedClientForEdit) {
        // Modo edición
        await apiPut(`/clients/${selectedClientForEdit.id}`, formData, token)
        toast.success('Cliente actualizado')
        // Actualizar el cliente en la lista
        const updatedClients = clients.map(client => 
          client.id === selectedClientForEdit.id 
            ? { ...client, ...formData }
            : client
        )
        setClients(updatedClients)
        setSelectedClientForEdit(null)
      } else {
        // Modo creación
        const res = await apiPost('/clients', formData, token)
        toast.success('Cliente guardado')
        setForm({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })
        // Añadir el nuevo cliente al final del orden personalizado
        addClientToEnd(res)
        setClients([{ id: res.id, ...formData, created_at: new Date().toISOString() }, ...clients])
        setCurrentPage(1)
      }
      setShowCreateModal(false)
    } catch (e) {
      toast.error(e?.message || 'Error al guardar cliente')
    }
  }

  const deleteClient = async (client) => {
    if (!window.confirm('¿Eliminar este cliente?')) return
    try {
      await apiDelete(`/clients/${client.id}`, token)
      setClients(clients.filter(c => c.id !== client.id))
      toast.success('Eliminado')
    } catch (e) {
      toast.error(e?.message || 'No se pudo eliminar')
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white/90">Clientes</h2>
      {/* Botón Crear Cliente */}
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
          Crear Cliente
        </NeoGradientButton>
      </div>
      <section className="space-y-3">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="text-xl font-semibold">Listado</h3>
        </div>
        {loading ? (
          <div className="mx-auto w-full max-w-4xl">
            <CustomSkeleton count={5} height={30} />
          </div>
        ) : (
          <>
           {(() => {
             // Obtener clientes en orden personalizado o aplicar ordenamiento manual
             let sorted;
             if (userHasSortedClients) {
               // Si el usuario ha ordenado manualmente, aplicar ese ordenamiento con desempate estable por ID
               sorted = clients.slice().sort((a, b) => {
                 const dir = sort.dir === 'asc' ? 1 : -1
                 const aId = a?.id || 0
                 const bId = b?.id || 0
                 const fallback = (aId - bId) * dir
                 
                 if (sort.field === 'created_at') {
                   const aDate = a.created_at || ''
                   const bDate = b.created_at || ''
                   const cmp = String(aDate).localeCompare(String(bDate))
                   return cmp !== 0 ? cmp * dir : fallback
                 }
                 if (sort.field === 'name') {
                   const cmp = String(a.name || '').localeCompare(String(b.name || ''), 'es', { numeric: true })
                   return cmp !== 0 ? cmp * dir : fallback
                 }
                 if (sort.field === 'cif') {
                   const cmp = String(a.cif || '').localeCompare(String(b.cif || ''), 'es', { numeric: true })
                   return cmp !== 0 ? cmp * dir : fallback
                 }
                 
                 const av = a[sort.field]
                 const bv = b[sort.field]
                 const cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'es', { numeric: true })
                 return cmp !== 0 ? cmp * dir : fallback
               })
             } else {
               // Usar orden personalizado del store (nuevos clientes al final)
               sorted = getOrderedClients(clients);
             }
             const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
             const safePage = Math.min(currentPage, totalPages)
             const start = (safePage - 1) * pageSize
             const pageItems = sorted.slice(start, start + pageSize)
              return (
                <>
                  {/* Desktop list - hidden, using responsive cards instead */}
                  <div className="hidden">
                    <ul className="space-y-2">
                       {pageItems.map((client) => (
                         <li key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:scale-[1.02] hover:bg-gray-800/80 active:scale-95 active:bg-gray-700 transition-all duration-200" onClick={()=>openClientModal(client)}>
                          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_12rem_minmax(0,1.6fr)_12rem] gap-6 items-start">
                            <div className="font-medium leading-snug break-words">{client.name}</div>
                            <div className="text-gray-500 justify-self-center text-center whitespace-nowrap">{client.cif}</div>
                            <div className="text-sm text-gray-400 break-words">
                              <div>{client.email}</div>
                              <div>{client.phone}</div>
                            </div>
                            <div className="text-sm text-gray-400 sm:text-center flex flex-col items-end sm:items-center gap-1 justify-center">
                                  <span className="whitespace-nowrap">{client.created_at ? formatDateES(client.created_at) : ''}</span>
                               <button className="text-red-600 underline active:scale-95 transition-transform duration-200 inline-block focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded" onClick={(e)=>{ e.stopPropagation(); deleteClient(client) }}>Eliminar</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mx-auto w-full max-w-4xl">
                    {/* Labels externos solo en desktop */}
                    <div className={`
                      hidden md:grid
                      md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_104px]
                      md:h-10
                      items-center
                      gap-2 sm:gap-3 md:gap-4
                      text-xs text-gray-500 font-medium
                    `}>
                      <button
                        className="text-left pl-4 hover:underline"
                        onClick={() => handleSort('name')}
                      >
                        Nombre {sort.field === 'name' && (sort.dir === 'asc' ? '↑' : '↓')}
                      </button>
                      <button
                        className="justify-self-center text-center hover:underline"
                        onClick={() => handleSort('created_at')}
                      >
                        Creado {sort.field === 'created_at' && (sort.dir === 'asc' ? '↑' : '↓')}
                      </button>
                      <div className="text-right pr-4">Acciones</div>
                    </div>

                    {/* Cards responsive con stagger */}
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 1 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
                      }}
                      className="space-y-2"
                      onAnimationStart={() => {
                        const staggerChildren = 0.08
                        const delayChildren = 0.04
                        const childDuration = MOTION?.duration?.base ?? 0.35
                        const itemsCount = pageItems.length
                        const totalMs = Math.max(200, Math.round((delayChildren + Math.max(0, itemsCount - 1) * staggerChildren + childDuration) * 1000))
              // Informar al Header de la duración total para el logo
                        try { window.dispatchEvent(new CustomEvent('route-stagger', { detail: { totalMs } })) } catch { /* noop */ }
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        hoverTimeoutRef.current = setTimeout(() => setForceHoverBtn(false), totalMs)
                      }}
                    >
                      {pageItems.map((client) => {
                        const menuOpen = openMenuId === client.id
                        return (
                          <DataCard
                            key={client.id}
                            isClickable={false}
                            columns={1}
                            className={`relative overflow-visible !px-4 !py-3 md:!px-4 md:!py-3 ${menuOpen ? 'z-50' : 'z-0'}`}
                            style={menuOpen ? { isolation: 'isolate' } : undefined}
                          >
                            <div className="grid grid-cols-1 gap-3 text-center md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_104px] md:items-center md:gap-4">
                            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:text-left md:gap-3 min-w-0">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-[radial-gradient(circle_at_30%_30%,rgba(8,180,216,0.22),rgba(11,60,93,0.12),rgba(11,60,93,0.05))] shadow-[0_10px_26px_-14px_rgba(8,180,216,0.45)]">
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
                                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                                  </svg>
                                  <span className="absolute inset-0 rounded-full bg-brand/15 blur-[12px]"></span>
                                </div>
                                <div className="min-w-0 w-full max-w-[16rem] md:max-w-[280px]">
                                  <div className="mb-0.5 text-xs text-gray-500 md:hidden">Nombre</div>
                                  <p className="truncate font-semibold leading-tight text-gray-100">
                                    {client.name}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-center justify-center gap-0.5 text-center md:w-full md:flex md:flex-col md:items-center md:justify-center md:justify-self-center md:text-center">
                                <div className="text-xs text-gray-500 md:hidden">Creado</div>
                                <p className="text-sm text-gray-300 md:leading-tight">
                                  {client.created_at ? formatDateES(client.created_at) : ''}
                                </p>
                              </div>

                              <div
                                className="relative flex items-center justify-center gap-2 md:justify-end md:justify-self-end"
                                data-client-menu-root={String(client.id)}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    openClientModal(client)
                                  }}
                                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700/70 bg-gray-900/60 text-gray-200 transition-all duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                                  aria-label={`Ver detalles de ${client.name}`}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7-10.5-7-10.5-7Z" />
                                    <circle cx="12" cy="12" r="3.5" />
                                  </svg>
                                </button>
                                <div className="relative z-50">
                                  <button
                                    type="button"
                                    onClick={() => setOpenMenuId(menuOpen ? null : client.id)}
                                    className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700/70 bg-gray-900/60 text-gray-200 transition-all duration-200 hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 ${menuOpen ? 'border-brand/60 text-brand' : ''}`}
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen}
                                    aria-label={`Más acciones para ${client.name}`}
                                  >
                                    <span className="flex flex-col gap-0.5">
                                      <span className="block h-1 w-1 rounded-full bg-current"></span>
                                      <span className="block h-1 w-1 rounded-full bg-current"></span>
                                      <span className="block h-1 w-1 rounded-full bg-current"></span>
                                    </span>
                                  </button>
                                  {menuOpen && (
                                    <div className="absolute right-0 top-10 z-[60] w-40 rounded-lg border border-gray-700/70 bg-gray-900/95 shadow-[0_18px_36px_-12px_rgba(8,180,216,0.45)] backdrop-blur-sm">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null)
                                          openEditModal(client)
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
                                          deleteClient(client)
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
                      })}
                    </motion.div>
                  </div>

                  <motion.div
                    key={`clientes-pagination-${safePage}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <Pagination
                      canPrev={safePage > 1}
                      canNext={safePage < totalPages}
                      onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      onNext={(page) => setCurrentPage(page)}
                      onSelect={(page) => setCurrentPage(page)}
                      pages={Array.from({ length: totalPages }, (_, idx) => idx + 1)}
                      current={safePage}
                    />
                  </motion.div>
               </>
             )
           })()}
          </>
        )}
  </section>
  <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={()=>setSelectedClient(null)}
          >
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', damping: 26, stiffness: 320 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}
              role="dialog" aria-modal="true" aria-labelledby="client-details-title"
            >
            <div className="flex items-start justify-between gap-4">
              <div>
                  <h4 id="client-details-title" className="text-xl font-semibold">{selectedClient.name}</h4>
                <div className="text-gray-400 text-sm">{selectedClient.cif}</div>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={()=>setSelectedClient(null)}>Cerrar</button>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={()=>onTabChange('facturas')} 
                className={`px-4 py-2 rounded transition-all duration-200 focus:ring-2 focus:ring-opacity-50 ${
                  tab==='facturas' 
                    ? 'bg-primary text-white focus:ring-brand hover:opacity-90 active:scale-95' 
                    : 'border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white active:scale-95 focus:ring-gray-500'
                }`}
              >
                Facturas
              </button>
              <button 
                onClick={()=>onTabChange('documentos')} 
                className={`px-4 py-2 rounded transition-all duration-200 focus:ring-2 focus:ring-opacity-50 ${
                  tab==='documentos' 
                    ? 'bg-primary text-white focus:ring-brand hover:opacity-90 active:scale-95' 
                    : 'border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white active:scale-95 focus:ring-gray-500'
                }`}
              >
                Documentacion
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: 'easeOut' }}
              >
                {tab==='facturas' ? (
                  <div className="mt-4">
                    {clientInvoices.loading ? <CustomSkeleton count={3} height={24} /> : (
                      clientInvoices.items.length ? (
                        <>
                          <ul className="divide-y divide-gray-800">
                            {(() => {
                              const totalPages = Math.max(1, Math.ceil(clientInvoices.items.length / invoicesPageSize))
                              const safePage = Math.min(invoicesPage, totalPages)
                              const start = (safePage - 1) * invoicesPageSize
                              const pageItems = clientInvoices.items.slice(start, start + invoicesPageSize)
                              return pageItems.map(inv => (
                                <li key={inv.id} onClick={()=>downloadClientInvoice(inv)} className="py-2 flex items-center justify-between rounded px-2 hover:bg-gray-800/80 cursor-pointer hover:scale-[1.02] transition-all duration-200">
                                  <div className="space-x-3">
                                    <span className="font-medium">{inv.number}</span>
                                    <span className="text-gray-400">{formatDateES(inv.date)}</span>
                                    <span className="text-gray-400">{inv.type}</span>
                                    <span className="text-gray-400 tabular-nums">{(inv.total ?? 0).toFixed(2)} €</span>
                                  </div>
                                  <div className="text-brand text-sm">Descargar</div>
                                </li>
                              ))
                            })()}
                          </ul>
                          {(() => {
                            const totalPages = Math.max(1, Math.ceil(clientInvoices.items.length / invoicesPageSize))
                            const safePage = Math.min(invoicesPage, totalPages)
                            return totalPages > 1 ? (
                              <div className="flex items-center justify-center gap-2 mt-4">
                                <button
                                  onClick={() => setInvoicesPage(Math.max(1, safePage - 1))}
                                  disabled={safePage <= 1}
                                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                >
                                  Anterior
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setInvoicesPage(i + 1)}
                                    className={`px-3 py-1 rounded hover:scale-105 transition-transform duration-200 ${
                                      safePage === i + 1 
                                        ? 'bg-brand text-white' 
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                  >
                                    {i + 1}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setInvoicesPage(Math.min(totalPages, safePage + 1))}
                                  disabled={safePage >= totalPages}
                                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                >
                                  Siguiente
                                </button>
                              </div>
                            ) : null
                          })()}
                        </>
                      ) : <div className="text-gray-400">Sin facturas</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-semibold mb-2">Documentos <span className="ml-2 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 align-middle">{clientDocs.items.filter(d=>d.category==='document').length}</span></h5>
                      {clientDocs.loading ? <CustomSkeleton count={2} height={20} /> : (
                        <>
                          {(() => {
                            const documents = clientDocs.items.filter(d=>d.category==='document')
                            const totalPages = Math.max(1, Math.ceil(documents.length / docsPageSize))
                            const safePage = Math.min(docsPage, totalPages)
                            const start = (safePage - 1) * docsPageSize
                            const pageItems = documents.slice(start, start + docsPageSize)
                            return (
                              <>
                                <div className="space-y-2">
                                  {pageItems.map(d => (
                                    <div key={d.id} className="flex items-center justify-between">
                                      <button className="underline text-brand hover:scale-105 transition-all duration-200 inline-block text-left" onClick={() => previewDocument(d)}>{d.filename}</button>
                                      <button className="text-red-500 underline hover:scale-105 transition-transform duration-200 inline-block" onClick={async()=>{
                                        if(!window.confirm('¿Eliminar documento?')) return;
                                        try { await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' }, credentials: 'include' }); toast.success('Eliminado'); loadClientDocs(selectedClient.id) } catch { toast.error('No se pudo eliminar') }
                                      }}>Eliminar</button>
                                    </div>
                                  ))}
                                                              <div className="flex gap-2 mt-2">
                                  <label className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded cursor-pointer hover:scale-105 transition-all duration-200">
                                    <input type="file" accept="application/pdf" className="hidden" onChange={(e)=>handleUpload(e,'document')} disabled={uploading} />
                                    Subir PDF
                                  </label>
                                  <button
                                    onClick={() => openContractModal(selectedClient)}
                                    className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded cursor-pointer hover:scale-105 transition-all duration-200"
                                  >
                                    Crear Contrato
                                  </button>
                                </div>
                                </div>
                                {totalPages > 1 && (
                                  <div className="flex items-center justify-center gap-2 mt-4">
                                    <button
                                      onClick={() => setDocsPage(Math.max(1, safePage - 1))}
                                      disabled={safePage <= 1}
                                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                    >
                                      Anterior
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setDocsPage(i + 1)}
                                        className={`px-3 py-1 rounded hover:scale-105 transition-transform duration-200 ${
                                          safePage === i + 1 
                                            ? 'bg-brand text-white' 
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                      >
                                        {i + 1}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => setDocsPage(Math.min(totalPages, safePage + 1))}
                                      disabled={safePage >= totalPages}
                                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                    >
                                      Siguiente
                                    </button>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </>
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Imagenes <span className="ml-2 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 align-middle">{clientDocs.items.filter(d=>d.category==='image').length}</span></h5>
                      {clientDocs.loading ? <CustomSkeleton count={2} height={20} /> : (
                        <>
                          {(() => {
                            const images = clientDocs.items.filter(d=>d.category==='image')
                            const totalPages = Math.max(1, Math.ceil(images.length / imagesPageSize))
                            const safePage = Math.min(imagesPage, totalPages)
                            const start = (safePage - 1) * imagesPageSize
                            const pageItems = images.slice(start, start + imagesPageSize)
                            return (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {pageItems.map(d => (
                                    <div key={d.id} className="group relative">
                                      <button onClick={() => previewDocument(d)} className="block overflow-hidden rounded hover:scale-110 transition-transform duration-300 w-full">
                                        <AuthenticatedImage 
                                          src={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`}
                                          alt={d.filename}
                                          className="w-full h-32 object-cover rounded border border-gray-700"
                                          token={token}
                                        />
                                      </button>
                                      <button className="absolute top-1 right-1 text-xs text-red-100 bg-red-600/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 hover:scale-105 transition-all duration-200" onClick={async()=>{
                                        if(!window.confirm('¿Eliminar imagen?')) return;
                                        try { await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' }, credentials: 'include' }); toast.success('Eliminada'); loadClientDocs(selectedClient.id) } catch { toast.error('No se pudo eliminar') }
                                      }}>Eliminar</button>
                                    </div>
                                  ))}
                                </div>
                                {totalPages > 1 && (
                                  <div className="flex items-center justify-center gap-2 mt-4">
                                    <button
                                      onClick={() => setImagesPage(Math.max(1, safePage - 1))}
                                      disabled={safePage <= 1}
                                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                    >
                                      Anterior
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setImagesPage(i + 1)}
                                        className={`px-3 py-1 rounded hover:scale-105 transition-transform duration-200 ${
                                          safePage === i + 1 
                                            ? 'bg-brand text-white' 
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                      >
                                        {i + 1}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => setImagesPage(Math.min(totalPages, safePage + 1))}
                                      disabled={safePage >= totalPages}
                                      className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                                    >
                                      Siguiente
                                    </button>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                          <label className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded cursor-pointer mt-4 hover:scale-105 transition-all duration-200">
                            <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleUpload(e,'image')} disabled={uploading} />
                            Subir imagen
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Generator Modal */}
      {/* Preview Modal for client documents (image or PDF) */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Vista previa</h4>
                <button onClick={closePreview} className="text-gray-400 hover:text-white">Cerrar</button>
              </div>
              <div className="w-full max-h-[70vh] flex items-center justify-center overflow-auto">
                {previewType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <iframe src={previewUrl} title="PDF preview" className="w-full h-full" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ContractGeneratorModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        selectedClient={selectedClientForContract}
        onDocumentSaved={loadClientDocs}
      />

      {/* Modal para crear cliente */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setForm({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })
          setSelectedClientForEdit(null)
        }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isEditing={!!selectedClientForEdit}
      />
    </main>
  )
}
