import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiDelete } from '../lib/api'
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

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await apiGet('/clients?limit=50&offset=0', token)
      setClients(data.items || data)
      setLoading(false)
    }
    if (token) load()
  }, [setClients, token])

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
                        <li key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded">
                          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_12rem_minmax(0,1.6fr)_12rem] gap-6 items-start">
                            <div className="font-medium leading-snug break-words">{client.name}</div>
                            <div className="text-gray-500 justify-self-center text-center whitespace-nowrap">{client.cif}</div>
                            <div className="text-sm text-gray-400 break-words">
                              <div>{client.email}</div>
                              <div>{client.phone}</div>
                            </div>
                            <div className="text-sm text-gray-400 sm:text-center flex flex-col items-end sm:items-center gap-1 justify-center">
                              <span className="whitespace-nowrap">{client.created_at ? String(client.created_at).slice(0,10) : ''}</span>
                              <button className="text-red-600 underline" onClick={()=>deleteClient(client)}>Eliminar</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2">
                    {pageItems.map((client) => (
                      <div key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Nombre</div>
                          <div className="font-medium">{client.name}</div>
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
                        <div className="mt-3 flex items-center gap-4">
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
    </main>
  )
}
