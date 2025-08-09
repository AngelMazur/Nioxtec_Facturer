import { useState } from 'react'
import { useStore } from '../store/store'
import { apiPost } from '../lib/api'
import { useNavigate } from 'react-router-dom'
// Usar el archivo proporcionado por el usuario

export default function Login() {
  const { setToken } = useStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await apiPost('/auth/login', { username, password })
      setToken(data.access_token)
      navigate('/clientes')
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <form onSubmit={submit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 w-full max-w-sm space-y-4">
        <div className="flex justify-center"><img src="/logo.png" alt="NIOXTEC" className="h-30 w-auto" /></div>
        <h1 className="text-xl font-semibold">Acceso</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Usuario" value={username} onChange={(e)=>setUsername(e.target.value)} required />
        <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-brand" type="password" placeholder="Contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="bg-primary hover:opacity-90 transition text-white px-4 py-2 rounded w-full" type="submit">Entrar</button>
      </form>
    </main>
  )
}


