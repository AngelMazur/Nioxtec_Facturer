import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost } from '../lib/api'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Clientes() {
  const { clients, setClients, token } = useStore()
  const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })

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
      setClients([...clients, { id: res.id, ...form }])
    } catch {
      toast.error('Error al guardar')
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
          <div className="hidden sm:grid grid-cols-4 gap-2 text-xs text-gray-500 px-2">
            <button className="text-left hover:underline" onClick={()=>setSort(s=>({ field: 'name', dir: s.dir==='asc'?'desc':'asc' }))}>Nombre</button>
            <button className="text-left hover:underline" onClick={()=>setSort(s=>({ field: 'cif', dir: s.dir==='asc'?'desc':'asc' }))}>CIF/NIF</button>
            <div>Contacto</div>
            <button className="text-right hover:underline" onClick={()=>setSort(s=>({ field: 'created_at', dir: s.dir==='asc'?'desc':'asc' }))}>Creado</button>
          </div>
           <ul className="space-y-2">
            {clients
              .slice()
              .sort((a,b)=>{
                const dir = sort.dir==='asc'?1:-1
                const av = a[sort.field] || ''
                const bv = b[sort.field] || ''
                if (sort.field==='created_at') return (av||'').localeCompare(bv||'')*dir
                return String(av).localeCompare(String(bv), 'es', { numeric: true })*dir
              })
              .map((client) => (
              <li key={client.id} className="p-3 bg-gray-800 border border-gray-700 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-gray-500">{client.cif}</div>
                  <div className="text-sm text-gray-400 break-words">
                    <div>{client.email}</div>
                    <div>{client.phone}</div>
                  </div>
                  <div className="text-sm text-gray-400 sm:text-right">{client.created_at ? client.created_at.slice(0,10) : ''}</div>
                </div>
              </li>
            ))}
          </ul>
          </>
        )}
      </section>
    </main>
  )
}