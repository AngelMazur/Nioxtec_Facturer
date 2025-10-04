import { useEffect, useState } from 'react'

export default function TopProgressBar() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const scrolled = h.scrollTop
      const height = h.scrollHeight - h.clientHeight
      const p = height > 0 ? Math.min(100, (scrolled / height) * 100) : 0
      setProgress(p)
      setVisible(p > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const onRoute = () => {
      setVisible(true)
      setProgress(10)
      setTimeout(() => setProgress(100), 200)
      setTimeout(() => setVisible(false), 600)
    }
    window.addEventListener('route-stagger', onRoute)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('route-stagger', onRoute)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <div
        className={`h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
