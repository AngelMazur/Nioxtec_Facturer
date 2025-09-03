import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef, cloneElement, Children } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MOTION } from '../styles/motion'

/**
 * Header component with navigation and mobile dropdown menu.
 * 
 * Features:
 * - Company logo with link to home
 * - Desktop navigation menu
 * - Mobile hamburger menu with dropdown
 * - Responsive design with Tailwind CSS
 * - Auto-close mobile menu when clicking navigation links
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Navigation items to render
 * @returns {JSX.Element} Header component
 */
export default function Header({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [logoReady, setLogoReady] = useState(false)
  const [logoDuration, setLogoDuration] = useState(0.8)
  const fallbackTimerRef = useRef(null)
  const [atTop, setAtTop] = useState(true)

  // Al cambiar de ruta, retrasar el render del logo hasta recibir un evento de sincronización
  useEffect(() => {
    // Ocultar logo hasta que llegue el tiempo de sincronización o el fallback
    setLogoReady(false)
    // Fallback: si no llega evento, mostrar tras duración por defecto
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    fallbackTimerRef.current = setTimeout(() => {
      setLogoDuration(0.8)
      setLogoReady(true)
    }, 800)
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    }
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      const totalMs = e?.detail?.totalMs
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
      if (typeof totalMs === 'number' && totalMs > 0) {
        setLogoDuration(totalMs / 1000)
      } else {
        setLogoDuration(0.8)
      }
      setLogoReady(true)
    }
    // Escuchar evento genérico y el legado de Facturas
    window.addEventListener('route-stagger', handler)
    window.addEventListener('route-facturas-stagger', handler)
    return () => {
      window.removeEventListener('route-stagger', handler)
      window.removeEventListener('route-facturas-stagger', handler)
    }
  }, [])

  // Actualiza el estado atTop para ocultar halo cuando no hay scroll
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 1)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Función para cerrar el menú móvil
  const closeMobileMenu = () => setOpen(false)

  // Función para crear enlaces del menú móvil que cierren automáticamente
  const createMobileNavItems = () => {
    return Children.map(children, (child) => {
      if (child.type === Link) {
        return cloneElement(child, {
          onClick: closeMobileMenu,
          className: `${child.props.className || ''} block py-2 px-3 rounded-md hover:bg-gray-800 transition-colors`
        })
      }
      if (child.type === 'button') {
        return cloneElement(child, {
          onClick: (e) => {
            closeMobileMenu()
            // Preservar el onClick original si existe
            if (child.props.onClick) {
              child.props.onClick(e)
            }
          },
          className: `${child.props.className || ''} block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 transition-colors`
        })
      }
      return child
    })
  }

  return (
    <header className={`sticky top-0 z-50 relative overflow-hidden bg-[rgba(16,20,26,0.45)] supports-[backdrop-filter]:bg-[rgba(16,20,26,0.35)] backdrop-blur-[10px] border-b border-white/10 ${atTop ? 'shadow-none' : 'shadow-[0_5px_50px_-5px_rgba(255,255,255,0.1),_0_0_0_1px_rgba(255,255,255,0.1)]'} transition-shadow`}>
      {/* Capa de brillo superior muy sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_60%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          {logoReady && (
            <motion.img
              key={`${location.pathname}-logo-${Math.round(logoDuration * 1000)}`}
              src="/logo.png"
              alt="NIOXTEC"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? Math.min(0.25, logoDuration) : logoDuration, ease: MOTION.ease.out }}
              className="h-auto w-32 transform-gpu transition-all duration-200 ease-out hover:scale-105 hover:brightness-110 hover:animate-blurred-fade-in"
            />
          )}
        </Link>
        <button
          className="ml-auto sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-700 hover:bg-gray-800 transition-colors"
          aria-label="Abrir menú"
          onClick={() => setOpen(v => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-200"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <nav className="ml-auto hidden sm:flex items-center gap-4">
          {children}
        </nav>
      </div>
      {/* Menú móvil */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-[rgba(16,20,26,0.65)] supports-[backdrop-filter]:bg-[rgba(16,20,26,0.55)] backdrop-blur-[10px]">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
            {createMobileNavItems()}
          </div>
        </div>
      )}
    </header>
  )
}
