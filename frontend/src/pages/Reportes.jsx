import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiGetBlob } from '../lib/api'
import CustomSkeleton from "../components/CustomSkeleton"
import ChartColumnSkeleton from "../components/ChartColumnSkeleton"

export default function Reportes() {
  const { token } = useStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState({ by_month: {}, total_year: 0 })
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [heatmap, setHeatmap] = useState({ by_day: {} })
  const [tip, setTip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await apiGet(`/reports/summary?year=${year}`, token)
        setSummary(data)
      } catch (error) {
        console.error('Error loading summary:', error)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token, year])

  useEffect(() => {
    async function load() {
      setLoadingHeatmap(true)
      try {
        const data = await apiGet(`/reports/heatmap?year=${year}&month=${month}`, token)
        setHeatmap(data)
      } catch (error) {
        console.error('Error loading heatmap:', error)
      } finally {
        setLoadingHeatmap(false)
      }
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

      {/* Sección de controles - Grid responsive uniforme */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Año */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-center h-full">
          <div className="text-sm text-gray-500 mb-2">Año</div>
          <input 
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-gray-900 text-white" 
            type="number" 
            value={year} 
            onChange={(e)=>setYear(Number(e.target.value))} 
          />
        </div>

        {/* Mes */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-center h-full">
          <div className="text-sm text-gray-500 mb-2">Mes</div>
          <select 
            className="border border-gray-700 p-2 rounded w-full bg-gray-900 text-white" 
            value={month} 
            onChange={(e)=>setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
        </div>

        {/* Facturación anual */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-center items-center h-full">
          <div className="text-sm text-gray-500 mb-2 text-center">Facturación anual</div>
          {loading ? (
            <div className="w-full">
              <CustomSkeleton count={1} height={32} className="mb-0" />
            </div>
          ) : (
            <div className="text-2xl font-semibold text-white text-center">{summary.total_year.toFixed(2)} €</div>
          )}
        </div>

        {/* Exportar datos */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-between h-full">
          <div className="text-sm text-gray-500 mb-2">Exportar datos</div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={downloadClients} 
              className="bg-primary text-white px-3 py-2 rounded hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap w-full"
            >
              Exportar clientes XLSX
            </button>
            <button 
              onClick={downloadInvoices} 
              className="bg-secondary text-white px-3 py-2 rounded hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap w-full"
            >
              Exportar facturas XLSX
            </button>
          </div>
        </div>
      </section>

      {/* Sección de gráfico de ingresos por mes */}
      <section className="rounded-lg border border-gray-700 p-4 relative bg-gray-800">
        <div className="text-sm text-gray-500 mb-2">Ingresos por mes</div>
        {loading ? (
          <div className="grid grid-cols-12 gap-3 h-64">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center justify-end gap-1">
                <div className="w-full h-48 relative">
                  <ChartColumnSkeleton className="h-full" />
                </div>
                <div className="text-xs text-gray-500">{months[idx]}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-3 h-64">
            {months.map((m, idx) => {
              const raw = Number(summary.by_month?.[idx+1] || 0)
              const max = Math.max(1, ...Object.values(summary.by_month || {}))
              const heightPct = Math.max(0, Math.round((raw / max) * 100))
              return (
                <div key={m} className="flex flex-col items-center justify-end gap-1">
                  <div
                    className="w-full h-48 relative"
                    onMouseEnter={(e)=>{
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTip({
                        idx,
                        value: raw,
                        x: rect.left + rect.width/2,
                        y: rect.top + window.scrollY - 28,
                      })
                    }}
                    onMouseMove={(e)=>{
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTip(t => t ? { ...t, x: rect.left + rect.width/2, y: rect.top + window.scrollY - 28 } : t)
                    }}
                    onMouseLeave={()=>setTip(null)}
                    onClick={() => setMonth(idx + 1)}
                  >
                    <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-cyan-400/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer" style={{ height: `${heightPct}%` }} />
                  </div>
                  <div className="text-xs text-gray-500">{m}</div>
                </div>
              )
            })}
          </div>
        )}
        {tip && (
          <div
            className="fixed z-50 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-900 text-white shadow pointer-events-none"
            style={{ left: tip.x, top: tip.y }}
          >
            {months[tip.idx]} · {tip.value.toFixed(2)} €
          </div>
        )}
      </section>

      {/* Sección de facturación mensual */}
      <section className="rounded-lg border border-gray-700 p-4 bg-gray-800">
        <div className="text-sm text-gray-500">Facturación mensual ({months[month-1]} {year})</div>
        {loadingHeatmap ? (
          <div className="w-full">
            <CustomSkeleton count={1} height={32} className="mb-0" />
          </div>
        ) : (
          <div className="text-2xl font-semibold text-white">{(heatmap && Object.values(heatmap.by_day || {}).reduce((a,b)=>a+Number(b||0),0)).toFixed(2)} €</div>
        )}
      </section>

      {/* Sección de heatmap */}
      <section className="rounded-lg border border-gray-700 p-4 space-y-3 bg-gray-800">
        <div className="text-sm text-gray-500">Heatmap de ingresos (día del mes)</div>
        {loadingHeatmap ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: 31}).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <CustomSkeleton count={1} height={40} className="mb-0" />
                <div className="text-[10px] text-gray-500">{i + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: 31}).map((_, i) => {
              const day = i + 1
              const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const value = heatmap.by_day?.[key] || 0
              const maxDay = Math.max(1, ...Object.values(heatmap.by_day || {}))
              const intensity = Math.min(1, value / maxDay)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-full h-10 rounded transition-all duration-300 ${value > 0 ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md hover:shadow-cyan-500/30' : ''}`}
                    style={{ backgroundColor: `rgba(8,180,216,${intensity || 0.12})` }}
                    title={`${day} de ${months[month-1]}: ${value.toFixed(2)} €`}
                  />
                  <div className="text-[10px] text-gray-500">{day}</div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}