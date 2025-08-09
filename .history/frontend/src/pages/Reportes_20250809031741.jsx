import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiGetBlob } from '../lib/api'

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

  // Descargas XLSX con Authorization header real
  async function downloadXlsx(path, filename) {
    try {
      const blob = await apiGetBlob(path, token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('No se pudo exportar el XLSX')
    }
  }
  const downloadClients = () => downloadXlsx('/clients/export_xlsx', 'clientes.xlsx')
  const downloadInvoices = () => downloadXlsx('/invoices/export_xlsx', 'facturas.xlsx')

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
          <button onClick={downloadClients} className="bg-primary text-white px-3 py-2 rounded">Exportar clientes XLSX</button>
          <button onClick={downloadInvoices} className="bg-secondary text-white px-3 py-2 rounded">Exportar facturas XLSX</button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500 mb-2">Ingresos por mes</div>
        <div className="grid grid-cols-12 gap-3 items-end h-56">
          {months.map((m, idx) => {
            const raw = summary.by_month?.[idx+1] || 0
            const max = Math.max(1, ...Object.values(summary.by_month || {}))
            const heightPct = Math.max(4, Math.round((raw / max) * 100))
            return (
              <div key={m} className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-gray-400">{raw.toFixed(0)}€</div>
                <div className="w-full rounded-sm bg-cyan-500/70 dark:bg-cyan-400/80" style={{ height: `${heightPct}%` }} />
                <div className="text-xs text-gray-500">{m}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500">Facturación mensual ({months[month-1]} {year})</div>
        <div className="text-2xl font-semibold">{(heatmap && Object.values(heatmap.by_day || {}).reduce((a,b)=>a+Number(b||0),0)).toFixed(2)} €</div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="text-sm text-gray-500">Importes por mes (tabla)</div>
        <div className="grid grid-cols-2 sm:grid-cols-12 text-xs font-medium text-gray-500">
          <div className="col-span-1 sm:col-span-6">Mes</div>
          <div className="col-span-1 sm:col-span-6 text-right">Importe</div>
        </div>
        <div className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
          {months.map((m, idx) => {
            const raw = summary.by_month?.[idx+1] || 0
            return (
              <div key={m} className="grid grid-cols-2 sm:grid-cols-12 py-1 text-sm">
                <div className="col-span-1 sm:col-span-6">{m}</div>
                <div className="col-span-1 sm:col-span-6 text-right">{raw.toFixed(2)} €</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="text-sm text-gray-500">Heatmap de ingresos (día del mes)</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({length: 31}).map((_, i) => {
            const day = i + 1
            const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const value = heatmap.by_day?.[key] || 0
            const maxDay = Math.max(1, ...Object.values(heatmap.by_day || {}))
            const intensity = Math.min(1, value / maxDay)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-10 rounded" style={{ backgroundColor: `rgba(8,180,216,${intensity || 0.12})` }} />
                <div className="text-[10px] text-gray-500">{day}</div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}