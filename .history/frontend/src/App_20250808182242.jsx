import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import DarkModeToggle from './components/DarkModeToggle'
import { useStore } from './store/store'

// Lazy load pages for code splitting
const Clientes = lazy(() => import('./pages/Clientes'))
const Facturas = lazy(() => import('./pages/Facturas'))
const Reportes = lazy(() => import('./pages/Reportes'))
const Login = lazy(() => import('./pages/Login'))

export default function App() {
  const { token } = useStore()
  return (
    <BrowserRouter>
      {/* Botón de modo oscuro siempre visible */}
      <DarkModeToggle />
      <Suspense fallback={<div className="p-4">Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={token ? '/clientes' : '/login'} />} />
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