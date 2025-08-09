export default function Reportes() {
  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <h2 className="text-2xl font-bold">Reportes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-gray-500">
          Próximamente: gráfico de ingresos por mes
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-gray-500">
          Próximamente: ranking de clientes
        </div>
      </div>
    </main>
  )
}