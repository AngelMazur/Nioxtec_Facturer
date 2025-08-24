import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiGetBlob } from '../lib/api'
import CustomSkeleton from "../components/CustomSkeleton"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

export default function Reportes() {
  const { token } = useStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [heatmap, setHeatmap] = useState({ by_day: {} })
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)
  const [combinedData, setCombinedData] = useState(null)
  const [loadingCombined, setLoadingCombined] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingCombined(true)
      try {
        const data = await apiGet(`/reports/combined_summary?year=${year}`, token)
        setCombinedData(data)
      } catch (error) {
        console.error('Error loading combined summary:', error)
      } finally {
        setLoadingCombined(false)
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

  // Prepare data for the combined chart
  const chartData = months.map((monthName, index) => {
    const monthNumber = index + 1
    return {
      month: monthName,
      ingresos: combinedData?.income_by_month?.[monthNumber] || 0,
      gastos: combinedData?.expenses_by_month?.[monthNumber] || 0,
      beneficio: combinedData?.profit_by_month?.[monthNumber] || 0
    }
  })

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
  const downloadExpenses = () => downloadXlsx('/expenses/export_xlsx', 'gastos.xlsx')

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} €
            </p>
          ))}
        </div>
      )
    }
    return null
  }

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

        {/* Ingresos anuales */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-center items-center h-full">
          <div className="text-sm text-gray-500 mb-2 text-center">Ingresos anuales</div>
          {loadingCombined ? (
            <div className="w-full">
              <CustomSkeleton count={1} height={32} className="mb-0" />
            </div>
          ) : (
            <div className="text-2xl font-semibold text-cyan-400 text-center">{combinedData?.total_income?.toFixed(2) || '0.00'} €</div>
          )}
        </div>

        {/* Beneficio anual */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800 flex flex-col justify-center items-center h-full">
          <div className="text-sm text-gray-500 mb-2 text-center">Beneficio anual</div>
          {loadingCombined ? (
            <div className="w-full">
              <CustomSkeleton count={1} height={32} className="mb-0" />
            </div>
          ) : (
            <div className={`text-2xl font-semibold text-center ${(combinedData?.total_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {combinedData?.total_profit?.toFixed(2) || '0.00'} €
            </div>
          )}
        </div>
      </section>

      {/* Gráfico combinado de Ingresos, Gastos y Beneficio */}
      <section className="rounded-lg border border-gray-700 p-4 bg-gray-800">
        <div className="text-sm text-gray-500 mb-4">Ingresos, Gastos y Beneficio por Mes ({year})</div>
        {loadingCombined ? (
          <div className="h-96 flex items-center justify-center">
            <CustomSkeleton count={1} height={384} className="mb-0" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(0)}€`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#9CA3AF' }}
                iconType="circle"
              />
              <Bar 
                dataKey="ingresos" 
                fill="#06b6d4" 
                name="Ingresos"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="gastos" 
                fill="#ef4444" 
                name="Gastos"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="beneficio" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Beneficio"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Sección de exportar datos */}
      <section className="rounded-lg border border-gray-700 p-4 bg-gray-800">
        <div className="text-sm text-gray-500 mb-2">Exportar datos</div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={downloadClients} 
            className="bg-primary text-white px-3 py-2 rounded hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap w-full"
          >
            Exportar clientes XLSX
          </button>
          <button 
            onClick={downloadExpenses} 
            className="bg-secondary text-white px-3 py-2 rounded hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap w-full"
          >
            Exportar gastos XLSX
          </button>
          <button 
            onClick={downloadInvoices} 
            className="border border-gray-400 text-gray-300 px-3 py-2 rounded hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap w-full"
          >
            Exportar facturas XLSX
          </button>
        </div>
      </section>

      {/* Sección de heatmap de ingresos */}
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