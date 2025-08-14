import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiDelete, apiGetBlob } from '../lib/api'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Clientes() {
  const { clients, setClients, token } = useStore()
  const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [userSorted, setUserSorted] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [tab, setTab] = useState('facturas') // 'facturas' | 'documentos'
  const [clientInvoices, setClientInvoices] = useState({ loading: false, items: [], total: 0 })
  const [clientDocs, setClientDocs] = useState({ loading: false, items: [] })
  const [uploading, setUploading] = useState(false)
  const apiBase = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:5001`).replace(/\/$/, '')

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
    await loadClientInvoices(client.id)
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await apiPost('/clients', form, token)
      toast.success('Cliente guardado')
      setForm({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })
      // Añadir arriba del todo y fijar como destacado en render (independiente del orden)
      setClients([{ id: res.id, ...form, created_at: new Date().toISOString(), __pinned: true }, ...clients])
      setCurrentPage(1)
    } catch {
      toast.error('Error al guardar')
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <label className="flex flex-col gap-1"><span className="text-sm text-gray-500">Nombre</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="name" value={form.name} onChange={handleChange} required /></label>
        <label className="flex flex-col gap-1"><span className="text-sm text-gray-500">CIF/NIF</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="cif" value={form.cif} onChange={handleChange} required /></label>
        <label className="flex flex-col gap-1 sm:col-span-2"><span className="text-sm text-gray-500">Dirección</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="address" value={form.address} onChange={handleChange} required /></label>
        <label className="flex flex-col gap-1"><span className="text-sm text-gray-500">Email</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" type="email" name="email" value={form.email} onChange={handleChange} required /></label>
        <label className="flex flex-col gap-1"><span className="text-sm text-gray-500">Teléfono</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="phone" value={form.phone} onChange={handleChange} required /></label>
        <label className="flex flex-col gap-1 sm:col-span-2"><span className="text-sm text-gray-500">IBAN</span><input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="iban" value={form.iban} onChange={handleChange} /></label>
        <div className="sm:col-span-2">
          <button className="bg-primary hover:opacity-90 transition text-white px-4 py-2 rounded" type="submit">Guardar</button>
        </div>
      </form>
      <section>
         <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <Skeleton count={5} height={30} className="mb-2" />
        ) : (
          <>
          <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_12rem_minmax(0,1.6fr)_12rem] gap-6 text-xs text-gray-500 px-2 items-center">
            <button className="text-left hover:underline whitespace-nowrap" onClick={()=>{ setSort(s=>({ field: 'name', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Nombre</button>
            <button className="text-center hover:underline whitespace-nowrap" onClick={()=>{ setSort(s=>({ field: 'cif', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>CIF/NIF</button>
            <div className="text-center whitespace-nowrap">Contacto</div>
            <button className="text-center hover:underline whitespace-nowrap" onClick={()=>{ setSort(s=>({ field: 'created_at', dir: s.dir==='asc'?'desc':'asc' })); setUserSorted(true); setCurrentPage(1); }}>Creado</button>
          </div>
           {(() => {
             // Ordenar: primero fijados (__pinned), luego por columna seleccionada
             const sorted = clients
               .slice()
               .sort((a,b)=>{
                 // Solo priorizar fijados si el usuario no ha ordenado manualmente
                 if (!userSorted) {
                   if (a.__pinned && !b.__pinned) return -1
                   if (!a.__pinned && b.__pinned) return 1
                 }
                 const dir = sort.dir==='asc'?1:-1
                 const av = a[sort.field] || ''
                 const bv = b[sort.field] || ''
                 if (sort.field==='created_at') return String(av||'').localeCompare(String(bv||'')) * dir
                 return String(av).localeCompare(String(bv), 'es', { numeric: true }) * dir
               })
             const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
             const safePage = Math.min(currentPage, totalPages)
             const start = (safePage - 1) * pageSize
             const pageItems = sorted.slice(start, start + pageSize)
              return (
                <>
                  {/* Desktop list */}
                  <div className="hidden md:block">
                    <ul className="space-y-2">
                       {pageItems.map((client) => (
                         <li key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:bg-gray-800/80" onClick={()=>openClientModal(client)}>
                          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_12rem_minmax(0,1.6fr)_12rem] gap-6 items-start">
                            <div className="font-medium leading-snug break-words">{client.name}</div>
                            <div className="text-gray-500 justify-self-center text-center whitespace-nowrap">{client.cif}</div>
                            <div className="text-sm text-gray-400 break-words">
                              <div>{client.email}</div>
                              <div>{client.phone}</div>
                            </div>
                            <div className="text-sm text-gray-400 sm:text-center flex flex-col items-end sm:items-center gap-1 justify-center">
                               <span className="whitespace-nowrap">{client.created_at ? String(client.created_at).slice(0,10) : ''}</span>
                               <button className="text-red-600 underline" onClick={(e)=>{ e.stopPropagation(); deleteClient(client) }}>Eliminar</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2">
                     {pageItems.map((client) => (
                       <div key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer" onClick={()=>openClientModal(client)}>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Nombre</div>
                            <div className="font-medium text-left">{client.name}</div>
                          <div className="text-xs text-gray-500 mt-2">CIF/NIF</div>
                          <div className="text-gray-300">{client.cif}</div>
                          <div className="text-xs text-gray-500 mt-2">Contacto</div>
                          <div className="text-sm text-gray-400 break-words">
                            <div>{client.email}</div>
                            <div>{client.phone}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Creado</div>
                          <div className="text-gray-300">{client.created_at ? String(client.created_at).slice(0,10) : ''}</div>
                        </div>
                         <div className="mt-3 flex items-center gap-4" onClick={(e)=>e.stopPropagation()}>
                           <button className="text-red-600 underline" onClick={()=>deleteClient(client)}>Eliminar</button>
                        </div>
                      </div>
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
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-3xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-semibold">{selectedClient.name}</h4>
                <div className="text-gray-400 text-sm">{selectedClient.cif}</div>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={()=>setSelectedClient(null)}>Cerrar</button>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>onTabChange('facturas')} className={tab==='facturas' ? 'bg-primary text-white px-4 py-2 rounded' : 'px-4 py-2 rounded border border-gray-700'}>Facturas</button>
              <button onClick={()=>onTabChange('documentos')} className={tab==='documentos' ? 'bg-primary text-white px-4 py-2 rounded' : 'px-4 py-2 rounded border border-gray-700'}>Documentacion</button>
            </div>
            {tab==='facturas' && (
              <div className="mt-4">
                {clientInvoices.loading ? <Skeleton count={3} height={24} /> : (
                  clientInvoices.items.length ? (
                    <ul className="divide-y divide-gray-800">
                      {clientInvoices.items.map(inv => (
                        <li key={inv.id} onClick={()=>downloadClientInvoice(inv)} className="py-2 flex items-center justify-between rounded px-2 hover:bg-gray-800/80 cursor-pointer">
                          <div className="space-x-3">
                            <span className="font-medium">{inv.number}</span>
                            <span className="text-gray-400">{inv.date}</span>
                            <span className="text-gray-400">{inv.type}</span>
                            <span className="text-gray-400 tabular-nums">{(inv.total ?? 0).toFixed(2)} €</span>
                          </div>
                          <div className="text-brand text-sm">Descargar</div>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-gray-400">Sin facturas</div>
                )}
              </div>
            )}
            {tab==='documentos' && (
              <div className="mt-4 space-y-6">
                <div>
                  <h5 className="font-semibold mb-2">Documentos <span className="ml-2 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 align-middle">{clientDocs.items.filter(d=>d.category==='document').length}</span></h5>
                  {clientDocs.loading ? <Skeleton count={2} height={20} /> : (
                    <div className="space-y-2">
                      {clientDocs.items.filter(d=>d.category==='document').map(d => (
                        <div key={d.id} className="flex items-center justify-between">
                          <a className="underline text-brand" href={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}?token=${encodeURIComponent(token || '')}`} target="_blank" rel="noreferrer">{d.filename}</a>
                          <button className="text-red-500 underline" onClick={async()=>{
                            if(!window.confirm('¿Eliminar documento?')) return;
                            try { await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } }); toast.success('Eliminado'); loadClientDocs(selectedClient.id) } catch { toast.error('No se pudo eliminar') }
                          }}>Eliminar</button>
                        </div>
                      ))}
                      <label className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded cursor-pointer mt-2">
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e)=>handleUpload(e,'document')} disabled={uploading} />
                        Subir PDF
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Imagenes <span className="ml-2 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 align-middle">{clientDocs.items.filter(d=>d.category==='image').length}</span></h5>
                  {clientDocs.loading ? <Skeleton count={2} height={20} /> : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {clientDocs.items.filter(d=>d.category==='image').map(d => (
                          <div key={d.id} className="group relative">
                            <a href={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}?token=${encodeURIComponent(token || '')}`} target="_blank" rel="noreferrer" className="block">
                              <img src={`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}?token=${encodeURIComponent(token || '')}`} alt={d.filename} className="w-full h-32 object-cover rounded border border-gray-700" />
                            </a>
                            <button className="absolute top-1 right-1 text-xs text-red-100 bg-red-600/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100" onClick={async()=>{
                              if(!window.confirm('¿Eliminar imagen?')) return;
                              try { await fetch(`${apiBase}/api/clients/${selectedClient.id}/documents/${d.id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } }); toast.success('Eliminada'); loadClientDocs(selectedClient.id) } catch { toast.error('No se pudo eliminar') }
                            }}>Eliminar</button>
                          </div>
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded cursor-pointer mt-2">
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
    </main>
  )
}
