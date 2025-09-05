import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/store'
import Header from './components/Header'
import TopProgressBar from './components/TopProgressBar'
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
        <Header
          rightSlot={(
            <button className="text-sm text-red-600 transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Salir
            </button>
          )}
          rightMobileSlot={(
            <button className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-red-500" onClick={logout}>
              Salir
            </button>
          )}
        >
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" to="/facturas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-6-4z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/></svg>
              Facturas
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" to="/clientes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Clientes
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" to="/productos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Productos
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" to="/gastos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>
              Gastos
            </Link>
            <Link className="text-sm font-medium hover:text-brand transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98] inline-flex items-center gap-1.5" to="/reportes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 13h3v5H7z"/><path d="M12 8h3v10h-3z"/><path d="M17 11h3v7h-3z"/></svg>
              Reportes
            </Link>
        </Header>
      )}
  {token && <TopProgressBar />}
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