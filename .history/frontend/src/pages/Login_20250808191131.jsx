import { useState } from 'react'
import { useStore } from '../store/store'
import { apiPost } from '../lib/api'
import { useNavigate } from 'react-router-dom'

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
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Acceso</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="border p-2 rounded w-full" placeholder="Usuario" value={username} onChange={(e)=>setUsername(e.target.value)} required />
        <input className="border p-2 rounded w-full" type="password" placeholder="Contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="bg-primary text-white px-4 py-2 rounded w-full" type="submit">Entrar</button>
      </form>
    </main>
  )
}


