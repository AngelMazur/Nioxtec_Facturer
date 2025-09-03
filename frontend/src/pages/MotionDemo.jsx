import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'
import { MOTION } from '../styles/motion'

export default function MotionDemo() {
  return (
    <PageTransition className="container-page py-6">
      <h1 className="text-2xl font-semibold mb-4">Motion Demo</h1>
      <p className="text-sm text-gray-400 mb-6">Ejemplos simples de transiciones y microinteracciones.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div
          className="p-4 rounded border border-gray-800 bg-gray-900/50"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
        >
          <h2 className="font-medium mb-2">Card con hover</h2>
          <div className="transition-transform duration-300 ease-out hover:-translate-y-0.5 p-3 rounded bg-gray-800/60">Hover para elevar</div>
        </motion.div>

        <motion.button
          className="px-4 py-2 rounded bg-blue-600/90 hover:bg-blue-600 text-white transition-[opacity,transform] duration-300 ease-out hover:scale-[1.02] active:scale-[.98]"
          whileTap={{ scale: 0.98 }}
        >
          Botón con tap
        </motion.button>
      </div>
    </PageTransition>
  )
}
