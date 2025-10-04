import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export default function CountUp({ value = 0, durationMs = 800, format = (v) => String(v), className = '' }) {
  const reduceMotion = useReducedMotion()
  const prevRef = useRef(value)
  const rafRef = useRef(0)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      prevRef.current = value
      return
    }
    const start = performance.now()
    const from = prevRef.current
    const to = value
    const duration = Math.max(120, durationMs)
    const step = (t) => {
      const elapsed = t - start
      const p = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)
    prevRef.current = value
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, durationMs, reduceMotion])

  return <span className={className}>{format(display)}</span>
}
