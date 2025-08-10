import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/store'
import { Link, useNavigate } from 'react-router-dom'
import Header from './components/Header'

// Lazy load pages for code splitting
const Clientes = lazy(() => import('./pages/Clientes'))
const Facturas = lazy(() => import('./pages/Facturas'))
const Reportes = lazy(() => import('./pages/Reportes'))
const Login = lazy(() => import('./pages/Login'))

function TopNav({ onLogout }) {
  const navigate = useNavigate()
  return (
    <nav className="p-3 flex gap-3 border-b">
      <Link className="underline" to="/clientes">Clientes</Link>
      <Link className="underline" to="/facturas">Facturas</Link>
      <Link className="underline" to="/reportes">Reportes</Link>
      <button className="ml-auto text-red-600 underline" onClick={() => { onLogout(); navigate('/login') }}>Salir</button>
    </nav>
  )
}

export default function App() {
  const { token, logout } = useStore()
  return (
    <BrowserRouter>
      {/* Modo oscuro forzado globalmente; sin conmutador */}
      <Suspense fallback={<div className="container-page py-8">Cargando…</div>}>
        {token && (
          <Header>
            <Link className="text-sm font-medium hover:text-brand" to="/facturas">Facturas</Link>
            <Link className="text-sm font-medium hover:text-brand" to="/clientes">Clientes</Link>
            <Link className="text-sm font-medium hover:text-brand" to="/reportes">Reportes</Link>
            <button className="text-sm text-red-600" onClick={logout}>Salir</button>
          </Header>
        )}
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/facturas' : '/login'} />} />
          <Route path="/login" element={<Login />} />
          {token && <Route path="/clientes" element={<Clientes />} />}
          {token && <Route path="/facturas" element={<Facturas />} />}
          {token && <Route path="/reportes" element={<Reportes />} />}
          {!token && <Route path="*" element={<Navigate to="/login" />} />}
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}