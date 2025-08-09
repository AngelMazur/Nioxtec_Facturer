import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet } from '../lib/api'

export default function Reportes() {
  const { token } = useStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState({ by_month: {}, total_year: 0 })
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [heatmap, setHeatmap] = useState({ by_day: {} })

  useEffect(() => {
    async function load() {
      const data = await apiGet(`/reports/summary?year=${year}`, token)
      setSummary(data)
    }
    if (token) load()
  }, [token, year])

  useEffect(() => {
    async function load() {
      const data = await apiGet(`/reports/heatmap?year=${year}&month=${month}`, token)
      setHeatmap(data)
    }
    if (token) load()
  }, [token, year, month])

  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  // CSV links
  const backend = typeof window !== 'undefined' && window.location.port === '8080' ? 'http://127.0.0.1:5000' : ''
  const xlsxClients = `${backend}/api/clients/export_xlsx`
  const xlsxInvoices = `${backend}/api/invoices/export_xlsx`

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-6">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Año</div>
          <input className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full" type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))} />
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Mes</div>
          <select className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full" value={month} onChange={(e)=>setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Facturación anual</div>
          <div className="text-2xl font-semibold">{summary.total_year.toFixed(2)} €</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-end gap-2">
          <a href={xlsxClients} className="bg-primary text-white px-3 py-2 rounded">Exportar clientes XLSX</a>
          <a href={xlsxInvoices} className="bg-secondary text-white px-3 py-2 rounded">Exportar facturas XLSX</a>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500 mb-2">Ingresos por mes</div>
        <div className="grid grid-cols-12 gap-2 items-end h-40">
          {months.map((m, idx) => {
            const value = summary.by_month[idx+1] || 0
            const max = Math.max(1, ...Object.values(summary.by_month))
            const height = Math.round((value / max) * 100)
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div className="w-full bg-cyan-500/60 dark:bg-cyan-400/60" style={{ height: `${height}%` }} />
                <div className="text-xs text-gray-500">{m}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="text-sm text-gray-500">Heatmap de ingresos (día del mes)</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({length: 42}).map((_, i) => {
            const day = i + 1
            const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const value = heatmap.by_day?.[key] || 0
            const intensity = Math.min(1, value / (summary.total_year / 12 || 1))
            return <div key={i} className="h-6 rounded" style={{ backgroundColor: `rgba(8,180,216,${intensity})` }} />
          })}
        </div>
      </section>
    </main>
  )
}