import { Link } from 'react-router-dom'
import { useState, cloneElement, Children } from 'react'

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
    <header className="sticky top-0 z-40 backdrop-blur bg-gray-900/80 border-b border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="NIOXTEC" className="h-auto w-32 transform-gpu transition-transform duration-200 ease-out hover:scale-105 animate-blurred-fade-in" />
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
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-900/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
            {createMobileNavItems()}
          </div>
        </div>
      )}
    </header>
  )
}
