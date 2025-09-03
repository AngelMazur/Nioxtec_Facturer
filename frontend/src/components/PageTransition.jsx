import { motion } from 'framer-motion'
import { MOTION } from '../styles/motion'

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={MOTION.page}
      transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
      className={`min-h-dvh ${className}`}
    >
      {children}
    </motion.main>
  )
}
