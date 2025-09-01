import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiDelete, apiGetBlob, apiPut } from '../lib/api'
import toast from 'react-hot-toast'
import ContractGeneratorModal from '../features/contracts/components/ContractGeneratorModal'
import CustomSkeleton from "../components/CustomSkeleton"
import CreateClientModal from "../components/CreateClientModal"
import NeoGradientButton from "../components/NeoGradientButton"
import DataCard from "../components/DataCard"

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
  const [invoicesPage, setInvoicesPage] = useState(1)
  const [imagesPage, setImagesPage] = useState(1)
  const [docsPage, setDocsPage] = useState(1)
  const [showContractModal, setShowContractModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClientForContract, setSelectedClientForContract] = useState(null)
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null)
  const invoicesPageSize = 10
  const imagesPageSize = 6
  const docsPageSize = 5
  const apiBase = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:5001`).replace(/\/$/, '')

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
      <h2 className="text-2xl font-bold">Clientes</h2>
      {/* Botón Crear Cliente */}
      <div className="flex justify-center">
        <NeoGradientButton
          onClick={() => setShowCreateModal(true)}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          }
        >
          Crear Cliente
        </NeoGradientButton>
      </div>
      <section>
         <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <CustomSkeleton count={5} height={30} className="mb-2" />
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
                                  <span className="whitespace-nowrap">{client.created_at ? require('../lib/format').formatDateES(client.created_at) : ''}</span>
                               <button className="text-red-600 underline active:scale-95 transition-transform duration-200 inline-block focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded" onClick={(e)=>{ e.stopPropagation(); deleteClient(client) }}>Eliminar</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Labels externos solo en desktop */}
                  <div className={`
                    hidden md:grid md:grid-cols-5
                    gap-2 sm:gap-3 md:gap-4
                    mb-2 sm:mb-2.5 md:mb-3
                    text-xs text-gray-500 font-medium
                  `}>
                    <div>
                      <button 
                        className="hover:underline cursor-pointer" 
                        onClick={() => handleSort('name')}
                      >
                        Nombre {sort.field === 'name' && (sort.dir === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>
                    <div>
                      <button 
                        className="hover:underline cursor-pointer" 
                        onClick={() => handleSort('cif')}
                      >
                        CIF/NIF {sort.field === 'cif' && (sort.dir === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>
                    <div>Contacto</div>
                    <div>
                      <button 
                        className="hover:underline cursor-pointer" 
                        onClick={() => handleSort('created_at')}
                      >
                        Creado {sort.field === 'created_at' && (sort.dir === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>
                    <div>Acciones</div>
                  </div>

                  {/* Cards responsive */}
                  <div className="space-y-2">
                     {pageItems.map((client) => (
                                              <DataCard
                         key={client.id}
                         onClick={()=>openClientModal(client)}
                                                 actions={[
                          {
                            label: 'Editar',
                            className: 'text-brand focus:ring-brand',
                            onClick: () => openEditModal(client)
                          },
                          {
                            label: 'Eliminar',
                            className: 'text-red-600 focus:ring-red-500',
                            onClick: () => deleteClient(client)
                          }
                        ]}
                        columns={4}
                        >
                          <div>
                            <div className="text-xs text-gray-500 md:hidden">Nombre</div>
                            <div className="font-medium text-left">{client.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 md:hidden">CIF/NIF</div>
                            <div className="text-gray-300">{client.cif}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 md:hidden">Contacto</div>
                            <div className="text-sm text-gray-400 break-words">
                              <div>{client.email}</div>
                              <div>{client.phone}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 md:hidden">Creado</div>
                            <div className="text-gray-300">{client.created_at ? require('../lib/format').formatDateES(client.created_at) : ''}</div>
                          </div>
                        </DataCard>
                     ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3">
                   {safePage > 1 ? (
                     <button className="bg-secondary text-white px-3 py-1 rounded" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>Anterior</button>
                   ) : <span />}
                   <div className="flex items-center gap-1">
                     {Array.from({ length: totalPages }).map((_, i)=>{
                       const page = i+1
                       const isActive = page === safePage
                       return (
                         <button
                           key={page}
                           onClick={()=>setCurrentPage(page)}
                           className={isActive ? 'bg-primary text-white px-3 py-1 rounded' : 'px-3 py-1 rounded border border-gray-700 text-gray-300 hover:text-brand'}
                         >
                           {page}
                         </button>
                       )
                     })}
                   </div>
                   {safePage < totalPages ? (
                     <button className="bg-primary text-white px-3 py-1 rounded" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
                   ) : <span />}
                 </div>
               </>
             )
           })()}
          </>
        )}
      </section>
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setSelectedClient(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-semibold">{selectedClient.name}</h4>
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
            {tab==='facturas' && (
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
                                <span className="text-gray-400">{inv.date}</span>
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
            )}
            {tab==='documentos' && (
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
                                  <a className="underline text-brand hover:scale-105 transition-all duration-200 inline-block" href={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`} target="_blank" rel="noreferrer">{d.filename}</a>
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
                                  <a href={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`} target="_blank" rel="noreferrer" className="block overflow-hidden rounded hover:scale-110 transition-transform duration-300">
                                    <img src={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`} alt={d.filename} className="w-full h-32 object-cover rounded border border-gray-700" />
                                  </a>
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
          </div>
        </div>
      )}

      {/* Contract Generator Modal */}
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
