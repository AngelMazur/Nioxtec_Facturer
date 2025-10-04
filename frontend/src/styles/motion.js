export const MOTION = {
  duration: { short: 0.2, base: 0.35, long: 0.5 },
  ease: {
    standard: [0.22, 0.8, 0.36, 1],
    out: [0.16, 1, 0.3, 1],
  },
  page: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  pop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
}
