import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/store'
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { SHOW_MOTION_DEMO } from './config/flags'

// Lazy load pages for code splitting
const Clientes = lazy(() => import('./pages/Clientes'))
const Facturas = lazy(() => import('./pages/Facturas'))
const Productos = lazy(() => import('./pages/Productos'))
const Reportes = lazy(() => import('./pages/Reportes'))
const Gastos = lazy(() => import('./pages/Gastos'))
const Login = lazy(() => import('./pages/Login'))
const MotionDemo = lazy(() => import('./pages/MotionDemo'))

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

function AnimatedRoutes({ token, logout }) {
  const location = useLocation()
  return (
    <>
      {token && (
        <Header>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" to="/facturas">Facturas</Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" to="/clientes">Clientes</Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" to="/productos">Productos</Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" to="/gastos">Gastos</Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" to="/reportes">Reportes</Link>
            <button className="text-sm text-red-600 transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]" onClick={logout}>Salir</button>
        </Header>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to={token ? '/facturas' : '/login'} />} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          {token && <Route path="/clientes" element={<PageTransition><Clientes /></PageTransition>} />}
          {token && <Route path="/facturas" element={<PageTransition><Facturas /></PageTransition>} />}
          {token && <Route path="/productos" element={<PageTransition><Productos /></PageTransition>} />}
          {token && <Route path="/gastos" element={<PageTransition><Gastos /></PageTransition>} />}
          {token && <Route path="/reportes" element={<PageTransition><Reportes /></PageTransition>} />}
          {SHOW_MOTION_DEMO && <Route path="/motion-demo" element={<PageTransition><MotionDemo /></PageTransition>} />}
          {!token && <Route path="*" element={<Navigate to="/login" />} />}
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  const { token, logout } = useStore()
  return (
    <BrowserRouter>
      {/* Modo oscuro forzado globalmente; sin conmutador */}
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatedRoutes token={token} logout={logout} />
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}