import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost, apiGetBlob } from '../lib/api'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Facturas() {
  const { clients, invoices, setClients, setInvoices, token } = useStore()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ number: '', date: new Date().toISOString().slice(0,10), type: 'factura', client_id: '', items: [] })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [clientsData, invoicesData] = await Promise.all([
        apiGet('/clients', token),
        apiGet('/invoices', token),
      ])
      setClients(clientsData)
      setInvoices(invoicesData)
      setLoading(false)
    }
    if (token) load()
  }, [setClients, setInvoices, token])

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', units: 1, unit_price: 0, tax_rate: 21 }] })
  }
  const handleItemChange = (idx, field, value) => {
    const items = form.items.map((it, i) => i === idx ? { ...it, [field]: field==='description' ? value : Number(value) } : it)
    setForm({ ...form, items })
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, client_id: Number(form.client_id) }
    try {
      const data = await apiPost('/invoices', payload, token)
      toast.success('Documento creado')
      setForm({ number:'', date:new Date().toISOString().slice(0,10), type:'factura', client_id:'', items: [] })
      setInvoices([...invoices, { id: data.id, ...payload, total:0, tax_total:0 }])
    } catch {
      toast.error('Error al crear')
    }
  }
  const [preview, setPreview] = useState(null)

  const downloadInvoice = async (id, number) => {
    try {
      const blob = await apiGetBlob(`/invoices/${id}/pdf`, token)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Error al descargar PDF')
    }
  }

  const openPreview = async (id) => {
    try {
      const blob = await apiGetBlob(`/invoices/${id}/pdf`, token)
      const url = window.URL.createObjectURL(blob)
      setPreview(url)
    } catch {
      toast.error('Error al previsualizar PDF')
    }
  }
  return (
    <main className="mx-auto max-w-6xl p-4 space-y-8">
      <h2 className="text-2xl font-bold">Facturas / Proformas</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="number" value={form.number} onChange={handleChange} placeholder="Número" required />
          <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" type="date" name="date" value={form.date} onChange={handleChange} required />
          <select className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="type" value={form.type} onChange={handleChange}>
            <option value="factura">Factura</option>
            <option value="proforma">Proforma</option>
          </select>
          <select className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" name="client_id" value={form.client_id} onChange={handleChange} required>
            <option value="">Cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <h3 className="font-semibold">Líneas</h3>
        {form.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border border-gray-200 dark:border-gray-700 p-2 rounded">
            <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Descripción" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} required />
            <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" type="number" min="1" value={item.units} onChange={(e) => handleItemChange(idx, 'units', e.target.value)} required />
            <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" type="number" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)} required />
            <input className="border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand" type="number" step="0.01" value={item.tax_rate} onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)} required />
          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-secondary hover:opacity-90 transition px-3 py-1 rounded text-white">Añadir línea</button>
        <button type="submit" className="bg-primary hover:opacity-90 transition text-white px-4 py-2 rounded">Guardar</button>
      </form>
      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <Skeleton count={5} height={30} className="mb-2" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {invoices.map((inv) => {
              const clientName = clients.find(c => c.id === inv.client_id)?.name ?? ''
              return (
                <button key={inv.id} onClick={() => openPreview(inv.id)} className="w-full text-left">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center hover:border-brand">
                    <div className="space-x-2">
                      <span className="font-medium">{inv.number}</span>
                      <span className="text-gray-500">{clientName}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span>{inv.date?.slice(0,10)}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{(inv.total ?? 0).toFixed(2)} €</span>
                      <button onClick={(e) => { e.stopPropagation(); downloadInvoice(inv.id, inv.number) }} className="text-brand underline">PDF</button>
                    </div>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </section>

      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-4xl w-full h-[80vh]" onClick={(e)=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-800">
              <span className="font-medium">Vista previa</span>
              <button className="text-sm text-red-600" onClick={() => setPreview(null)}>Cerrar</button>
            </div>
            <iframe title="preview" src={preview} className="w-full h-full" />
          </div>
        </div>
      )}
    </main>
  )
}