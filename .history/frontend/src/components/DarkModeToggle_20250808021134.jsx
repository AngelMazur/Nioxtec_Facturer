import { useEffect, useState } from 'react'

// Botón que permite alternar entre modo claro y oscuro usando Tailwind.
export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    // Lee la preferencia del usuario del localStorage o del sistema
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Alternar modo oscuro"
      className="fixed bottom-4 right-4 bg-primary text-white dark:bg-secondary p-2 rounded-full shadow-lg focus:outline-none"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}