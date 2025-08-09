import { Link } from 'react-router-dom'

export default function Header({ children }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="NIOXTEC" className="h-40 w-auto" />
        </Link>
        <nav className="ml-auto hidden sm:flex items-center gap-4">
          {children}
        </nav>
      </div>
    </header>
  )
}


