import { Link } from 'react-router-dom'
import { useState } from 'react'

/**
 * Header component with navigation and mobile dropdown menu.
 * 
 * Features:
 * - Company logo with link to home
 * - Desktop navigation menu
 * - Mobile hamburger menu with dropdown
 * - Responsive design with Tailwind CSS
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Navigation items to render
 * @returns {JSX.Element} Header component
 */
export default function Header({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="NIOXTEC" className="h-auto w-32" />
        </Link>
        <button
          className="ml-auto sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 dark:border-gray-700"
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
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-2">
            {children}
          </div>
        </div>
      )}
    </header>
  )
}


