import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet } from '../lib/api'

export default function Reportes() {
  const { token } = useStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState({ by_month: {}, total_year: 0 })

  useEffect(() => {
    async function load() {
      const data = await apiGet(`/reports/summary?year=${year}`, token)
      setSummary(data)
    }
    if (token) load()
  }, [token, year])

  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  // CSV links
  const backend = typeof window !== 'undefined' && window.location.port === '8080' ? 'http://127.0.0.1:5000' : ''
  const csvClients = `${backend}/api/clients/export`
  const csvInvoices = `${backend}/api/invoices/export`

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-6">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Año</div>
          <input className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full" type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))} />
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Facturación anual</div>
          <div className="text-2xl font-semibold">{summary.total_year.toFixed(2)} €</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-end gap-2">
          <a href={csvClients} className="bg-primary text-white px-3 py-2 rounded">Exportar clientes CSV</a>
          <a href={csvInvoices} className="bg-secondary text-white px-3 py-2 rounded">Exportar facturas CSV</a>
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
                <div className="w-full bg-brand/20" style={{ height: `${height}%` }} />
                <div className="text-xs text-gray-500">{m}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500 mb-2">Acciones rápidas</div>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
          <li>Top clientes por facturación (próxima iteración)</li>
          <li>Facturas pendientes de envío/cobro (si añadimos estados)</li>
          <li>Descarga de proformas/facturas del mes en ZIP (próxima iteración)</li>
        </ul>
      </section>
    </main>
  )
}