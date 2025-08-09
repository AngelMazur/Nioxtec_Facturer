import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { apiGet, apiPost } from '../lib/api'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Clientes() {
  const { clients, setClients, token } = useStore()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', cif: '', address: '', email: '', phone: '', iban: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await apiGet('/clients', token)
      setClients(data)
      setLoading(false)
    }
    load()
  }, [setClients])

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
    } catch (e) {
      toast.error('Error al guardar')
    }
  }

  return (
    <main className="p-4 space-y-8">
      <h2 className="text-2xl font-bold">Clientes</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        {['name','cif','address','email','phone','iban'].map((field) => (
          <input
            key={field}
            className="border p-2 rounded"
            name={field}
            type={field === 'email' ? 'email' : 'text'}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.toUpperCase()}
            required={field !== 'iban'}
            aria-label={field}
          />
        ))}
        <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Guardar</button>
      </form>
      <section>
        <h3 className="text-xl font-semibold mb-2">Listado</h3>
        {loading ? (
          <Skeleton count={5} height={30} className="mb-2" />
        ) : (
          <ul className="space-y-2">
            {clients.map((client) => (
              <li key={client.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between">
                <span>{client.name}</span>
                <span className="text-sm text-gray-500">{client.cif}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}